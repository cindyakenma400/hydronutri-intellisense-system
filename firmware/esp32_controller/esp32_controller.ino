/*
 * HydroNutri IntelliSense: ESP32 field controller
 *
 * Every SENSOR_INTERVAL_MS it reads the soil probe and POSTs the reading
 * to /sensor/upload. Every CONTROL_INTERVAL_MS it GETs /controls/status
 * and switches the pump and valve relays to match. The dashboard buttons
 * and the backend's auto mode both work by changing that status.
 *
 * Board:     any ESP32 dev board (Arduino core for ESP32)
 * Libraries: ArduinoJson (v7), ModbusMaster, DHT sensor library
 *            (the last one only when USE_DHT22 is 1)
 *
 * Setup: copy config.example.h to config.h and fill it in.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ModbusMaster.h>

#include "config.h"

#if USE_DHT22
#include <DHT.h>
DHT dht(DHT22_PIN, DHT22);
#endif

ModbusMaster soilSensor;

bool pumpOn = false;
bool valveOn = false;
unsigned long pumpStartedAt = 0;

// Set when the hardware runtime limit trips. The pump then stays off,
// even if the backend still says ON, until the backend itself says OFF.
bool pumpLockedOut = false;
unsigned long lastCommandAt = 0;
unsigned long lastSensorAt = 0;
unsigned long lastControlAt = 0;

struct Reading {
  float soilMoisture;
  float temperature;
  float humidity;
  float ph;
  float ec;
  float nitrogen;
  float phosphorus;
  float potassium;
};

// ------------------------------------------------------------------ relays

void writeRelay(int pin, bool on) {
  bool level = RELAY_ACTIVE_LOW ? !on : on;
  digitalWrite(pin, level ? HIGH : LOW);
}

void setPump(bool on) {
  if (on && !pumpOn) pumpStartedAt = millis();
  pumpOn = on;
  writeRelay(PUMP_RELAY_PIN, on);
}

void setValve(bool on) {
  valveOn = on;
  writeRelay(VALVE_RELAY_PIN, on);
}

void allOff() {
  setPump(false);
  setValve(false);
}

// ------------------------------------------------------------------ RS485

void preTransmission() { digitalWrite(RS485_DE_RE_PIN, HIGH); }
void postTransmission() { digitalWrite(RS485_DE_RE_PIN, LOW); }

// Register map of the CWT 7-in-1 probe (check it against your sensor's
// datasheet; some batches differ):
//   0x0000 moisture x0.1 %      0x0001 temperature x0.1 C (signed)
//   0x0002 EC uS/cm             0x0003 pH x0.1
//   0x0004 N mg/kg  0x0005 P mg/kg  0x0006 K mg/kg
bool readSoil(Reading &r) {
  uint8_t result = soilSensor.readHoldingRegisters(0x0000, 7);
  if (result != soilSensor.ku8MBSuccess) {
    Serial.printf("Soil sensor read failed (Modbus code 0x%02X)\n", result);
    return false;
  }

  r.soilMoisture = soilSensor.getResponseBuffer(0) / 10.0f;
  r.temperature = (int16_t)soilSensor.getResponseBuffer(1) / 10.0f;
  r.ec = soilSensor.getResponseBuffer(2) / 1000.0f;   // uS/cm to dS/m
  r.ph = soilSensor.getResponseBuffer(3) / 10.0f;
  r.nitrogen = soilSensor.getResponseBuffer(4);
  r.phosphorus = soilSensor.getResponseBuffer(5);
  r.potassium = soilSensor.getResponseBuffer(6);
  return true;
}

// ------------------------------------------------------------------ network

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("Connecting to WiFi \"%s\"", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long started = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - started < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected, IP ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi not connected, will retry");
  }
}

void addDeviceKey(HTTPClient &http) {
  if (strlen(DEVICE_API_KEY) > 0) {
    http.addHeader("X-Device-Key", DEVICE_API_KEY);
  }
}

void uploadReading() {
  Reading r = {};

  // On a failed read an all-zero frame is still sent: the backend uses
  // it to show the soil sensor as offline and never irrigates on it.
  readSoil(r);

#if USE_DHT22
  float h = dht.readHumidity();
  if (!isnan(h)) r.humidity = h;
#endif

  JsonDocument doc;
  doc["soil_moisture"] = r.soilMoisture;
  doc["temperature"] = r.temperature;
  doc["humidity"] = r.humidity;
  doc["ph"] = r.ph;
  doc["ec"] = r.ec;
  doc["nitrogen"] = r.nitrogen;
  doc["phosphorus"] = r.phosphorus;
  doc["potassium"] = r.potassium;

  String body;
  serializeJson(doc, body);

  HTTPClient http;
  http.begin(String(BACKEND_URL) + "/sensor/upload");
  http.addHeader("Content-Type", "application/json");
  addDeviceKey(http);

  int status = http.POST(body);
  Serial.printf("Upload %d  %s\n", status, body.c_str());
  http.end();
}

void fetchControls() {
  HTTPClient http;
  http.begin(String(BACKEND_URL) + "/controls/status");
  addDeviceKey(http);

  int status = http.GET();
  if (status == 200) {
    JsonDocument doc;
    if (!deserializeJson(doc, http.getString())) {
      bool wantPump = doc["pump_on"] | false;
      bool wantValve = doc["valve_on"] | false;

      if (!wantPump) pumpLockedOut = false;
      if (pumpLockedOut) wantPump = false;

      if (wantPump != pumpOn) {
        Serial.printf("Pump %s\n", wantPump ? "ON" : "OFF");
        setPump(wantPump);
      }
      if (wantValve != valveOn) {
        Serial.printf("Valve %s\n", wantValve ? "ON" : "OFF");
        setValve(wantValve);
      }
      lastCommandAt = millis();
    }
  } else {
    Serial.printf("Control poll failed (%d)\n", status);
  }
  http.end();
}

// ------------------------------------------------------------------ main

void setup() {
  Serial.begin(115200);

  pinMode(PUMP_RELAY_PIN, OUTPUT);
  pinMode(VALVE_RELAY_PIN, OUTPUT);
  allOff();

  pinMode(RS485_DE_RE_PIN, OUTPUT);
  postTransmission();
  Serial2.begin(SOIL_SENSOR_BAUD, SERIAL_8N1, RS485_RX_PIN, RS485_TX_PIN);
  soilSensor.begin(SOIL_SENSOR_ADDRESS, Serial2);
  soilSensor.preTransmission(preTransmission);
  soilSensor.postTransmission(postTransmission);

#if USE_DHT22
  dht.begin();
#endif

  connectWifi();
  lastCommandAt = millis();
}

void loop() {
  unsigned long now = millis();

  connectWifi();

  if (WiFi.status() == WL_CONNECTED) {
    if (now - lastControlAt >= CONTROL_INTERVAL_MS) {
      lastControlAt = now;
      fetchControls();
    }
    if (now - lastSensorAt >= SENSOR_INTERVAL_MS) {
      lastSensorAt = now;
      uploadReading();
    }
  }

  // Fail safe: no fresh command from the backend means relays go off.
  if ((pumpOn || valveOn) && now - lastCommandAt >= COMMAND_TIMEOUT_MS) {
    Serial.println("Backend unreachable, switching all relays off");
    allOff();
  }

  // Hardware backstop in case the backend keeps saying ON.
  if (pumpOn && now - pumpStartedAt >= PUMP_MAX_RUN_MS) {
    Serial.println("Pump hit hardware runtime limit, switching off");
    pumpLockedOut = true;
    setPump(false);
  }

  delay(50);
}

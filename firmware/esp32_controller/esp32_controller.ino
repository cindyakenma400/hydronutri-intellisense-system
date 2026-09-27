/*
 * HydroNutri IntelliSense - ESP32 Firmware
 * Reads the CWT-SOIL-NPKPHCTH-S sensor over RS485 (Modbus RTU) via a
 * level shifter, POSTs readings to the FastAPI backend, and drives the
 * irrigation pump and fertilizer pump relays from the backend's control state.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ====================== FILL THESE IN ======================
const char* WIFI_SSID     = "Galaxy A16 573C";
const char* WIFI_PASSWORD = "en6i6p4ie3ddzq7";
const char* BACKEND_IP    = "10.69.84.2";   // your PC's IP (ipconfig)
const int   BACKEND_PORT  = 8000;
// ===========================================================

// ---- RS485 pins (through the level shifter) ----
#define RS485_RX   16   // ESP32 RX2 -> shifter LV1 -> MAX485 RO
#define RS485_TX   17   // ESP32 TX2 -> shifter LV2 -> MAX485 DI
#define RS485_DE    4   // ESP32     -> shifter LV3 -> MAX485 DE+RE

// ---- Relay pins ----
#define IRRIGATION_PUMP   40  // IN1 - irrigation pump
#define FERTILIZER_PUMP   27  // IN2 - fertilizer pump

// Set to 1 if the relay switches ON but never switches back OFF.
// That happens with 5 V active-low relay boards driven from the
// ESP32's 3.3 V pins: HIGH is not high enough to release the relay.
// With 1, OFF leaves the pin floating instead, which the relay board
// reads as OFF. Set to 0 if your relay turns off fine with HIGH.
#define RELAY_OFF_FLOATING 1

const unsigned long SENSOR_INTERVAL  = 5000;  // read + upload every 5s
const unsigned long CONTROL_INTERVAL = 2000;  // poll controls every 2s
const unsigned long COMMAND_TIMEOUT  = 60000; // relays off if no backend for 60s

unsigned long lastSensorRun  = 0;
unsigned long lastControlRun = 0;
unsigned long lastControlOK  = 0;

// Modbus read requests: address 0x01, function 0x03, one register each.
const byte REQ_HUMIDITY[]    = {0x01,0x03,0x00,0x00,0x00,0x01,0x84,0x0A};
const byte REQ_TEMPERATURE[] = {0x01,0x03,0x00,0x01,0x00,0x01,0xD5,0xCA};
const byte REQ_EC[]          = {0x01,0x03,0x00,0x02,0x00,0x01,0x25,0xCA};
const byte REQ_PH[]          = {0x01,0x03,0x00,0x03,0x00,0x01,0x74,0x0A};
const byte REQ_NITROGEN[]    = {0x01,0x03,0x00,0x04,0x00,0x01,0xC5,0xCB};
const byte REQ_PHOSPHORUS[]  = {0x01,0x03,0x00,0x05,0x00,0x01,0x94,0x0B};
const byte REQ_POTASSIUM[]   = {0x01,0x03,0x00,0x06,0x00,0x01,0x64,0x0B};

// ---------------------------------------------------------------- relays

void relayOn(int pin) {
#if RELAY_OFF_FLOATING
  pinMode(pin, OUTPUT);
  digitalWrite(pin, LOW);
#else
  digitalWrite(pin, LOW);
#endif
}

void relayOff(int pin) {
#if RELAY_OFF_FLOATING
  pinMode(pin, INPUT);   // float — relay board's pullup reads it as OFF
#else
  digitalWrite(pin, HIGH);
#endif
}

void allOff() {
  relayOff(IRRIGATION_PUMP);
  relayOff(FERTILIZER_PUMP);
}

// ---------------------------------------------------------------- Modbus

// Sends one Modbus request, returns the raw 16-bit value or -1 on error.
int readRegister(const byte* request) {
  byte responseBuffer[8] = {0};

  while (Serial2.available()) Serial2.read();   // flush junk

  digitalWrite(RS485_DE, HIGH);                 // transmit mode
  delay(5);
  Serial2.write(request, 8);
  Serial2.flush();
  digitalWrite(RS485_DE, LOW);                  // receive mode

  unsigned long start = millis();
  int idx = 0;
  while (millis() - start < 200 && idx < 7) {
    if (Serial2.available()) {
      responseBuffer[idx++] = Serial2.read();
    }
  }

  // Valid single-register reply is 7 bytes, starting 0x01 0x03.
  if (idx < 7 || responseBuffer[0] != 0x01 || responseBuffer[1] != 0x03) {
    return -1;
  }
  return (int)((responseBuffer[3] << 8) | responseBuffer[4]);
}

// ---------------------------------------------------------------- WiFi

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected. ESP32 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi not connected, will retry");
  }
}

// ---------------------------------------------------------------- main

void setup() {
  Serial.begin(115200);

  Serial2.begin(4800, SERIAL_8N1, RS485_RX, RS485_TX);
  pinMode(RS485_DE, OUTPUT);
  digitalWrite(RS485_DE, LOW);

  pinMode(IRRIGATION_PUMP, OUTPUT);
  pinMode(FERTILIZER_PUMP, OUTPUT);
  allOff();

  connectWiFi();
  lastControlOK = millis();
  Serial.println("HydroNutri ESP32 ready.");
}

void loop() {
  unsigned long now = millis();

  connectWiFi();

  if (WiFi.status() != WL_CONNECTED) return;

  // ---- Poll controls every 2 seconds (fast response to dashboard) ----
  if (now - lastControlRun >= CONTROL_INTERVAL) {
    lastControlRun = now;

    HTTPClient ctrl;
    String cUrl = "http://" + String(BACKEND_IP) + ":" +
                  String(BACKEND_PORT) + "/controls/status";
    ctrl.begin(cUrl);
    int cCode = ctrl.GET();
    if (cCode == 200) {
      StaticJsonDocument<200> cDoc;
      if (deserializeJson(cDoc, ctrl.getString()) == DeserializationError::Ok) {
        bool pumpOn  = cDoc["pump_on"]  | false;
        bool valveOn = cDoc["valve_on"] | false;
        pumpOn ? relayOn(IRRIGATION_PUMP) : relayOff(IRRIGATION_PUMP);
        valveOn ? relayOn(FERTILIZER_PUMP) : relayOff(FERTILIZER_PUMP);
        Serial.printf("Relays -> irrigation:%s fertilizer:%s\n",
                      pumpOn ? "ON" : "OFF", valveOn ? "ON" : "OFF");
        lastControlOK = now;
      }
    } else {
      Serial.println("Control read failed: " + String(cCode));
    }
    ctrl.end();
  }

  // ---- Read sensors and upload every 5 seconds ----
  if (now - lastSensorRun >= SENSOR_INTERVAL) {
    lastSensorRun = now;

    int rawHum = readRegister(REQ_HUMIDITY);    delay(60);
    int rawTmp = readRegister(REQ_TEMPERATURE); delay(60);
    int rawEc  = readRegister(REQ_EC);          delay(60);
    int rawPh  = readRegister(REQ_PH);          delay(60);
    int rawN   = readRegister(REQ_NITROGEN);    delay(60);
    int rawP   = readRegister(REQ_PHOSPHORUS);  delay(60);
    int rawK   = readRegister(REQ_POTASSIUM);   delay(60);

    float soil_moisture = (rawHum >= 0) ? rawHum / 10.0 : 0;
    float temperature   = (rawTmp >= 0) ? rawTmp / 10.0 : 0;
    float ec            = (rawEc  >= 0) ? rawEc  / 1000.0 : 0;
    float ph            = (rawPh  >= 0) ? rawPh  / 10.0 : 0;
    float nitrogen      = (rawN   >= 0) ? rawN : 0;
    float phosphorus    = (rawP   >= 0) ? rawP : 0;
    float potassium     = (rawK   >= 0) ? rawK : 0;

    Serial.printf("M:%.1f T:%.1f EC:%.2f pH:%.1f N:%.0f P:%.0f K:%.0f\n",
                  soil_moisture, temperature, ec, ph,
                  nitrogen, phosphorus, potassium);

    HTTPClient http;
    String url = "http://" + String(BACKEND_IP) + ":" +
                 String(BACKEND_PORT) + "/sensor/upload";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<300> doc;
    doc["temperature"]   = temperature;
    doc["humidity"]      = 0;              // no air-humidity sensor
    doc["soil_moisture"] = soil_moisture;
    doc["nitrogen"]      = nitrogen;
    doc["phosphorus"]    = phosphorus;
    doc["potassium"]     = potassium;
    doc["ph"]            = ph;
    doc["ec"]            = ec;

    String body;
    serializeJson(doc, body);
    int code = http.POST(body);
    Serial.println(code == 200 ? "Upload OK" : "Upload failed: " + String(code));
    http.end();
  }

  // ---- Safety: no backend for 60 seconds -> all relays off ----
  if (now - lastControlOK >= COMMAND_TIMEOUT) {
    Serial.println("Backend unreachable for 60s, switching all pumps off");
    allOff();
    lastControlOK = now;  // print the warning once per minute, not every loop
  }

  delay(50);
}

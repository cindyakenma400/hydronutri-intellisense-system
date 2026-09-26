// Copy this file to config.h (same folder) and fill in your values.
// config.h is ignored by git so WiFi passwords never get committed.

#pragma once

// ---------------------------------------------------------------- network
#define WIFI_SSID     "your-wifi-name"
#define WIFI_PASSWORD "your-wifi-password"

// LAN address of the computer running the FastAPI backend, started with
//   uvicorn app.main:app --host 0.0.0.0 --port 8000
// Find it with `ipconfig` (Windows) or `ip addr` (Linux). Not 127.0.0.1:
// on the ESP32 that would mean the ESP32 itself.
#define BACKEND_URL "http://192.168.1.50:8000"

// Must match DEVICE_API_KEY in the backend environment. Leave empty if
// the backend does not set one.
#define DEVICE_API_KEY ""

// ---------------------------------------------------------------- relays
#define PUMP_RELAY_PIN  26   // irrigation pump
#define VALVE_RELAY_PIN 27   // fertilizer valve / dosing pump

// Most cheap relay boards switch ON when the input is pulled LOW.
// Set to 0 if your board switches ON with HIGH.
#define RELAY_ACTIVE_LOW 1

// ---------------------------------------------------------------- soil sensor
// CWT-SOIL-NPKPHCTH-S on RS485 through a MAX485 module.
#define RS485_RX_PIN   16    // MAX485 RO
#define RS485_TX_PIN   17    // MAX485 DI
#define RS485_DE_RE_PIN 4    // MAX485 DE and RE tied together
#define SOIL_SENSOR_ADDRESS 1
#define SOIL_SENSOR_BAUD    4800

// ---------------------------------------------------------------- air sensor
// Optional DHT22 for air humidity. The soil probe has no air humidity
// channel; with this off, humidity is reported as 0.
#define USE_DHT22   0
#define DHT22_PIN   15

// ---------------------------------------------------------------- timing
#define SENSOR_INTERVAL_MS  5000UL    // how often readings are uploaded
#define CONTROL_INTERVAL_MS 2000UL    // how often pump commands are fetched

// If the backend cannot be reached for this long, every relay is switched
// off. A lost WiFi link must never leave the pump running.
#define COMMAND_TIMEOUT_MS  60000UL

// Hardware backstop on top of the backend's own maximum runtime.
#define PUMP_MAX_RUN_MS     (30UL * 60UL * 1000UL)

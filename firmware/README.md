# ESP32 field controller

`esp32_controller/` is the firmware for the ESP32 that sits in the field. It does two jobs:

1. Every 5 seconds it reads the soil probe and sends the reading to `POST /sensor/upload`.
2. Every 2 seconds it asks the backend `GET /controls/status` and switches the pump and valve relays to match.

Users never talk to the ESP32 directly. They press the pump button on the dashboard (from a computer or a phone), the backend stores the new state, and the ESP32 picks it up within 2 seconds. Auto mode works the same way: the backend decides from soil moisture and the ESP32 follows.

## Wiring

| Part | ESP32 pin | Notes |
|---|---|---|
| Pump relay IN | GPIO 26 | Relay switches the pump's own power supply, never power it from the ESP32 |
| Valve / dosing pump relay IN | GPIO 27 | |
| MAX485 RO | GPIO 16 | RS485 module for the soil probe |
| MAX485 DI | GPIO 17 | |
| MAX485 DE + RE (tied) | GPIO 4 | |
| MAX485 A / B | Probe A / B | Probe needs its own 12 to 24 V supply |
| DHT22 data (optional) | GPIO 15 | Air humidity; set `USE_DHT22 1` |

All pins can be changed in `config.h`.

## Flashing

1. Install the Arduino IDE and add the ESP32 board package (Boards Manager, search "esp32" by Espressif).
2. Install libraries from the Library Manager: **ArduinoJson** (v7), **ModbusMaster**, and **DHT sensor library** if you use a DHT22.
3. Copy `esp32_controller/config.example.h` to `esp32_controller/config.h` and fill in WiFi, the backend address, and the device key. `config.h` is ignored by git.
4. Open `esp32_controller/esp32_controller.ino`, pick your ESP32 board and port, and upload.
5. Open the Serial Monitor at 115200 baud. You should see `Upload 200` lines and `Pump ON` / `Pump OFF` when you press the dashboard button.

The soil probe register map in `readSoil()` is the common one for the CWT 7-in-1 probe. Check it against the datasheet that came with your sensor.

## Safety behaviour

- **WiFi or backend lost:** if no command arrives for 60 seconds, every relay switches off.
- **Maximum runtime:** the backend stops the pump after the "Maximum pump runtime" in Settings. The ESP32 also has its own 30 minute limit, and after it trips the pump stays off until the backend says OFF.
- **Sensor failure:** a failed probe read is sent as all zeros. The dashboard then shows the soil sensor as offline, and auto mode ignores that reading instead of irrigating on it.

## Testing without hardware

`backend/simulate_esp32.py` behaves like this firmware: it uploads readings and obeys the pump state, and simulated moisture rises while the pump is on. Turn on Auto Mode, run `python simulate_esp32.py --scenario dry`, and watch the pump switch on, then off once the soil is wet again.

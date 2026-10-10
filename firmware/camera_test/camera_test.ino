/*
 * Camera Test Sketch for ESP32-CAM + RHYX M21-45 (GC2145)
 *
 * This camera does NOT support JPEG — it only outputs RGB565.
 * Upload this sketch, open Serial Monitor at 115200 baud, and
 * check the output to verify your camera is working.
 *
 * Board: AI Thinker ESP32-CAM
 * Arduino IDE: Tools > Board > ESP32 Arduino > AI Thinker ESP32-CAM
 */

#define CAMERA_MODEL_AI_THINKER
#include "esp_camera.h"

// AI Thinker ESP32-CAM pin definitions
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define FLASH_LED_PIN      4

#define NUM_TEST_FRAMES    5

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("========================================");
  Serial.println(" ESP32-CAM + RHYX M21-45 Camera Test");
  Serial.println("========================================");
  Serial.println();

  pinMode(FLASH_LED_PIN, OUTPUT);
  digitalWrite(FLASH_LED_PIN, LOW);

  // --- Camera configuration (RGB565 for RHYX M21-45) ---
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;

  // RHYX M21-45 fix: use RGB565 instead of JPEG
  config.pixel_format = PIXFORMAT_RGB565;
  config.frame_size   = FRAMESIZE_QVGA;  // 320x240 — max safe size for RGB565

  config.fb_count     = 1;
  config.grab_mode    = CAMERA_GRAB_LATEST;

  // --- Initialize camera ---
  Serial.print("[1/4] Initializing camera... ");
  esp_err_t err = esp_camera_init(&config);

  if (err != ESP_OK) {
    Serial.printf("FAILED (error 0x%x)\n\n", err);

    if (err == 0x105) {
      Serial.println(">>> Error 0x105: Camera not found.");
      Serial.println("    - Check the ribbon cable connection.");
      Serial.println("    - Gold fingers should face INWARD (toward the ESP32 chip).");
      Serial.println("    - Press the black locking latch down firmly.");
    } else if (err == 0x106) {
      Serial.println(">>> Error 0x106: Format not supported.");
      Serial.println("    - Make sure pixel_format is PIXFORMAT_RGB565 (not JPEG).");
    } else {
      Serial.println(">>> Unknown error. Double-check wiring and board selection.");
    }

    Serial.println("\nCamera test FAILED. Fix the issue and reset the board.");
    while (true) delay(1000);
  }

  Serial.println("OK");

  // --- Check PSRAM ---
  Serial.print("[2/4] PSRAM: ");
  if (psramFound()) {
    Serial.printf("Found (%d bytes free)\n", ESP.getFreePsram());
  } else {
    Serial.println("Not found (OK for QVGA RGB565)");
  }

  // --- Print sensor info ---
  Serial.print("[3/4] Camera sensor: ");
  sensor_t *s = esp_camera_sensor_get();
  if (s) {
    Serial.printf("PID=0x%02X  (", s->id.PID);
    switch (s->id.PID) {
      case 0x2145: Serial.print("GC2145 / RHYX M21-45"); break;
      case 0x26:   Serial.print("OV2640");               break;
      case 0x36:   Serial.print("OV3660");               break;
      default:     Serial.print("Unknown");              break;
    }
    Serial.println(")");
  } else {
    Serial.println("Could not read sensor info");
  }

  // --- Capture test frames ---
  Serial.printf("[4/4] Capturing %d test frames...\n\n", NUM_TEST_FRAMES);

  int successCount = 0;
  for (int i = 1; i <= NUM_TEST_FRAMES; i++) {
    Serial.printf("  Frame %d/%d: ", i, NUM_TEST_FRAMES);

    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("FAILED (null frame buffer)");
      continue;
    }

    Serial.printf("OK  %dx%d  %d bytes  format=%d",
                  fb->width, fb->height, fb->len, fb->format);

    // Sanity check: QVGA RGB565 should be 320*240*2 = 153600 bytes
    size_t expected = fb->width * fb->height * 2;
    if (fb->len == expected) {
      Serial.print("  [size OK]");
    } else {
      Serial.printf("  [expected %d]", expected);
    }

    // Check if the frame is not all-zero (black)
    bool allZero = true;
    for (size_t j = 0; j < fb->len && j < 1024; j++) {
      if (fb->buf[j] != 0) {
        allZero = false;
        break;
      }
    }

    if (allZero) {
      Serial.print("  [WARNING: data is all zeros — possible black frame]");
    } else {
      Serial.print("  [has pixel data]");
      successCount++;
    }

    Serial.println();
    esp_camera_fb_return(fb);
    delay(200);
  }

  // --- Summary ---
  Serial.println();
  Serial.println("========================================");
  if (successCount == NUM_TEST_FRAMES) {
    Serial.println(" RESULT: CAMERA IS WORKING");
    Serial.println(" All frames captured with pixel data.");
  } else if (successCount > 0) {
    Serial.printf(" RESULT: PARTIAL (%d/%d frames OK)\n", successCount, NUM_TEST_FRAMES);
    Serial.println(" Some frames had issues. Check ribbon cable.");
  } else {
    Serial.println(" RESULT: CAMERA NOT WORKING");
    Serial.println(" No valid frames captured.");
    Serial.println(" - Reseat the ribbon cable");
    Serial.println(" - Try a different ESP32-CAM board");
  }
  Serial.println("========================================");

  // Flash the LED to signal test completion
  for (int i = 0; i < 3; i++) {
    digitalWrite(FLASH_LED_PIN, HIGH);
    delay(150);
    digitalWrite(FLASH_LED_PIN, LOW);
    delay(150);
  }

  Serial.println("\nFree heap: " + String(ESP.getFreeHeap()) + " bytes");
  Serial.println("Test complete. Board will idle now.");
}

void loop() {
  delay(10000);
}

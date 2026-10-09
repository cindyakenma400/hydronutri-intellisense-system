/*
 * ESP32-CAM Simple Test v2
 * Streams video to a web browser so you can verify the camera works.
 * Open Serial Monitor at 115200 after reset to see the IP address,
 * then open that IP in your browser.
 */

#include "esp_camera.h"
#include <WiFi.h>

// ====================== FILL THESE IN ======================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
// ===========================================================

// ---------- AI Thinker ESP32-CAM pin definitions ----------
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

// Built-in LED flash
#define FLASH_GPIO_NUM     4

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nESP32-CAM Test v2 Starting...");

  // Turn off the flash LED
  pinMode(FLASH_GPIO_NUM, OUTPUT);
  digitalWrite(FLASH_GPIO_NUM, LOW);

  // Power cycle the camera to reset it
  pinMode(PWDN_GPIO_NUM, OUTPUT);
  digitalWrite(PWDN_GPIO_NUM, HIGH);
  delay(200);
  digitalWrite(PWDN_GPIO_NUM, LOW);
  delay(200);

  // Camera configuration
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
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode    = CAMERA_GRAB_LATEST;

  // Use lower resolution and quality for maximum reliability
  config.frame_size   = FRAMESIZE_QVGA;   // 320x240 (smaller = more reliable)
  config.jpeg_quality = 15;               // 0-63, higher = more compression
  config.fb_count     = 2;                // 2 frame buffers for stability
  config.fb_location  = CAMERA_FB_IN_PSRAM;

  // Check for PSRAM
  if (psramFound()) {
    Serial.println("PSRAM found, using higher settings");
    config.frame_size   = FRAMESIZE_VGA;   // 640x480
    config.jpeg_quality = 10;
    config.fb_count     = 2;
  } else {
    Serial.println("No PSRAM, using low resolution");
  }

  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init FAILED with error 0x%x\n", err);
    if (err == 0x105) {
      Serial.println("-> Camera not detected. Check the ribbon cable.");
    } else if (err == 0x20001) {
      Serial.println("-> Camera ID not found. Wrong camera type?");
    }
    Serial.println("Try: unplug, reseat ribbon cable, plug back in.");
    return;
  }
  Serial.println("Camera init OK");

  // Detect and configure the OV3660 sensor
  sensor_t *s = esp_camera_sensor_get();
  if (s) {
    Serial.printf("Camera sensor PID: 0x%x\n", s->id.PID);
    if (s->id.PID == 0x3660) {
      Serial.println("OV3660 detected - applying settings");
      s->set_vflip(s, 1);
      s->set_brightness(s, 1);
      s->set_saturation(s, -2);
    } else if (s->id.PID == 0x2640) {
      Serial.println("OV2640 detected");
    } else {
      Serial.printf("Unknown sensor: 0x%x\n", s->id.PID);
    }
  }

  // Warm up: take and discard a few frames
  Serial.print("Warming up camera");
  for (int i = 0; i < 5; i++) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (fb) {
      Serial.printf(" [frame %d: %u bytes]", i + 1, fb->len);
      esp_camera_fb_return(fb);
    } else {
      Serial.printf(" [frame %d: FAILED]", i + 1);
    }
    delay(200);
  }
  Serial.println(" Done");

  // Test capture
  camera_fb_t* test = esp_camera_fb_get();
  if (test) {
    Serial.printf("Test capture OK: %ux%u, %u bytes\n",
                  test->width, test->height, test->len);
    esp_camera_fb_return(test);
  } else {
    Serial.println("WARNING: Test capture failed!");
    Serial.println("Camera may be defective or ribbon cable loose.");
  }

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected! IP address: ");
  Serial.println(WiFi.localIP());

  server.begin();
  Serial.println("Web server started.");
  Serial.println("Open this IP in your browser to see the camera.");
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  String request = client.readStringUntil('\r');
  client.readString();

  if (request.indexOf("/capture") >= 0) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Capture failed!");
      client.println("HTTP/1.1 500 Internal Server Error");
      client.println("Content-Type: text/plain");
      client.println("Connection: close");
      client.println();
      client.println("Camera capture failed. Check Serial Monitor.");
      client.stop();
      return;
    }

    Serial.printf("Capture OK: %u bytes\n", fb->len);
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: image/jpeg");
    client.printf("Content-Length: %u\r\n", fb->len);
    client.println("Connection: close");
    client.println();
    client.write(fb->buf, fb->len);
    esp_camera_fb_return(fb);

  } else {
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println("Connection: close");
    client.println();
    client.println("<!DOCTYPE html><html><head>");
    client.println("<title>ESP32-CAM Test</title>");
    client.println("<style>");
    client.println("body{font-family:sans-serif;text-align:center;background:#111;color:#fff;margin:20px}");
    client.println("img{max-width:100%;border:2px solid #333;border-radius:8px}");
    client.println("h1{color:#4CAF50}");
    client.println("a{color:#4CAF50}");
    client.println("</style></head><body>");
    client.println("<h1>ESP32-CAM Test</h1>");
    client.println("<p>Camera is working! Image refreshes every 3 seconds.</p>");
    client.println("<p><a href='/capture'>Click here for single capture</a></p>");
    client.println("<img id='cam' src='/capture'>");
    client.println("<p id='status'>Loading...</p>");
    client.println("<script>");
    client.println("var img = document.getElementById('cam');");
    client.println("var status = document.getElementById('status');");
    client.println("var count = 0;");
    client.println("img.onload = function(){ status.textContent = 'Frame ' + (++count) + ' loaded'; };");
    client.println("img.onerror = function(){ status.textContent = 'Frame failed - retrying...'; };");
    client.println("setInterval(function(){");
    client.println("  img.src = '/capture?' + Date.now();");
    client.println("}, 3000);");
    client.println("</script>");
    client.println("</body></html>");
  }

  client.stop();
}

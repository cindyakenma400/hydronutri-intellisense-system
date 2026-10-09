/*
 * ESP32-CAM Simple Test v3 - OV3660
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

#define FLASH_GPIO_NUM     4

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nESP32-CAM Test v3 (OV3660) Starting...");

  // Turn off flash
  pinMode(FLASH_GPIO_NUM, OUTPUT);
  digitalWrite(FLASH_GPIO_NUM, LOW);

  // Hard power cycle the camera
  pinMode(PWDN_GPIO_NUM, OUTPUT);
  digitalWrite(PWDN_GPIO_NUM, HIGH);
  delay(500);
  digitalWrite(PWDN_GPIO_NUM, LOW);
  delay(500);

  // Camera configuration - conservative for OV3660
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
  config.pixel_format = PIXFORMAT_JPEG;

  // OV3660 works better with 10MHz clock on some boards
  config.xclk_freq_hz = 10000000;

  // Start very small - QQVGA 160x120
  config.frame_size   = FRAMESIZE_QQVGA;
  config.jpeg_quality = 20;
  config.fb_count     = 1;
  config.fb_location  = CAMERA_FB_IN_DRAM;
  config.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;

  Serial.printf("PSRAM found: %s\n", psramFound() ? "YES" : "NO");

  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init FAILED: 0x%x\n", err);
    return;
  }
  Serial.println("Camera init OK");

  // Detect sensor
  sensor_t *s = esp_camera_sensor_get();
  if (s) {
    Serial.printf("Sensor PID: 0x%x\n", s->id.PID);
    if (s->id.PID == 0x3660) {
      Serial.println("OV3660 confirmed");
      s->set_vflip(s, 1);
      s->set_brightness(s, 1);
      s->set_saturation(s, 0);
    }
  }

  // Warmup - take and discard frames
  Serial.println("Warming up...");
  for (int i = 0; i < 10; i++) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (fb) {
      Serial.printf("  Frame %d: %ux%u, %u bytes\n",
                    i + 1, fb->width, fb->height, fb->len);
      esp_camera_fb_return(fb);
    } else {
      Serial.printf("  Frame %d: FAILED\n", i + 1);
    }
    delay(300);
  }

  // If QQVGA works, try stepping up to QVGA
  Serial.println("Trying QVGA (320x240)...");
  if (s) {
    s->set_framesize(s, FRAMESIZE_QVGA);
    delay(500);
  }

  camera_fb_t* test = esp_camera_fb_get();
  if (test) {
    Serial.printf("QVGA capture OK: %ux%u, %u bytes\n",
                  test->width, test->height, test->len);
    esp_camera_fb_return(test);
  } else {
    Serial.println("QVGA failed, falling back to QQVGA");
    if (s) s->set_framesize(s, FRAMESIZE_QQVGA);
  }

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected! IP: ");
  Serial.println(WiFi.localIP());

  server.begin();
  Serial.println("Open this IP in your browser.");
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  String request = client.readStringUntil('\r');
  client.readString();

  if (request.indexOf("/capture") >= 0) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Capture FAILED");
      client.println("HTTP/1.1 500 Internal Server Error");
      client.println("Content-Type: text/plain");
      client.println("Connection: close");
      client.println();
      client.println("Capture failed");
      client.stop();
      return;
    }

    Serial.printf("Serve: %ux%u, %u bytes\n", fb->width, fb->height, fb->len);
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
    client.println("</style></head><body>");
    client.println("<h1>ESP32-CAM Test</h1>");
    client.println("<p>Image refreshes every 3 seconds.</p>");
    client.println("<img id='cam' src='/capture'>");
    client.println("<p id='s'>Loading...</p>");
    client.println("<script>");
    client.println("var img=document.getElementById('cam');");
    client.println("var s=document.getElementById('s');");
    client.println("var c=0;");
    client.println("img.onload=function(){s.textContent='Frame '+(++c);};");
    client.println("img.onerror=function(){s.textContent='Failed - retrying...';};");
    client.println("setInterval(function(){img.src='/capture?'+Date.now();},3000);");
    client.println("</script></body></html>");
  }

  client.stop();
}

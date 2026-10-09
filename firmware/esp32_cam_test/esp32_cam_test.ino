/*
 * ESP32-CAM Simple Test
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

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  Serial.println("\n\nESP32-CAM Test Starting...");

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

  // Start with lower resolution for reliability
  config.frame_size   = FRAMESIZE_VGA;   // 640x480
  config.jpeg_quality = 12;              // 0-63, lower = better quality
  config.fb_count     = 1;

  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init FAILED with error 0x%x\n", err);
    Serial.println("Check your wiring and board selection.");
    return;
  }
  Serial.println("Camera init OK");

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
    // Single photo capture
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      client.println("HTTP/1.1 500 Internal Server Error");
      client.println();
      client.println("Camera capture failed");
      return;
    }

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: image/jpeg");
    client.printf("Content-Length: %u\r\n", fb->len);
    client.println("Connection: close");
    client.println();
    client.write(fb->buf, fb->len);

    esp_camera_fb_return(fb);

  } else {
    // Simple HTML page with auto-refreshing image
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
    client.println("<p>Camera is working! Image refreshes every 2 seconds.</p>");
    client.println("<img id='cam' src='/capture'>");
    client.println("<script>");
    client.println("setInterval(function(){");
    client.println("  document.getElementById('cam').src='/capture?'+Date.now();");
    client.println("}, 2000);");
    client.println("</script>");
    client.println("</body></html>");
  }

  client.stop();
}

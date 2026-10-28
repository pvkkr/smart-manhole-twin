/*
 * Smart Manhole - ESP32 Wi-Fi WebSocket Gateway Firmware
 * ======================================================
 * Hardware Connections:
 *   ESP32 GPIO16 (RX2) <--- STM32 PA9 (TX1)
 *   ESP32 GPIO17 (TX2) ---> STM32 PA10 (RX1)
 *   ESP32 GND          <--- STM32 GND (Common Ground)
 *
 * Required Arduino Libraries:
 *   - WebSockets by Markus Sattler (install via Arduino Library Manager)
 *   - ArduinoJson by Benoit Blanchon (v6 or v7)
 */

#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// Wi-Fi Configuration
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Hardware Serial 2 for STM32 communication
#define RXD2 16
#define TXD2 17

WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Web Client Disconnected!\n", num);
      break;
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Web Client Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      // Send welcome handshake
      webSocket.sendTXT(num, "{\"status\":\"LINK_OK\",\"device\":\"ESP32_MANHOLE_GW\"}");
      break;
    }
    case WStype_TEXT:
      // Commands from frontend (e.g. buzzer trigger or threshold update)
      Serial.printf("[%u] Received command: %s\n", num, payload);
      Serial2.println((char*)payload); // Forward to STM32
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  // STM32 UART interface
  Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);

  Serial.println("\n--- Smart Manhole ESP32 Gateway Booting ---");

  // Connect to Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to Wi-Fi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected!");
    Serial.print("[Wi-Fi] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WebSocket] URL for Web Dashboard: ws://");
    Serial.print(WiFi.localIP());
    Serial.println(":81/telemetry");
  } else {
    // Fallback: create standalone Access Point if home Wi-Fi is unreachable
    Serial.println("\n[Wi-Fi] Fallback to SoftAP mode...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("SmartManhole-AP", "manhole123");
    Serial.print("[SoftAP] IP Address: ");
    Serial.println(WiFi.softAPIP());
    Serial.println("[WebSocket] URL for Web Dashboard: ws://192.168.4.1:81/telemetry");
  }

  // Start WebSocket server on port 81
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();

  // Read incoming telemetry line from STM32 UART
  if (Serial2.available()) {
    String jsonLine = Serial2.readStringUntil('\n');
    jsonLine.trim();

    if (jsonLine.startsWith("{") && jsonLine.endsWith("}")) {
      // Print to local debugging monitor
      Serial.println("[STM32 -> ESP32] " + jsonLine);

      // Broadcast over WebSocket to the Digital Twin Web App
      webSocket.broadcastTXT(jsonLine);
    }
  }
}

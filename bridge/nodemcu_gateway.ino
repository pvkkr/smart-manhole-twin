/*
 * Smart Manhole - Universal NodeMCU Wi-Fi WebSocket Gateway
 * =========================================================
 * Compatible with BOTH ESP8266 NodeMCU and ESP32 NodeMCU!
 *
 * Wiring to STM32F103C8T6 (Blue Pill):
 * ---------------------------------------------------------
 *   ESP8266 NodeMCU        ESP32 NodeMCU         STM32 Blue Pill
 *   ----------------       -------------         ---------------
 *   Pin D7 (GPIO13 RX)  OR GPIO16 (RX2)    <---  PA9 (USART1 TX)
 *   Pin D8 (GPIO15 TX)  OR GPIO17 (TX2)    --->  PA10 (USART1 RX)
 *   GND                    GND             <---  GND (Common Ground)
 * ---------------------------------------------------------
 *
 * Required Libraries (Install via Arduino IDE Library Manager):
 *   1. "WebSockets" by Markus Sattler
 *   2. "ArduinoJson" by Benoit Blanchon (v6 or v7)
 *   3. (For ESP8266 only) "SoftwareSerial" (built into ESP8266 core)
 */

#if defined(ESP8266)
  #include <ESP8266WiFi.h>
  #include <SoftwareSerial.h>
  #define BOARD_NAME "ESP8266_NodeMCU"
  SoftwareSerial stm32Serial(13, 15); // RX = D7 (GPIO13), TX = D8 (GPIO15)
#elif defined(ESP32)
  #include <WiFi.h>
  #define BOARD_NAME "ESP32_NodeMCU"
  #define RXD2 16
  #define TXD2 17
#endif

#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// ==========================================
// 1. YOUR WI-FI CREDENTIALS (Configure here)
// ==========================================
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// WebSocket Server running on Port 81
WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Web Dashboard Disconnected!\n", num);
      break;
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Web Dashboard Connected from %s\n", num, ip.toString().c_str());
      // Handshake packet
      webSocket.sendTXT(num, "{\"status\":\"LINK_OK\",\"device\":\"" BOARD_NAME "\"}");
      break;
    }
    case WStype_TEXT:
      Serial.printf("[%u] Command from Dashboard: %s\n", num, payload);
      // Forward any commands (e.g. buzzer trigger) back to STM32
      #if defined(ESP8266)
        stm32Serial.println((char*)payload);
      #elif defined(ESP32)
        Serial2.println((char*)payload);
      #endif
      break;
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);

  #if defined(ESP8266)
    stm32Serial.begin(115200);
  #elif defined(ESP32)
    Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);
  #endif

  Serial.println();
  Serial.println("==================================================");
  Serial.println(" SMART MANHOLE - NODEMCU WI-FI WEBSOCKET GATEWAY ");
  Serial.printf(" Board: %s\n", BOARD_NAME);
  Serial.println("==================================================");

  // Connect to Local Wi-Fi Network
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi: ");
  Serial.print(WIFI_SSID);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected successfully!");
    Serial.print("[Wi-Fi] NodeMCU IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.println("--------------------------------------------------");
    Serial.print("[Web Dashboard] Use this WebSocket URL:\n   ws://");
    Serial.print(WiFi.localIP());
    Serial.println(":81/telemetry");
    Serial.println("--------------------------------------------------");
  } else {
    // If router Wi-Fi failed, create a direct SoftAP hotspot
    Serial.println("\n[Wi-Fi] Could not connect to router. Starting SoftAP Hotspot...");
    WiFi.mode(WIFI_AP);
    WiFi.softAP("SmartManhole-AP", "manhole123");
    Serial.print("[SoftAP] Hotspot SSID: SmartManhole-AP (Password: manhole123)\n");
    Serial.print("[SoftAP] NodeMCU IP: ");
    Serial.println(WiFi.softAPIP());
    Serial.println("--------------------------------------------------");
    Serial.println("[Web Dashboard] Use this WebSocket URL:\n   ws://192.168.4.1:81/telemetry");
    Serial.println("--------------------------------------------------");
  }

  // Start WebSocket Server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("[WebSocket] Gateway server listening on Port 81...");
}

void loop() {
  webSocket.loop();

  // Read raw telemetry stream sent by STM32 USART1 (PA9)
  String jsonPacket = "";

  #if defined(ESP8266)
    if (stm32Serial.available()) {
      jsonPacket = stm32Serial.readStringUntil('\n');
    }
  #elif defined(ESP32)
    if (Serial2.available()) {
      jsonPacket = Serial2.readStringUntil('\n');
    }
  #endif

  jsonPacket.trim();

  // Validate JSON frame from STM32
  if (jsonPacket.length() > 10 && jsonPacket.startsWith("{") && jsonPacket.endsWith("}")) {
    // Print to Serial Monitor for verification
    Serial.print("[STM32 Telemetry] ");
    Serial.println(jsonPacket);

    // Broadcast live telemetry frame to all connected Web Dashboard clients
    webSocket.broadcastTXT(jsonPacket);
  }
}

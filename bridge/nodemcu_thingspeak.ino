/*
 * Smart Manhole - NodeMCU to ThingSpeak Cloud Gateway
 * ====================================================
 * Reads JSON telemetry from STM32F103 (PA9 TX) and uploads
 * directly to ThingSpeak Cloud over Wi-Fi!
 *
 * Compatible with BOTH ESP8266 NodeMCU and ESP32 NodeMCU!
 *
 * Hardware Connections:
 * ----------------------------------------------------
 *   STM32 Blue Pill      ESP8266 NodeMCU       ESP32 NodeMCU
 *   PA9 (USART1 TX) ---> Pin D7 (GPIO13 RX) OR GPIO16 (RX2)
 *   GND             ---> GND                OR GND
 * ----------------------------------------------------
 *
 * ThingSpeak Field Mapping:
 *   Field 1: Ultrasonic Distance (cm)
 *   Field 2: MQ-2 Gas (Raw ADC)
 *   Field 3: Temperature (°C)
 *   Field 4: Tilt Angle (deg)
 *   Field 5: Cover Open Status (0 = Closed, 1 = Open)
 *   Field 6: Status String ("NORMAL", "WARNING", "CRITICAL")
 */

#if defined(ESP8266)
  #include <ESP8266WiFi.h>
  #include <ESP8266HTTPClient.h>
  #include <SoftwareSerial.h>
  #define BOARD_NAME "ESP8266_NodeMCU"
  SoftwareSerial stm32Serial(13, 15); // RX = D7 (GPIO13), TX = D8 (GPIO15)
#elif defined(ESP32)
  #include <WiFi.h>
  #include <HTTPClient.h>
  #define BOARD_NAME "ESP32_NodeMCU"
  #define RXD2 16
  #define TXD2 17
#endif

#include <ArduinoJson.h>

// ==========================================================
// 1. CONFIGURE YOUR WI-FI & THINGSPEAK CREDENTIALS HERE
// ==========================================================
const char* WIFI_SSID           = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD       = "YOUR_WIFI_PASSWORD";
const char* THINGSPEAK_API_KEY  = "YOUR_THINGSPEAK_WRITE_API_KEY"; // 16-character Write API Key

// ThingSpeak minimum update interval: 15 seconds (Free Tier Limit)
const unsigned long UPLOAD_INTERVAL_MS = 15000;
unsigned long lastUploadTime = 0;

// Cached latest sensor values from STM32
float latest_distance_cm = 0.0;
int   latest_gas_adc     = 0;
float latest_temp_c      = 25.0;
float latest_tilt_deg    = 0.0;
int   latest_cover_open  = 0;
String latest_status     = "NORMAL";

void sendToThingSpeak() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ThingSpeak] Wi-Fi not connected. Skipping upload.");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  // Build ThingSpeak REST URL
  String url = "http://api.thingspeak.com/update?api_key=";
  url += THINGSPEAK_API_KEY;
  url += "&field1=" + String(latest_distance_cm, 1);
  url += "&field2=" + String(latest_gas_adc);
  url += "&field3=" + String(latest_temp_c, 1);
  url += "&field4=" + String(latest_tilt_deg, 1);
  url += "&field5=" + String(latest_cover_open);
  url += "&field6=" + latest_status;

  Serial.println("[ThingSpeak] Uploading telemetry to Cloud...");
  Serial.print("[URL] ");
  Serial.println(url);

  #if defined(ESP8266)
    http.begin(client, url);
  #elif defined(ESP32)
    http.begin(url);
  #endif

  int httpCode = http.GET();

  if (httpCode > 0) {
    String response = http.getString();
    int entryId = response.toInt();
    if (entryId > 0) {
      Serial.printf("[ThingSpeak] Success! Entry ID #%d recorded.\n", entryId);
    } else {
      Serial.printf("[ThingSpeak] Server returned: %s (Rate limited or invalid key)\n", response.c_str());
    }
  } else {
    Serial.printf("[ThingSpeak] HTTP GET failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
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
  Serial.println(" SMART MANHOLE - NODEMCU THINGSPEAK CLOUD GATEWAY ");
  Serial.printf(" Board: %s\n", BOARD_NAME);
  Serial.println("==================================================");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi: ");
  Serial.print(WIFI_SSID);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected!");
    Serial.print("[Wi-Fi] IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.println("[ThingSpeak] Ready to upload telemetry to api.thingspeak.com");
  } else {
    Serial.println("\n[Wi-Fi] Connection failed! Please check SSID and password.");
  }
}

void loop() {
  // 1. Ingest JSON frames arriving from STM32 USART1 (PA9)
  String jsonPacket = "";

  #if defined(ESP8266)
    if (stm32Serial.available()) {
      jsonPacket = stm32Serial.readStringUntil('\n');
    } else if (Serial.available()) {
      jsonPacket = Serial.readStringUntil('\n');
    }
  #elif defined(ESP32)
    if (Serial2.available()) {
      jsonPacket = Serial2.readStringUntil('\n');
    }
  #endif

  jsonPacket.trim();

  if (jsonPacket.length() > 10 && jsonPacket.startsWith("{") && jsonPacket.endsWith("}")) {
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, jsonPacket);

    if (!error) {
      latest_distance_cm = doc["distance_cm"] | 0.0;
      latest_gas_adc     = doc["gas_adc"] | 0;
      int temp_x100      = doc["temperature_x100"] | 2500;
      latest_temp_c      = (float)temp_x100 / 100.0;
      
      const char* cover_str = doc["cover"] | "COVER CLOSED";
      latest_cover_open  = (strcmp(cover_str, "COVER OPEN") == 0) ? 1 : 0;
      
      latest_status      = (const char*)(doc["status"] | "NORMAL");

      Serial.printf("[STM32 Data] Dist: %.1fcm | Gas: %d | Temp: %.1fC | Cover: %s\n",
                    latest_distance_cm, latest_gas_adc, latest_temp_c, cover_str);
    } else {
      Serial.print("[JSON Parse Warning]: ");
      Serial.println(jsonPacket);
    }
  }

  // 2. Upload to ThingSpeak Cloud every 15 seconds
  if (millis() - lastUploadTime >= UPLOAD_INTERVAL_MS) {
    lastUploadTime = millis();
    sendToThingSpeak();
  }
}

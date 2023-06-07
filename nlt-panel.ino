#include "config.h"

#include <vector>

#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>

#include <ArduinoJson.h>
#include <NTPClient.h>

#include <ESPAsyncTCP.h>
#include <WiFiUdp.h>

#include <Adafruit_NeoPixel.h>
#include <FastLED.h>

#include <AceCommon.h>
#include <AceRoutine.h>

using namespace ace_routine;

// @version 3.0.2

const uint8_t MAJOR = 3;
const uint8_t MINOR = 0;
const uint8_t PATCH = 2;

#define NUM_LEDS 128

Adafruit_NeoPixel strip(NUM_LEDS, D6, NEO_GRB + NEO_KHZ800);

const uint32_t DIGIT_COLOR = strip.Color(255, 255, 255);

const int rows[7] = { 0, 33, 36, 71, 75, 109, 111 };

const int digits[10][10] = {
  { 1, 2, 3, 5, 8, 10, 11, 12 }, { 2, 5, 7, 10, 12 }, { 1, 2, 5, 7, 6, 8, 11, 12 }, { 1, 2, 5, 7, 6, 10, 12, 10, 11 }, { 1, 3, 6, 7, 5, 10, 12 }, { 1, 2, 3, 6, 7, 10, 11, 12 }, { 2, 4, 6, 7, 8, 11, 12, 10 }, { 1, 2, 5, 7, 9, 11 }, { 1, 2, 3, 5, 6, 7, 8, 10, 11, 12 }, { 1, 2, 3, 5, 6, 7, 9, 11 }
};
const int digit_rows[12][2] = { { 1, 0 }, { 1, 1 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 3, 0 }, { 3, 1 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 5, 0 }, { 5, 1 } };

const int characters[27][25] = {
  { 1, 2, 3, 5, 8, 9, 12, 13, 14, 15, 16, 17, 20 },
  { 1, 2, 3, 5, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20 },
  { 1, 2, 3, 4, 5, 9, 13, 17, 18, 19, 20 },
  { 1, 2, 3, 5, 8, 8, 12, 13, 16, 17, 18, 19, 20 },
  { 1, 2, 3, 4, 5, 9, 10, 11, 13, 17, 18, 19, 20 },
  { 1, 2, 3, 4, 5, 9, 10, 11, 13, 17 },
  { 1, 2, 3, 4, 5, 9, 10, 11, 13, 16, 18, 19, 20 },
  { 1, 4, 5, 8, 9, 10, 11, 12, 13, 16, 17, 20 },
  { 2, 3, 4, 7, 11, 15, 17, 18, 19, 20 },
  { 2, 3, 4, 8, 9, 12, 13, 16, 18, 19, 20 },
  { 1, 3, 5, 7, 9, 10, 11, 13, 15, 17, 20 },
  { 1, 5, 9, 13, 17, 18, 19, 20 },
  { 1, 4, 5, 6, 7, 8, 9, 12, 13, 16, 17, 20 },
  { 1, 4, 5, 6, 8, 9, 11, 12, 13, 16, 17, 20 },
  { 1, 2, 3, 4, 5, 8, 9, 12, 13, 16, 17, 18, 19, 20 },
  { 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 17 },
  { 1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 18, 19, 20 },
  { 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 15, 17, 20 },
  { 1, 2, 3, 4, 5, 10, 11, 12, 16, 17, 18, 19, 20 },
  { 1, 2, 3, 4, 7, 11, 15, 19 },
  { 1, 4, 5, 8, 9, 12, 13, 16, 18, 19, 20 },
  { 1, 4, 5, 8, 10, 12, 15, 16, 20 },
  { 1, 5, 6, 10, 11, 13, 15, 16, 18, 20, 21, 22, 23, 24, 25 },
  { 1, 4, 7, 8, 9, 13, 17, 18, 19, 22, 25 },
  { 1, 4, 6, 8, 11, 12, 16, 20 },
  { 1, 2, 3, 4, 7, 10, 11, 13, 14, 17, 18, 19, 20 },
  { 10, 11, 12 }
};
const int character_rows[20][2] = { { 1, 0 }, { 1, 1 }, { 1, 2 }, { 1, 3 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 2, 3 }, { 3, 0 }, { 3, 1 }, { 3, 2 }, { 3, 3 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 4, 3 }, { 5, 0 }, { 5, 1 }, { 5, 2 }, { 5, 3 } };
const int character_rows_wide[25][2] = {
  { 1, 0 }, { 1, 1 }, { 1, 2 }, { 1, 3 }, { 1, 4 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 2, 3 }, { 2, 4 }, { 3, 0 }, { 3, 1 }, { 3, 2 }, { 3, 3 }, { 3, 4 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 4, 3 }, { 4, 4 }, { 5, 0 }, { 5, 1 }, { 5, 2 }, { 5, 3 }, { 5, 4 }
};

const int character_offset[5][2] = { { 0, 0 }, { 1, 0 }, { 1, 1 }, { 2, 1 }, { 2, 2 } };

const int noise_map[128][2] = {
  { 1, 5 }, { 2, 5 }, { 3, 5 }, { 4, 5 }, { 5, 5 }, { 6, 5 }, { 7, 5 }, { 8, 5 }, { 9, 5 }, { 10, 5 }, { 11, 5 }, { 12, 5 }, { 13, 5 }, { 14, 5 }, { 15, 5 }, { 16, 5 }, { 17, 5 }, { 18, 4 }, { 17, 4 }, { 16, 4 }, { 15, 4 }, { 14, 4 }, { 13, 4 }, { 12, 4 }, { 11, 4 }, { 10, 4 }, { 9, 4 }, { 8, 4 }, { 7, 4 }, { 6, 4 }, { 5, 4 }, { 4, 4 }, { 3, 4 }, { 2, 4 }, { 1, 4 }, { 0, 3 }, { 1, 3 }, { 2, 3 }, { 3, 3 }, { 4, 3 }, { 5, 3 }, { 6, 3 }, { 7, 3 }, { 8, 3 }, { 9, 3 }, { 10, 3 }, { 11, 3 }, { 12, 3 }, { 13, 3 }, { 14, 3 }, { 15, 3 }, { 16, 3 }, { 17, 3 }, { 18, 3 }, { 19, 2 }, { 18, 2 }, { 17, 2 }, { 16, 2 }, { 15, 2 }, { 14, 2 }, { 13, 2 }, { 12, 2 }, { 11, 2 }, { 10, 2 }, { 9, 2 }, { 8, 2 }, { 7, 2 }, { 6, 2 }, { 5, 2 }, { 4, 2 }, { 3, 2 }, { 2, 2 }, { 1, 2 }, { 0, 3 }, { 0, 2 }, { 1, 2 }, { 2, 2 }, { 3, 2 }, { 4, 2 }, { 5, 2 }, { 6, 2 }, { 7, 2 }, { 8, 2 }, { 9, 2 }, { 10, 2 }, { 11, 2 }, { 12, 2 }, { 13, 2 }, { 14, 2 }, { 15, 2 }, { 16, 2 }, { 17, 2 }, { 18, 2 }, { 18, 1 }, { 17, 1 }, { 16, 1 }, { 15, 1 }, { 14, 1 }, { 13, 1 }, { 12, 1 }, { 11, 1 }, { 10, 1 }, { 9, 1 }, { 8, 1 }, { 7, 1 }, { 6, 1 }, { 5, 1 }, { 4, 1 }, { 3, 1 }, { 2, 1 }, { 1, 1 }, { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 }, { 6, 0 }, { 7, 0 }, { 8, 0 }, { 9, 0 }, { 10, 0 }, { 11, 0 }, { 12, 0 }, { 13, 0 }, { 14, 0 }, { 15, 0 }, { 16, 0 }, { 17, 0 }
};

const int character_direction = 1;
// 0 = ltr (left to right)
// 1 = rtl (right to left) (werkt niet misclick)

static unsigned long last_time = 0;
unsigned long delta = 0;
uint16_t hue = 0;

uint16_t sky_color = strip.Color(0, 170, 255);
uint8_t sky_hue = 142;
uint16_t sky_hue_mapped = map(sky_hue, 0, 255, 0, 65535);

// https://openweathermap.org/weather-conditions
int weather_temp = 0;   // 🥶
int weather_group = 0;  // clear
int weather_id = 0;

WiFiUDP ntpUDP;
WiFiUDP broadcastUDP;

static std::vector<AsyncClient *> clients;

NTPClient time_client(ntpUDP, "europe.pool.ntp.org", 3600, 60000);

static void server_client_disconnect(void *arg, AsyncClient *client) {
  Serial.printf("\n client %s disconnected \n",
                client->remoteIP().toString().c_str());
}

// TODO: instellingen via sim?
// static void server_client_data(void *arg, AsyncClient *client, void *data,
// size_t len) {
//   Serial.println("Received data:");
//   Serial.write((uint8_t *)data, len);
// }

static void server_client_connect(void *arg, AsyncClient *client) {
  Serial.printf("\n new client has been connected to server, ip: %s",
                client->remoteIP().toString().c_str());

  clients.push_back(client);

  client->onDisconnect(&server_client_disconnect, NULL);
  // client->onData(&server_client_data, NULL);
}

void server_stats(uint16_t fps, uint8_t rssi) {
  uint8_t packet[] = { 0x02, (fps >> 8) & 0xff, fps & 0xff, rssi };

  for (AsyncClient *client : clients) {
    client->write((char *)packet, sizeof(packet));
  }
}

void server_update() {
  uint8_t packet[NUM_LEDS * 3 + 1] = { 0x01 };

  for (int i = 0; i < NUM_LEDS; i++) {
    uint32_t color = strip.getPixelColor(i);

    packet[i * 3 + 1] = (color >> 16) & 0xff;
    packet[i * 3 + 2] = (color >> 8) & 0xff;
    packet[i * 3 + 3] = color & 0xff;
  }

  for (AsyncClient *client : clients) {
    client->write((char *)packet, sizeof(packet));
  }
}

void setup() {
  Serial.begin(115200);

  strip.begin();
  strip.show();

  WiFi.begin(ssid, password);

  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");

    // TODO: display on display (geen probleem)
  }

  Serial.println();

  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());

  time_client.begin();
  Serial.println("time_client started");  // TODO: dit is cringe

  AsyncServer *server = new AsyncServer(SERVICE_PORT);
  server->onClient(&server_client_connect, server);

  server->setNoDelay(true);

  server->begin();

  Serial.println("tcp server started");

  if (!MDNS.begin(SERVICE_NAME)) {
    Serial.println("Error setting up MDNS responder!");
  }

  MDNS.addService("nlt-panel", "tcp", SERVICE_PORT);
  MDNS.addServiceTxt("nlt-panel", "tcp", "version",
                     (String)MAJOR + "." + (String)MINOR + "." + (String)PATCH);

  last_time = millis();
}

String httpGETRequest(const char *serverName) {
  WiFiClient client;
  HTTPClient http;

  http.begin(client, serverName);

  int httpResponseCode = http.GET();

  String payload = "{}";

  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  http.end();

  return payload;
}

int wifi_rssi() {
  if (WiFi.status() != WL_CONNECTED)
    return -1;
  int dBm = WiFi.RSSI();
  if (dBm <= -100)
    return 0;
  if (dBm >= -50)
    return 100;
  return 2 * (dBm + 100);
}

void render_digit(int offset, const int digit[10]) {
  for (int i = 0; i < 10; i++) {
    if (digit[i] > 0) {
      int row = digit_rows[digit[i] - 1][0];
      int index = digit_rows[digit[i] - 1][1];

      if (row % 2 == 0) {
        strip.setPixelColor(rows[row] + index + offset, DIGIT_COLOR);
      } else {
        strip.setPixelColor(rows[row] - index - offset, DIGIT_COLOR);
      }
    }
  }
}

int digit[2] = { 0, 0 };
void int_to_digit(int time) {
  if (time > 9) {
    digit[0] = (time - (time % 10)) / 10;
    digit[1] = time % 10;
  } else {
    digit[0] = 0;
    digit[1] = time;
  }
}

bool is_wide_character(const int character[25]) {
  for (int i = 0; i < 25; i++) {
    if (character[i] > 20) {
      return true;
    }
  }

  return false;
}

void render_character(int offset, const int character[25]) {
  bool is_wide = is_wide_character(character);

  for (int i = 0; i < 25; i++) {
    if (character[i] > 0) {
      int row = (is_wide) ? character_rows_wide[character[i] - 1][0]
                          : character_rows[character[i] - 1][0];
      int index = (is_wide) ? character_rows_wide[character[i] - 1][1]
                            : character_rows[character[i] - 1][1];
      int row_offset = character_offset[row - 1][character_direction];

      if (character_direction == 1)
        row_offset = -row_offset;

      if (row % 2 == 0) {
        strip.setPixelColor(rows[row] + index + offset + row_offset,
                            DIGIT_COLOR);
      } else {
        strip.setPixelColor(rows[row] - index - offset - row_offset,
                            DIGIT_COLOR);
      }
    }
  }
}

COROUTINE(streamLoop) {
  COROUTINE_LOOP() {
    server_update();

    COROUTINE_DELAY(1000 / REFRESH_RATE_STREAM);
  }
}

COROUTINE(statusLoop) {
  COROUTINE_LOOP() {
    server_stats(1000 / delta, wifi_rssi());

    COROUTINE_DELAY(STATUS_DELAY);
  }
}

DynamicJsonDocument ip_doc(1024);
DynamicJsonDocument weather_doc(1024);

char url_buffer[128];

COROUTINE(weatherLoop) {
  COROUTINE_LOOP() {
    DeserializationError ip_error = deserializeJson(
      ip_doc, httpGETRequest("http://ip-api.com/json?fields=192"));

    String weather_url =
      "http://api.openweathermap.org/data/2.5/weather?units=metric&lat=" + (String)ip_doc["lat"] + "&lon=" + (String)ip_doc["lon"] + "&appid=" + OWM_KEY;

    weather_url.toCharArray(url_buffer, 128);

    DeserializationError weather_error =
      deserializeJson(weather_doc, httpGETRequest(url_buffer));

    time_client.setTimeOffset((int)weather_doc["timezone"]);

    weather_temp = (int)round((double)weather_doc["main"]["temp"]);

    if ((int)weather_doc["weather"][0]["id"] == 800) {
      weather_group = 0;
      weather_id = 0;
    } else {
      weather_group =
        (int)floor((int)weather_doc["weather"][0]["id"] / 100.0);
      weather_id = weather_doc["weather"][0]["id"];
    }

    Serial.println("temp");
    Serial.println(weather_temp);
    Serial.println("group");
    Serial.println(weather_group);
    Serial.println("id");
    Serial.println(weather_id);
    Serial.println();

    ip_doc.clear();
    weather_doc.clear();

    COROUTINE_DELAY_SECONDS(WEATHER_DELAY / 1000);
  }
}

uint32_t scaleBrightness(uint32_t color, float brightness) {
  uint8_t r = (color >> 16) & 0xFF;
  uint8_t g = (color >> 8) & 0xFF;
  uint8_t b = color & 0xFF;

  r *= brightness;
  g *= brightness;
  b *= brightness;

  return ((uint32_t)r << 16) | ((uint32_t)g << 8) | b;
}

void render_background(int delta) {
  hue = hue + (delta * BACKGROUND_SPEED);
  hue = hue % 65535;

  int offset = millis() / 25;

  switch (BACKGROUND_MODE) {
    case 0:
      strip.fill(scaleBrightness(strip.ColorHSV(hue), BACKGROUND_BRIGHTNESS));

      break;
    case 1:
      for (int i = 0; i < NUM_LEDS; i++) {
        uint8_t noise =
          inoise8(noise_map[i][0] * 50, noise_map[i][1] * 50, offset);

        strip.setPixelColor(
          i, scaleBrightness(strip.ColorHSV(map(noise, 0, 255, 0, 65535)),
                             BACKGROUND_BRIGHTNESS));
      }

      break;
    case 2:
      // TODO: deze shit

      switch (weather_group) {
        case 0:  // Clear
          strip.fill(scaleBrightness(sky_color, BACKGROUND_BRIGHTNESS));

          break;
        case 2:  // Thunderstorm
          break;
        case 3:  // Drizzle
          break;
        case 5:  // Rain
          break;
        case 6:  // Snow
          break;
        case 7:  // Atmosphere
          for (int i = 0; i < NUM_LEDS; i++) {
            uint8_t noise = inoise8(noise_map[i][0] * 50 + offset,
                                    noise_map[i][1] * 50);

            strip.setPixelColor(
              i, scaleBrightness(strip.Color(noise, noise, noise),
                                 BACKGROUND_BRIGHTNESS));
          }

          break;
        case 8:  // Clouds
          int intensity = (weather_id - 801) * 15;

          for (int i = 0; i < NUM_LEDS; i++) {
            uint8_t noise = inoise8(noise_map[i][0] * 50 + offset,
                                    noise_map[i][1] * 50)
                            - intensity;

            strip.setPixelColor(
              i, scaleBrightness(strip.ColorHSV(sky_hue_mapped, noise),
                                 BACKGROUND_BRIGHTNESS));
          }

          break;
      }

      break;
  }
}

COROUTINE(renderLoop) {
  COROUTINE_LOOP() {
    unsigned long time = millis();
    delta = time - last_time;

    time_client.update();

    render_background(delta);

    int_to_digit(time_client.getHours());

    render_digit(0, digits[digit[0]]);
    render_digit(4, digits[digit[1]]);

    int_to_digit(time_client.getMinutes());

    render_digit(10, digits[digit[0]]);
    render_digit(14, digits[digit[1]]);

    if (time_client.getSeconds() % 2 == 0) {
      strip.setPixelColor(44, DIGIT_COLOR);
      strip.setPixelColor(83, DIGIT_COLOR);
    }

    // // character test
    // int fortnite = (int)round(millis() / 1000) % 27;

    // int_to_digit(fortnite);

    // render_digit(0, digits[digit[0]]);
    // render_digit(4, digits[digit[1]]);
    // render_character(12, characters[fortnite]);

    // // weather test
    // int_to_digit(weather_temp);

    // render_digit(0, digits[digit[0]]);
    // render_digit(4, digits[digit[1]]);

    // render_digit(10, digits[weather_group]);

    strip.show();

    last_time = time;

    unsigned long post_time = millis();

    if ((post_time - time) < (1000 / REFRESH_RATE))
      COROUTINE_DELAY((1000 / REFRESH_RATE) - (post_time - time));

    // TODO: crash voorkomen

    // COROUTINE_DELAY(1000 / REFRESH_RATE);
  }
}

void loop() {
  MDNS.update();

  // TODO: config??
  weatherLoop.runCoroutine();
  renderLoop.runCoroutine();

  if (clients.size() > 0) {
    streamLoop.runCoroutine();
    statusLoop.runCoroutine();
  }
}
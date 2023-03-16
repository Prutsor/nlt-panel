#include <vector>

#include <NTPClient.h>
#include <ESP8266WiFi.h>

#include <WiFiUdp.h>
#include <ESPAsyncTCP.h>

#include <Adafruit_NeoPixel.h>

#include <AceRoutine.h>
using namespace ace_routine;

#define NUM_LEDS 128

const int BACKGROUND_SPEED = 2;

const int REFRESH_RATE_STREAM = 30;
const int REFRESH_RATE = 60;

const int BROADCAST_DELAY = 2500;
const int STATUS_DELAY = 1000;

const char *ssid = "mkhome24";
const char *password = "neebedankt";

const IPAddress broadcast_ip = IPAddress(224, 0, 1, 3);
const int broadcast_port = 8266;

const int server_port = 8265;

// @version 3.0.1

const uint8_t MAJOR = 3;
const uint8_t MINOR = 0;
const uint8_t PATCH = 1;

Adafruit_NeoPixel strip(NUM_LEDS, D6, NEO_GRB + NEO_KHZ800);

const uint32_t DIGIT_COLOR = strip.Color(255, 255, 255);

const int rows[7] = { 0, 33, 36, 71, 75, 109, 111 };

const int digits[10][10] = { { 1, 2, 3, 5, 8, 10, 11, 12 }, { 2, 5, 7, 10, 12 }, { 1, 2, 5, 7, 6, 8, 11, 12 }, { 1, 2, 5, 7, 6, 10, 12, 10, 11 }, { 1, 3, 6, 7, 5, 10, 12 }, { 1, 2, 3, 6, 7, 10, 11, 12 }, { 2, 4, 6, 7, 8, 11, 12, 10 }, { 1, 2, 5, 7, 9, 11 }, { 1, 2, 3, 5, 6, 7, 8, 10, 11, 12 }, { 1, 2, 3, 5, 6, 7, 9, 11 } };
const int digit_rows[12][2] = { { 1, 0 }, { 1, 1 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 3, 0 }, { 3, 1 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 5, 0 }, { 5, 1 } };

const int characters[26][13] = { { 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 15 }, { 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15 }, { 1, 2, 3, 4, 7, 10, 13, 14, 15 }, { 1, 2, 4, 6, 7, 9, 10, 12, 13, 14, 15 }, { 1, 2, 3, 4, 7, 8, 10, 13 }, { 1, 2, 3, 4, 7, 9, 10, 12, 13, 14, 15 }, { 1, 3, 4, 6, 7, 8, 9, 10, 12, 13, 15 }, { 1, 2, 3, 5, 8, 11, 13, 14, 15 }, { 3, 6, 9, 10, 12, 13, 14, 15 }, { 1, 3, 4, 6, 7, 8, 10, 12, 13, 15 }, { 1, 4, 7, 10, 13, 14, 15 }, { 1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 15 }, { 3, 4, 6, 7, 8, 9, 10, 12, 13 }, { 1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15 }, { 1, 2, 3, 4, 6, 7, 8, 9, 10, 13 }, { 1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15, 16 }, { 1, 2, 4, 6, 7, 8, 10, 13, 12, 15 }, { 1, 2, 3, 4, 7, 8, 9, 12, 13, 14, 15 }, { 1, 2, 3, 5, 8, 11, 14 }, { 1, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15 }, { 1, 3, 4, 6, 7, 9, 10, 12, 14 }, { 1, 3, 4, 6, 7, 9, 10, 11, 12, 13, 15 }, { 1, 3, 4, 6, 8, 10, 12, 13, 15 }, { 1, 3, 4, 6, 8, 11, 14 }, { 1, 2, 3, 6, 8, 10, 13, 14, 15 } };
const int character_rows[16][4] = { { 1, 0 }, { 1, 1 }, { 1, 2 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 3, 0 }, { 3, 1 }, { 3, 2 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 5, 0 }, { 5, 1 }, { 5, 2 }, { 6, 2 } };

const int character_direction = 3;
// 3 = ltr (left to right)
// 2 = rtl (right to left) (werkt niet misclick)

static unsigned long last_time = 0;
unsigned long delta = 0;

WiFiUDP ntpUDP;
WiFiUDP broadcastUDP;

static std::vector<AsyncClient *> clients;

NTPClient time_client(ntpUDP, "europe.pool.ntp.org", 3600, 60000);

static void server_client_disconnect(void *arg, AsyncClient *client) {
  Serial.printf("\n client %s disconnected \n", client->remoteIP().toString().c_str());
}

// static void server_client_data(void *arg, AsyncClient *client, void *data, size_t len) {
//   Serial.println("Received data:");
//   Serial.write((uint8_t *)data, len);
// }

static void server_client_connect(void *arg, AsyncClient *client) {
  Serial.printf("\n new client has been connected to server, ip: %s", client->remoteIP().toString().c_str());

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

void broadcast(uint8_t packet[]) {
  broadcastUDP.beginPacketMulticast(broadcast_ip, broadcast_port, WiFi.localIP());
  broadcastUDP.write(packet, sizeof(packet) + 1);
  broadcastUDP.endPacket();
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
  }

  Serial.println();

  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());

  time_client.begin();
  Serial.println("time_client started");

  AsyncServer *server = new AsyncServer(server_port);
  server->onClient(&server_client_connect, server);

  server->setNoDelay(true);

  server->begin();

  Serial.println("tcp server started");

  last_time = millis();
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

COROUTINE(broadcastLoop) {
  COROUTINE_LOOP() {
    uint8_t packet[] = { 0x00, wifi_rssi(), MAJOR, MINOR, PATCH };

    broadcast(packet);

    COROUTINE_DELAY(BROADCAST_DELAY);
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

uint16_t hue = 0;

void loop() {
  unsigned long time = millis();
  delta = time - last_time;

  hue = hue + (delta * BACKGROUND_SPEED);
  hue = hue % 65535;

  strip.fill(strip.ColorHSV(hue));

  time_client.update();

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

  strip.show();

  broadcastLoop.runCoroutine();

  if (clients.size() > 0) {
    streamLoop.runCoroutine();
    statusLoop.runCoroutine();
  }

  unsigned long post_time = millis();

  if ((post_time - time) < (1000 / REFRESH_RATE))
    delay((1000 / REFRESH_RATE) - (post_time - time));

  last_time = time;
}
#include <NTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

#include <Adafruit_NeoPixel.h>

#define NUM_LEDS 128

const float BACKGROUND_SPEED = 2500;

const char *ssid = "fortnite";
const char *password = "fortnitre33";

Adafruit_NeoPixel strip(NUM_LEDS, 6, NEO_GRB + NEO_KHZ800);

const uint32_t DIGIT_COLOR = strip.Color(255, 0, 255);

const int digits[10][10] = {{1, 2, 3, 5, 8, 10, 11, 12}, {2, 5, 7, 10, 12}, {1, 2, 5, 7, 6, 8, 11, 12}, {1, 2, 5, 7, 6, 10, 12, 10, 11}, {1, 3, 6, 7, 5, 10, 12}, {1, 2, 3, 6, 7, 10, 11, 12}, {2, 4, 6, 7, 8, 11, 12, 10}, {1, 2, 5, 7, 9, 11}, {1, 2, 3, 5, 6, 7, 8, 10, 11, 12}, {1, 2, 3, 5, 6, 7, 9, 11}};
const int digit_rows[12][2] = {{1, 0}, {1, 1}, {2, 0}, {2, 1}, {2, 2}, {3, 0}, {3, 1}, {4, 0}, {4, 1}, {4, 2}, {5, 0}, {5, 1}};

const int rows[7] = {0, 33, 36, 71, 75, 109, 111};

WiFiUDP ntpUDP;

NTPClient time_client(ntpUDP, "europe.pool.ntp.org", 3600, 60000);

void setup() {
  Serial.begin(115200);

  strip.begin();
  strip.show();

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    int brightness = round(map(sin(millis() / 500.0), -1, 1, 0, 255));

    strip.fill(strip.Color(brightness, brightness, brightness));
    strip.show();
  }

  time_client.begin();
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

float hue = 0;
int frame = 0;

unsigned long last_millis = 0;

void loop() {
  time_client.update();

  float delta = 1 / ((float)millis() / (float)last_millis);
  hue = hue + (delta * BACKGROUND_SPEED);
  frame = frame + 1;

  last_millis = millis();

  if (hue >= 65535) {
    hue = 0;
  }

  if (frame >= 255) {
    frame = 0;
  }

  strip.fill(strip.ColorHSV(hue));

  int_to_digit(time_client.getHours());

  render_digit(0, digits[digit[0]]);
  render_digit(4, digits[digit[1]]);

  int_to_digit(time_client.getMinutes());

  render_digit(10, digits[digit[0]]);
  render_digit(14, digits[digit[1]]);

  if (time_client.getSeconds() % 2 == 0)
  {
    strip.setPixelColor(44, DIGIT_COLOR);
    strip.setPixelColor(83, DIGIT_COLOR);
  }

  strip.show();
}
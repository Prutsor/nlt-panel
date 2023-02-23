#include <FastLED.h>
#include <SimpleSerialProtocol.h>

#include "uRTCLib.h"
#include "Arduino.h"

#define NUM_LEDS 128

CRGB leds[NUM_LEDS];
uRTCLib rtc(0x68);

const long BAUDRATE = 115200;        // speed of serial connection
const long CHARACTER_TIMEOUT = 500;  // wait max 500 ms between single chars to be received

const float BACKGROUND_SPEED = 5;

void onError(uint8_t errorNum);
void onSetTime();
void onSetDebug();

SimpleSerialProtocol ssp(Serial, BAUDRATE, CHARACTER_TIMEOUT, onError, 'a', 'z');

const int digits[10][10] = { { 1, 2, 3, 5, 8, 10, 11, 12 }, { 2, 5, 7, 10, 12 }, { 1, 2, 5, 7, 6, 8, 11, 12 }, { 1, 2, 5, 7, 6, 10, 12, 10, 11 }, { 1, 3, 6, 7, 5, 10, 12 }, { 1, 2, 3, 6, 7, 10, 11, 12 }, { 2, 4, 6, 7, 8, 11, 12, 10 }, { 1, 2, 5, 7, 9, 11 }, { 1, 2, 3, 5, 6, 7, 8, 10, 11, 12 }, { 1, 2, 3, 5, 6, 7, 9, 11 } };
const int digit_rows[12][2] = { { 1, 0 }, { 1, 1 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 3, 0 }, { 3, 1 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 5, 0 }, { 5, 1 } };

const int rows[7] = { 0, 33, 36, 71, 75, 109, 111 };

void update() {
  for (int index = 0; index < NUM_LEDS; index++) {
    CRGB color = leds[index];

    ssp.writeCommand('c');

    ssp.writeUnsignedInt8(index);
    ssp.writeUnsignedInt8(color.r);
    ssp.writeUnsignedInt8(color.g);
    ssp.writeUnsignedInt8(color.b);

    ssp.writeEot();
  }
}

void update_fps() {
  ssp.writeCommand('f');

  ssp.writeUnsignedInt16(FastLED.getFPS());

  ssp.writeEot();
}

void render_digit(int offset, int digit[10], CRGB color) {
  for (int i = 0; i < 10; i++) {
    int pixel = digit[i];

    if (pixel > 0) {
      int row = digit_rows[pixel - 1][0];
      int index = digit_rows[pixel - 1][1];

      if (row % 2 == 0) {
        leds[rows[row] + index + offset] = color;
      } else {
        leds[rows[row] - index - offset] = color;
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

void setup() {
  ssp.init();

  URTCLIB_WIRE.begin();

  ssp.registerCommand('t', onSetTime);
  ssp.registerCommand('d', onSetDebug);

  // bitClear(ADCSRA, ADPS0);
  // bitSet(ADCSRA, ADPS1);
  // bitClear(ADCSRA, ADPS2);
}

float hue = 0;
bool debug = false;

void loop() {
  ssp.loop();

  float delta = (float)1 / (float)FastLED.getFPS();  // tijd gebruiken????
  hue = hue + (delta * BACKGROUND_SPEED);

  if (hue >= 255) {
    hue = 0;
  }

  fill_rainbow(leds, NUM_LEDS, round(hue), 0);

  rtc.refresh();

  int_to_digit(rtc.hour());

  render_digit(0, digits[digit[0]], CRGB::White);
  render_digit(4, digits[digit[1]], CRGB::White);

  int_to_digit(rtc.minute());

  render_digit(10, digits[digit[0]], CRGB::White);
  render_digit(14, digits[digit[1]], CRGB::White);

  if (rtc.second() % 2 == 0) {
    leds[44] = CRGB::White;
    leds[83] = CRGB::White;
  }

  FastLED.show();

  if (debug == true) {
    update();
    update_fps();
  }
}

void onError(uint8_t errorNum) {
  digitalWrite(LED_BUILTIN, HIGH);
}

void onSetTime() {
  uint8_t second = ssp.readUnsignedInt8();
  uint8_t minute = ssp.readUnsignedInt8();
  uint8_t hour = ssp.readUnsignedInt8();
  uint8_t dayOfWeek = ssp.readUnsignedInt8();
  uint8_t dayOfMonth = ssp.readUnsignedInt8();
  uint8_t month = ssp.readUnsignedInt8();
  uint8_t year = ssp.readUnsignedInt8();

  rtc.set(second, minute, hour, dayOfWeek, dayOfMonth, month, year);

  ssp.readEot();
};

void onSetDebug() {
  debug = ssp.readBool();

  ssp.readEot();
};

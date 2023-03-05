#include <FastLED.h>
#include <SimpleSerialProtocol.h>

#include "uRTCLib.h"
#include "Arduino.h"

// @version 2.2.1

const uint8_t MAJOR = 2;
const uint8_t MINOR = 2;
const uint8_t PATCH = 1;

#define NUM_LEDS 128

CRGB leds[NUM_LEDS];
uRTCLib rtc(0x68);

const long BAUDRATE = 115200;
const long CHARACTER_TIMEOUT = 500;

const float BACKGROUND_SPEED = 5;

void onError(uint8_t errorNum);
void onSetTime();
void onSetDebug();
void onShowVersion();
void onReady();

SimpleSerialProtocol ssp(Serial, BAUDRATE, CHARACTER_TIMEOUT, onError, 'a', 'z');

const int digits[10][10] = { { 1, 2, 3, 5, 8, 10, 11, 12 }, { 2, 5, 7, 10, 12 }, { 1, 2, 5, 7, 6, 8, 11, 12 }, { 1, 2, 5, 7, 6, 10, 12, 10, 11 }, { 1, 3, 6, 7, 5, 10, 12 }, { 1, 2, 3, 6, 7, 10, 11, 12 }, { 2, 4, 6, 7, 8, 11, 12, 10 }, { 1, 2, 5, 7, 9, 11 }, { 1, 2, 3, 5, 6, 7, 8, 10, 11, 12 }, { 1, 2, 3, 5, 6, 7, 9, 11 } };
const int digit_rows[12][2] = { { 1, 0 }, { 1, 1 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 3, 0 }, { 3, 1 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 5, 0 }, { 5, 1 } };

// { 1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15 }
const int characters[26][13] = { { 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 15 }, { 1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15 }, { 1, 2, 3, 4, 7, 10, 13, 14, 15 }, { 1, 2, 4, 6, 7, 9, 10, 12, 13, 14, 15 }, { 1, 2, 3, 4, 7, 8, 10, 13 }, { 1, 2, 3, 4, 7, 9, 10, 12, 13, 14, 15 }, { 1, 3, 4, 6, 7, 8, 9, 10, 12, 13, 15 }, { 1, 2, 3, 5, 8, 11, 13, 14, 15 }, { 3, 6, 9, 10, 12, 13, 14, 15 }, { 1, 3, 4, 6, 7, 8, 10, 12, 13, 15 }, { 1, 4, 7, 10, 13, 14, 15 }, { 1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 15 }, { 3, 4, 6, 7, 8, 9, 10, 12, 13 }, { 1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15 }, { 1, 2, 3, 4, 6, 7, 8, 9, 10, 13 }, { 1, 2, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15, 16 }, { 1, 2, 4, 6, 7, 8, 10, 13, 12, 15 }, { 1, 2, 3, 4, 7, 8, 9, 12, 13, 14, 15 }, { 1, 2, 3, 5, 8, 11, 14 }, { 1, 3, 4, 6, 7, 9, 10, 12, 13, 14, 15 }, { 1, 3, 4, 6, 7, 9, 10, 12, 14 }, { 1, 3, 4, 6, 7, 9, 10, 11, 12, 13, 15 }, { 1, 3, 4, 6, 8, 10, 12, 13, 15 }, { 1, 3, 4, 6, 8, 11, 14 }, { 1, 2, 3, 6, 8, 10, 13, 14, 15 } };
const int character_rows[16][4] = { { 1, 0, 0, 0 }, { 1, 1, 0, 0 }, { 1, 2, 0, 0 }, { 2, 0, 1, 1 }, { 2, 1, 1, 1 }, { 2, 2, 1, 1 }, { 3, 0, 1, 1 }, { 3, 1, 1, 1 }, { 3, 2, 1, 1 }, { 4, 0, 2, 0 }, { 4, 1, 2, 0 }, { 4, 2, 2, 0 }, { 5, 0, 2, 0 }, { 5, 1, 2, 0 }, { 5, 2, 2, 0 }, { 6, 2, 3, 0 } };

const int character_direction = 3;
// 3 = ltr (left to right)
// 2 = rtl (right to left) (werkt niet misclick)

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

void render_character(int offset, int character[13], CRGB color) {
  for (int i = 0; i < 13; i++) {
    int pixel = character[i];

    if (pixel > 0) {
      int row = character_rows[pixel - 1][0];
      int index = character_rows[pixel - 1][1];
      // int row_offset = character_rows[pixel - 1][character_direction];
      int row_offset = 0;

      if (row % 2 == 0) {
        leds[rows[row] + index + offset + row_offset] = color;
      } else {
        leds[rows[row] - index - offset - row_offset] = color;
      }
    }
  }
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

void render_version() {
  int offset = 14;

  if (PATCH < 10) {
    render_digit(offset, digits[PATCH], CRGB::White);

    offset -= 5;
  } else {
    int_to_digit(PATCH);

    render_digit(offset, digits[digit[1]], CRGB::White);
    offset -= 4;
    render_digit(offset, digits[digit[0]], CRGB::White);
    offset -= 5;
  }

  leds[rows[5] - offset - 3] = CRGB::White;

  if (MINOR < 10) {
    render_digit(offset, digits[MINOR], CRGB::White);

    offset -= 5;
  } else {
    int_to_digit(MINOR);

    render_digit(offset, digits[digit[1]], CRGB::White);
    offset -= 4;
    render_digit(offset, digits[digit[0]], CRGB::White);
    offset -= 5;
  }

  leds[rows[5] - offset - 3] = CRGB::White;

  if (MAJOR < 10) {
    render_digit(offset, digits[MAJOR], CRGB::White);
  } else {
    int_to_digit(MAJOR);

    render_digit(offset, digits[digit[1]], CRGB::White);
    offset -= 4;
    render_digit(offset, digits[digit[0]], CRGB::White);
    offset -= 5;
  }
}

void setup() {
  ssp.init();

  URTCLIB_WIRE.begin();

  ssp.registerCommand('r', onReady);
  ssp.registerCommand('t', onSetTime);
  ssp.registerCommand('d', onSetDebug);
  ssp.registerCommand('v', onShowVersion);

  FastLED.addLeds<NEOPIXEL, 6>(leds, NUM_LEDS);

  bitClear(ADCSRA, ADPS0);
  bitSet(ADCSRA, ADPS1);
  bitClear(ADCSRA, ADPS2);
}

float hue = 0;
int frame = 0;

bool debug = false;
bool show_version = false;

void loop() {
  ssp.loop();

  float delta = (float)1 / (float)FastLED.getFPS();
  hue = hue + (delta * BACKGROUND_SPEED);
  frame = frame + 1;

  if (hue >= 255) {
    hue = 0;
  }

  if (frame >= 255) {
    frame = 0;
  }

  fill_rainbow(leds, NUM_LEDS, round(hue), 0);

  rtc.refresh();

  if (show_version) {
    render_version();
  } else {
    int_to_digit(rtc.hour());

    render_digit(0, digits[digit[0]], CRGB::White);
    render_digit(4, digits[digit[1]], CRGB::White);

    int_to_digit(rtc.minute());

    render_digit(10, digits[digit[0]], CRGB::White);
    render_digit(14, digits[digit[1]], CRGB::White);

    // int_to_digit(frame % 26);

    // render_character(12, characters[frame % 26], CRGB::White);
    // render_character(8, characters[digit[0]], CRGB::White);

    if (rtc.second() % 2 == 0) {
      leds[44] = CRGB::White;
      leds[83] = CRGB::White;
    }
  }

  FastLED.show();

  if (debug == true) {
    update();
    update_fps();
  }

  // delay(100);
}

void onError(uint8_t errorNum) {
  digitalWrite(LED_BUILTIN, HIGH);
}

void onReady() {
  uint8_t software_major = ssp.readUnsignedInt8();
  uint8_t software_minor = ssp.readUnsignedInt8();
  uint8_t software_patch = ssp.readUnsignedInt8();

  ssp.readEot();

  ssp.writeCommand('r');

  ssp.writeUnsignedInt8(MAJOR);
  ssp.writeUnsignedInt8(MINOR);
  ssp.writeUnsignedInt8(PATCH);

  ssp.writeEot();
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

void onShowVersion() {
  show_version = true;

  ssp.readEot();
}

void onSetDebug() {
  debug = ssp.readBool();

  ssp.readEot();
};

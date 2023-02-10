#include <FastLED.h>
#include "uRTCLib.h"

#define NUM_LEDS 128

CRGB leds[NUM_LEDS];
uRTCLib rtc(0x68);

const int digits[10][10] = { { 1, 2, 3, 5, 8, 10, 11, 12 }, { 2, 5, 7, 10, 12 }, { 1, 2, 5, 7, 6, 8, 11, 12 }, { 1, 2, 5, 7, 6, 10, 12, 10, 11 }, { 1, 3, 6, 7, 5, 10, 12 }, { 1, 2, 3, 6, 7, 10, 11, 12 }, { 2, 4, 6, 7, 8, 11, 12, 10 }, { 1, 2, 5, 7, 9, 11 }, { 1, 2, 3, 5, 6, 7, 8, 10, 11, 12 }, { 1, 2, 3, 5, 6, 7, 9, 11 } };
const int digit_rows[12][2] = { { 1, 0 }, { 1, 1 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 3, 0 }, { 3, 1 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 5, 0 }, { 5, 1 } };

const int rows[7] = { 0, 33, 36, 71, 75, 109, 111 };

void update() {
  for (int index = 0; index < NUM_LEDS; index++) {
    CRGB color = leds[index];

    Serial.println((String) "c," + index + "," + color.r + "," + color.g + "," + color.b);
  }
}

void update_fps() {
  Serial.println((String) "f," + FastLED.getFPS());
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
  Serial.begin(921600);

  URTCLIB_WIRE.begin();

  rtc.set(0, 56, 12, 5, 13, 1, 22);

  bitClear(ADCSRA, ADPS0);
  bitSet(ADCSRA, ADPS1);
  bitClear(ADCSRA, ADPS2);
}

int frame = 0;

void loop() {
  frame++;
  if (frame >= 255)
    frame = 0;

  fill_rainbow(leds, NUM_LEDS, frame, 0);

  rtc.refresh();

  int_to_digit(rtc.hour());

  render_digit(0, digits[digit[0]], CRGB::White);
  render_digit(4, digits[digit[1]], CRGB::White);

  int_to_digit(rtc.minute());

  render_digit(10, digits[digit[0]], CRGB::White);
  render_digit(14, digits[digit[1]], CRGB::White);

  if (frame % 2 == 0) {
    leds[44] = CRGB::White;
    leds[83] = CRGB::White;
  }

  FastLED.show();

  // if (frame % 10 == 0) update();
  update();
  update_fps();
}
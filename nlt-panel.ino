#include <FastLED.h>

#define NUM_LEDS 128

CRGB leds[NUM_LEDS];

const int digits[10][10] = { { 1, 2, 3, 5, 8, 10, 11, 12 }, { 2, 5, 7, 10, 12 }, { 1, 2, 5, 7, 6, 8, 11, 12 }, { 1, 2, 5, 7, 6, 10, 12, 10, 11 }, { 1, 3, 6, 7, 5, 10, 12 }, { 1, 2, 3, 6, 7, 10, 11, 12 }, { 2, 4, 6, 7, 8, 11, 12, 10 }, { 1, 2, 5, 7, 9, 11 }, { 1, 2, 3, 5, 6, 7, 8, 10, 11, 12 }, { 1, 2, 3, 5, 6, 7, 9, 11 } };
const int digit_rows[12][2] = { { 1, 0 }, { 1, 1 }, { 2, 0 }, { 2, 1 }, { 2, 2 }, { 3, 0 }, { 3, 1 }, { 4, 0 }, { 4, 1 }, { 4, 2 }, { 5, 0 }, { 5, 1 } };

const int rows[7] = { 0, 33, 36, 71, 75, 109, 111 };

void update() {
  for (int index = 0; index < NUM_LEDS; index++) {
    CRGB color = leds[index];

    // byte packet[5];

    // packet[0] = 0x01;
    // packet[1] = (uint8_t)index;
    // packet[2] = color.red;
    // packet[3] = color.green;
    // packet[4] = color.blue;

    // Serial.write(packet, 5);
    // Serial.write('\n');

    Serial.println((String) "c," + index + "," + color.r + "," + color.g + "," + color.b);
  }
}

void update_fps() {
  // byte packet[2];

  // packet[0] = 0x02;
  // packet[1] = FastLED.getFPS() >> 8;

  // Serial.write(packet, 2);
  // Serial.write('\n');

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

void setup() {
  Serial.begin(921600);

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

  render_digit(0, digits[0], CRGB::White);
  render_digit(4, digits[1], CRGB::White);

  render_digit(10, digits[2], CRGB::White);
  render_digit(14, digits[3], CRGB::White);

  leds[44] = CRGB::White;
  leds[83] = CRGB::White;

  FastLED.show();

  // if (frame % 10 == 0) update();
  update();
  update_fps();
}
#ifndef CONSTANTS_H
#define CONSTANTS_H

#include "Arduino.h"
#include <Adafruit_NeoPixel.h>

const uint16_t STRIP_LEDS = 128;
const uint16_t STRIP_PIN = D6;
const neoPixelType STRIP_TYPE = NEO_GRB + NEO_KHZ800;

const uint32_t DIGIT_COLOR = Adafruit_NeoPixel::Color(255, 255, 255);

#endif

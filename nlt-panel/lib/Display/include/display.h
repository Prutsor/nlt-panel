#ifndef Display_h
#define Display_h

#include "Arduino.h"

#include "config.h"
#include "constants.h"
#include "font.h"

#include <FastLED.h>
#include <Adafruit_NeoPixel.h>

class Display
{
    public:
        Display();

<<<<<<< HEAD
        Adafruit_NeoPixel _strip;

=======
>>>>>>> 4eb51d34ab5e98c63a17e66cf95881cebc03d776
        void setup();

        void int_to_digit(int time);

        void render_digit(int offset, const int digit[10]);
        void render_time(int hours, int minutes, int seconds);

        void render_character(int offset, const int character[25]);

        void render_background();

        void update();

    private:
        uint32_t scale_brightness(uint32_t color, float brightness);

<<<<<<< HEAD
=======
        Adafruit_NeoPixel _strip;

>>>>>>> 4eb51d34ab5e98c63a17e66cf95881cebc03d776
        int _digit_buffer[2];

        unsigned long _last_time;
        unsigned long _delta;
        uint16_t _hue;
};

#endif
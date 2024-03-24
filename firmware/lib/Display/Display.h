#ifndef Display_h
#define Display_h

#include "Arduino.h"

#include "constants.h"
#include "config.h"
#include "font.h"

#include <Adafruit_NeoPixel.h>
#include <FastLED.h> // TODO: custom noise implementation

class Display
{
    public:
        explicit Display(Adafruit_NeoPixel &strip);

        Adafruit_NeoPixel &_strip; // TODO: abstract

        void setup();

        void int_to_digit(int time);

        void render_digit(int offset, const int digit[10]);
        void render_time(int hours, int minutes, int seconds);

        void render_character(int offset, const int character[25]);
        void render_text(const char *text);

        void render_background();

        void update();

    private:
        static uint32_t scale_brightness(uint32_t color, float brightness);

        static bool is_wide_character(const int character[25]);

        int _digit_buffer[2];

        unsigned long _last_time{};
        unsigned long _delta{};
        uint16_t _hue{};
};

#endif
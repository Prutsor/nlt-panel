#ifndef Display_h
#define Display_h

#include "Arduino.h"

#include "config.h"
#include "constants.hpp"
#include "font.hpp"
#include "settings.hpp"

#include <Adafruit_NeoPixel.h>
#include <FastLED.h> // TODO: custom noise implementation
#include <logger.h>

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
        void render_text(char *text);

        void render_background();

        void update();

    private:
        logging::Logger _logger;

        static uint32_t scale_brightness(uint32_t color, float brightness);

        static bool is_wide_character(const int character[25]);

        void sanitize_text(char *text);
        void calculate_text_size(int *text);

        char *_text;
        int _text_size = 0;
        
        int _text_buffer[64] = {};
        int _text_buffer_size = 0;

        int _digit_buffer[2];

        unsigned long _last_time{};
        unsigned long _delta{};
        uint16_t _hue{};
};

#endif
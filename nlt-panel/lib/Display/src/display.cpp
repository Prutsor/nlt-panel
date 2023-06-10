#include "Display.h"

Display::Display(Adafruit_NeoPixel &strip) : _strip(strip), _digit_buffer{0, 0} {}

void Display::setup()
{
    _strip.begin();
    _strip.show();

    _last_time = millis();
}

void Display::int_to_digit(int time)
{
    if (time > 9)
    {
        _digit_buffer[0] = (time - (time % 10)) / 10;
        _digit_buffer[1] = time % 10;
    }
    else
    {
        _digit_buffer[0] = 0;
        _digit_buffer[1] = time;
    }
};

void Display::render_digit(int offset, const int digit[10])
{
    for (int i = 0; i < 10; i++)
    {
        if (digit[i] > 0)
        {
            int row = font_digit_rows[digit[i] - 1][0];
            int index = font_digit_rows[digit[i] - 1][1];

            if (row % 2 == 0)
            {
                _strip.setPixelColor(font_rows[row] + index + offset, DIGIT_COLOR);
            }
            else
            {
                _strip.setPixelColor(font_rows[row] - index - offset, DIGIT_COLOR);
            }
        }
    }
};

void Display::render_time(int hours, int minutes, int seconds)
{
    int_to_digit(hours);

    render_digit(0, font_digits[_digit_buffer[0]]);
    render_digit(4, font_digits[_digit_buffer[1]]);

    int_to_digit(minutes);

    render_digit(10, font_digits[_digit_buffer[0]]);
    render_digit(14, font_digits[_digit_buffer[1]]);

    if (seconds % 2 == 0)
    {
        _strip.setPixelColor(44, DIGIT_COLOR);
        _strip.setPixelColor(83, DIGIT_COLOR);
    }
}

void Display::render_character(int offset, const int character[25]){};

uint32_t Display::scale_brightness(uint32_t color, float brightness)
{
    uint8_t r = (color >> 16) & 0xFF;
    uint8_t g = (color >> 8) & 0xFF;
    uint8_t b = color & 0xFF;

    r *= brightness;
    g *= brightness;
    b *= brightness;

    return ((uint32_t)r << 16) | ((uint32_t)g << 8) | b;
}

void Display::render_background()
{
    int offset = millis() / 25;

    for (int i = 0; i < STRIP_LEDS; i++)
    {
        uint8_t noise =
            inoise8(noise_map[i][0] * 50, noise_map[i][1] * 50, offset);

        _strip.setPixelColor(
            i, scale_brightness(_strip.ColorHSV(map(noise, 0, 255, 0, 65535)),
                                BACKGROUND_BRIGHTNESS));
    }
};

void Display::update()
{
    unsigned long time = millis();
    _delta = time - _last_time;

    _hue = _hue + (_delta * BACKGROUND_SPEED);
    _hue = _hue % 65535;

    _strip.show();

    _last_time = time;
}
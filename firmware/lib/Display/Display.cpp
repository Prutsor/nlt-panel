#include "Display.h"

Display::Display(Adafruit_NeoPixel &strip) : _strip(strip), _digit_buffer{0, 0} {}

void Display::setup()
{
    _strip.begin();

    // for (int i = 0; i < STRIP_LEDS; i++)
    // {
    //     _strip.setPixelColor(i, 0);
    // }
    //
    // for (int i = 0; i < STRIP_LEDS; i++)
    // {
    //     _strip.setPixelColor(i, 0xFFFFFF);
    //     _strip.show();
    //
    //     delay(25);
    // }

    // _strip.setPixelColor(0, 0xFFFFFF);

    // _strip.show();

    _last_time = millis();
}

void Display::int_to_digit(const int time)
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

void Display::render_digit(const int offset, const int digit[10])
{
    for (int i = 0; i < 10; i++)
    {
        if (digit[i] > 0)
        {
            const int row = font_digit_rows[digit[i] - 1][0];
            const int index = font_digit_rows[digit[i] - 1][1];

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

void Display::render_time(const int hours, const int minutes, const int seconds)
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

// TODO: optimize
bool Display::is_wide_character(const int character[25])
{
    for (int i = 0; i < 25; i++)
    {
        if (character[i] > 20)
        {
            return true;
        }
    }

    return false;
}

void Display::render_character(const int offset, const int character[25])
{
    const bool is_wide = is_wide_character(character);

    if (is_wide) {
        if (offset < -6) return;
    }

    if (offset < -5) return;
    if (offset > 17) return;

    for (int i = 0; i < 25; i++)
    {
        if (character[i] > 0)
        {
            int row = (is_wide) ? font_character_rows_wide[character[i] - 1][0]
                                : font_character_rows[character[i] - 1][0];

            int index = (is_wide) ? font_character_rows_wide[character[i] - 1][1]
                                  : font_character_rows[character[i] - 1][1];

            int row_offset = font_character_offset[row - 1][font_character_direction];

            if (font_character_direction == 1)
                row_offset = -row_offset;

            int n;

            if (row % 2 == 0) n = font_rows[row] + index + offset + row_offset;
            else n = font_rows[row] - index - offset - row_offset;

            int o;

            if (row % 2 == 0) o = n - font_rows[row];
            else o = font_rows[row] - n;

            if (o > -font_rows_cutoff[row]) _strip.setPixelColor(n, DIGIT_COLOR);
        }
    }
}

void Display::render_text(const char *text)
{
    int offset = (int)round(millis() / 100) % (strlen(text) * 5 + 20);

    offset = -offset + 20; // TODO: dynamic size

    for (int i = 0; i < strlen(text); i++)
    {
        const int character = toUpperCase(text[i]);

        const int index = character - 65;

        // Serial.println(String(text[i]) + " " + String(index) + " " + String(offset));

        if (index < 27) {
            render_character(offset, font_characters[index]);

            offset += (is_wide_character(font_characters[index])) ? 6 : 5;
        } else {
            offset += 5;
        }
    }
}

uint32_t Display::scale_brightness(const uint32_t color, float brightness)
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
    const uint32_t offset = millis() * NOISE_SPEED;

    for (int i = 0; i < STRIP_LEDS; i++)
    {
        const uint16_t noise = inoise16(noise_map[i][0] * NOISE_SCALE, noise_map[i][1] * NOISE_SCALE, offset);

        _strip.setPixelColor(i, scale_brightness(Adafruit_NeoPixel::ColorHSV(noise), BACKGROUND_BRIGHTNESS));
    }
};

void Display::update()
{
    const unsigned long time = millis();
    _delta = time - _last_time;

    _hue = _hue + (_delta * BACKGROUND_SPEED);
    _hue = _hue % 65535;

    _strip.show();

    _last_time = time;
}
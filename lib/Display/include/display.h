#include <Arduino.h>

namespace Display
{
    enum class BACKGROUND_MODE : uint8_t
    {
        rainbow = 0,
        noise = 1,
        weather = 2
    };

    void initialize();

    void int_to_digit(int time);

    void render_digit(int offset, const int digit[10]);
    void render_character(int offset, const int character[25]);

    void render_background(int delta);
}
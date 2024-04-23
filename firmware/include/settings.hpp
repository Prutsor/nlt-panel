#ifndef SETTINGS_HPP
#define SETTINGS_HPP

enum class DISPLAY_MODE {
    Time,
    Text
};

enum class BACKGROUND_MODE {
    Noise,
    Color
};

extern DISPLAY_MODE s_display_mode;
extern BACKGROUND_MODE s_background_mode;

extern char s_display_text[];
extern uint32_t s_background_color;

#endif //SETTINGS_HPP

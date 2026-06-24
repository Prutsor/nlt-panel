#ifndef CONFIG_H
#define CONFIG_H

constexpr float BACKGROUND_BRIGHTNESS = 0.5;
constexpr int BACKGROUND_SPEED = 1;

constexpr int VISUALIZER_PORT = 1935;

constexpr const char *SERVICE_NAME = "nlt-panel-mksp";
constexpr int SERVICE_PORT = 8266;

constexpr const char *ssid = "****";
constexpr const char *password = "****";

constexpr const char *NTP_TZ = "CET-1CEST-2,M3.5.0/02:00:00,M10.5.0/03:00:00";
constexpr const char *NTP_SERVER = "ntp.time.nl";
constexpr const char *NTP_SERVER_FALLBACK_1 = "time.google.com";
constexpr const char *NTP_SERVER_FALLBACK_2 = "time.cloudflare.com";

#endif // CONFIG_H
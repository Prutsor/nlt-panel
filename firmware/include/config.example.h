#ifndef CONFIG_H
#define CONFIG_H

constexpr float BACKGROUND_BRIGHTNESS = 0.5;
constexpr int BACKGROUND_SPEED = 1;

constexpr int VISUALIZER_PORT = 1935;

constexpr const char *SERVICE_NAME = "nlt-panel-mksp";
constexpr int SERVICE_PORT = 8266;

constexpr const char *ssid = "****";
constexpr const char *password = "****";

constexpr const char *NTP_SERVER = "nl.pool.ntp.org";
constexpr const char *NTP_TZ = "CET-1CEST-2,M3.5.0/02:00:00,M10.5.0/03:00:00";

#endif  // CONFIG_H
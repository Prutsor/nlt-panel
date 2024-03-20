#ifndef Visualizer_h
#define Visualizer_h

#include "Arduino.h"

#include "Display.h"

#include "constants.h"
#include "config.h"

#include <ESP8266WiFi.h>

class Visualizer
{
    public:
        Visualizer(Display display);

        void setup();
        void update();

    private:
        WiFiServer _server;
        WiFiClient _client;

        Display _display;

        uint8_t _stream_buffer[385];
        long last_update;
};

#endif
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
        uint8_t _metadata_buffer[14];

        static void _insert_buffer(uint8_t *buffer, const uint32_t *data, uint8_t size, uint8_t offset);

        unsigned long last_update;
        unsigned long last_metadata;
};

#endif
#ifndef Visualizer_h
#define Visualizer_h

#include "Arduino.h"

#include "Display.h"

#include "constants.hpp"
#include "config.h"
#include "settings.hpp"

#include <ESP8266WiFi.h>
#include <logger.h>

class Visualizer
{
    public:
        explicit Visualizer(Display display);

        void setup();
        void update();

    private:
        logging::Logger _logger;

        WiFiServer _server;
        WiFiClient _client;

        Display _display;

        uint8_t _stream_buffer[385]{};
        uint8_t _metadata_buffer[15]{};

        uint8_t _recv_buffer[512]{};

        static void _insert_buffer(uint8_t *buffer, const uint32_t *data, uint8_t size, uint8_t offset);
        static uint8_t signal_strength();

        unsigned long last_update{};
        unsigned long last_metadata{};
};

#endif
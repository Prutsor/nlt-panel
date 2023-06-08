#ifndef Visualizer_h
#define Visualizer_h

#include "display.h"
#include "config.h"

#include "Arduino.h"

#include "ESPAsyncUDP.h"

class Visualizer
{
    public:
        Visualizer();

        void setup(Display display);
        void update();

    private:
        AsyncUDP _udp;
};

#endif
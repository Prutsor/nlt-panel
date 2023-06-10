#ifndef Visualizer_h
#define Visualizer_h

#include "display.h"

#include "constants.h"
#include "config.h"

#include "ESPAsyncUDP.h"

class Visualizer
{
    public:
        Visualizer();

        void setup(Display display);
        void update();

    private:
        AsyncUDP _udp;
        Display _display;
};

#endif
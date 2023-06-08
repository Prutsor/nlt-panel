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
<<<<<<< HEAD
        Display _display;
=======
>>>>>>> 4eb51d34ab5e98c63a17e66cf95881cebc03d776
};

#endif
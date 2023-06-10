#ifndef Visualizer_h
#define Visualizer_h

#include "display.h"

#include "constants.h"
#include "config.h"

#include <ESPAsyncTCP.h>

class Visualizer
{
    public:
        Visualizer(Display display);

        void setup();
        void update();

    private:
        AsyncServer *_server;
        static std::vector<AsyncClient *> _clients;

        Display _display;
};

#endif
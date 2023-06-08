#include "Visualizer.h"

Visualizer::Visualizer() {}

void Visualizer::setup(Display display)
{
	_udp = AsyncUDP();

	if (_udp.listen(VISUALIZER_PORT))
	{
		Serial.print("	Listening on UDP port ");
		Serial.println(VISUALIZER_PORT);
	}
	else
	{
		Serial.print("Failed");
	}
}

void Visualizer::update()
{
	uint8_t packet[STRIP_LEDS * 3 + 1] = {0x01};

    for (int i = 0; i < STRIP_LEDS; i++)
    {
        uint32_t color = _display._strip.getPixelColor(i);

        packet[i * 3 + 1] = (color >> 16) & 0xff;
        packet[i * 3 + 2] = (color >> 8) & 0xff;
        packet[i * 3 + 3] = color & 0xff;
    }

	_udp.write(packet, sizeof(packet));
}
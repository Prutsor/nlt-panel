#include "Visualizer.h"

Visualizer::Visualizer() {}

void Visualizer::setup(Display display)
{
	_udp = AsyncUDP();

<<<<<<< HEAD
	if (_udp.listen(VISUALIZER_PORT))
=======
    if (_udp.listen(VISUALIZER_PORT))
>>>>>>> 4eb51d34ab5e98c63a17e66cf95881cebc03d776
	{
		Serial.print("	Listening on UDP port ");
		Serial.println(VISUALIZER_PORT);
	}
	else
	{
		Serial.print("Failed");
	}
<<<<<<< HEAD
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
=======
>>>>>>> 4eb51d34ab5e98c63a17e66cf95881cebc03d776
}
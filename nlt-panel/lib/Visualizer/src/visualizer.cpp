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
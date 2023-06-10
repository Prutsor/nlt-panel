#include "Visualizer.h"

std::vector<AsyncClient *> Visualizer::_clients;

Visualizer::Visualizer(Display display) : _display(display) {}

void Visualizer::setup()
{
	AsyncServer *_server = new AsyncServer(VISUALIZER_PORT);

	_server->onClient([](void *arg, AsyncClient *client)
					  { _clients.push_back(client); },
					  _server);

	_server->setNoDelay(true);
	_server->begin();

	Serial.print("	Listening on TCP port ");
	Serial.println(VISUALIZER_PORT);
}

void Visualizer::update()
{
	if (_clients.empty()) return;

	uint8_t packet[STRIP_LEDS * 3 + 1] = {0x01};

	for (int i = 0; i < STRIP_LEDS; i++)
	{
		uint32_t color = _display._strip.getPixelColor(i);

		packet[i * 3 + 1] = (color >> 16) & 0xff;
		packet[i * 3 + 2] = (color >> 8) & 0xff;
		packet[i * 3 + 3] = color & 0xff;
	}

	for (AsyncClient *client : _clients)
	{
		client->write((char *)packet, sizeof(packet));
	}

	Serial.println("	Visualizer packet sent");
}
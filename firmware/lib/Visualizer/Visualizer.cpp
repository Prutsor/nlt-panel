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

	last_update = millis();

	Serial.print("	Listening on TCP port ");
	Serial.println(VISUALIZER_PORT);
}

void Visualizer::update()
{
	if (_clients.empty()) return;
	if (millis() - last_update < 1000/24) return;

	//TODO: read raw neopixel buffer
	//TODO: receive video stream?

	_stream_buffer[0] = 0x01;

	for (int i = 0; i < STRIP_LEDS; i++)
	{
		uint32_t color = _display._strip.getPixelColor(i);

		_stream_buffer[i * 3 + 1] = (color >> 16) & 0xff;
		_stream_buffer[i * 3 + 2] = (color >> 8) & 0xff;
		_stream_buffer[i * 3 + 3] = color & 0xff;
	}

	for (AsyncClient *client : _clients)
	{
		client->write((char *)_stream_buffer, sizeof(_stream_buffer));
	}

	last_update = millis();
}
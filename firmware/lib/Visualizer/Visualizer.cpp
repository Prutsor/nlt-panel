#include "Visualizer.h"

#include <WiFiServer.h>

Visualizer::Visualizer(Display display) : _server(WiFiServer(VISUALIZER_PORT)), _display(display) {}

void Visualizer::setup()
{
	_server.setNoDelay(true);
	_server.begin();
}

void Visualizer::update()
{
	if (_server.hasClient())
	{
		_client = _server.accept();
	}

	if (!_client) return;
	if (!_client.availableForWrite()) return;

	if (millis() - last_update < 1000 / 24) return;

	// TODO: read raw neopixel buffer
	// TODO: receive video stream?

	_stream_buffer[0] = 0x01;

	for (int i = 0; i < STRIP_LEDS; i++)
	{
		uint32_t color = _display._strip.getPixelColor(i);

		_stream_buffer[i * 3 + 1] = (color >> 16) & 0xff;
		_stream_buffer[i * 3 + 2] = (color >> 8) & 0xff;
		_stream_buffer[i * 3 + 3] = color & 0xff;
	}

	_client.write(_stream_buffer, sizeof(_stream_buffer));
	_client.flush();

	last_update = millis();
}
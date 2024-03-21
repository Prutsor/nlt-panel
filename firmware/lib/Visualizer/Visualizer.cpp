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

	if (millis() - last_metadata > 1000 / 10) {
		_metadata_buffer[0] = 0x02;

		uint32_t time = millis();

		uint32_t heap_free = 0;
		uint32_t heap_max = 0;
		uint8_t heap_frag = 0;

		ESP.getHeapStats(&heap_free, &heap_max, &heap_frag);

		_insert_buffer(_metadata_buffer, &time, 4, 1);
		_insert_buffer(_metadata_buffer, &heap_free, 4, 5);
		_insert_buffer(_metadata_buffer, &heap_max, 4, 9);
		_metadata_buffer[13] = heap_frag;

		_client.write(_metadata_buffer, sizeof(_metadata_buffer));
		_client.flush();

		last_metadata = millis();
	}

	if (millis() - last_update > 1000 / 24) {
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

	_client.flush();
}

void Visualizer::_insert_buffer(uint8_t *buffer, const uint32_t *data, uint8_t size, uint8_t offset)
{
	for (int i = 0; i < size; i++)
	{
		buffer[i + offset] = (*data >> (i * 8));
	}
}


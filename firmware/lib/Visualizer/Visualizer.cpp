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

	if (_client.available() > 0) {
		const int size = _client.available();

		_client.readBytes(_recv_buffer, size);

		switch (_recv_buffer[0]) {
			case 0x03: // SET_MODE (VALUE, MODE)
				if (_recv_buffer[1] == 0x00) {
					s_display_mode = static_cast<DISPLAY_MODE>(_recv_buffer[2]);
				} else if (_recv_buffer[1] == 0x01) {
					s_background_mode = static_cast<BACKGROUND_MODE>(_recv_buffer[2]);
				}
				
				break;
			case 0x04: // SET_TEXT
				for (int i = 0; i < size - 1; i++) {
					s_display_text[i] = _recv_buffer[i + 1];
				}

				s_display_text[size - 1] = 0;

				break;
			case 0x05: // SET_COLOR
				s_background_color = (_recv_buffer[1] << 16) | (_recv_buffer[2] << 8) | _recv_buffer[3];
				
				break;
			default:
				break;
		}
	}

	if (!_client.availableForWrite()) return;

	bool written = false;

	if (millis() - last_metadata > 1000 / 2) {
		_metadata_buffer[0] = 0x02;

		const uint32_t time = millis();

		uint32_t heap_free = 0;
		uint32_t heap_max = 0;
		uint8_t heap_frag = 0;

		EspClass::getHeapStats(&heap_free, &heap_max, &heap_frag);

		_insert_buffer(_metadata_buffer, &time, 4, 1);
		_insert_buffer(_metadata_buffer, &heap_free, 4, 5);
		_insert_buffer(_metadata_buffer, &heap_max, 4, 9);
		_metadata_buffer[13] = heap_frag;

		_metadata_buffer[14] = signal_strength();

		_client.write(_metadata_buffer, sizeof(_metadata_buffer));
		written = true;

		last_metadata = millis();
	}

	if (millis() - last_update > 1000 / 24) {
		// TODO: read raw neopixel buffer
		// TODO: receive video stream?

		_stream_buffer[0] = 0x01;

		for (int i = 0; i < STRIP_LEDS; i++)
		{
			const uint32_t color = _display._strip.getPixelColor(i);

			_stream_buffer[i * 3 + 1] = (color >> 16) & 0xff;
			_stream_buffer[i * 3 + 2] = (color >> 8) & 0xff;
			_stream_buffer[i * 3 + 3] = color & 0xff;
		}

		_client.write(_stream_buffer, sizeof(_stream_buffer));
		written = true;

		last_update = millis();
	}

	if (written) _client.flush();
}

void Visualizer::_insert_buffer(uint8_t *buffer, const uint32_t *data, const uint8_t size, const uint8_t offset)
{
	for (int i = 0; i < size; i++)
	{
		buffer[i + offset] = (*data >> (i * 8));
	}
}

uint8_t Visualizer::signal_strength()
{
	const int8_t dBm = WiFi.RSSI();

	if (dBm <= -100)
		return 0;
	if (dBm >= -50)
		return 100;

	return 2 * (dBm + 100);
}

#include <config.h>

#include <Arduino.h>
#include <ArduinoOTA.h>

#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>

#include <logger.h>
#include <time.h>

#include "config.h"
#include "constants.h"
#include "font.h"

#include <Adafruit_NeoPixel.h>

#include "Display.h"
#include "Visualizer.h"

// @version 4.0.0

constexpr uint8_t MAJOR = 4;
constexpr uint8_t MINOR = 0;
constexpr uint8_t PATCH = 0;

Adafruit_NeoPixel strip(STRIP_LEDS, STRIP_PIN, STRIP_TYPE);

Display display(strip);
Visualizer visualizer(display);

logging::Logger logger;

time_t now;
struct tm tm;

void setup()
{
	Serial.begin(115200);

	const unsigned long start = millis();

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "WIFI", "Setting up WiFi (SSID: %s)", ssid);

	WiFi.begin(ssid, password);

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DISPLAY", "Setting up display");

	display.setup();

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "WIFI", "Waiting for WiFi connection");

	while (WiFi.status() != WL_CONNECTED)
	{
		delay(100);
	}

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "WIFI", "Connected, IP address: %s", WiFi.localIP().toString().c_str());

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "MDNS", "Setting up MDNS (Service name: %s)", SERVICE_NAME);

	if (!MDNS.begin(SERVICE_NAME))
	{
		logger.log(logging::LoggerLevel::LOGGER_LEVEL_ERROR, "MDNS", "Error setting up MDNS responder!");
	}

	MDNS.addService("nlt-panel", "tcp", SERVICE_PORT);
	MDNS.addServiceTxt("nlt-panel", "tcp", "version", (String)MAJOR + "." + (String)MINOR + "." + (String)PATCH);

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "NTP", "Setting up NTP (Server: %s, TZ: %s)", NTP_SERVER, NTP_TZ);
	configTime(NTP_TZ, NTP_SERVER);

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "VISUALIZER", "Setting up visualizer (Port: %d)", VISUALIZER_PORT);
	visualizer.setup();

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "OTA", "Setting up OTA");
	ArduinoOTA.begin(false);

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "SETUP", "Done! Took %d ms", millis() - start);
}

void loop()
{
	MDNS.update();
	ArduinoOTA.handle();

	time(&now);
	localtime_r(&now, &tm);

	display.render_background();
	// display.render_time(tm.tm_hour, tm.tm_min, tm.tm_sec);
	display.render_text("makerspace");

	display.update();
	visualizer.update();
}
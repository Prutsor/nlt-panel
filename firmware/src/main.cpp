#include <config.h>

#include <Arduino.h>
#include <ArduinoOTA.h>

#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <sntp.h>

#include <logger.h>
#include <time.h>

#include "config.h"
#include "constants.hpp"
#include "font.hpp"

#include <Adafruit_NeoPixel.h>

#include "Display.h"
#include "Visualizer.h"

#include "settings.hpp"

DISPLAY_MODE s_display_mode = DISPLAY_MODE::Time;
BACKGROUND_MODE s_background_mode = BACKGROUND_MODE::Noise;

char s_display_text[128] = "test";
uint32_t s_background_color = 0x039dfc;

// @version 4.1.2

constexpr uint8_t MAJOR = 4;
constexpr uint8_t MINOR = 1;
constexpr uint8_t PATCH = 2;

Adafruit_NeoPixel strip(STRIP_LEDS, STRIP_PIN, STRIP_TYPE);

Display display(strip);
Visualizer visualizer(display);

logging::Logger logger;

time_t now;
struct tm tm;

void printNetworkDiagnostics();
void printNTPDiagnostics();

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

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "NTP", "Setting up NTP (Main server: %s, TZ: %s)", NTP_SERVER, NTP_TZ);
	configTime(NTP_TZ, NTP_SERVER, NTP_SERVER_FALLBACK_1, NTP_SERVER_FALLBACK_2);
	printNetworkDiagnostics();
	printNTPDiagnostics();

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

	if (s_display_mode == DISPLAY_MODE::Time)
	{
		display.render_time(tm.tm_hour, tm.tm_min, tm.tm_sec);
	}
	else if (s_display_mode == DISPLAY_MODE::Text)
	{
		display.render_text(s_display_text);
	}

	display.update();
	visualizer.update();
}

void printNetworkDiagnostics()
{
	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "--- Network Diagnostics ---");
	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "Local IP: %s", WiFi.localIP().toString().c_str());
	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "Gateway:  %s", WiFi.gatewayIP().toString().c_str());
	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "DNS 1:    %s", WiFi.dnsIP(0).toString().c_str());
	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "DNS 2:    %s", WiFi.dnsIP(1).toString().c_str());

	IPAddress test_ip;
	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "Testing DNS for google.com...");
	if (WiFi.hostByName("google.com", test_ip))
	{
		logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "google.com = %s", test_ip.toString().c_str());
	}
	else
	{
		logger.log(logging::LoggerLevel::LOGGER_LEVEL_ERROR, "DIAG", "Cannot resolve google.com");
	}

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "---------------------------");
}

void printNTPDiagnostics()
{
	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "--- NTP Server Diagnostics ---");

	for (int i = 0; i < SNTP_MAX_SERVERS; i++)
	{
		IPAddress sntp_ip = *sntp_getserver(i);
		const char *name = sntp_getservername(i);

		if (name == nullptr && !sntp_ip.isSet())
		{
			logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "Server %d: Not configured", i);
			continue;
		}

		logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "Server %d: %s", i, name ? name : "IP-Only");
		logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "  SNTP IP:    %s", sntp_ip.isSet() ? sntp_ip.toString().c_str() : "Pending");

		if (name != nullptr)
		{
			IPAddress test_ip;
			if (WiFi.hostByName(name, test_ip))
			{
				logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "  Manual DNS: %s", test_ip.toString().c_str());
			}
			else
			{
				logger.log(logging::LoggerLevel::LOGGER_LEVEL_ERROR, "DIAG", "  Manual DNS: Failed");
			}
		}
	}

	logger.log(logging::LoggerLevel::LOGGER_LEVEL_INFO, "DIAG", "------------------------------");
}
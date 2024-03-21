#include <config.h>

#include <Arduino.h>

#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>

#include <time.h>

#include "config.h"
#include "constants.h"

#include <Adafruit_NeoPixel.h>

#include "Display.h"
#include "Visualizer.h"

Adafruit_NeoPixel strip(STRIP_LEDS, STRIP_PIN, STRIP_TYPE);

Display display(strip);
Visualizer visualizer(display);

time_t now;
struct tm tm;

// @version 4.0.0

constexpr uint8_t MAJOR = 4;
constexpr uint8_t MINOR = 0;
constexpr uint8_t PATCH = 0;

void setup_wifi();
void setup_mdns();

void setup()
{
	Serial.begin(115200);
	Serial.println();

	Serial.println("setup_wifi():");
	setup_wifi();

	Serial.println("setup_mdns():");
	setup_mdns();

	Serial.println("configTime():");
	configTime(NTP_TZ, NTP_SERVER);

	Serial.println("display.setup():");
	display.setup();

	Serial.println("visualizer.setup():");
	visualizer.setup();

	Serial.println("setup(): Done!");
}

void loop()
{
	MDNS.update();

	time(&now);
	localtime_r(&now, &tm);

	display.render_background();
	display.render_time(tm.tm_hour, tm.tm_min, tm.tm_sec);

	display.update();
	visualizer.update();
}

void setup_wifi()
{
	WiFi.begin(ssid, password);

	Serial.print("	Connecting");
	while (WiFi.status() != WL_CONNECTED)
	{
		delay(100);
		Serial.print(".");
	}
	Serial.println();

	Serial.print("	Connected, IP address: ");
	Serial.println(WiFi.localIP());
}

void setup_mdns()
{
	if (!MDNS.begin(SERVICE_NAME))
	{
		Serial.println("	Error setting up MDNS responder!");
	}

	MDNS.addService("nlt-panel", "tcp", SERVICE_PORT);
	MDNS.addServiceTxt("nlt-panel", "tcp", "version", (String)MAJOR + "." + (String)MINOR + "." + (String)PATCH);
}

#include <config.h>

#include <Arduino.h>

#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>

#include <NTPClient.h>

<<<<<<< HEAD
#include "config.h"
#include "constants.h"

=======
>>>>>>> 4eb51d34ab5e98c63a17e66cf95881cebc03d776
#include "display.h"
#include "visualizer.h"

Display display;
Visualizer visualizer;

WiFiUDP ntp_udp;
NTPClient time_client(ntp_udp, "europe.pool.ntp.org", 3600, 60000);

// @version 4.0.0

const uint8_t MAJOR = 4;
const uint8_t MINOR = 0;
const uint8_t PATCH = 0;

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

	Serial.println("display.setup():");
	display.setup();

	Serial.println("visualizer.setup():");
	visualizer.setup(display);

	Serial.println("setup(): Done!");
}

void loop()
{
	MDNS.update();
	time_client.update();

<<<<<<< HEAD
	display.render_background();
=======
>>>>>>> 4eb51d34ab5e98c63a17e66cf95881cebc03d776
	display.render_time(time_client.getHours(), time_client.getMinutes(), time_client.getSeconds());

	display.update();
	visualizer.update();
}

void setup_wifi()
{
	WiFi.begin(ssid, password);

	Serial.print("	Connecting");
	while (WiFi.status() != WL_CONNECTED)
	{
		delay(500);
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

#include <DS3232RTC.h>
#include <FastLED.h>
#define LED_PIN     9
#define NUM_LEDS    128
CRGB leds[NUM_LEDS];
CHSV colourOfNumbers( 160, 255, 255);
DS3232RTC myRTC(false);
tmElements_t tm;
int hue=0;
const int Digits[10][10] = 
{
  {7,8,10,11,14,18,22,24},
  {14,16,18,22,24},
  {7,8,9,11,14,16,18,24},
  {7,9,11,14,16,18,22,24},
  {9,10,11,16,18,22,24},
  {7,9,10,11,14,16,18,22},
  {7,8,9,14,15,16,18,22},
  {7,11,14,16,17,24},
  {7,8,9,10,11,14,16,18,22,24},
  {7,9,10,11,14,16,17,24},
};


void setup()
{
    pinMode(17, OUTPUT); //ground and v5 for clock module
    pinMode(16, OUTPUT);
    digitalWrite(17, HIGH);
    digitalWrite(16, LOW);
    FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
    myRTC.begin();
}

void displaynumber( int place , int number , CHSV colour){
  for (int i = 0 ; i < 10 ; i++) {
    if (Digits[number/10][i] != 0) {
      leds[(Digits[number/10][i]+place)] = colour;
    }
    if (Digits[number%10][i] != 0) {
      leds[(Digits[number%10][i]+28+place)] = colour;
    }
  }
}

void loop(){
  RTC.read(tm);
  hue=(hue+1)%2550;
  leds[0] = colourOfNumbers;
  fill_solid( leds, NUM_LEDS, CRGB(255-leds[0][0],255-leds[0][1],255-leds[0][2]));
  colourOfNumbers.hue = hue/10;
  displaynumber(0,tm.Hour,colourOfNumbers);
  displaynumber(70,tm.Minute,colourOfNumbers);
  if ( tm.Second%2 == 0 ){
    leds[64] = colourOfNumbers;
    leds[66] = colourOfNumbers;
  }
   FastLED.show();
   FastLED.clear ();
}

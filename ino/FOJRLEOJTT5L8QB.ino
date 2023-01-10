#include <FastLED.h>
#define LED_PIN     9
#define NUM_LEDS    128
CRGB leds[NUM_LEDS];
CHSV colourOfNumbers( 160, 255, 255);
int hue=0;
int counter=0;
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
    FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
}

void displaynumber( int place , int number , CHSV colour){// place 0 = left , 1 = right .
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
  counter=(counter+1)%10000;
  hue=(hue+1)%2550;
  colourOfNumbers.hue = hue/10;
  displaynumber(0,counter/100,colourOfNumbers);
  displaynumber(70,counter%100,colourOfNumbers);
   FastLED.show();
   FastLED.clear ();
}

#include <FastLED.h>
#include <DS3232RTC.h>
#define LED_PIN     9
#define NUM_LEDS    128
DS3232RTC myRTC(false);
tmElements_t tm;
CRGB leds[NUM_LEDS];
CHSV colour( 0, 255, 180);
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
    pinMode(17, OUTPUT); //ground and v5 for clock module
    pinMode(16, OUTPUT);
    digitalWrite(17, HIGH);
    digitalWrite(16, LOW);
    FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
    myRTC.begin();
}

//function that uses the Digit aray to display numbers between 0 and 100
void displaynumber( int place , int number){
  for (int i = 0 ; i < 10 ; i++) {
    if (Digits[number/10][i] != 0) {
      leds[(Digits[number/10][i]+place)] = CRGB(255,255,255);;
    }
    if (Digits[number%10][i] != 0) {
      leds[(Digits[number%10][i]+28+place)] = CRGB(255,255,255);;
    }
  }
}

void loop(){
  RTC.read(tm);
  
  //changes the colour of background every 10 cycles
  if (counter<10){
    counter++;
  }else{
    colour.hue = (colour.hue+1)%256;
    counter=0;
  }

  // sets background to rainbow colours
  for ( int i=0; i< 128;i++){
    colour.hue = (colour.hue+1)%256;
    leds[i]= colour;
  }
  colour.hue = (colour.hue+128)%256;
  
  displaynumber(0,tm.Hour);
  displaynumber(70,tm.Minute);

  //display colons
  if ( tm.Second%2 == 0 ){
    leds[64] = CRGB(255,255,255);
    leds[66] = CRGB(255,255,255);
  }
  FastLED.show();
}

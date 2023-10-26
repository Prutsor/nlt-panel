
#ifndef Noise_h
#define Noise_h

extern float noise1(float x);
extern float noise2(float x, float y);
extern float noise3(float x, float y, float z);
extern float noise4(float x, float y, float z, float w);

extern float pnoise1(float x, int px);
extern float pnoise2(float x, float y, int px, int py);
extern float pnoise3(float x, float y, float z, int px, int py, int pz);
extern float pnoise4(float x, float y, float z, float w, int px, int py, int pz, int pw);

#endif

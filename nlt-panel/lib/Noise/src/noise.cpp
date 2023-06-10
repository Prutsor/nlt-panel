#include "noise.h"

uint8_t inoise8(uint16_t x, uint16_t y, uint16_t z)
{
    uint16_t seed = x + y * 57 + z * 131;
    seed = (seed << 13) ^ seed;
    return (uint8_t)((seed * (seed * seed * 15731 + 789221) + 1376312589) >> 8);
}
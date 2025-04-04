#ifndef _MAGE_H
#define _MAGE_H

#include "mage_defines.h"
#include "mage_game_control.h"
#include "FrameBuffer.h"

//this will handle any blocking delays at the end of the loop
void handleBlockingDelay();

//updates the state of all the things before rendering:
void GameUpdate();

//This renders the game to the screen based on the loop's updated state.
void GameRender();

void EngineInit();

//this runs the actual game, performing initial setup and then
//running the game loop indefinitely until the game is exited.
void MAGE();

#endif //_MAGE_H
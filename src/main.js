/*
5 of Phaser's Major Components

Physics Systems DONE
Cameras DONE (When getting enough keys)
Text Objects DONE
Animation Manager (Sprite) DONE
Tween Manager (When getting enough keys) DONE
Sound DONE

Some notes:
This is a game based off the movie The Seventh Seal where Antonious Block encounters Death.
I tried to incorporate the chess board with a unique twist where Antonious has to fend off against these
ghostly figures. The chess pieces power ups are another unique thing I added to give the scene some value.
The keys are just something I added to open a portal to get out of this bizarre world.

*/

import ChessGameScene from './scenes/ChessGameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import WinScene from './scenes/WinScene.js';
import Menu from './scenes/Menu.js';
import HelpScene from './scenes/HelpScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [Menu, HelpScene,ChessGameScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);

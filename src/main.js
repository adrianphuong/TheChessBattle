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

import ChessGameScene from './scenes/ChessGameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import WinScene from './scenes/WinScene.js';

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
    scene: [ChessGameScene, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);

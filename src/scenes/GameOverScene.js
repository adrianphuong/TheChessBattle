class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    preload() {
        this.load.image('over','./assets/over.png');
    }

    create() {
        this.add.image(400,300, 'over');
        this.add.text(275, 400, 'Press R to restart', { fontSize: '24px', fill: '#fff' });

        this.input.keyboard.on('keydown-R', () => {
            this.scene.stop('GameOverScene');
            this.scene.start('ChessGameScene');
        });
    }
}

export default GameOverScene;

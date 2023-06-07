class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        this.add.text(300, 300, 'Game Over', { fontSize: '32px', fill: '#fff' });
        this.add.text(300, 350, 'Press R to restart', { fontSize: '24px', fill: '#fff' });

        this.input.keyboard.on('keydown-R', () => {
            this.scene.start('ChessGameScene');
        });
    }
}

export default GameOverScene;

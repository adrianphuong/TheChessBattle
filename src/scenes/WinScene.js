class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    create() {
        this.add.text(300, 300, 'You Won', { fontSize: '32px', fill: '#fff' });
        this.add.text(300, 350, 'Press R to restart', { fontSize: '24px', fill: '#fff' });

        this.input.keyboard.on('keydown-R', () => {
            this.scene.start('ChessGameScene');
        });
    }
}

export default WinScene;

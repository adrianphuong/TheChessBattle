class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    create() {
        this.add.text(300, 300, 'You Won', { fontSize: '32px', fill: '#000' });
    }
}

export default WinScene;

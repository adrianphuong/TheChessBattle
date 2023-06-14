class HelpScene extends Phaser.Scene {
    constructor() {
        super("HelpScene");
    }
    preload() {
        this.load.image('help', './assets/help.png');
        this.load.image('menu', './assets/menu.png');
        this.load.image('background', './assets/background.png');
    }

    create() {
        this.background = this.add.tileSprite(0, 0, 800, 600, 'background').setOrigin(0, 0).setAlpha(0.2);
        this.add.image(this.sys.game.config.width/2, this.sys.game.config.height/3, 'help').setScale(0.3);
        this.add.image(this.sys.game.config.width/2, this.sys.game.config.height/3+300, 'menu').setScale(0.4);
        this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    }

    update() {
        this.background.tilePositionX += 2;
        if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
            this.scene.start("Menu");
        }
    }
}

export default HelpScene;
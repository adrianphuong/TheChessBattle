class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }
    preload() {
        this.load.image('title', './assets/title.png');
        this.load.image('subtitle', './assets/subtitle.png');
        this.load.image('buttons', './assets/press.png');
        this.load.image('background', './assets/background.png');
    }

    create() {
        this.background = this.add.tileSprite(0, 0, 800, 600, 'background').setOrigin(0, 0).setAlpha(0.2);
        this.add.image(this.sys.game.config.width/2, this.sys.game.config.height/3, 'title');
        this.add.image(this.sys.game.config.width/2, this.sys.game.config.height/3+100, 'subtitle').setScale(0.4);
        this.add.image(this.sys.game.config.width/2, this.sys.game.config.height/2+120, 'buttons').setScale(0.5);
        // Add keyboard input
        this.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    }

    update() {
        this.background.tilePositionX += 2;
        if (Phaser.Input.Keyboard.JustDown(this.keyRIGHT)) {
            this.scene.start("ChessGameScene");
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
            this.scene.start("HelpScene");
        }
    }

}
export default Menu;
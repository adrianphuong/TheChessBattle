class ChessGameScene extends Phaser.Scene {
    constructor() {
        super('ChessGameScene');
    }

    preload() {
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('death', 'assets/sprites/death.png');
        this.load.image('background', 'assets/background.png');
        //this.load.image('particle', 'assets/sprites/particle.png');
    }

    create() {
        this.background = this.add.tileSprite(0, 0, 800, 600, 'background').setOrigin(0, 0);
        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);

        this.deathPieces = this.physics.add.group();

        for (let i = 0; i < 11; i++) {
            this.spawnDeath();
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.physics.add.collider(this.player, this.deathPieces, this.hitDeath, null, this);

        //this.particles = this.add.particles('particle');
    }

    spawnDeath() {
        const x = Phaser.Math.Between(0, this.game.renderer.width);
        const y = Phaser.Math.Between(0, this.game.renderer.height);
        const edge = Phaser.Math.Between(0, 3);
        let spawnX, spawnY;
        if (edge === 0) { // top edge
            spawnX = x;
            spawnY = 0;
        } else if (edge === 1) { // right edge
            spawnX = this.game.renderer.width;
            spawnY = y;
        } else if (edge === 2) { // bottom edge
            spawnX = x;
            spawnY = this.game.renderer.height;
        } else { // left edge
            spawnX = 0;
            spawnY = y;
        }
        const deathPiece = this.deathPieces.create(spawnX, spawnY, 'death');
        deathPiece.isAttacking = false;
    }

    update() {
        this.background.tilePositionX = this.cameras.main.scrollX * 0.5;
        this.background.tilePositionY = this.cameras.main.scrollY * 0.5;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocityY(0);
        }

        // For each of the death pieces, set velocity towards the player
        Phaser.Actions.Call(this.deathPieces.getChildren(), function(deathPiece) {
            let direction = new Phaser.Math.Vector2(this.player.x - deathPiece.x, this.player.y - deathPiece.y).normalize();
            deathPiece.setVelocity(direction.x * 50, direction.y * 50);

            if (Phaser.Math.Distance.Between(this.player.x, this.player.y, deathPiece.x, deathPiece.y) < 50) {
                if (this.player.isAttacking) {
                    deathPiece.setAngle(90);
                    deathPiece.setTint(0xff0000);
                    /*(this.particles.createEmitter({
                        speed: 100,
                        scale: { start: 1, end: 0 },
                        blendMode: 'ADD'
                    }).startFollow(deathPiece);*/
                    this.time.addEvent({
                        delay: 2000,
                        callback: function() {
                            deathPiece.destroy();
                            this.spawnDeath();
                        },
                        callbackScope: this,
                    });
                }
            }
        }, this);

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.player.isAttacking = true;
            this.time.addEvent({
                delay: 1000,
                callback: function() {
                    this.player.isAttacking = false;
                },
                callbackScope: this,
            });
        }
    }

    hitDeath(player, deathPiece) {
        if (!player.isAttacking && deathPiece.angle !== 90) {
            this.physics.pause();
            player.setTint(0xff0000);
            this.scene.start('GameOverScene');
        }
    }
}

export default ChessGameScene;

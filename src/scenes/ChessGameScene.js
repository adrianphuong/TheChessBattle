class ChessGameScene extends Phaser.Scene {
    constructor() {
        super('ChessGameScene');
        this.gameStarted = false;
        this.health = 100;
        this.lastHit = 0;
        this.speedBoost = false;
        this.shield = false;
        this.keysCollected = 0;
    }

    preload() {
        this.load.image('player', 'assets/sprites/player.png');
        this.load.image('death', 'assets/sprites/death.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('bishop', 'assets/sprites/bishop.png');
        this.load.image('king', 'assets/sprites/king.png');
        this.load.image('knight', 'assets/sprites/knight.png');
        this.load.image('key', 'assets/sprites/key.png');
        this.load.image('portal','assets/sprites/portal.png');
        this.load.audio('bgMusic', 'assets/bgsound.mp3');
        this.load.audio('keySound', 'assets/key.mp3');
    }

    create() {
        // The background is now set to follow the player
        this.backgrounds = [];
        for (let i = 0; i < 2; i++) {
            let bg = this.add.tileSprite(i * 800, 0, 800, 600, 'background');
            bg.setOrigin(0, 0);
            this.backgrounds.push(bg);
        }
        this.bgMusic = this.sound.add('bgMusic', { loop: true });   
        this.bgMusic.play();


        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);
        this.keys = this.physics.add.group();
        this.keyText = this.add.text(10, 10, 'Keys: 0', { fontSize: '16px', fill: '#000' });
        this.spawnKey(); // Only spawn one key at the start
        this.physics.add.overlap(this.player, this.keys, this.collectKey, null, this);

        // Add a portal sprite, assuming you've preloaded an image with the key 'portal'
        this.portal = this.physics.add.sprite(400, 0, 'portal');

        // Make the portal initially invisible
        this.portal.setVisible(false);

        this.physics.add.overlap(this.player, this.portal, this.enterPortal, null, this);

        this.portal.body.enable = false;

        this.healthBar = this.add.graphics();
        this.updateHealthBar();

        this.deathPieces = this.physics.add.group();
        for (let i = 0; i < 11; i++) {
            this.spawnDeath();
        }

        // Spawn power-ups less frequently
        this.time.addEvent({ delay: 5000, callback: this.spawnBishop, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 15000, callback: this.spawnKnight, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 30000, callback: this.spawnKing, callbackScope: this, loop: true });

        this.bishops = this.physics.add.group();
        this.kings = this.physics.add.group();
        this.knights = this.physics.add.group();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.physics.add.overlap(this.player, this.deathPieces, this.hitDeath, null, this);
        this.physics.add.overlap(this.player, this.bishops, this.collectBishop, null, this);
        this.physics.add.overlap(this.player, this.kings, this.collectKing, null, this);
        this.physics.add.overlap(this.player, this.knights, this.collectKnight, null, this);

        this.startText = this.add.text(10, 50, 'Escape back to reality. USE ARROW KEYS TO START.', { align: 'center', fontSize: '20px', fill: '#ffffff' });
        this.startText.setScrollFactor(0);
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x00ff00, 1); 
        this.healthBar.fillRect(10, 10, 200 * (this.health / 100), 20);
    }

    spawnDeath() {
        const x = Phaser.Math.Between(0, this.scale.width);
        const y = Phaser.Math.Between(0, this.scale.height);
        const edge = Phaser.Math.Between(0, 3);
        let spawnX, spawnY;
        if (edge === 0) { 
            spawnX = x;
            spawnY = 0;
        } else if (edge === 1) {
            spawnX = this.scale.width;
            spawnY = y;
        } else if (edge === 2) {
            spawnX = x;
            spawnY = this.scale.height;
        } else {
            spawnX = 0;
            spawnY = y;
        }
        const deathPiece = this.deathPieces.create(spawnX, spawnY, 'death');
        deathPiece.isAttacking = false;
    }

    spawnKey() {
        let distance = 0;
        let position = new Phaser.Geom.Point(0, 0);

        while (distance < 300) {
            position.x = Phaser.Math.Between(0, this.scale.width);
            position.y = Phaser.Math.Between(0, this.scale.height);
            distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, position.x, position.y);
        }

        if(this.keys.countActive(true) === 0) { // Only spawn a new key if there are none active
            this.keys.create(position.x, position.y, 'key');
        }
    }

    collectKey(player, key) {
        key.disableBody(true, true);
        this.keysCollected++;
        this.keyText.setText('Keys: ' + this.keysCollected);
        // Play key sound
        this.sound.play('keySound');

        if (this.keysCollected >= 4) {
            this.portal.setVisible(true);
            this.portal.body.enable = true;
        }
        else {
            this.spawnKey(); // Spawn a new key when a key is collected
        }
    }

    enterPortal(player, portal) {
        this.scene.start('WinScene');
    }

    spawnBishop() {
        this.bishops.create(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), 'bishop');
    }

    spawnKing() {
        this.kings.create(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), 'king');
    }

    spawnKnight() {
        this.knights.create(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), 'knight');
    }

    update(time) {
        if (!this.gameStarted) {
            if (this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown) {
                this.gameStarted = true;
                this.startText.visible = false;
            } else {
                return;
            }
        }

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(this.speedBoost ? -320 : -160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.speedBoost ? 320 : 160);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(this.speedBoost ? -320 : -160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.speedBoost ? 320 : 160);
        } else {
            this.player.setVelocityY(0);
        }

        Phaser.Actions.Call(this.deathPieces.getChildren(), function(deathPiece) {
            let direction = new Phaser.Math.Vector2(this.player.x - deathPiece.x, this.player.y - deathPiece.y).normalize();
            deathPiece.setVelocity(direction.x * 50, direction.y * 50);
        }, this);

        this.backgrounds.forEach((bg) => {
            if (this.player.x > bg.x + 800) {
                bg.x += 800 * 2;
            } else if (this.player.x < bg.x - 800) {
                bg.x -= 800 * 2;
            }
        });
    }

    hitDeath(player, deathPiece) {
        if (!this.shield) {
            const timeNow = this.time.now;
            if (timeNow - this.lastHit > 1000) {
                this.lastHit = timeNow;
                this.health -= 10;
                player.setTint(0xff0000);

                if (this.health <= 0) {
                    this.physics.pause();
                    this.scene.start('GameOverScene');
                } else {
                    this.time.addEvent({
                        delay: 200, 
                        callback: function() {
                            player.clearTint();
                        },
                        callbackScope: this,
                    });
                    this.updateHealthBar();
                }
            }
        }
    }

    collectBishop(player, bishop) {
        bishop.disableBody(true, true);
        this.speedBoost = true;
        this.time.addEvent({
            delay: 5000, 
            callback: function() {
                this.speedBoost = false;
            },
            callbackScope: this,
        });
    }

    collectKing(player, king) {
        king.disableBody(true, true);
        this.health = Math.min(100, this.health + 50);
        this.updateHealthBar();
    }

    collectKnight(player, knight) {
        knight.disableBody(true, true);
        this.shield = true;
        this.time.addEvent({
            delay: 5000, 
            callback: function() {
                this.shield = false;
            },
            callbackScope: this,
        });
    }
}

export default ChessGameScene;

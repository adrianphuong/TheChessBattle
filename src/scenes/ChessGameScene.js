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
        this.load.image('death', 'assets/sprites/death2x.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('bishop', 'assets/sprites/bishopheart.png');
        this.load.image('king', 'assets/sprites/kingspeed.png');
        this.load.spritesheet('knight', 'assets/sprites/knight.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.spritesheet('knightrun', 'assets/sprites/knightrun.png', {
            frameWidth: 96,
            frameHeight: 48
        });
        this.load.spritesheet('knightattack', 'assets/sprites/knightattack.png', {
            frameWidth: 96,
            frameHeight: 48
        });
        this.load.image('key', 'assets/sprites/key.png');
        this.load.image('portal','assets/sprites/portal.png');
        this.load.audio('bgMusic', 'assets/bgsound.mp3');
        this.load.audio('keySound', 'assets/key.mp3');
        this.load.audio('powerUp', 'assets/powerUp.wav');
        this.load.audio('portaltp', 'assets/portal.wav');
        this.load.audio("swoosh", 'assets/sword.mp3');
        
    }

    create() {
        this.health = 100;
        // The background is now set to follow the player
        this.keysCollected = 0;
        this.backgrounds = [];
        for (let i = 0; i < 2; i++) {
            let bg = this.add.tileSprite(i * 800, 0, 800, 600, 'background');
            bg.setOrigin(0, 0);
            this.backgrounds.push(bg);
        }
        this.bgMusic = this.sound.add('bgMusic', { loop: true , volume: .2});   
        this.bgMusic.play();
        

        this.power = this.sound.add('powerUp');
        this.tp = this.sound.add('portaltp');
        this.sword = this.sound.add('swoosh', {volume: .2});

        this.player = this.physics.add.sprite(400, 300, 'knight', 0);
        this.player.hasAttacked = false;
        // Idle Anim
        this.anims.create({
            key: 'idle',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('knight', {
                start: 0,
                end: 1,
            }),
        });
        // Running Anim
        this.anims.create({
            key: 'run',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('knightrun', {
                start: 0,
                end: 5,
            }),
        });
        // Attack Anim
        this.anims.create({
            key: 'attack',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('knightattack', {
                start: 0,
                end: 7,
            }),
            onPlay: () => {
                this.player.hasAttacked = true;
            },
            onComplete: () => {
                this.player.hasAttacked = false;
                this.player.play('idle', true);
            },
        });
    
        this.player.play('idle');

        this.player.setCollideWorldBounds(true);
        this.keys = this.physics.add.group();
        this.keyText = this.add.text(10, 10, 'Keys: 0', { fontSize: '16px', fill: '#000' });
        this.spawnKey(); // Only spawn one key at the start
        this.physics.add.overlap(this.player, this.keys, this.collectKey, null, this);

        this.portal = this.physics.add.sprite(400, 200, 'portal');

        // Make the portal initially invisible
        this.portal.setVisible(false);

        this.physics.add.overlap(this.player, this.portal, this.enterPortal, null, this);
        
        this.portal.body.enable = false;

        this.healthBar = this.add.graphics();
        this.updateHealthBar();

        this.deathPieces = this.physics.add.group();
        this.physics.add.overlap(this.player, this.deathPieces, this.hitDeath, null, this);
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

        this.startText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Escape back to reality. USE ARROW KEYS TO START. HOLD SPACE TO ATTACK', {
            align: 'center',
            fontSize: '15px',
            fill: '#ffffff',
            fontStyle: 'bold',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                stroke: true,
                fill: true
            }
        });
        this.startText.setOrigin(0.5);
        this.startText.setScrollFactor(0);
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBar.fillStyle(0x00ff00, 1); 
        this.healthBar.fillRect(10, 10, 200 * (this.health / 100), 20);
    }

    spawnDeath() {
        // Check the number of active deathPieces
        const activeDeathPieces = this.deathPieces.countActive(true);
    
        // Spawn a new deathPiece only if the number of active deathPieces is less than 11
        if (activeDeathPieces < 11) {
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
            deathPiece.isBeingDestroyed = false;
            deathPiece.isAttacking = false;
        }
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
            // Get the camera
            let cam = this.cameras.main;

            // Get the current camera position
            let currentCamX = cam.scrollX;
            let currentCamY = cam.scrollY;
            let currentCamZoom = cam.zoom;

            // Slowly move the camera to the portal's position
            this.tweens.add({
                targets: cam,
                scrollX: { from: currentCamX, to: this.portal.x - cam.width / 2 },
                scrollY: { from: currentCamY, to: this.portal.y - cam.height / 2 },
                zoom: { from: currentCamZoom, to: 2 }, // Zoom in
                duration: 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                onYoyo: () => cam.zoom = currentCamZoom, // Reset the zoom level when the camera is moving back to the initial position
            });
        }
        else {
            this.spawnKey(); // Spawn a new key when a key is collected
        }
    }

    enterPortal(player, portal) {
        this.tp.play();
        this.gameStarted = false;
        this.scene.start('WinScene');
    }

    spawnBishop() {
        this.bishops.create(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), 'bishop');
    }

    spawnKing() {
        this.kings.create(Phaser.Math.Between(0, this.scale.width), Phaser.Math.Between(0, this.scale.height), 'king');
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
    
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.player.hasAttacked) {
            this.sword.play();
            this.player.play('attack', true);
            this.player.hasAttacked = true;
        }
    
        if (this.player.anims.currentAnim && this.player.anims.currentAnim.key !== 'attack') {
            this.player.hasAttacked = false;
        }
    
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(this.speedBoost ? -320 : -160);
            this.player.flipX = true;
            this.player.play('run', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.speedBoost ? 320 : 160);
            this.player.flipX = false;
            this.player.play('run', true);
        } else {
            this.player.setVelocityX(0);
        }
    
        if (this.cursors.up.isDown) {
            this.player.setVelocityY(this.speedBoost ? -320 : -160);
            this.player.play('run', true);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.speedBoost ? 320 : 160);
            this.player.play('run', true);
        } else {
            this.player.setVelocityY(0);
        }
    
        if (!this.cursors.up.isDown && !this.cursors.down.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown && !this.spaceKey.isDown) {
            this.player.play('idle', true);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.player.hasAttacked) {
            this.sword.play();
            this.player.play('attack', true);
            this.player.hasAttacked = true;
        }
    
        if (this.player.anims.currentAnim && this.player.anims.currentAnim.key !== 'attack') {
            this.player.hasAttacked = false;
        }
    
        Phaser.Actions.Call(this.deathPieces.getChildren(), function (deathPiece) {
            if (!deathPiece.isDead) { 
                let direction = new Phaser.Math.Vector2(this.player.x - deathPiece.x, this.player.y - deathPiece.y).normalize();
                deathPiece.setVelocity(direction.x * 50, direction.y * 50);
            }
        }, this);
    
        this.backgrounds.forEach((bg) => {
            if (this.player.x > bg.x + 800) {
                bg.x += 800 * 2;
            } else if (this.player.x < bg.x - 800) {
                bg.x -= 800 * 2;
            }
        });
    }
    

    // New method to update the timer
    updateTime() {
        this.timeRemaining--;
        this.timeText.setText('Time Remaining: ' + this.timeRemaining);
        if(this.timeRemaining <= 0) {
            this.physics.pause();
            this.scene.start('GameOverScene');
        }
    }

    hitDeath(player, deathPiece) {
        // Calculate the distance between the player and the deathPiece
        const distance = Phaser.Math.Distance.Between(player.x, player.y, deathPiece.x, deathPiece.y);
    
        // Check if the player is looking in the direction of death
        const playerLookingLeft = player.flipX;
        const deathFromLeft = deathPiece.x < player.x;
    
        // Check if an animation is playing and if it is 'attack'
        if (player.anims.currentAnim && player.anims.currentAnim.key === 'attack') {
            // If the player is attacking and facing the deathPiece and it is less than a certain distance away, destroy it
            if ((playerLookingLeft && deathFromLeft) || (!playerLookingLeft && !deathFromLeft)) {
                if (distance < 130) {
                    deathPiece.setTint(0xff0000); // Tint 'death' red
                    deathPiece.setVelocity(0, 0);
                    deathPiece.setAcceleration(0, 0);
    
                    // Check if the deathPiece is already dead
                    if (!deathPiece.isDead) {
                        deathPiece.isDead = true; // Mark the deathPiece as dead
    
                        // Fade out and disable death after a delay
                        this.time.addEvent({
                            delay: 1000,
                            callback: function () {
                                deathPiece.disableBody(true, true);
                                this.spawnDeath(); // Spawn a new death piece
                            },
                            callbackScope: this
                        });
                    }
                }
            }
        } else {
            // If player is not attacking and death touches the player
            if (distance < 100 && !deathPiece.isDead) {
                this.health -= .1; // Reduce player health by 10
                this.updateHealthBar();
                if (this.health <= 0) { // If player's health drops to zero
                    this.gameStarted = false;
                    this.scene.start('GameOverScene'); // Start the GameOverScene
                }
            }
        }
    }

    collectBishop(player, bishop) {
        bishop.disableBody(true, true);
        this.health = Math.min(100, this.health + 50);
        this.updateHealthBar();
        this.power.play();
    }

    collectKing(player, king) {
        king.disableBody(true, true);
        this.health = Math.min(100, this.health + 50);
        this.updateHealthBar();
        this.speedBoost = true;
        this.time.addEvent({
            delay: 5000, 
            callback: function() {
                this.speedBoost = false;
            },
            callbackScope: this,
        });
        this.power.play();
    }

}

export default ChessGameScene;

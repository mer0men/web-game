<template>
  <div id="app">
    <canvas id="game"></canvas>
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<script>
import Phaser from "phaser";
// import firebase from "firebase";

export default {
  name: "app",
  data() {
    return {
      game: {},
      stars: undefined,
      player: undefined,
      bombs: undefined,
      platforms: undefined,
      grass: undefined,
      cursors: undefined,
      bullets: undefined,
      en_bullets: undefined,
      enemies: undefined,
      moveKeys: undefined,
      flip: true,
      score: 0,
      gameOver: false,
      scoreText: undefined,
      scene: undefined,
      pl_login: false
    };
  },
  methods: {
   // stopScene() {
   //   this.scene.pause()
   // },
    bombKill(bullets, bombs) {
      bombs.disableBody(true, true);
      console.log(bullets);
    },
    boom(bullet, platform) {
      bullet.disableBody(true, true);
      console.log(platform);
    },
    collectStar(player, star) {
      star.disableBody(true, true);

      //  Add and update the score
      this.score += 10;
      this.scoreText.setText("Score: " + this.score);

      if (this.stars.countActive(true) === 0) {
        //  A new batch of stars to collect
        this.stars.children.iterate(child => {
          child.enableBody(true, child.x, 0, true, true);
        });

        // создаем бомбы и врага ///////////////////////////////////////////////////////////////////////////////////
        let x =
          player.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);

        let bomb = this.bombs.create(x, 16, "bomb");
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      }
    },
    enemyKill(bullet, enemy) {
      enemy.disableBody(true, true);
      console.log(bullet);
    },
    en_boom(en_bullet, platform) {
      en_bullet.disableBody(true, true);
      console.log(platform);
    },
    enemyshoot(enemy, platforms) {
      let en_bullet = this.en_bullets.create(enemy.x - 5, enemy.y, "fireball");
      en_bullet.setVelocityX(-500);
      en_bullet.setVelocityY(-300);

      en_bullet = this.en_bullets.create(enemy.x + 5, enemy.y, "fireball");
      en_bullet.setVelocityX(500);
      en_bullet.setVelocityY(-300);
      console.log(platforms);
    },
    fire() {
      let bullet;

      if (this.flip) {
        bullet = this.bullets.create(
          this.player.x - 5,
          this.player.y,
          "fireball"
        );
        bullet.setVelocityX(-1000);
        bullet.setVelocityY(-100);
      } else {
        bullet = this.bullets.create(
          this.player.x + 5,
          this.player.y,
          "fireball"
        );
        bullet.setVelocityX(1000);
        bullet.setVelocityY(-100);
      }
    },
    hitBomb(player, bomb) {
      this.scene.physics.pause();

      player.setTint(0xff0000);

      player.anims.play("turn");

      this.gameOver = true;
      console.log(bomb);
    }
  },
  mounted() {
    console.log("User", this.$root.user);
    // console.log(this.$root.firebaseui);
    // console.log(this.$root.firebase);
    let ui = new this.$root.firebaseui.auth.AuthUI(this.$root.firebase.auth());
    let uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          this.userId = authResult.user;
          console.log(authResult, redirectUrl);
          return true;
        }
      },
      signInSuccessUrl: "/",
      signInOptions: [this.$root.firebase.auth.GoogleAuthProvider.PROVIDER_ID]
    };
    ui.start("#firebaseui-auth-container", uiConfig);

    this.game = new Phaser.Game({
      type: Phaser.WEBGL,
      width: 1024,
      height: 576,
      canvas: document.getElementById("game"),
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 600 },
          debug: false
        }
      },
      scene: {
        preload: function() {
          this.game.vueinst.scene = this;
          this.load.image(
            "background",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/wasteland.png"
          );
          this.load.image(
            "big_ground",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/platform_big_grass.png"
          );
          this.load.image(
            "ground",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/platform_grass.png"
          );
          this.load.image(
            "star",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/star.png"
          );
          this.load.image(
            "bomb",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/bomb.png"
          );
          this.load.image(
            "enemy_1",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/enemy_1.png"
          );
          this.load.image(
            "fireball",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/fireball.png"
          );
          this.load.spritesheet(
            "dude",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/dude.png",
            {
              frameWidth: 32,
              frameHeight: 48
            }
          );
          //   this.game.load.spritesheet('keel', 'assets/boom_frame.png', {frameWidth: 16, frameHeight: 16 });
          this.load.image(
            "grass",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/platform_grass_img.png"
          );
          this.load.image(
            "fone",
            "https://raw.githubusercontent.com/kazakovichna/web-game/master/MAZASHiB%20LOGO.png"
          );
        },
        create: function() {
          this.input.keyboard.on("keyup-W", () => console.log("W pressed"));
          this.input.keyboard.on("keydown-W", this.game.vueinst.fire, this);

          this.game.vueinst.bullets = this.physics.add.group();
          this.game.vueinst.en_bullets = this.physics.add.group();
          // устанавливаем тип бомб //////////////////////////////////////////////////////////////////////////////////////
          this.game.vueinst.bombs = this.physics.add.group();
          // здесь мы создаем карту //////////////////////////////////////////////////////////////////////////////////
          this.add.image(512, 288, "background");

          this.game.vueinst.platforms = this.physics.add.staticGroup();
          this.game.vueinst.grass = this.physics.add.staticGroup();

          this.game.vueinst.platforms
            .create(512, 570, "big_ground")
            .setScale(1)
            .refreshBody();

          // platforms.create(50, 140, 'ground');

          //нижняя стена ////////////////////////////////////////////////////////////////////////////////////////////////
          this.game.vueinst.platforms.create(150, 540, "ground");
          this.game.vueinst.grass.create(150, 537, "grass");
          this.game.vueinst.platforms.create(150, 520, "ground");
          this.game.vueinst.grass.create(150, 517, "grass");
          // rocks at first flour //////
          this.game.vueinst.platforms.create(450, 540, "ground");
          this.game.vueinst.grass.create(450, 537, "grass");

          // первая ступенька // первая половина экрана /////////////////////////////////////////////////////////////////
          this.game.vueinst.platforms.create(50, 430, "ground");
          this.game.vueinst.grass.create(50, 427, "grass");
          // second stairs
          this.game.vueinst.platforms.create(250, 345, "ground");
          this.game.vueinst.grass.create(250, 342, "grass");
          // there are first flour
          this.game.vueinst.platforms.create(370, 345, "ground");
          this.game.vueinst.grass.create(370, 342, "grass");
          this.game.vueinst.platforms.create(490, 345, "ground");
          this.game.vueinst.grass.create(490, 342, "grass");
          this.game.vueinst.platforms.create(610, 345, "ground");
          this.game.vueinst.grass.create(610, 342, "grass");
          this.game.vueinst.platforms.create(730, 345, "ground");
          this.game.vueinst.grass.create(730, 342, "grass");
          this.game.vueinst.platforms.create(760, 345, "ground");
          this.game.vueinst.grass.create(760, 342, "grass");
          this.game.vueinst.platforms.create(230, 315, "ground");
          this.game.vueinst.grass.create(230, 342, "grass");
          this.game.vueinst.platforms.create(210, 285, "ground");
          this.game.vueinst.grass.create(210, 282, "grass");
          // third stairs
          this.game.vueinst.platforms.create(50, 270, "ground");
          this.game.vueinst.grass.create(50, 267, "grass");
          // fourth stairs
          this.game.vueinst.platforms.create(250, 200, "ground");
          this.game.vueinst.grass.create(250, 197, "grass");
          // there are second flour
          this.game.vueinst.platforms.create(370, 200, "ground");
          this.game.vueinst.grass.create(370, 342, "grass");
          this.game.vueinst.platforms.create(490, 200, "ground");
          this.game.vueinst.grass.create(370, 342, "grass");
          this.game.vueinst.platforms.create(610, 200, "ground");
          this.game.vueinst.grass.create(370, 342, "grass");
          this.game.vueinst.platforms.create(730, 200, "ground");
          this.game.vueinst.grass.create(370, 342, "grass");
          this.game.vueinst.platforms.create(760, 200, "ground");
          this.game.vueinst.grass.create(370, 342, "grass");
          this.game.vueinst.platforms.create(920, 160, "ground");
          this.game.vueinst.grass.create(370, 342, "grass");
          this.game.vueinst.platforms.create(890, 190, "ground");
          this.game.vueinst.grass.create(370, 342, "grass");
          // mid per last flour
          this.game.vueinst.platforms.create(10, 130, "ground");
          this.game.vueinst.grass.create(10, 127, "grass");
          this.game.vueinst.platforms.create(130, 130, "ground");
          this.game.vueinst.grass.create(130, 127, "grass");
          this.game.vueinst.platforms.create(250, 130, "ground");
          this.game.vueinst.grass.create(250, 127, "grass");
          this.game.vueinst.platforms.create(370, 130, "ground");
          this.game.vueinst.grass.create(370, 127, "grass");
          this.game.vueinst.platforms.create(490, 130, "ground");
          this.game.vueinst.grass.create(490, 127, "grass");
          this.game.vueinst.platforms.create(610, 130, "ground");
          this.game.vueinst.grass.create(610, 127, "grass");
          // platforms.create(730, 130, 'ground');
          this.game.vueinst.platforms.create(730, 130, "ground");
          this.game.vueinst.grass.create(730, 127, "grass");
          //last stair
          //  platforms.create(50, 140, 'ground');
          //there are third big flour
          this.game.vueinst.platforms.create(250, 60, "ground");
          this.game.vueinst.grass.create(250, 57, "grass");
          this.game.vueinst.platforms.create(370, 60, "ground");
          this.game.vueinst.grass.create(370, 57, "grass");
          this.game.vueinst.platforms.create(490, 60, "ground");
          this.game.vueinst.grass.create(490, 57, "grass");
          this.game.vueinst.platforms.create(610, 60, "ground");
          this.game.vueinst.grass.create(610, 57, "grass");
          this.game.vueinst.platforms.create(730, 60, "ground");
          this.game.vueinst.grass.create(730, 57, "grass");
          // platforms.create(730, 30, 'ground');
          // second part of screen
          this.game.vueinst.platforms.create(750, 520, "ground");
          this.game.vueinst.grass.create(750, 517, "grass");
          this.game.vueinst.platforms.create(960, 115, "ground");
          this.game.vueinst.grass.create(960, 112, "grass");
          this.game.vueinst.platforms.create(960, 265, "ground");
          this.game.vueinst.grass.create(960, 262, "grass");
          this.game.vueinst.platforms.create(960, 430, "ground");
          this.game.vueinst.grass.create(960, 427, "grass");

          // create the enemies /////////////////////////////////////////////////////////////////////////////////////////
          this.game.vueinst.enemies = this.physics.add.group();

          var enemy_1 = this.game.vueinst.enemies.create(100, 170, "enemy_1");

          enemy_1.setCollideWorldBounds(true);
          enemy_1.setBounce(1);
          enemy_1.setVelocity(Phaser.Math.Between(-200, 200), 20);

          //здесь мы прописываем движение игрока и анимацию этого движения ///////////////////////////////////////////////

          this.game.vueinst.player = this.physics.add.sprite(10, 530, "dude");

          this.game.vueinst.player.setBounce(0.2);
          this.game.vueinst.player.setCollideWorldBounds(true);

          this.game.vueinst.moveKeys = this.input.keyboard.addKeys({
            left_A: Phaser.Input.Keyboard.KeyCodes.A,
            right_D: Phaser.Input.Keyboard.KeyCodes.D
          });

          // тут будет вся анимация //////////////////////////////////////////////////////////////////////////////////////

          this.anims.create({
            key: "fly",
            frames: [{ key: "keel", frame: 0 }],
            frameRate: 20
          });

          this.anims.create({
            key: "kek",
            frames: this.anims.generateFrameNumbers("keel", {
              start: 1,
              end: 4
            }),
            frameRate: 20
          });
          this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {
              start: 0,
              end: 3
            }),
            frameRate: 10,
            repeat: -1
          });

          this.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20
          });

          this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {
              start: 5,
              end: 8
            }),
            frameRate: 10,
            repeat: -1
          });

          this.game.vueinst.cursors = this.input.keyboard.createCursorKeys();

          // добавляем звезды /////////////////////////////////////////////////////////////////////////////////////////////
          this.game.vueinst.stars = this.physics.add.group({
            key: "star",
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
          });

          this.game.vueinst.stars.children.iterate(function(child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
          });

          this.game.vueinst.scoreText = this.add.text(16, 16, "score: 0", {
            fontSize: "32px",
            fill: "#000"
          });

          // устанавливаем протоколы столкновений ////////////////////////////////////////////////////////////////////////

          this.physics.add.collider(
            this.game.vueinst.player,
            this.game.vueinst.platforms
          );
          this.physics.add.collider(
            this.game.vueinst.stars,
            this.game.vueinst.platforms
          );
          this.physics.add.collider(
            this.game.vueinst.bombs,
            this.game.vueinst.platforms
          );

          this.physics.add.collider(
            this.game.vueinst.enemies,
            this.game.vueinst.platforms,
            this.game.vueinst.enemyshoot,
            null,
            this
          );
          this.physics.add.collider(
            this.game.vueinst.player,
            this.game.vueinst.en_bullets,
            this.game.vueinst.hitBomb,
            null,
            this
          );
          this.physics.add.collider(
            this.game.vueinst.en_bullets,
            this.game.vueinst.platforms,
            this.game.vueinst.en_boom,
            null,
            this
          );
          this.physics.add.collider(
            this.game.vueinst.bullets,
            this.game.vueinst.enemies,
            this.game.vueinst.enemyKill,
            null,
            this
          );
          this.physics.add.collider(
            this.game.vueinst.bullets,
            this.game.vueinst.platforms,
            this.game.vueinst.boom,
            null,
            this
          );
          this.physics.add.overlap(
            this.game.vueinst.player,
            this.game.vueinst.stars,
            this.game.vueinst.collectStar,
            null,
            this
          );
          this.physics.add.collider(
            this.game.vueinst.player,
            this.game.vueinst.bombs,
            this.game.vueinst.hitBomb,
            null,
            this
          );
          this.physics.add.collider(
            this.game.vueinst.bullets,
            this.game.vueinst.bombs,
            this.game.vueinst.bombKill,
            null,
            this
          );
        },
        update: function() {
          if (!this.game.vueinst.pl_login) {
            this.add.image(512, 288, "fone");
          }

          if (this.game.vueinst.moveKeys["left_A"].isDown) {
            this.game.vueinst.player.setVelocityX(-160);
            this.game.vueinst.flip = true;
            this.game.vueinst.player.anims.play("left", true);
          } else if (this.game.vueinst.moveKeys["right_D"].isDown) {
            this.game.vueinst.player.setVelocityX(160);
            this.game.vueinst.flip = false;
            this.game.vueinst.player.anims.play("right", true);
          } else {
            this.game.vueinst.player.setVelocityX(0);

            this.game.vueinst.player.anims.play("turn");
          }

          if (
            this.game.vueinst.cursors.space.isDown &&
            this.game.vueinst.player.body.touching.down
          ) {
            this.game.vueinst.player.setVelocityY(-330);
          }
        }
      }
    });
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

#game {
  height: 576px;
  width: 1024px;
}
</style>

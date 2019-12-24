<template>
  <div id="app">
    <canvas id="game"></canvas>
    <div v-show="!user" id="firebaseui-auth-container"></div>
    <div v-show="user" class="logout">
      <img src="https://raw.githubusercontent.com/kazakovichna/web-game/master/logout.png"
           @click="logout" width="100" height="100" style="cursor: pointer" title="logut">
    </div>
    <div class="scoreboard" style="background-image: ">
      <ul>
        <li v-for="(item, index) in scoreboard" :key="index">
          {{ item.name }}: {{ item.score }}
        </li>
      </ul>
    </div>
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
      isPaused: false
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    database() {
      return this.$store.state.database;
    },
    scoreboard() {
      return this.$store.state.score;
    }
  },
  methods: {
    logout() {
      this.$root.firebase.auth().signOut();
    },
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

      this.$store.dispatch("INSERT_SCOREBOARD", {
        name: this.user.email.split("@")[0],
        score: this.score
      });
      this.scene.add.image(512, 288, "fone");
      setTimeout(() => alert("вас загрызли КВНшики"));
      this.game.destroy();
      this.initGame();
    },
    initGame(){

      this.score = 0;
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
        scale: {
          width: 1024,
          height: 576,
          mode: Phaser.Scale.FIT
        },
        scene: {
          preload: function() {
            this.game.vueinst.scene = this;
            this.game.vueinst.loadImgs(this);
          },
          create: function() {
            this.input.keyboard.on("keydown-SPACE", this.game.vueinst.fire, this);

            // устанавливаем протоколы столкновений ////////////////////////////////////////////////////////////////////////

            this.game.vueinst.generationMap(this);
            this.game.vueinst.createColaiders(this);
            var button = this.add
              .image(980, 16, "fullscreen", 0)
              .setOrigin(1, 0)
              .setInteractive();

            button.on(
              "pointerup",
              function() {
                if (this.scale.isFullscreen) {
                  button.setFrame(0);
                  this.scale.stopFullscreen();
                } else {
                  button.setFrame(1);
                  this.scale.startFullscreen();
                }
              },
              this
            );
          },
          update: function() {
            if (!this.game.vueinst.user) {
              if (!this.game.vueinst.isPasued) {
                this.game.vueinst.isPasued = true;
                this.physics.pause();
                this.add.image(512, 288, "fone");
              }
            } else {
              if (this.game.vueinst.isPasued) {
                this.game.vueinst.isPasued = false;
                this.physics.resume();
              }
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
              this.game.vueinst.moveKeys["up_W"].isDown &&
              this.game.vueinst.player.body.touching.down
            ) {
              this.game.vueinst.player.setVelocityY(-330);
            }
          }
        }
      });
      this.game.vueinst = this;

    },
    loadImgs(scene) {
      scene.load.image(
        "background",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/wasteland.png"
      );
      scene.load.image(
        "big_ground",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/platform_big_grass.png"
      );
      scene.load.image(
        "ground",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/platform_grass.png"
      );
      scene.load.image(
        "star",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/star.png"
      );
      scene.load.image(
        "bomb",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/bomb.png"
      );
      scene.load.image(
        "enemy_1",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/enemy_1.png"
      );
      scene.load.image(
        "fireball",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/fireball.png"
      );
      scene.load.spritesheet(
        "dude",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/dude.png",
        {
          frameWidth: 32,
          frameHeight: 48
        }
      );
      scene.load.image(
        "grass",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/assets/platform_grass_img.png"
      );
      scene.load.image(
        "fone",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/MAZASHiB%20LOGO.png"
      );
      scene.load.image(
        "fullscreen",
        "https://raw.githubusercontent.com/kazakovichna/web-game/master/fullscreen_bt.png"
      );
    },
    generationMap(scene) {
      scene.game.vueinst.bullets = scene.physics.add.group();
      scene.game.vueinst.en_bullets = scene.physics.add.group();
      // устанавливаем тип бомб //////////////////////////////////////////////////////////////////////////////////////
      scene.game.vueinst.bombs = scene.physics.add.group();
      // здесь мы создаем карту //////////////////////////////////////////////////////////////////////////////////
      scene.add.image(512, 288, "background");

      scene.game.vueinst.platforms = scene.physics.add.staticGroup();
      scene.game.vueinst.grass = scene.physics.add.staticGroup();

      scene.game.vueinst.platforms
        .create(512, 570, "big_ground")
        .setScale(1)
        .refreshBody();

      // platforms.create(50, 140, 'ground');

      //нижняя стена ////////////////////////////////////////////////////////////////////////////////////////////////
      scene.game.vueinst.platforms.create(150, 540, "ground");
      scene.game.vueinst.grass.create(150, 537, "grass");
      scene.game.vueinst.platforms.create(150, 520, "ground");
      scene.game.vueinst.grass.create(150, 517, "grass");
      // rocks at first flour //////
      scene.game.vueinst.platforms.create(450, 540, "ground");
      scene.game.vueinst.grass.create(450, 537, "grass");

      // первая ступенька // первая половина экрана /////////////////////////////////////////////////////////////////
      scene.game.vueinst.platforms.create(50, 430, "ground");
      scene.game.vueinst.grass.create(50, 427, "grass");
      // second stairs
      scene.game.vueinst.platforms.create(250, 345, "ground");
      scene.game.vueinst.grass.create(250, 342, "grass");
      // there are first flour
      scene.game.vueinst.platforms.create(370, 345, "ground");
      scene.game.vueinst.grass.create(370, 342, "grass");
      scene.game.vueinst.platforms.create(490, 345, "ground");
      scene.game.vueinst.grass.create(490, 342, "grass");
      scene.game.vueinst.platforms.create(610, 345, "ground");
      scene.game.vueinst.grass.create(610, 342, "grass");
      scene.game.vueinst.platforms.create(730, 345, "ground");
      scene.game.vueinst.grass.create(730, 342, "grass");
      scene.game.vueinst.platforms.create(760, 345, "ground");
      scene.game.vueinst.grass.create(760, 342, "grass");
      scene.game.vueinst.platforms.create(230, 315, "ground");
      scene.game.vueinst.grass.create(230, 342, "grass");
      scene.game.vueinst.platforms.create(210, 285, "ground");
      scene.game.vueinst.grass.create(210, 282, "grass");
      // third stairs
      scene.game.vueinst.platforms.create(50, 270, "ground");
      scene.game.vueinst.grass.create(50, 267, "grass");
      // fourth stairs
      scene.game.vueinst.platforms.create(250, 200, "ground");
      scene.game.vueinst.grass.create(250, 197, "grass");
      // there are second flour
      scene.game.vueinst.platforms.create(370, 200, "ground");
      scene.game.vueinst.grass.create(370, 342, "grass");
      scene.game.vueinst.platforms.create(490, 200, "ground");
      scene.game.vueinst.grass.create(370, 342, "grass");
      scene.game.vueinst.platforms.create(610, 200, "ground");
      scene.game.vueinst.grass.create(370, 342, "grass");
      scene.game.vueinst.platforms.create(730, 200, "ground");
      scene.game.vueinst.grass.create(370, 342, "grass");
      scene.game.vueinst.platforms.create(760, 200, "ground");
      scene.game.vueinst.grass.create(370, 342, "grass");
      scene.game.vueinst.platforms.create(920, 160, "ground");
      scene.game.vueinst.grass.create(370, 342, "grass");
      scene.game.vueinst.platforms.create(890, 190, "ground");
      scene.game.vueinst.grass.create(370, 342, "grass");
      // mid per last flour
      scene.game.vueinst.platforms.create(10, 130, "ground");
      scene.game.vueinst.grass.create(10, 127, "grass");
      scene.game.vueinst.platforms.create(130, 130, "ground");
      scene.game.vueinst.grass.create(130, 127, "grass");
      scene.game.vueinst.platforms.create(250, 130, "ground");
      scene.game.vueinst.grass.create(250, 127, "grass");
      scene.game.vueinst.platforms.create(370, 130, "ground");
      scene.game.vueinst.grass.create(370, 127, "grass");
      scene.game.vueinst.platforms.create(490, 130, "ground");
      scene.game.vueinst.grass.create(490, 127, "grass");
      scene.game.vueinst.platforms.create(610, 130, "ground");
      scene.game.vueinst.grass.create(610, 127, "grass");
      // platforms.create(730, 130, 'ground');
      scene.game.vueinst.platforms.create(730, 130, "ground");
      scene.game.vueinst.grass.create(730, 127, "grass");
      //last stair
      //  platforms.create(50, 140, 'ground');
      //there are third big flour
      scene.game.vueinst.platforms.create(250, 60, "ground");
      scene.game.vueinst.grass.create(250, 57, "grass");
      scene.game.vueinst.platforms.create(370, 60, "ground");
      scene.game.vueinst.grass.create(370, 57, "grass");
      scene.game.vueinst.platforms.create(490, 60, "ground");
      scene.game.vueinst.grass.create(490, 57, "grass");
      scene.game.vueinst.platforms.create(610, 60, "ground");
      scene.game.vueinst.grass.create(610, 57, "grass");
      scene.game.vueinst.platforms.create(730, 60, "ground");
      scene.game.vueinst.grass.create(730, 57, "grass");
      // platforms.create(730, 30, 'ground');
      // second part of screen
      scene.game.vueinst.platforms.create(750, 520, "ground");
      scene.game.vueinst.grass.create(750, 517, "grass");
      scene.game.vueinst.platforms.create(960, 115, "ground");
      scene.game.vueinst.grass.create(960, 112, "grass");
      scene.game.vueinst.platforms.create(960, 265, "ground");
      scene.game.vueinst.grass.create(960, 262, "grass");
      scene.game.vueinst.platforms.create(960, 430, "ground");
      scene.game.vueinst.grass.create(960, 427, "grass");

      // create the enemies /////////////////////////////////////////////////////////////////////////////////////////
      scene.game.vueinst.enemies = scene.physics.add.group();

      var enemy_1 = scene.game.vueinst.enemies.create(100, 170, "enemy_1");

      enemy_1.setCollideWorldBounds(true);
      enemy_1.setBounce(1);
      enemy_1.setVelocity(Phaser.Math.Between(-200, 200), 20);

      //здесь мы прописываем движение игрока и анимацию этого движения ///////////////////////////////////////////////

      scene.game.vueinst.player = scene.physics.add.sprite(10, 530, "dude");

      scene.game.vueinst.player.setBounce(0.2);
      scene.game.vueinst.player.setCollideWorldBounds(true);

      scene.game.vueinst.moveKeys = scene.input.keyboard.addKeys({
        left_A: Phaser.Input.Keyboard.KeyCodes.A,
        right_D: Phaser.Input.Keyboard.KeyCodes.D,
        up_W: Phaser.Input.Keyboard.KeyCodes.W
      });

      // тут будет вся анимация //////////////////////////////////////////////////////////////////////////////////////
      scene.anims.create({
        key: "left",
        frames: scene.anims.generateFrameNumbers("dude", {
          start: 0,
          end: 3
        }),
        frameRate: 10,
        repeat: -1
      });

      scene.anims.create({
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20
      });

      scene.anims.create({
        key: "right",
        frames: scene.anims.generateFrameNumbers("dude", {
          start: 5,
          end: 8
        }),
        frameRate: 10,
        repeat: -1
      });

      scene.game.vueinst.cursors = scene.input.keyboard.createCursorKeys();

      // добавляем звезды /////////////////////////////////////////////////////////////////////////////////////////////
      scene.game.vueinst.stars = scene.physics.add.group({
        key: "star",
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
      });

      scene.game.vueinst.stars.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      });

      scene.game.vueinst.scoreText = scene.add.text(16, 16, "score: 0", {
        fontSize: "32px",
        fill: "#000"
      });
    },
    createColaiders(scene) {
      scene.physics.add.collider(
        scene.game.vueinst.player,
        scene.game.vueinst.platforms
      );
      scene.physics.add.collider(
        scene.game.vueinst.stars,
        scene.game.vueinst.platforms
      );
      scene.physics.add.collider(
        scene.game.vueinst.bombs,
        scene.game.vueinst.platforms
      );
      scene.physics.add.collider(
        scene.game.vueinst.enemies,
        scene.game.vueinst.platforms,
        scene.game.vueinst.enemyshoot,
        null,
        scene
      );
      scene.physics.add.collider(
        scene.game.vueinst.player,
        scene.game.vueinst.en_bullets,
        scene.game.vueinst.hitBomb,
        null,
        scene
      );
      scene.physics.add.collider(
        scene.game.vueinst.en_bullets,
        scene.game.vueinst.platforms,
        scene.game.vueinst.en_boom,
        null,
        scene
      );
      scene.physics.add.collider(
        scene.game.vueinst.bullets,
        scene.game.vueinst.enemies,
        scene.game.vueinst.enemyKill,
        null,
        scene
      );
      scene.physics.add.collider(
        scene.game.vueinst.bullets,
        scene.game.vueinst.platforms,
        scene.game.vueinst.boom,
        null,
        scene
      );
      scene.physics.add.overlap(
        scene.game.vueinst.player,
        scene.game.vueinst.stars,
        scene.game.vueinst.collectStar,
        null,
        scene
      );
      scene.physics.add.collider(
        scene.game.vueinst.player,
        scene.game.vueinst.bombs,
        scene.game.vueinst.hitBomb,
        null,
        scene
      );
      scene.physics.add.collider(
        scene.game.vueinst.bullets,
        scene.game.vueinst.bombs,
        scene.game.vueinst.bombKill,
        null,
        scene
      );
    }
  },
  mounted() {
    // console.log("User", this.$root.user);
    // console.log(this.$root.firebaseui);
    // console.log(this.$root.firebase);
    this.$store.dispatch("CONNECT_DATABASE", undefined);

    this.$root.firebase.auth().onAuthStateChanged(user => {
      this.$store.commit("SET_USER", user);
    });

    // Получение таблицы рекордов
    this.$store.dispatch("GET_SCOREBOARD", undefined);

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
    this.initGame();

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

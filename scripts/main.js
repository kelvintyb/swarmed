$('document').ready(function() {

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });
  //init global vars to be assigned game objects later, consider refactoring later into global game object
  var enemies,
    enemy,
    player,
    control,
    scoreTimer,
    score = 0,
    enemyTimer;

  //init player group and based on length of player.children, initiate number of enemy tracking groups to be randomised amongst the four spots

  function preload() {
    //load images for background, player & enemies
    game.load.image('background', 'assets/sky.png');
    game.load.image('enemy', 'assets/star.png')
    game.load.spritesheet('player', 'assets/dude.png', 32, 48);
  }

  //IMPLEMENT: 4 overlord objects from which enemies will spawn - use randomiser function to determine x,y
  function create() {
    //initialise physics system
    game.physics.startSystem(Phaser.Physics.ARCADE)
      //initialise game map background
    game.add.sprite(0, 0, 'background');

    //assign GLOBAL group to delegate control of enemies
    enemies = game.add.group();
    //enable physics for anything in enemies group
    enemies.enableBody = true;
    //create enemy function taking in num of enemies & IMPLEMENT location array
    function createEnemy(num) {
      for (var i = 0; i < num; i++) {
        enemy = enemies.create(game.world.randomX, game.world.randomY, 'enemy');
        // enemy.scale.setTo(0.5, 0.5)
      }
    }
    createEnemy(1);
    //create player and assign to GLOBAL var
    function createPlayer(num) {
      for (var i = 0; i < num; i++) {
        player = game.add.sprite(game.world.randomX, game.world.randomY, 'player');
        player.scale.setTo(0.75, 0.75);
        enableWorldBoundsFor(player);
      }
    }
    createPlayer(1);
    //enable physics and world boundaries
    function enableWorldBoundsFor(player) {
      game.physics.arcade.enable(player);
      player.body.collideWorldBounds = true;
    }

    //create keyboard mapping system - refer to source code at https://github.com/photonstorm/phaser/blob/v2.6.2/src/input/Keyboard.js for more functions. IMPLEMENT proper object functionality by Monday.
    control = game.input.keyboard.createCursorKeys();
    //uncomment below to test prevent scrolling method
    game.input.keyboard.addKeyCapture(control);

    //create timer to keep track of score
    function scoreTimer(milliseconds) {
      scoreTimer = game.time.create(false);
      scoreTimer.loop(milliseconds, updateScore, this);
      scoreTimer.start();
    }
    scoreTimer(1);

    function updateScore() {
      score++;
    }
    //create timer to spawn enemies
    function spawnTimer(milliseconds) {
      enemyTimer = game.time.create(false);
      enemyTimer.loop(milliseconds, spawnEnemy, this)
      enemyTimer.start();
    }
    spawnTimer(1000);
    //IMPLEMENT spawn away from player
    function spawnEnemy() {
      //multiplier to increase spawn rate
      var multiplier = Math.ceil(score / 1000);
      console.log(multiplier);
      for (var i = 0; i < multiplier; i++) {
        enemies.create(game.world.randomX, game.world.randomY, 'enemy');
      }
    }

  }

  function update() {
    //check for collision
    game.physics.arcade.collide(player, enemies, collideHandler);

    //collided function to kill player - note that with overlap/collide callback functions, the sprite individual will always get passed in as the 1st parameter, while the child of the sprite group will get passed in as the 2nd parameter
    //IMPLEMENT insert update scoreboard function here?

    function collideHandler(player, enemy) {
      console.log('when stars collide')
      player.kill();
      enemy.kill();
      scoreTimer.stop();
    }

    //player control logic - IMPLEMENT variable speed via function (spacebar acceleration?)
    function movementHandler(player, speed) {
      player.body.velocity.x = 0, player.body.velocity.y = 0;
      if (control.left.isDown) {
        player.body.velocity.x = -speed;
      } else if (control.right.isDown) {
        player.body.velocity.x = speed;
      }
      if (control.up.isDown) {
        player.body.velocity.y = -speed;
      } else if (control.down.isDown) {
        player.body.velocity.y = speed;
      }
    }
    movementHandler(player, 200);

    //check for angle between each enemy and player & apply to directional velocity of enemy to simulate tracking
    //IMPLEMENT multiple player tracking
    //IMPLEMENT increasing velocity for each enemy
    //IMPLEMENT consider every alternate enemy has tracking abilities, and the rest just go randomly
    function trackingBetween(enemyGrp, player) {
      enemyGrp.children.forEach(function(enemy) {
        var degrees = (180 / Math.PI) * game.physics.arcade.angleBetween(enemy, player);
        var randomiser = game.rnd.integerInRange(-90, 90)
        game.physics.arcade.velocityFromAngle(degrees + randomiser, 150, enemy.body.velocity);
      })
    }
    trackingBetween(enemies, player)
  }

  function render() {
    game.debug.text('Your score is ' + score, 32, 32)
  }
});

//IMPLEMENT animation for objects
//IMPLEMENT states
//IMPLEMENT 2 players
//IMPLEMENT

$('document').ready(function() {
  var enemies,
    enemy,
    players,
    player,
    playerSpeed = 200,
    control,
    scoreTimer,
    score = 0,
    highScore = 0,
    enemyTimer,
    numOfPlayers = 1,
    shields,
    shield = 0,
    shieldTimer,
    nukes,
    nuke,
    nukeTimer,
    nitros,
    nitro,
    nitroTimer,
    decayTimer;

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas', {
    preload: preload,
    create: create,
    update: update,
    render: render
  })

  //init player group and based on length of player.children, initiate number of enemy tracking groups to be randomised amongst the four spots
  function randSpawn() {
    var spawnX = [100, game.world.width - 100];
    var spawnY = [150, game.world.height - 150];
    var randX = spawnX[Math.round(Math.random())]
    var randY = spawnY[Math.round(Math.random())]

    return {
      x: randX,
      y: randY
    }
  }

  function preload() {
    //load images for background, player & enemies
    game.load.image('background', 'assets/background2.jpg');
    game.load.image('enemy', 'assets/star.png')
    game.load.spritesheet('player', 'assets/dude.png', 32, 48);
    game.load.spritesheet('overlord', 'assets/dude.png', 32, 48);
    game.load.image('shield', 'assets/star.png');
    game.load.image('nuke', 'assets/star.png');
  }

  function create() {
    //initialise physics system
    game.physics.startSystem(Phaser.Physics.ARCADE)
      //initialise game map background and scale to game dimensions
    var background = game.add.sprite(0, 0, 'background');
    background.x = 0;
    background.y = 0;
    background.height = game.height;
    background.width = game.width;
    //initialise spawn points
    function addOverlord() {
      game.add.sprite(125, 125, 'overlord');
      game.add.sprite(125, game.world.height - 125, 'overlord');
      game.add.sprite(game.world.width - 125, 125, 'overlord');
      game.add.sprite(game.world.width - 125, game.world.height - 125, 'overlord')
    }
    addOverlord();
    //assign GLOBAL group to delegate control of enemies
    enemies = game.add.group();
    //enable physics for anything in enemies group
    enemies.enableBody = true;

    //create player and assign to GLOBAL var
    function createPlayer(numOfPlayers) {
      players = game.add.group();
      for (var i = 0; i < numOfPlayers; i++) {
        player = players.create(game.world.centerX, game.world.centerY, 'player');
        player.scale.setTo(0.75, 0.75);
        enableWorldBoundsFor(player);
      }
    }
    createPlayer(numOfPlayers);

    //enable physics and world boundaries
    function enableWorldBoundsFor(player) {
      game.physics.arcade.enable(player);
      player.body.collideWorldBounds = true;
    }

    //BUG: if i wrap timer creation into a function, update func will raise an error on .stop() - timer is undefined
    //create timer to keep track of score
    scoreTimer = game.time.create(false);
    scoreTimer.loop(1, updateScore, this);
    scoreTimer.start();

    function updateScore() {
      score++;
    }
    //create timer to spawn enemies
    enemyTimer = game.time.create(false);
    //maybe put in players.forEach and use index to determine assign to which enemy group
    enemyTimer.loop(1000, spawnEnemy, this);
    enemyTimer.start();

    //IMPLEMENT spawn away from player
    function spawnEnemy() {
      //multiplier to increase spawn rate
      var multiplier = Math.ceil(score / 5000);
      for (var i = 0; i < multiplier; i++) {
        enemies.create(randSpawn().x, randSpawn().y, 'enemy');
        //based on loops counter & num of players, assign to player group
      }
    }

    //initialise groups for powerups, and respective powerup timers
    shields = game.add.group();
    shields.enableBody = true;
    nukes = game.add.group();
    nukes.enableBody = true;
    nitros = game.add.group();
    nitros.enableBody = true;
    //init timers for powerups;
    shieldTimer = game.time.create(false);
    shieldTimer.loop(10000, spawnShield, this);
    shieldTimer.start();
    nukeTimer = game.time.create(false);
    nukeTimer.loop(35000, spawnNuke, this);
    nukeTimer.start();
    nitroTimer = game.time.create(false);
    nitroTimer.loop(8000, spawnNitro, this);
    nitroTimer.start();
    decayTimer = game.time.create(false);
    decayTimer.loop(2500, nitroDecay, this);
    decayTimer.start();

    function nitroDecay() {
      while (playerSpeed > 200) {
        playerSpeed -= 10;
      }
    }

    function spawnShield() {
      shields.create(game.world.randomX, game.world.randomY, 'star');
      console.log('shield created')
    }

    function spawnNuke() {
      nukes.create(game.world.randomX, game.world.randomY, 'player');
      console.log('nuke created');
    }

    function spawnNitro() {
      nitros.create(game.world.randomX, game.world.randomY, 'player');
      console.log('nitro created');
    }
    //create keyboard mapping system - refer to source code at https://github.com/photonstorm/phaser/blob/v2.6.2/src/input/Keyboard.js for more functions.
    control = game.input.keyboard.createCursorKeys();
    //prevent accidental window scrolling when in canvas focus
    game.input.keyboard.addKeyCapture(control);
  }

  function update() {
    //check for collision btw player & enemies or powerups
    game.physics.arcade.collide(player, enemies, collideHandler);
    game.physics.arcade.collide(player, shields, shieldHandler);
    game.physics.arcade.collide(player, nukes, nukeHandler);
    game.physics.arcade.collide(player, nitros, nitroHandler);

    //collided function to kill player - note that with overlap/collide callback functions, the sprite individual will always get passed in as the 1st parameter, while the child of the sprite group will get passed in as the 2nd parameter
    //IMPLEMENT insert update scoreboard function here?

    function shieldHandler(player, shieldObj) {
      console.log('when shields collide')
      if (shield <= 100) {
        //SOUND
        score += 2500
      } else {
        score += 5000
      }
      shield += 100
      shieldObj.kill();
    }

    function nukeHandler(player, nuke) {
      console.log('when nukes collide')
      enemies.children.forEach(function(enemy) {
        enemy.kill();
      })
      nuke.kill();
    }

    function nitroHandler(player, nitro) {
      playerSpeed = 350;
      score += 1500;
      nitro.kill();
    }

    function collideHandler(player, enemy) {
      console.log('when stars collide')
      if (shield > 0) {
        enemy.kill();
        shield -= 20
          //SOUND
      } else {
        enemy.kill();
        player.kill();
        scoreTimer.stop();
        enemyTimer.stop();
        updateHighScore();
      }
    }

    function updateHighScore() {
      if (highScore < score) {
        highScore = score;
      }
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
    movementHandler(player, playerSpeed);

    //check for angle between each enemy and player & apply to directional velocity of enemy to simulate tracking
    //IMPLEMENT multiple player tracking
    //IMPLEMENT increasing velocity for each enemy
    //IMPLEMENT consider every alternate enemy has tracking abilities, and the rest just go randomly
    function trackingBetween(enemyGrp, player, enemySpeed) {
      enemyGrp.children.forEach(function(enemy) {
        var degrees = (180 / Math.PI) * game.physics.arcade.angleBetween(enemy, player);
        var randomiser = game.rnd.integerInRange(-90, 90)
        game.physics.arcade.velocityFromAngle(degrees + randomiser, enemySpeed, enemy.body.velocity);
      })
    }
    trackingBetween(enemies, player, 150)
  }

  function render() {
    game.debug.text('Your score is ' + score, 32, 32)
    game.debug.text('HIGH SCORE: ' + highScore, 32, 64)
    game.debug.text('Shields: ' + shield, 400, 32)
  }
});

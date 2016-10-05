//IMPLEMENT states/instructions
//IMPLEMENT animation for objects/ change color of mutas
//IMPLEMENT sounds - for player getting hit, player killed, nuke appearing, nuke damage & mutas dying, shield/nitro appearing, shield collide, nitro collide

//IMPLEMENT 2 players
//init player group and based on length of player.children, initiate number of enemy tracking groups to be randomised amongst the four spots
//IMPLEMENT MULTI

// $('document').ready(function() {
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
  shield = 100,
  shieldTimer,
  nukes,
  nuke,
  nukeTimer,
  nitros,
  nitro,
  nitroTimer,
  decayTimer;
//creating new phaser game object
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas')



//adding states
var bootState = {
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start('load');
  }
}
var loadState = {
  preload: preload,
  create: function() {
    game.state.start('menu');
  }
}

var menuState = {
  create: function() {
    var quote = game.add.text(100, 300, "'I am the swarm. Armies will be shattered. Worlds will burn.\nNow at last, vengeance will be mine.' - Sarah Kerrigan", {
      font: '15px Courier',
      fill: '#f469e2'
    })

    // TEXT to be inserted later: Learn how to play by clicking the button below or\n select one of the game modes to begin.
    var startLabel = game.add.text(80, 500, "Press 'S' to begin, and use your arrow keys to control the wraith.\nAvoid the mutalisks!!!", {
      font: '20px Arial',
      fill: '#ffffff'
    });
    //key to start 1 player game
    var sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    sKey.onDown.addOnce(this.start, this);

  },
  start: function() {
    game.state.start('play');
  }
}

var playState = {
  create: create,
  update: update,
  render: render
}

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
// game.state.add('win', winState);

game.state.start('boot');

//  {
//   preload: preload,
//   create: create,
//   update: update,
//   render: render
// })




function preload() {
  //loading text
  var loadingText = game.add.text(80, 150, 'LOADING...', {
      font: '30px starcraft',
      fill: '#ffffff'
    })
    //load images for background, player & enemies
  game.load.image('background', 'assets/orangebg2.png');
  game.load.image('enemy', 'assets/monster.png')
  game.load.image('player', 'assets/ship1.png');
  game.load.image('overlord', 'assets/overlords1.png');
  game.load.image('shield', 'assets/shield.png');
  game.load.image('nuke', 'assets/nuke.png');
  game.load.image('nitro', 'assets/speed2.png');
}

function create() {
  //initialise game map background and scale to game dimensions
  var background = game.add.sprite(0, 0, 'background');
  background.x = 0;
  background.y = 0;
  background.height = game.height;
  background.width = game.width;
  //initialise spawn points
  function addOverlord() {
    game.add.sprite(125, 75, 'overlord');
    game.add.sprite(125, game.world.height - 150, 'overlord');
    game.add.sprite(game.world.width - 200, 75, 'overlord');
    game.add.sprite(game.world.width - 200, game.world.height - 150, 'overlord')
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
  function randSpawn() {
    var spawnX = [125, game.world.width - 200];
    var spawnY = [75, game.world.height - 150];
    var randX = spawnX[Math.round(Math.random())]
    var randY = spawnY[Math.round(Math.random())]

    return {
      x: randX,
      y: randY
    }
  }

  function spawnEnemy() {
    //multiplier to increase spawn rate
    var multiplier = Math.ceil(score / 5000);
    for (var i = 0; i < multiplier; i++) {
      var enemy = enemies.create(randSpawn().x, randSpawn().y, 'enemy');
      enemy.scale.setTo(0.75, 0.75);

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
  nitroTimer.loop(9000, spawnNitro, this);
  nitroTimer.start();
  decayTimer = game.time.create(false);
  decayTimer.loop(1000, nitroDecay, this);
  decayTimer.start();

  function nitroDecay() {
    if (playerSpeed > 200) {
      playerSpeed -= 15;
    }
  }

  function spawnShield() {
    shields.create(game.world.randomX, game.world.randomY, 'shield');
    console.log('shield created')
  }

  function spawnNuke() {
    nukes.create(game.world.randomX, game.world.randomY, 'nuke');
    console.log('nuke created');
  }

  function spawnNitro() {
    nitros.create(game.world.randomX, game.world.randomY, 'nitro');
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
      shieldTimer.stop();
      nukeTimer.stop();
      nitroTimer.stop();
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
// });

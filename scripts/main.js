//IMPLEMENT animation for objects
//IMPLEMENT sounds - game music; for player getting hit, player killed, nuke appearing, nuke damage & mutas dying, shield/nitro appearing, shield collide, nitro collide

//IMPLEMENT 2 players
//make 2 player objects with global vars like shield & currscore
//init player group and based on length of player.children, initiate number of enemy tracking groups to be randomised amongst the four spots
//IMPLEMENT VISUALS FOR SHIELD - can refer to http://phaser.io/examples/v2/text/center-text-on-sprite for concept
//IMPLEMENT MULTI using happyfuntimes/jammer


// $('document').ready(function() {
//POLLUTING THE GLOBAL NAMESPACE
var enemies,
  enemy,
  players,
  player,
  playerSpeed = 200,
  cursors,
  wKey,
  aKey,
  sKey,
  dKey,
  scoreTimer,
  score = 0,
  currScore = 0,
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
    var menuBg = game.add.sprite(0, 0, 'menu-bg');
    menuBg.x = 0;
    menuBg.y = 0;
    menuBg.height = game.height;
    menuBg.width = game.width;
    var quote = game.add.text(100, 250, "'I am the swarm. Armies will be shattered. Worlds will burn.\nNow at last, vengeance shall be mine.' - Sarah Kerrigan", {
      font: '15px Courier',
      fill: '#f469e2'
    })
    var instructLabel = game.add.text(80, 450, "Press 'H' to learn how to play", {
      font: '20px Arial',
      fill: '#ffffff'
    });
    var onePlayerLabel = game.add.text(80, 480, "Press 'S' to start a 1 player game", {
      font: '20px Arial',
      fill: '#cc0101'
    });
    //key to start 1 player game
    var sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    sKey.onDown.addOnce(this.start, this);
    var hKey = game.input.keyboard.addKey(Phaser.Keyboard.H);
    hKey.onDown.addOnce(this.instructions, this);
  },
  start: function() {
    game.state.start('play');
  },
  instructions: function() {
    game.state.start('instructions')
  }
}

var instructionState = {
  create: function() {
    var instructBg = game.add.sprite(0, 0, 'instructions-bg');
    instructBg.x = 0;
    instructBg.y = 0;
    instructBg.height = game.height;
    instructBg.width = game.width;

    var bKey = game.input.keyboard.addKey(Phaser.Keyboard.B);
    bKey.onDown.addOnce(this.back, this);

    var controlStyle = {
      font: '20px Courier',
      fontWeight: 'bold',
      fill: 'rgb(7, 135, 4)'
    }
    var charStyle = {
      font: '20px Courier',
      fontWeight: 'bold',
      fill: 'rgb(166, 28, 9)'
    }
    var powerStyle = {
      font: '20px Courier',
      fontWeight: 'bold',
      fill: 'rgb(67, 0, 134)'
    }
    var style = {
      font: '14px Courier',
      fill: '#ffffff'
        // 'rgb(1, 23, 116)'
    }
    game.add.text(50, 50, "How To Play", {
      font: '28px Courier',
      fill: 'rgb(0, 33, 255)'
    });
    game.add.text(400, 50, "Press 'B' to go back", {
        font: '20px starcraft',
        fontWeight: 'bold',
        fill: 'rgb(255, 147, 34)'
      })
      //BUG: why doesn't an IIFE work here?
    function addInstructions() {
      game.add.text(70, 160, "Controls", controlStyle);
      game.add.text(350, 200, "Player 1", style);
      game.add.text(500, 200, "Player 2", style);
      game.add.text(70, 320, "Characters", charStyle);
      game.add.text(300, 350, "HARMFUL:\nRun from \nthese", style);
      game.add.text(430, 350, "HARMLESS:\nSpawn Points", style);
      game.add.text(600, 350, "USELESS:\nYou control this", style);
      game.add.text(70, 470, "Power-ups", powerStyle);
      game.add.text(280, 510, "Speed Boost:\nDecays over time", style);
      game.add.text(450, 510, "Shields:\nHelps take\ndamage", style);
      game.add.text(600, 510, "Nuke:\nKills all \nenemies onscreen", style);
    }
    addInstructions();

    function addSprites() {
      game.add.sprite(350, 130, 'wasd');
      game.add.sprite(500, 130, 'arrows');
      game.add.sprite(300, 280, 'enemy');
      game.add.sprite(430, 250, 'overlord');
      game.add.sprite(600, 280, 'player');
      game.add.sprite(300, 450, 'nitro');
      game.add.sprite(450, 450, 'shield');
      game.add.sprite(600, 450, 'nuke');
    }
    addSprites();
  },
  back: function() {
    game.state.start('menu')
  }
}
var loseState = {
    create: function() {
      var endingBg = game.add.sprite(0, 0, 'ending');
      endingBg.x = 0;
      endingBg.y = 0;
      endingBg.height = game.height;
      endingBg.width = game.width;
      //Create m key listener for restart
      var bkey = game.input.keyboard.addKey(Phaser.Keyboard.B);
      bkey.onDown.addOnce(this.restart, this);
      game.add.text(80, 100, "You have been muta-liated.\n\nPress 'B' to go back\nto the main menu.", {
        font: '28px starcraft',
        fill: '#14b825'
      });
      game.add.text(160, 340, "Player 1's score is: " + currScore, {
        font: '28px Courier',
        fill: 'rgb(198, 1, 1)'
      })
    },
    restart: function() {
      game.state.start('menu');
    }
  }
  //Look further below for the functions referenced in playState
var playState = {
  create: create,
  update: update,
  render: render
}
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('instructions', instructionState);
game.state.add('play', playState);
game.state.add('lose', loseState);

game.state.start('boot');

function preload() {
  var loadingText = game.add.text(80, 150, 'LOADING...', {
      font: '30px starcraft',
      fill: '#ffffff'
    })
    //load images for background, player & enemies
  game.load.image('background', 'assets/orangebg2.png');
  game.load.image('menu-bg', 'assets/menu.png');
  game.load.image('instructions-bg', 'assets/instruct-bg.png');
  game.load.image('ending', 'assets/ending.png');
  game.load.image('arrows', 'assets/arrows2.png');
  game.load.image('wasd', 'assets/wasd2.png');
  game.load.image('enemy', 'assets/monster.png')
  game.load.image('player', 'assets/ship1.png');
  game.load.image('overlord', 'assets/overlords1.png');
  game.load.image('shield', 'assets/shield.png');
  game.load.image('nuke', 'assets/nuke.png');
  game.load.image('nitro', 'assets/speed2.png');

  //load audio
  // game.load.audio()
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
  scoreTimer.loop(1, incrementScore, this);
  scoreTimer.start();

  function incrementScore() {
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
  //create keyboard mapping system for Player 1 / 2
  wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
  aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
  dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
  cursors = game.input.keyboard.createCursorKeys();
  //prevent accidental window scrolling when in canvas focus
  game.input.keyboard.addKeyCapture(cursors);

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
      stopTimers();
      updateScores();
      resetShields();
      game.state.start('lose')
    }
  }

  function stopTimers() {
    scoreTimer.stop();
    enemyTimer.stop();
    shieldTimer.stop();
    nukeTimer.stop();
    nitroTimer.stop();
  }

  function resetShields() {
    shield = 100;
  }
  //this updates high score and resets player scores
  function updateScores() {
    if (highScore < score) {
      highScore = score;
    }
    currScore = score;
    score = 0;
  }
  //player control logic

  function playerOneControls(playerSpeed) {
    player.body.velocity.x = 0, player.body.velocity.y = 0; //IMPLEMENT nd to change to players[0] and diff speeds when implementing 2 players
    if (aKey.isDown) {
      player.body.velocity.x = -playerSpeed;
    } else if (dKey.isDown) {
      player.body.velocity.x = playerSpeed;
    }
    if (wKey.isDown) {
      player.body.velocity.y = -playerSpeed;
    } else if (sKey.isDown) {
      player.body.velocity.y = playerSpeed;
    }
  }
  playerOneControls(playerSpeed);

  // function playerTwoControls(player, speed) {
  // player.body.velocity.x = 0, player.body.velocity.y = 0;
  // if (cursors.left.isDown) {
  //   player.body.velocity.x = -speed;
  // } else if (cursors.right.isDown) {
  //   player.body.velocity.x = speed;
  // }
  // if (cursors.up.isDown) {
  //   player.body.velocity.y = -speed;
  // } else if (cursors.down.isDown) {
  //   player.body.velocity.y = speed;
  // }
  // }

  //check for angle between each enemy and player & apply to directional velocity of enemy to simulate tracking
  //IMPLEMENT multiple player tracking
  //IMPLEMENT increasing velocity for each enemy
  function trackingBetween(enemyGrp, player, enemySpeed) {
    enemyGrp.children.forEach(function(enemy) {
      var degrees = (180 / Math.PI) * game.physics.arcade.angleBetween(enemy, player);
      var randomiser = game.rnd.integerInRange(-90, 90)
      game.physics.arcade.velocityFromAngle(degrees + randomiser, enemySpeed, enemy.body.velocity);
    })
  }
  trackingBetween(enemies, player, 150)
}
//strictly speaking, should put this in update function
function render() {
  game.debug.text('Your score is ' + score, 32, 32)
  game.debug.text('HIGH SCORE: ' + highScore, 32, 64)
  game.debug.text('Shields: ' + shield, 400, 32)
}
// });

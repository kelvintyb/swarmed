//IMPLEMENT sounds - game music; for player getting hit, player killed, nuke appearing, nuke damage & mutas dying, shield/nitro appearing, shield collide, nitro collide
//IMPLEMENT animation for objects

//IMPLEMENT VISUALS FOR SHIELD - can refer to http://phaser.io/examples/v2/text/center-text-on-sprite for concept
//IMPLEMENT MULTI using happyfuntimes/jammer
$('document').ready(function() {
  //POLLUTING THE GLOBAL NAMESPACE
  var enemiesGrp1,
    enemiesGrp2,
    playersGrp,
    controls = {
      cursors: undefined,
      wKey: undefined,
      aKey: undefined,
      sKey: undefined,
      dKey: undefined
    }
    //player constructor
  function Player() {
    this.score = 0;
    this.lastScore = 0;
    this.speed = 200;
    this.shield = 100;
  }
  var playerOne = new Player();
  var playerTwo = new Player();
  //flag to determine handler actions in 2 player game when playerOne has died
  playerOne.isDead = false;
  playerTwo.isDead = true;
  var numOfPlayers = undefined;

  var scoreTimer,
    scoreTimer2,
    highScore = 0,
    enemyTimer,
    enemyTimer2,
    shields,
    shieldTimer,
    nukes,
    nukeTimer,
    nitros,
    nitroTimer,
    decayTimer;
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas')
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
      var instructLabel = game.add.text(80, 440, "Press 'H' to learn how to play", {
        font: '20px Arial',
        fill: '#ffffff'
      });
      var onePlayerLabel = game.add.text(80, 480, "Press 'S' to start a 1 player game", {
        font: '20px Arial',
        fill: '#cc0101'
      });
      var twoPlayerLabel = game.add.text(80, 510, "Press 'D' to start a 2 player game", {
        font: '20px Arial',
        fill: 'rgb(0, 13, 184)'
      });
      //key to start 1 player game
      var hKey = game.input.keyboard.addKey(Phaser.Keyboard.H);
      hKey.onDown.addOnce(this.instructions, this);
      var sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
      sKey.onDown.addOnce(this.startOne, this);
      var dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
      dKey.onDown.addOnce(this.startTwo, this);
    },
    startOne: function() {
      numOfPlayers = 1;
      game.state.start('play');
    },
    startTwo: function() {
      numOfPlayers = 2;
      playerTwo.isDead = false;
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
        game.add.sprite(600, 280, 'player1');
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
        game.add.text(160, 340, "Player 1's score is: " + playerOne.lastScore, {
          font: '28px Courier',
          fill: 'rgb(198, 1, 1)'
        })
        if (numOfPlayers == 2) {
          game.add.text(160, 400, "Player 2's score is: " + playerTwo.lastScore, {
            font: '28px Courier',
            fill: 'rgb(6, 8, 193)'
          })
        }
      },
      restart: function() {
        numOfPlayers = undefined;
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
    game.load.image('enemy', 'assets/monster.png');
    game.load.image('player1', 'assets/ship1.png');
    game.load.image('player2',
      'assets/ship2.png');
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
    //NOTE: assign GLOBAL group to delegate control of enemies, use enemies tracker to assign separate grps of enemies / OR have 1 group of enemies and 1 group of players and assign within tracking func. might be easier to modularise and just have sep grps of enemies for each player & modify multiplier effect accordingly.
    enemiesGrp1 = game.add.group();
    enemiesGrp1.enableBody = true;
    enemiesGrp2 = game.add.group();
    enemiesGrp2.enableBody = true;
    //BUG: enemiesGrp1 & 2 get assigned within the function scope but doesn't get modified in the global scope, causes spawnEnemy to bug out. Recreate by uncommenting below function
    // function createEnemiesGrp(numOfPlayers) {
    //   for (var i = 1; i <= numOfPlayers; i++) {
    //     switch (i) {
    //       case 1:
    //         enemiesGrp1 = game.add.group();
    //         enemiesGrp1.enableBody = true;
    //         console.log(enemiesGrp1)
    //         break;
    //       case 2:
    //         enemiesGrp2 = game.add.group();
    //         enemiesGrp2.enableBody = true;
    //         console.log(enemiesGrp2)
    //         break;
    //       default:
    //         break;
    //     }
    //   }
    // }
    // createEnemiesGrp(numOfPlayers);

    function createPlayerGrp(numOfPlayers) {
      playersGrp = game.add.group();
      for (var i = 1; i <= numOfPlayers; i++) {
        var player = playersGrp.create(game.world.centerX - 60 + i * 40, game.world.centerY, 'player' + i);
        game.physics.arcade.enable(player);
        switch (i) {
          case 1:
            playerOne.sprite = player;
            break;
          case 2:
            playerTwo.sprite = player;
            break;
          default:
            break;
        }
      }
      playersGrp.setAll('body.collideWorldBounds', true);
    }
    createPlayerGrp(numOfPlayers);

    //BUG: if i wrap timer creation into a function, update func will raise an error on .stop() - timer is undefined
    //create timer to keep track of score
    scoreTimer = game.time.create(false);
    scoreTimer.loop(1, function() {
      playerOne.score++;
    }, this);
    scoreTimer.start();
    if (numOfPlayers == 2) {
      scoreTimer2 = game.time.create(false);
      scoreTimer2.loop(1, function() {
        playerTwo.score++;
      }, this);
      scoreTimer2.start();
    }

    //create timer to spawn enemies
    enemyTimer = game.time.create(false);
    enemyTimer.loop(1000, function() {
      spawnEnemy(enemiesGrp1)
    }, this);
    enemyTimer.start();
    if (numOfPlayers == 2) {
      enemyTimer2 = game.time.create(false);
      enemyTimer2.loop(1000, function() {
        spawnEnemy(enemiesGrp2)
      }, this);
      enemyTimer2.start();
    }
    console.log(enemiesGrp1)
    console.log(enemiesGrp2)

    //randomises spawn pt coordinates
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

    //NOTE: multiplier needs to be inversely proportioned to numOfPlayers,
    function spawnEnemy(enemiesGrp) {
      for (var i = 0; i < createMultiplier(numOfPlayers); i++) {
        var enemy = enemiesGrp.create(randSpawn().x, randSpawn().y, 'enemy');
        enemy.scale.setTo(0.75, 0.75);
      }
    }
    //multiplier to increase spawn rate
    function createMultiplier(numOfPlayers) {
      var multiplier;
      if (numOfPlayers == 2) {
        var lowerScore = Math.min(playerOne.score, playerTwo.score)
        multiplier = Math.ceil(lowerScore / 7500);
      } else {
        multiplier = Math.ceil(playerOne.score / 5000);
      }
      return multiplier;
    }


    //initialise groups for powerups, and respective powerup timers
    shields = game.add.group();
    shields.enableBody = true;
    nukes = game.add.group();
    nukes.enableBody = true;
    nitros = game.add.group();
    nitros.enableBody = true;
    //init timers for powerups;
    var powerMultiplier = (numOfPlayers == 1) ? 1 : 0.8;
    shieldTimer = game.time.create(false);
    shieldTimer.loop(10000 * powerMultiplier, spawnShield, this);
    shieldTimer.start();
    nukeTimer = game.time.create(false);
    nukeTimer.loop(35000 * powerMultiplier, spawnNuke, this);
    nukeTimer.start();
    nitroTimer = game.time.create(false);
    nitroTimer.loop(9000 * powerMultiplier, spawnNitro, this);
    nitroTimer.start();
    decayTimer = game.time.create(false);
    decayTimer.loop(1000 * powerMultiplier, nitroDecay, this);
    decayTimer.start();

    function nitroDecay() {
      if (playerOne.speed > 200) {
        playerOne.speed -= 15;
      }
      if (playerTwo.speed > 200) {
        playerTwo.speed -= 15;
      }
    }

    function spawnShield() {
      shields.create(game.world.randomX, game.world.randomY, 'shield');
      //AUDIO
    }

    function spawnNuke() {
      nukes.create(game.world.randomX, game.world.randomY, 'nuke');
      //AUDIO
    }

    function spawnNitro() {
      nitros.create(game.world.randomX, game.world.randomY, 'nitro');
      //AUDIO
    }
    //create keyboard mapping system for Player 1 / 2 - could refactor into createControl func taking in arguments object
    controls.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    controls.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    controls.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    controls.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    controls.cursors = game.input.keyboard.createCursorKeys();
    //prevent accidental window scrolling when in canvas focus
    game.input.keyboard.addKeyCapture(controls.cursors);

  }

  function update() {
    playersGrp.children.forEach(function(player, index) {
      if (playerOne.isDead) {
        playerObj = playerTwo;
      } else {
        //NOTE: ternary shld generally be used for assignments - it's clearer.
        var playerObj = (index == 0) ? playerOne : playerTwo;
      }
      //NOTE: see below for one approach to passing in vars to callbacks from within this function scope. another approach is to use .bind(null,playerObj) on each of the handlers
      game.physics.arcade.collide(player, shields, function(player, shieldObj) {
        shieldHandler(player, shieldObj, playerObj)
      });
      game.physics.arcade.collide(player, nitros, function(player, nitro) {
        nitroHandler(player, nitro, playerObj)
      });
      game.physics.arcade.collide(player, nukes, nukeHandler);
      game.physics.arcade.collide(player, enemiesGrp1, function(player, enemy) {
        collideHandler(player, enemy, playerObj)
      });
      game.physics.arcade.collide(player, enemiesGrp2, function(player, enemy) {
        collideHandler(player, enemy, playerObj)
      });
    })

    //collided function to kill player - note that with overlap/collide callback functions, the sprite individual will always get passed in as the 1st parameter, while the child of the sprite group will get passed in as the 2nd parameter
    function shieldHandler(player, shieldObj, playerObj) {
      if (playerObj.shield <= 100) {
        //Audio
        playerObj.score += 2500
      } else {
        playerObj.score += 5000
      }
      playerObj.shield += 100
      shieldObj.kill();
    }

    function nukeHandler(player, nuke) {
      enemiesGrp1.children.forEach(function(enemy) {
        enemy.kill();
      })
      enemiesGrp2.children.forEach(function(enemy) {
        enemy.kill();
      })
      nuke.kill();
    }

    function nitroHandler(player, nitro, playerObj) {
      playerObj.speed = 350;
      playerObj.score += 1500;
      nitro.kill();
    }

    function collideHandler(player, enemy, playerObj) {
      if (playerObj.shield > 0) {
        enemy.kill();
        playerObj.shield -= 20
          //SOUND
      } else {
        if (playerObj == playerOne) {
          playerOne.isDead = true;
          scoreTimer.stop();
          enemyTimer.stop();
        } else if (playerObj == playerTwo) {
          playerTwo.isDead = true;
          scoreTimer2.stop();
          enemyTimer2.stop();
        }
        enemy.kill();
        player.kill();
      }
    }
    //if no player sprites on screen, resetGame
    if (playerOne.isDead && playerTwo.isDead) {
      resetGame();
    }

    function resetGame() {
      playerOne.isDead = false;
      playerTwo.isDead = true;
      updateScores();
      resetShields();
      game.state.start('lose')
    }

    function stopTimers() {
      shieldTimer.stop();
      nukeTimer.stop();
      nitroTimer.stop();
    }

    function resetShields() {
      playerOne.shield = 100;
      playerTwo.shield = 100;
    }
    //this updates high score and resets player scores
    function updateScores() {
      if (highScore < playerOne.score) {
        highScore = playerOne.score;
      }
      if (highScore < playerTwo.score) {
        highScore = playerTwo.score;
      }
      playerOne.lastScore = playerOne.score;
      playerTwo.lastScore = playerTwo.score;
      playerOne.score = 0;
      playerTwo.score = 0;
    }
    //player control logic
    function initControls() {
      playersGrp.children.forEach(function(player, index) {
        (index == 0) ? playerOneControls(player): playerTwoControls(player);
      })
    }
    initControls();

    function playerOneControls(player) {
      player.body.velocity.x = 0, player.body.velocity.y = 0; //IMPLEMENT nd to change to players[0] and diff speeds when implementing 2 players
      if (controls.aKey.isDown) {
        player.body.velocity.x = -playerOne.speed;
      } else if (controls.dKey.isDown) {
        player.body.velocity.x = playerOne.speed;
      }
      if (controls.wKey.isDown) {
        player.body.velocity.y = -playerOne.speed;
      } else if (controls.sKey.isDown) {
        player.body.velocity.y = playerOne.speed;
      }
    }

    function playerTwoControls(player) {
      player.body.velocity.x = 0, player.body.velocity.y = 0;
      if (controls.cursors.left.isDown) {
        player.body.velocity.x = -playerTwo.speed;
      } else if (controls.cursors.right.isDown) {
        player.body.velocity.x = playerTwo.speed;
      }
      if (controls.cursors.up.isDown) {
        player.body.velocity.y = -playerTwo.speed;
      } else if (controls.cursors.down.isDown) {
        player.body.velocity.y = playerTwo.speed;
      }
    }

    //check for angle between each enemy and player & apply to directional velocity of enemy to simulate tracking
    function trackingBetween(enemyGrp, player, enemySpeed) {
      enemyGrp.children.forEach(function(enemy) {
        var degrees = (180 / Math.PI) * game.physics.arcade.angleBetween(enemy, player); //this angle is in radians, hence the conversion
        var randomiser = game.rnd.integerInRange(-90, 90)
        game.physics.arcade.velocityFromAngle(degrees + randomiser, enemySpeed, enemy.body.velocity);
      })
    }

    trackingBetween(enemiesGrp1, playerOne.sprite, 150);
    if (numOfPlayers == 2 && playerTwo.isDead == false) {
      trackingBetween(enemiesGrp2, playerTwo.sprite, 150);
    }
  }

  function render() {

    game.debug.text('Player 1 Score: ' + playerOne.score, 32, 32)
    game.debug.text('Player 1 Shields: ' + playerOne.shield, 32, 56)
    if (numOfPlayers == 2) {
      game.debug.text('Player 2 Score: ' + playerTwo.score, 580, 32)
      game.debug.text('Player 2 Shields: ' + playerTwo.shield, 580, 56)
    }
    game.debug.text('HIGH SCORE: ' + highScore, 350, 42)

  }
});

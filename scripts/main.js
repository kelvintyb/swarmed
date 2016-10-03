$('document').ready(function() {

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });
  //init global vars to be assigned game objects later, consider refactoring later into global game object
  var enemies, enemy, player, control, timer, score = 0;

  function preload() {
    //load images for background, player & enemies
    game.load.image('sky', 'assets/sky.png');
    game.load.image('enemy', 'assets/star.png')
    game.load.spritesheet('player', 'assets/dude.png', 32, 48);
  }

  function create() {
    //initialise physics system
    game.physics.startSystem(Phaser.Physics.ARCADE)
      //initialise game map background
    game.add.sprite(0, 0, 'sky');

    //assign GLOBAL group to delegate control of enemies
    enemies = game.add.group();
    //enable physics for anything in enemies group
    enemies.enableBody = true;
    //create enemy and store into enemy var
    enemy = enemies.create(game.world.randomX, game.world.randomY, 'enemy');
    //BUG: if using scale, may break overlap function later - cld workaround using .sprite on the player object and individual enemy objects
    // enemy.scale.setTo(0.5, 0.5)
    console.log(enemy);
    console.log(enemies);
    //create player and assign to GLOBAL var
    player = game.add.sprite(game.world.randomX, game.world.randomY, 'player');
    // player.scale.setTo(0.5, 0.5)
    console.log(player);
    //enable physics and world boundaries
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;

    //create keyboard mapping system - refer to source code at https://github.com/photonstorm/phaser/blob/v2.6.2/src/input/Keyboard.js for more functions. IMPLEMENT proper object functionality by Monday.
    control = game.input.keyboard.createCursorKeys();
    //uncomment below to test prevent scrolling method
    game.input.keyboard.addKeyCapture(control);

    //create timer to keep track of score
    timer = game.time.create(false);
    timer.loop(1000, updateScore, this);
    timer.start();

    function updateScore() {
      score++;
    }
  }

  function update() {
    //check for collision
    game.physics.arcade.collide(player, enemies);
    //callback when collision happens
    game.physics.arcade.overlap(player, enemies, collideHandler, null, this);
    //collided function to kill player - note that with overlap callback functions, the sprite individual will always get passed in as the 1st parameter, while the child of the sprite group will get passed in as the 2nd parameter
    function collideHandler(player, enemy) {
      console.log('when stars collide')
      player.kill();
      enemy.kill();
      //IMPLEMENT insert update scoreboard function here?
      timer.stop();
    }

    //player control logic - IMPLEMENT variable speed via function (spacebar acceleration?)
    player.body.velocity.x = 0, player.body.velocity.y = 0;
    if (control.left.isDown) {
      player.body.velocity.x = -200;
    } else if (control.right.isDown) {
      player.body.velocity.x = 200;
    }
    if (control.up.isDown) {
      player.body.velocity.y = -200;
    } else if (control.down.isDown) {
      player.body.velocity.y = 200;
    }

    //check for angle between enemy and player & apply to directional velocity of enemy to simulate tracking IMPLEMENT multiple enemy tracking
    var degrees = (180 / Math.PI) * game.physics.arcade.angleBetween(enemies.children[0], player);
    game.physics.arcade.velocityFromAngle(degrees, 100, enemies.children[0].body.velocity);
  }

  function render() {
    game.debug.text('Survived for ' + score + ' seconds', 32, 32)
  }
});

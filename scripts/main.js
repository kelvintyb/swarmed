$('document').ready(function() {

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas', {
    preload: preload,
    create: create,
    update: update
  });
  //init global vars to be assigned game objects later
  var enemies, player, control;

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
    var enemy = enemies.create(game.world.randomX, game.world.randomY, 'enemy');

    //create player and assign to GLOBAL var
    player = game.add.sprite(game.world.randomX, game.world.randomY, 'player');
    console.log(player);
    //enable physics and world boundaries
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;

    //create keyboard mapping system - refer to source code at https://github.com/photonstorm/phaser/blob/v2.6.2/src/input/Keyboard.js for more functions. IMPLEMENT proper object functionality by Monday.
    control = game.input.keyboard.createCursorKeys();
    //uncomment below to test prevent scrolling method
    // game.input.keyboard.addKeyCapture(arrow);

  }

  function update() {
    //check for collision
    game.physics.arcade.collide(player, enemies);
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

  }

});

$('document').ready(function() {

  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameCanvas', {
    preload: preload,
    create: create,
    update: update
  });
  //init global vars to be assigned game objects later
  var enemies, player;

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
    //enable physics
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;

  }

  function update() {
    game.physics.arcade.collide(player, enemies);
  }

});

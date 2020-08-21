//configuracion inicial, render, tamaño, ..., funciones de carga y ejecucion
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 200}
        }
    },
    scene: {
        preload: preload,
        create: create
    }
}
//Crea el juego
var game = new Phaser.Game(config);

function preload(){
    //esto todavía no sé para qué
    this.load.setBaseURL('http://labs.phaser.io');
    //pre carga las imagenes, recibe el nombre de la imagen y la ruta
    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
}

function create(){
    //carga la imagen en el DOM
    this.add.image(400,300,'sky');
    //Añade particulas 
    var particles = this.add.particles('red');
    //No se pero supongo que se refiere al que emite las particulas
    var emitter = particles.createEmitter({
        speed: 100,
        scale: { start: 1, end: 0},
        blendMode: 'ADD'
    });
    //Añade un logo no se de que forma
    var logo = this.physics.add.image(400,100,'logo');

    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    emitter.startFollow(logo);
}
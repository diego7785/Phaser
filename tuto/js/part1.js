var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    //Para poder usar las leyes físicas hay que incluir esto en la configuración
    physics: {
        //sistema arcade
        default: 'arcade',
        arcade: {
            //indica que hay gravedad y que tan fuerte es, a mayo valor mas fuerte
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var score = 0;
var scoreText;

var dimensiones = {
    ancho: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    alto: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
}

function preload (){
    console.log(dimensiones.ancho);
    console.log(dimensiones.alto);
    //carga de imagen, nombre o identificador del elemento y la ruta de la imagen
    this.load.image('sky', './assets/sky.png');
    this.load.image('ground', './assets/platform.png');
    this.load.image('star', './assets/star.png');
    this.load.image('bomb', './assets/bomb.png');
    //spritesheet es un grupo de imágenes dentro de una misma imagen, los tamaños corresponde a los tamaños de cada imagen a extraer 
    this.load.spritesheet('dude', './assets/dude.png', 
        {frameWidth: 32, frameHeight: 48});
}

function create (){

    // CREANDO PLATAFORMAS


    //muestra la imagen en el DOM, medidas de la imagen y el identificador de la imagen
    this.add.image(400,300,'sky');
    //crea un nuevo grupo de elementos estáticos con física, para poder controlarlos todos juntos con las mismas leyes
    //estático porque los elementos no se moverán
    //dinámicos los que se van a mover y necesitan la física aplicada a su movimiento
    platforms = this.physics.add.staticGroup();

    //crea un nuevo elemento del grupo, posicion y nombre
    //setScale(2) multiplica el tamaño de la imagen por dos
    //refreshBody() al hacer el cambio de tamaño es necesario avisar al sistemas de físicas
    platforms.create(400,568,'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    //CREANDO JUGADOR
    
    //se crea y añade el jugador, con medidas e identificador
    //se añade ya con las físicas incluidas y se agrega como sprite debido a que es parte de uno
    //al no especificar el modo de añadir físicas le agrega física dinámica por defecto
    player=this.physics.add.sprite(100,450,'dude');

    //se agrega un rebote cuando choque o caiga
    player.setBounce(0.2);
    //Para que el personaje choque cuando llegue a un borde
    player.setCollideWorldBounds(true);

    //animando el personaje
    this.anims.create({
        key: 'left',
        //esta animacion usa los fotogramas 0,1,2,3 del sprite original para mover el personaje
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3}),
        //la velocidad de muestra de los fotogramas es de 10fps
        frameRate: 10,
        //la animacion no se repite, una vez terminada debe volver a iniciarse
        repeat: -1
    });

    this.anims.create({
        //direccion contraria a la que se esta moviendo
        key: 'turn',
        frames: [{ key: 'dude', frame: 4}],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    });

    //añade efectos de gravedad en el eje Y al personaje (peso del objeto)
    player.body.setGravityY(300); 

    //añade que el personaje colisione con las plataformas y el suelo, para que no las traspase
    this.physics.add.collider(player,platforms);

    //listener de eventos del teclado
    cursors = this.input.keyboard.createCursorKeys();

    //Añadiendo estrellas

    //grupo de física dinámica
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11, //12 estrellas (la que crea y once más)
        setXY: { x: 12, y: 0, stepX: 70} //posicion inicial de caida y separacion entre estrellas
    });

    //recorre cada estrella y les da un valor de rebote aleatorio entre 0.4 y 0.8
    stars.children.iterate(function (child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
    });

    //colision estrellas plataformas
    this.physics.add.collider(stars,platforms);

    //verificacion de colision o superpocision de personaje y estrellas para recogerlas
    this.physics.add.overlap(player,stars,collectStar,null,this);

    //funcion para recoger las estrellas
    function collectStar(player,star){
        star.disableBody(true,true); //desaparece la estrella

        score +=10;
        scoreText.setText('Score: '+score);

        if(stars.countActive(true)===0){ //cuenta cuantas estrellas quedan
            stars.children.iterate(function(child){
                child.enableBody(true,child.x,0,true,true); //habilita todas las estrellas otra vez y las posiciona en 0
            });

            var x = (player.x <400) ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0,400);  //se escoge una posicion en el lado opuesto de la posicion del personaje 

            var bomb = bombs.create(x,16,'bomb'); //crea la bomba
            bomb.setBounce(1); //salto de la bomba
            bomb.setCollideWorldBounds(true); //se habilita que no pueda salir del mundo
            bomb.setVelocity(Phaser.Math.Between(-200,200),20);
        }

    }

    //configurando puntaje
    //posicion, texto, estilo del texto
    scoreText = this.add.text(16,16,'score: 0', {fontSize: '32px', fill: '#000000'})

    //añadiendo bombas
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs,platforms);

    //al momento de la colision se ejecuta otra funcion
    this.physics.add.collider(player,bombs,hitBomb, null, this);

    function hitBomb(player,bombs){
        this.physics.pause(); //pausa el juego
        player.setTint(0xff0000); //pinta el personaje de color rojo
        player.anims.play('turn');
        gameOverText = this.add.text((dimensiones.ancho/4)-140,dimensiones.alto/4,'GAME OVER', {fontSize: '64px', fill: '#000000'})
    }
}

function update (){
    //relacion de eventos y animacion
    if(cursors.left.isDown){
        player.setVelocityX(-160);

        //ejecuta la animacion
        player.anims.play('left', true);
    } else if(cursors.right.isDown){
        player.setVelocityX(160);

        player.anims.play('right',true);
    } else{
        player.setVelocityX(0);

        player.anims.play('turn',true);
    }

    if(cursors.up.isDown && player.body.touching.down){
        player.setVelocityY(-480);
    }
}

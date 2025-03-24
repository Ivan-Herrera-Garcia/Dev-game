const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Cargar las hojas de sprites
const playerRun = new Image();
playerRun.src = "sprites/Colour2/Outline/120x80_PNGSheets/_Run.png";  // Ruta a la hoja de sprites de correr

const playerIdle = new Image();
playerIdle.src = "sprites/Colour2/Outline/120x80_PNGSheets/_Idle.png";  // Ruta a la hoja de sprites de reposo

const playerJump = new Image();
playerJump.src = "sprites/Colour2/Outline/120x80_PNGSheets/_Jump.png";  // Ruta a la hoja de sprites de salto

// Variables del jugador
const player = {
    x: 100,
    y: 100,
    width: 120,  // Ancho del sprite
    height: 80,  // Alto del sprite
    speed: 4,
    dy: 0,
    jumping: false,
    gravity: 0.8,
    jumpStrength: -12,
    alive: true,
};

// Configuración de plataformas
const floors = [
    { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },  // Suelo base
    { x: 150, y: 250, width: 100, height: 20 },  // Plataforma media
    { x: 350, y: 150, width: 100, height: 20 },  // Plataforma alta
    { x: 500, y: 300, width: 100, height: 50 },  // Plataforma alta que no deja pasar al jugador
    { x: 700, y: 250, width: 50, height: 100 },  // Plataforma en forma de pared que bloquea el paso
];

// Variables para las animaciones (sprite sheets)
const frameWidth = 120;  // Ancho de cada fotograma en la hoja de sprites
const frameHeight = 80;  // Alto de cada fotograma
const totalFramesRun = 6;  // Número total de fotogramas para correr
const totalFramesIdle = 4;  // Número total de fotogramas para reposo
const totalFramesJump = 1;  // Número total de fotogramas para saltar

let currentFrameRun = 0;  // Fotograma actual para correr
let currentFrameIdle = 0; // Fotograma actual para reposo
let frameSpeed = 10;  // Velocidad de animación
let frameCounter = 0;  // Contador para controlar la velocidad de cambio de fotogramas

const keys = {
    right: false,
    left: false,
    up: false
};

// Control de teclas
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowUp" && !player.jumping) {
        player.dy = player.jumpStrength;
        player.jumping = true;
        keys.up = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowUp") keys.up = false;
});

// Actualizar la posición del jugador
function update() {
    if (!player.alive) return;

    // Movimiento horizontal
    if (keys.right) player.x += player.speed;
    if (keys.left) player.x -= player.speed;

    // Actualizar la animación
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        frameCounter = 0;
        if (keys.right || keys.left) {
            currentFrameRun = (currentFrameRun + 1) % totalFramesRun;
        } else {
            currentFrameIdle = (currentFrameIdle + 1) % totalFramesIdle;
        }
    }

    // Gravedad y salto
    player.y += player.dy;
    player.dy += player.gravity;

    // Verificar colisiones con plataformas
    player.jumping = true;
    floors.forEach(floor => {
        // Verifica si el jugador está tocando el suelo o una plataforma desde arriba
        if (player.y + player.height <= floor.y &&  // El jugador está por encima de la plataforma
            player.y + player.height + player.dy >= floor.y && // El jugador está cayendo
            player.x + player.width > floor.x && // El jugador está dentro del rango horizontal de la plataforma
            player.x < floor.x + floor.width) {  // El jugador está dentro del ancho de la plataforma
            
            player.y = floor.y - player.height;  // Coloca al jugador encima de la plataforma
            player.dy = 0;  // Detiene la caída
            player.jumping = false;  // El jugador ya no está saltando
        }
    
        // Verifica colisión lateral (cuando el jugador está cerca de la plataforma)
        if (player.y + player.height > floor.y && // El jugador no está por encima de la plataforma
            player.y < floor.y + floor.height && // El jugador está dentro de la altura de la plataforma
            player.x + player.width > floor.x && // El jugador está al frente de la plataforma
            player.x < floor.x + floor.width) {  // El jugador está dentro del ancho de la plataforma
    
            // Verifica si el jugador está intentando moverse a la derecha
            if (keys.right && player.x + player.width > floor.x) {
                player.x = floor.x - player.width;  // Detén al jugador en el borde de la plataforma
            }
    
            // Verifica si el jugador está intentando moverse a la izquierda
            if (keys.left && player.x < floor.x + floor.width) {
                player.x = floor.x + floor.width;  // Detén al jugador en el borde de la plataforma
            }
        }
    });
    
    

    // Limitar el jugador al canvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Desplazamiento automático del canvas
    const centerX = window.innerWidth / 2 - player.width / 2;
    const offset = player.x - centerX;
    window.scrollTo({ left: offset, behavior: "smooth" });
}

// Dibujar elementos en el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Si se desactiva se ve el dibujo continuo

    // Dibujar plataformas
    floors.forEach(floor => {
        ctx.fillStyle = "#555";
        ctx.fillRect(floor.x, floor.y, floor.width, floor.height);
    });

    // Jugador Para pruebas
    //  ctx.fillStyle = "#0f0";
    //  ctx.fillRect(player.x, player.y, player.width, player.height);


    // Dibujar jugador con sprite sheet
    if (keys.right) {
        // Dibujar el fotograma correcto para correr hacia la derecha
        let sx = currentFrameRun * frameWidth;
        ctx.drawImage(playerRun, sx, 0, frameWidth, frameHeight, player.x, player.y, frameWidth, frameHeight);
    } else if (keys.left) {
        // Dibujar el fotograma correcto para correr hacia la izquierda (reflejado)
        let sx = currentFrameRun * frameWidth;
        ctx.save();
        ctx.scale(-1, 1); // Reflejar imagen
        ctx.drawImage(playerRun, sx, 0, frameWidth, frameHeight, -player.x - player.width, player.y, frameWidth, frameHeight);
        ctx.restore();
    } else if (keys.up) {
        // Dibujar el fotograma de salto
        ctx.drawImage(playerJump, 0, 0, frameWidth, frameHeight, player.x, player.y, frameWidth, frameHeight);
    } else {
        // Dibujar el fotograma correcto para reposo
        let sx = currentFrameIdle * frameWidth;
        ctx.drawImage(playerIdle, sx, 0, frameWidth, frameHeight, player.x, player.y, frameWidth, frameHeight);
    }

    // // Dibujar enemigos y proyectiles
    // enemies.forEach(enemy => {
    //     ctx.fillStyle = "red";
    //     ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    //     ctx.fillStyle = "yellow";
    //     enemy.projectiles.forEach(proj => {
    //         ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
    //     });
    // });
}

//SECCION DE TEXTOS 
const textBox = document.getElementById("text-box");
const textElement = document.getElementById("text");
const continueElement = document.getElementById("continue");

const dialogs = [
    "Hola, viajero interdimensional...",
    "Te encuentras en un mundo desconocido, lleno de peligros y misterios.",
    "¡Prepárate para enfrentarte a los desafíos más difíciles!"
];

let currentDialog = 0;
let charIndex = 0;
let typing = false;

// Escribir el texto letra por letra
function typeText() {
    textBox.style.display = "block";  // Asegúrate de mostrar la ventana de texto
    typing = true;

    // Si aún no hemos escrito todo el texto
    if (charIndex < dialogs[currentDialog].length) {
        textElement.textContent += dialogs[currentDialog][charIndex];  // Escribir un carácter
        charIndex++;
        setTimeout(typeText, 50);  // Llamar a la función de nuevo con retraso para escribir
    } else {
        typing = false;  // Detener la escritura
        continueElement.style.display = "block";  // Mostrar el indicador para continuar
    }
}

// Guardamos la referencia a la función del event listener
const handleKeydownTexto = (e) => {
    // Si presionamos "Enter" y no estamos escribiendo
    if (e.key === "Enter" && !typing) {
        continueElement.style.display = "none";  // Ocultar el indicador
        charIndex = 0;
        
        // Si hay más diálogos, continuar con el siguiente
        if (currentDialog < dialogs.length - 1) {
            currentDialog++;
            textElement.textContent = "";  // Limpiar el texto
            typing = true;
            typeText();  // Escribir el siguiente diálogo
            console.log("Siguiente diálogo");
        } else {
            console.log("Fin de los diálogos");
            // Si hemos llegado al final de los diálogos
            document.getElementById("text-box").remove();  // Eliminar la ventana de texto
            eliminarHookTexto();  // Eliminar el event listener
        }
    } else {
        // Si no es "Enter", ocultamos todos los elementos y eliminamos el event listener
        textBox.style.display = "none";  // Ocultar la ventana de texto
        continueElement.style.display = "none";  // Ocultar el indicador
        textElement.textContent = "";  // Limpiar el contenido
        eliminarHookTexto();  // Eliminar el event listener
    }
};


// Agregamos el event listener
document.addEventListener("keydown", handleKeydownTexto);

// Función para eliminar el event listener
function eliminarHookTexto() {
    document.removeEventListener("keydown", handleKeydownTexto);
    console.log("Hook de teclado eliminado");
}


// Función principal de juego
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop); // Esto asegura que se dibujen nuevos fotogramas
    typeText();
}

// Comenzar el juego
// gameLoop();

// Iniciar el diálogo automáticamente al cargar la página
// window.onload = showTextBox;



// const canvas = document.getElementById("gameCanvas");
// const ctx = canvas.getContext("2d");

// // Cargar los gifs de sprite
// const playerRun = new Image();
// playerRun.src = "sprites/Colour2/Outline/120x80_gifs/__Run.gif";  // Ruta al gif de correr

// const playerIdle = new Image();
// playerIdle.src = "sprites/Colour2/Outline/120x80_gifs/__Idle.gif";  // Ruta al gif de reposo

// const playerJump = new Image();
// playerJump.src = "sprites/Colour2/Outline/120x80_gifs/__Jump.gif";  // Ruta al gif de reposo

// // Variables del jugador
// const player = {
//     x: 100,
//     y: 300,
//     width: 60,  // Ajusta el tamaño del sprite (si es necesario)
//     height: 80, // Ajusta el tamaño del sprite (si es necesario)
//     speed: 4,
//     dy: 0,
//     jumping: false,
//     gravity: 0.8,
//     jumpStrength: -12,
//     alive: true,
// };

// // Configuración de plataformas
// const floors = [
//     { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
//     { x: 150, y: 250, width: 100, height: 20 },
//     { x: 350, y: 150, width: 100, height: 20 },
//     { x: 500, y: 300, width: 100, height: 20 }
// ];

// const keys = {
//     right: false,
//     left: false,
//     up: false
// };

// // Control de teclas
// document.addEventListener("keydown", (e) => {
//     if (e.key === "ArrowRight") keys.right = true;
//     if (e.key === "ArrowLeft") keys.left = true;
//     if (e.key === "ArrowUp" && !player.jumping) {
//         player.dy = player.jumpStrength;
//         player.jumping = true;
//     }
// });

// document.addEventListener("keyup", (e) => {
//     if (e.key === "ArrowRight") keys.right = false;
//     if (e.key === "ArrowLeft") keys.left = false;
// });

// // Actualizar la posición del jugador y animación de sprites
// function update() {
//     if (!player.alive) return;

//     // Movimiento horizontal
//     if (keys.right) {
//         player.x += player.speed;
//     } else if (keys.left) {
//         player.x -= player.speed;
//     }

//     // Gravedad y salto
//     player.y += player.dy;
//     player.dy += player.gravity;

//     // Verificar colisiones con plataformas
//     player.jumping = true;
//     floors.forEach(floor => {
//         if (player.y + player.height >= floor.y &&
//             player.y + player.height <= floor.y + floor.height &&
//             player.x + player.width > floor.x &&
//             player.x < floor.x + floor.width) {
//             player.y = floor.y - player.height;
//             player.dy = 0;
//             player.jumping = false;
//         }
//     });

//     // Limitar al jugador dentro del canvas
//     if (player.x < 0) player.x = 0;
//     if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
// }

// // Dibujar elementos en el canvas
// function draw() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Dibujar plataformas
//     ctx.fillStyle = "#555";
//     floors.forEach(floor => ctx.fillRect(floor.x, floor.y, floor.width, floor.height));

//     // Dibujar jugador con gif de sprite
//     if (keys.right || keys.left) {
//         // Si el jugador se mueve, mostrar el gif de correr
//         ctx.drawImage(playerRun, player.x, player.y - 20, player.width, player.height);
//     } else if (keys.up) {
//         // Si el jugador salta, mostrar el gif de salto
//         ctx.drawImage(playerJump, player.x, player.y - 20, player.width, player.height);
//     } else {
//         // Si el jugador está quieto, mostrar el gif de reposo
//         ctx.drawImage(playerIdle, player.x, player.y - 20, player.width, player.height);
//     }

//     requestAnimationFrame(gameLoop);
// }

// // Bucle principal del juego
// function gameLoop() {
//     update();
//     draw();
// }

// playerRun.onload = () => {
//     playerIdle.onload = () => {
//         gameLoop(); // Espera que ambos gifs estén cargados para iniciar el juego
//     }
// };


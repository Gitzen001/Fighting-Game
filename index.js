const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = 1024;
canvas.height = 576;

ctx.fillRect(0, 0, canvas.width, canvas.height);
const gravity = 0.2;
let gameStarted = false;
let isPaused = false;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 128,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 150,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/samuraiMack/Run.png",
      framesMax: 8,
      image: new Image(),
    },
    jump: {
      imageSrc: "./img/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 800,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  color: "green",
  imageSrc: "./img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167,
  },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      framesMax: 8,
      image: new Image(),
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
  ArrowDown: {
    pressed: false,
  },
};

function startGame() {
  gameStarted = true;
  document.querySelector("#mainMenu").style.display = "none";
  decreaseTimer();
}
decreaseTimer();

function animate() {
  window.requestAnimationFrame(animate);
  if (!gameStarted || isPaused) return;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  background.update();
  shop.update();
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  if (enemy.health <= 0 || player.health <= 0 || timer === 0) {
    clearTimeout(timerId);
    return;
  }
  let p1Speed = player.isShielding ? 2 : 5;
  let p2Speed = enemy.isShielding ? 2 : 5;

  //BODY COLLISION CHECK
  const isTouching =
    player.position.x + player.width >= enemy.position.x &&
    player.position.x <= enemy.position.x + enemy.width &&
    player.position.y + player.height >= enemy.position.y &&
    player.position.y <= enemy.position.y + enemy.height;
  //player movement
  if (keys.a.pressed && player.lastKey === "a" && !player.isAttacking) {
    player.velocity.x = -p1Speed;
    player.switchSprite("run");
    if (isTouching && player.position.x > enemy.position.x) {
      if (enemy.position.x > 0) {
        player.velocity.x = -p1Speed;
        enemy.position.x -= p1Speed;
      }
    } else {
      player.velocity.x = -p1Speed;
    }
  } else if (keys.d.pressed && player.lastKey === "d" && !player.isAttacking) {
    player.velocity.x = p1Speed;
    player.switchSprite("run");
    if (isTouching && player.position.x < enemy.position.x) {
      if (enemy.position.x + enemy.width < canvas.width) {
        player.velocity.x = p1Speed;
        enemy.position.x += p1Speed;
      }
    } else {
      player.velocity.x = p1Speed;
    }
  } else {
    player.switchSprite("idle");
  }

  //jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }
  //enemy movement
  if (
    keys.ArrowLeft.pressed &&
    enemy.lastKey === "ArrowLeft" &&
    !enemy.isAttacking
  ) {
    enemy.switchSprite("run");
    if (isTouching && enemy.position.x > player.position.x) {
      if (player.position.x > 0) {
        enemy.velocity.x = -p2Speed;
        player.position.x -= p2Speed;
      }
    } else {
      enemy.velocity.x = -p2Speed;
    }
  } else if (
    keys.ArrowRight.pressed &&
    enemy.lastKey === "ArrowRight" &&
    !enemy.isAttacking
  ) {
    enemy.switchSprite("run");
    if (isTouching && enemy.position.x < player.position.x) {
      if (player.position.x + player.width < canvas.width) {
        enemy.velocity.x = p2Speed;
        player.position.x += p2Speed;
      }
    } else {
      enemy.velocity.x = p2Speed;
    }
  } else {
    enemy.switchSprite("idle");
  }
  //jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  //detect for collision & enemy gets hit
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking &&
    player.framesCurrent === 2
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    if (enemy.isShielding && !enemy.isShieldBroken) {
      enemy.shieldHealth -= 20;
    } else {
      gsap.to("#enemyHealth", {
        width: enemy.health + "%",
        duration: 0.2,
    });
  }
  }
  if (player.isAttacking && player.framesCurrent === 2) {
    player.isAttacking = false;
  }

  //detect for collision & player gets hit

  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    if (player.isShielding && !player.isShieldBroken) {
      player.shieldHealth -= 20;
    } else {
    gsap.to("#playerHealth", {
        width: player.health + "%",
        duration: 0.2,
      });
    }
  }
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}
animate();
// function rematch() {
//   timer = 60;
//   isPaused = false;
//   gameStarted = true;
//   clearTimeout(timerId);

//   // 1. REVIVE PLAYER 1
//   player.dead = false;             // Allow them to move again
//   player.health = 100;             // Reset health logic
//   player.position = { x: 150, y: 0 }; // Put them back at start
//   player.velocity = { x: 0, y: 0 };
//   player.switchSprite('idle');     // Change the picture back to standing
//   player.framesCurrent = 0;        // Start the animation from the beginning
  
//   // Reset P1 extras
//   player.shieldHealth = 100;
//   player.isShielding = false;
//   player.isShieldBroken = false;
//   player.isAttacking = false;
//   player.canAttack = true;

//   // 2. REVIVE ENEMY
//   enemy.dead = false;              // Allow them to move again
//   enemy.health = 100;              // Reset health logic
//   enemy.position = { x: 800, y: 0 }; // Put them back at start
//   enemy.velocity = { x: 0, y: 0 };
//   enemy.switchSprite('idle');      // Change the picture back to standing
//   enemy.framesCurrent = 0;         // Start the animation from the beginning

//   // Reset Enemy extras
//   enemy.shieldHealth = 100;
//   enemy.isShielding = false;
//   enemy.isShieldBroken = false;
//   enemy.isAttacking = false;
//   enemy.canAttack = true;

//   // 3. RESET THE UI
//   document.querySelector("#playerHealth").style.width = "100%";
//   document.querySelector("#enemyHealth").style.width = "100%";
//   document.querySelector("#timer").innerHTML = timer;
//   document.querySelector("#displayText").style.display = "none";

//   decreaseTimer();
// }

function goToMenu() {
  location.reload();
}

window.addEventListener("keydown", (event) => {
  if (player.dead || enemy.dead || !gameStarted || isPaused) return;
  if (!player.dead) {
    if (event.key === "p" || event.key === "P") {
      togglePause();
    }

    if (player.health <= 0 || enemy.health <= 0 || timer === 0) return;
    switch (event.key) {
      case "w":
        if (player.velocity.y === 0) player.velocity.y = -7;
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case " ":
        if (!player.isAttacking && !player.isShieldBroken) {
          player.isShielding = true;
        }
        break;
      case "s":
        if (!keys.s.pressed && !enemy.dead) {
          player.attack();
          keys.s.pressed = true;
        }
        break;
      case "1":
        if (!enemy.isAttacking && !enemy.isShieldBroken) {
          enemy.isShielding = true;
        }
        break;
    }
  }
  if (!enemy.dead) {
    switch (event.key) {
      case "ArrowUp":
        if (enemy.velocity.y === 0) enemy.velocity.y = -7;
        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";
        break;
      case "ArrowDown":
        if (!keys.ArrowDown.pressed && !player.dead) {
          enemy.attack();
          keys.ArrowDown.pressed = true;
        }
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  if (!gameStarted) return;
  switch (event.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case " ":
      player.isShielding = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = false;
      break;
    case "1":
      enemy.isShielding = false;
      break;
  }
});

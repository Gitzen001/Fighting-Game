const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = 1024;
canvas.height = 576;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.2;
let gameStarted = false;
let isPaused = false;
class Sprite {
  constructor({ position, velocity, color = "red", offset }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset,
      width: 100,
      height: 50,
    };
    this.color = color;
    this.isAttacking;
    this.canAttack = true;
    this.health = 100;
    this.isShielding = false;
    this.shieldHealth = 100;
    this.maxShieldHealth = 100;
    this.isShieldBroken = false;
  }
  draw() {
    if (!this.canAttack && !this.isAttacking) {
      ctx.globalAlpha = 0.5; // Make them slightly transparent
    } else {
      ctx.globalAlpha = 1.0;
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    ctx.globalAlpha = 1.0;
    if (this.isShielding && !this.isShieldBroken) {
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 5;
      ctx.strokeRect(
        this.position.x - 5,
        this.position.y - 5,
        this.width + 10,
        this.height + 10,
      );
      // Shield Health Bar
      ctx.fillStyle = "cyan";
      ctx.fillRect(
        this.position.x,
        this.position.y - 20,
        (this.shieldHealth / this.maxShieldHealth) * this.width,
        10,
      );
    }
    if (this.isAttacking) {
      ctx.fillStyle = "blue";
      ctx.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height,
      );
    }
  }

  update() {
    this.draw();
    if (!this.isShielding || this.isShieldBroken) {
      if (this.shieldHealth < this.maxShieldHealth) {
        this.shieldHealth += 0.2;
      }
    }
    if (this.shieldHealth >= this.maxShieldHealth) {
      this.isShieldBroken = false;
    }
    if (this.shieldHealth <= 0) {
      this.shieldHealth = 0;
      this.isShieldBroken = true;
      this.isShielding = false;
    }
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y;
    this.position.x += this.velocity.x;
    if (this.position.x <= 0) {
      this.position.x = 0;
    }
    if (this.position.x + this.width >= canvas.width) {
      this.position.x = canvas.width - this.width;
    }
    this.position.y += this.velocity.y;
    if (this.position.y + this.height >= canvas.height) {
      this.velocity.y = 0;
      this.position.y = canvas.height - this.height;
    } else this.velocity.y += gravity; //gravity
  }
  attack() {
    if (!this.canAttack || this.isShielding) return;
    this.isAttacking = true;
    this.canAttack = false;
    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
    setTimeout(() => {
      this.canAttack = true;
    }, 500);
  }
}
const player = new Sprite({
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
});

const enemy = new Sprite({
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
  s:{
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

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >=
      rectangle2.position.x &&
    rectangle1.attackBox.position.x <=
      rectangle2.position.x + rectangle2.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >=
      rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  );
}

function determineWinner({ player, enemy, timerId }) {
  clearTimeout(timerId);
  const displayElement = document.querySelector("#displayText");
  const nameElement = document.querySelector("#winnerName");
  displayElement.style.display = "flex";
  if (player.health === enemy.health) {
    nameElement.innerHTML = "Tie";
  } else if (player.health > enemy.health) {
    nameElement.innerHTML = "Player 1 Wins";
  } else if (player.health < enemy.health) {
    nameElement.innerHTML = "Player 2 Wins";
  }
}
let timer = 60;
let timerId;
function decreaseTimer() {
  if (!gameStarted || isPaused) {
    clearTimeout(timerId);
    return;
  }
  if (timer > 0 && !isPaused) {
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  }
  if (timer === 0) {
    determineWinner({ player, enemy, timerId });
  } else {
    timerId = setTimeout(decreaseTimer, 1000);
  }
}
decreaseTimer();
function animate() {
  window.requestAnimationFrame(animate);
  if (!gameStarted || isPaused) return;
  ctx.fillStyle = "black";
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


  if (keys.a.pressed && player.lastKey === "a" && !player.isAttacking) {
    if (isTouching && player.position.x > enemy.position.x) {
      if (enemy.position.x > 0) {
        player.velocity.x = -p1Speed;
        enemy.position.x -= p1Speed;
      }
    } else {
      player.velocity.x = -p1Speed;
    }
  } else if (keys.d.pressed && player.lastKey === "d" && !player.isAttacking) {
    if (isTouching && player.position.x < enemy.position.x) {
      if (enemy.position.x + enemy.width < canvas.width) {
        player.velocity.x = p1Speed;
        enemy.position.x += p1Speed;
      }
    } else {
      player.velocity.x = p1Speed;
    }
  }
  if (
    keys.ArrowLeft.pressed &&
    enemy.lastKey === "ArrowLeft" &&
    !enemy.isAttacking
  ) {
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
    if (isTouching && enemy.position.x < player.position.x) {
      if (player.position.x + player.width < canvas.width) {
        enemy.velocity.x = p2Speed;
        player.position.x += p2Speed;
      }
    } else {
      enemy.velocity.x = p2Speed;
    }
  }
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking
  ) {
    player.isAttacking = false;
    if (enemy.isShielding && !enemy.isShieldBroken) {
      enemy.shieldHealth -= 20;
    } else {
      enemy.health -= 10;
      document.querySelector("#enemyHealth").style.width = enemy.health + "%";
    }
  }

  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    if (player.isShielding && !player.isShieldBroken) {
      player.shieldHealth -= 20;
    } else {
      player.health -= 10;
      document.querySelector("#playerHealth").style.width = player.health + "%";
    }
  }

  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}
animate();
function rematch() {
  timer = 60;
  isPaused = false;
  gameStarted = true;

  clearTimeout(timerId);

  //Reset Player
  player.position = { x: 100, y: 0 };
  player.velocity = { x: 0, y: 0 };
  player.health = 100;
  player.shieldHealth = 100;
  player.isShielding = false;
  player.isShieldBroken = false;
  player.isAttacking = false;
  player.canAttack = true;

  //Reset Enemy
  enemy.position = { x: 700, y: 0 };
  enemy.velocity = { x: 0, y: 0 };
  enemy.health = 100;
  enemy.shieldHealth = 100;
  enemy.isShielding = false;
  enemy.isShieldBroken = false;
  enemy.isAttacking = false;
  enemy.canAttack = true;

  document.querySelector("#playerHealth").style.width = "100%";
  document.querySelector("#enemyHealth").style.width = "100%";
  document.querySelector("#timer").innerHTML = timer;
  document.querySelector("#displayText").style.display = "none";

  decreaseTimer();
}

function goToMenu() {
  document.querySelector("#displayText").style.display = "none";
  document.querySelector("#pauseMenu").style.display = "none";
  document.querySelector("#mainMenu").style.display = "flex";
  //reset the game
  gameStarted = false;
  isPaused = false;
  clearTimeout(timerId);
  timer = 60;
  document.querySelector("#timer").innerHTML = timer;

  player.position = { x: 100, y: 0 };
  enemy.position = { x: 700, y: 0 };
  player.health = 100;
  enemy.health = 100;
}
function togglePause() {
  if (enemy.health <= 0 || player.health <= 0 || timer === 0) return;
  isPaused = !isPaused;
  const menu = document.querySelector("#pauseMenu");
  if (isPaused) {
    menu.style.display = "flex";
  } else {
    menu.style.display = "none";
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key === "p" || event.key === "P") {
    togglePause();
  }
});
window.addEventListener("keydown", (event) => {
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
      if (!keys.s.pressed) {
        player.attack();
        keys.s.pressed = true;
      }
      break;
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
      if (!keys.ArrowDown.pressed) {
        enemy.attack();
        keys.ArrowDown.pressed = true;
      }
      break;
    case "1":
      if (!enemy.isAttacking && !enemy.isShieldBroken) {
        enemy.isShielding = true;
      }
      break;
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


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = 1024;
canvas.height = 576;

ctx.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.2;

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
    this.health = 100;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
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
    this.isAttacking = true;
    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
  }
}
const player = new Sprite({
  position: {
    x: 0,
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
    x: 400,
    y: 100,
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
  document.querySelector("#displayText").style.display = "flex";
  if (player.health === enemy.health) {
    document.querySelector("#displayText").innerHTML = "Tie";
  } else if (player.health > enemy.health) {
    document.querySelector("#displayText").innerHTML = "Player 1 Wins";
  } else if (player.health < enemy.health) {
    document.querySelector("#displayText").innerHTML = "Player 2 Wins";
  }
}
let timer = 60;
let timerId;
function decreaseTimer() {
  if (timer > 0) {
    timerId = setTimeout(decreaseTimer, 1000);
    timer--;
    document.querySelector("#timer").innerHTML = timer;
  }
  if (timer === 0) {
    determineWinner({ player, enemy, timerId });
  }
}
decreaseTimer();
function animate() {
  window.requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;
  if (enemy.health <= 0 || player.health <= 0 || timer === 0) {
    return;
  }
  //Body Collision Check
  const isTouching =
    player.position.x + player.width >= enemy.position.x &&
    player.position.x <= enemy.position.x + enemy.width &&
    player.position.y + player.height >= enemy.position.y &&
    player.position.y <= enemy.position.y + enemy.height;

  if (keys.a.pressed && player.lastKey === "a") {
    // const playerAtLeftWall = player.position.x <= 0;
    const enemyAtLeftWall = enemy.position.x <= 0;

    if (isTouching && player.position.x > enemy.position.x) {
      if (!enemyAtLeftWall) {
        player.velocity.x = -5;
        enemy.position.x -= 5;
      } else {
        player.velocity.x = 0;
        player.position.x = enemy.position.x + enemy.width;
      }
    } else {
      player.velocity.x = -5;
    }
  } else if (keys.d.pressed && player.lastKey === "d") {
    const enemyAtRightWall = enemy.position.x + enemy.width >= canvas.width;

    if (isTouching && player.position.x < enemy.position.x) {
      if (!enemyAtRightWall) {
        player.velocity.x = 5;
        enemy.position.x += 5;
      } else {
        player.velocity.x = 0;
        player.position.x = enemy.position.x - player.width;
      }
    } else {
      player.velocity.x = 5;
    }
  }

  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    const playerAtLeftWall = player.position.x <= 0;

    if (isTouching && enemy.position.x > player.position.x) {
      if (!playerAtLeftWall) {
        enemy.velocity.x = -5;
        player.position.x -= 5;
      } else {
        enemy.velocity.x = 0;
        enemy.position.x = player.position.x + player.width;
      }
    } else {
      enemy.velocity.x = -5;
    }
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    const playerAtRightWall = player.position.x + player.width >= canvas.width;

    if (isTouching && enemy.position.x < player.position.x) {
      if (!playerAtRightWall) {
        enemy.velocity.x = 5;
        player.position.x += 5;
      } else {
        enemy.velocity.x = 0;
        enemy.position.x = player.position.x - enemy.width;
      }
    } else {
      enemy.velocity.x = 5;
    }
  }
  //player movement
  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
  }
  //enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
  }
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking
  ) {
    player.isAttacking = false;
    enemy.health -= 10;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    player.health -= 10;
    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  //end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}
animate();

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
      if (!keys.space.pressed) {
        player.attack();
        keys.space.pressed = true;
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
  }
});

window.addEventListener("keyup", (event) => {
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
      keys.space.pressed = false;
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
  }
});

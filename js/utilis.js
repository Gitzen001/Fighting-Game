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
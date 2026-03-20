let p1 = localStorage.getItem("player1God") || "Player 1";
let p2 = localStorage.getItem("player2God") || "Player 2";

const board = document.getElementById("board");
const timerText = document.getElementById("timer");
const chanceText = document.getElementById("chance");
const turnText = document.getElementById("turn");

const countdownScreen = document.getElementById("countdownScreen");
const countText = document.getElementById("countText");

const popup = document.getElementById("popup");
const winnerText = document.getElementById("winnerText");
const winSound = document.getElementById("winSound");

// ✅ DIRECT LOCAL PATHS (FIXED)
const pairs = [
  ["file:///C:/Users/DELL/Desktop/memory%20game/Phrixus.jpg","file:///C:/Users/DELL/Desktop/memory%20game/ram.jpg"],
  ["file:///C:/Users/DELL/Desktop/memory%20game/fleece.jpg","file:///C:/Users/DELL/Desktop/memory%20game/dragon.jpg"],
  ["file:///C:/Users/DELL/Desktop/memory%20game/jason.jpg","file:///C:/Users/DELL/Desktop/memory%20game/pelias.jpg"],
  ["file:///C:/Users/DELL/Desktop/memory%20game/athena.jpg","file:///C:/Users/DELL/Desktop/memory%20game/ship.jpg"],
  ["file:///C:/Users/DELL/Desktop/memory%20game/phineus.png","file:///C:/Users/DELL/Desktop/memory%20game/harpies2.jpg.jpeg"],
  ["file:///C:/Users/DELL/Desktop/memory%20game/clash_rock.png","file:///C:/Users/DELL/Desktop/memory%20game/argonauts.png"],
  ["file:///C:/Users/DELL/Desktop/memory%20game/colchis.jpg.jpeg","file:///C:/Users/DELL/Desktop/memory%20game/aeetes.jpg.jpeg"],
  ["file:///C:/Users/DELL/Desktop/memory%20game/medea.jpg.jpeg","file:///C:/Users/DELL/Desktop/memory%20game/love.png"]
];

let cardsData = pairs.flat();

let round = 1;
let currentPlayer = 1;

let results = {
  1: { completed: false, time: null },
  2: { completed: false, time: null }
};

let first = null, second = null, lock = false;
let matched = 0;
let timeLeft = 30;
let timer;

// START AFTER LOAD
window.onload = function () {
  startTurn(1);
};

// COUNTDOWN
function startCountdown(callback) {
  countdownScreen.classList.remove("hidden");

  let count = 3;
  countText.innerText = count;

  let interval = setInterval(() => {
    count--;
    countText.innerText = count;

    if (count === 0) {
      clearInterval(interval);
      setTimeout(() => {
        countdownScreen.classList.add("hidden");
        callback();
      }, 500);
    }
  }, 1000);
}

// START TURN
function startTurn(player) {
  currentPlayer = player;

  turnText.innerText = (player === 1 ? p1 : p2) + "'s Turn";
  chanceText.innerText = "Chance: " + round;

  startCountdown(() => {
    matched = 0;
    timeLeft = 30;

    createBoard();

    timerText.innerText = "Time: " + timeLeft;

    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      timerText.innerText = "Time: " + timeLeft;

      if (timeLeft <= 0) {
        finishTurn(false);
      }
    }, 1000);
  });
}

// CREATE BOARD
function createBoard() {
  board.innerHTML = "";
  let shuffled = [...cardsData].sort(() => 0.5 - Math.random());

  shuffled.forEach(img => {
    let card = document.createElement("div");
    card.classList.add("card");
    card.dataset.image = img;

    card.onclick = () => flip(card);

    board.appendChild(card);
  });
}

// FLIP
function flip(card) {
  if (lock) return;

  card.innerHTML = `<img src="${card.dataset.image}">`;

  if (!first) first = card;
  else {
    second = card;
    check();
  }
}

// CHECK
function check() {
  let match = pairs.some(pair =>
    pair.includes(first.dataset.image) &&
    pair.includes(second.dataset.image)
  );

  if (match) {
    matched++;
    reset();

    if (matched === pairs.length) {
      finishTurn(true);
    }

  } else {
    lock = true;
    setTimeout(() => {
      first.innerHTML = "";
      second.innerHTML = "";
      reset();
    }, 600);
  }
}

// RESET
function reset() {
  first = null;
  second = null;
  lock = false;
}

// FINISH TURN
function finishTurn(completed) {
  clearInterval(timer);

  results[currentPlayer].completed = completed;
  results[currentPlayer].time = completed ? (30 - timeLeft) : null;

  if (currentPlayer === 1) {
    setTimeout(() => startTurn(2), 1000);
  } else {
    evaluateRound();
  }
}

// ROUND LOGIC
function evaluateRound() {
  let p1r = results[1];
  let p2r = results[2];

  if (p1r.completed && !p2r.completed) return declareWinner(p1);
  if (!p1r.completed && p2r.completed) return declareWinner(p2);

  if (p1r.completed && p2r.completed) {
    if (p1r.time < p2r.time) return declareWinner(p1);
    if (p2r.time < p1r.time) return declareWinner(p2);
  }

  if (round < 3) {
    round++;
    results = {
      1: { completed: false, time: null },
      2: { completed: false, time: null }
    };
    setTimeout(() => startTurn(1), 1500);
  } else {
    winnerText.innerText = "🤝 It's a Draw!";
    popup.classList.remove("hidden");
  }
}

// WINNER
function declareWinner(name) {
  board.innerHTML = "";
  winnerText.innerText = `🏆 ${name} WINS!`;
  popup.classList.remove("hidden");
  winSound.play();
}

// RESTART
function restartGame() {
  location.reload();
}
let p1 = localStorage.getItem("player1God") || "Player 1";
let p2 = localStorage.getItem("player2God") || "Player 2";

const board = document.getElementById("board");
const timerText = document.getElementById("timer");
const chanceText = document.getElementById("chance");
const turnText = document.getElementById("turn");

const popup = document.getElementById("popup");
const winnerText = document.getElementById("winnerText");

const countdownScreen = document.getElementById("countdownScreen");
const countText = document.getElementById("countText");

/* IMAGE PATHS (GITHUB READY) */
const pairs = [
  ["images/phrixus.jpg","images/ram.jpg"],
  ["images/fleece.jpg","images/dragon.jpg"],
  ["images/jason.jpg","images/pelias.jpg"],
  ["images/athena.jpg","images/ship.jpg"],
  ["images/phineus.png","images/harpies2.jpg.jpeg"],
  ["images/clash_rock.png","images/argonauts.png"],
  ["images/colchis.jpg.jpeg","images/aeetes.jpg.jpeg"],
  ["images/medea.jpg.jpeg","images/love.png"]
];

let cardsData = pairs.flat();

let round = 1;
let currentPlayer = 1;

let results = {
  1: { completed: false, time: null },
  2: { completed: false, time: null }
};

let first = null;
let second = null;
let lock = false;
let matched = 0;

let timeLeft = 30;
let timer;

/* START GAME */
window.onload = () => {
  startTurn(1);
};

/* COUNTDOWN */
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

/* START TURN */
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

/* CREATE BOARD */
function createBoard() {
  board.innerHTML = "";

  let shuffled = [...cardsData].sort(() => 0.5 - Math.random());

  shuffled.forEach(img => {
    let card = document.createElement("div");
    card.className = "card";
    card.dataset.image = img;

    card.onclick = () => flip(card);

    board.appendChild(card);
  });
}

/* FLIP */
function flip(card) {
  if (lock || card.innerHTML !== "") return;

  card.innerHTML = `<img src="${card.dataset.image}">`;

  if (!first) {
    first = card;
  } else {
    second = card;
    checkMatch();
  }
}

/* CHECK MATCH */
function checkMatch() {
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

/* RESET */
function reset() {
  first = null;
  second = null;
  lock = false;
}

/* FINISH TURN */
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

/* ROUND LOGIC */
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

/* WINNER */
function declareWinner(name) {
  board.innerHTML = "";
  winnerText.innerText = `🏆 ${name} WINS!`;
  popup.classList.remove("hidden");
}

/* RESTART */
function restartGame() {
  location.reload();
}
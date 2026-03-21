// 🎭 GET PLAYER DATA CORRECTLY
let p1Name = localStorage.getItem("p1") || "Player 1";
let p2Name = localStorage.getItem("p2") || "Player 2";

let p1God = localStorage.getItem("c1") || "Apollo";
let p2God = localStorage.getItem("c2") || "Zeus";

let p1 = `${p1Name} (${p1God})`;
let p2 = `${p2Name} (${p2God})`;

function getGodName(text){
  let match = text.match(/\((.*?)\)/);
  return match ? match[1] : text;
}

// 🎮 ELEMENTS
const board = document.getElementById("board");
const timerText = document.getElementById("timer");
const turnText = document.getElementById("turn");
const levelText = document.getElementById("level");
const popup = document.getElementById("popup");
const winnerText = document.getElementById("winnerText");
const heartsText = document.getElementById("hearts");

// 🧠 CARD PAIRS
const allPairs = [
  ["phrixus.jpg","ram.jpg"],
  ["fleece.jpg","dragon.jpg"],
  ["jason.jpg","pelias.jpg"],
  ["athena.jpg","ship.jpg"],
  ["phineus.png","harpies2.jpg.jpeg"],
  ["clash_rock.png","argonauts.png"],
  ["colchis.jpg.jpeg","aeetes.jpg.jpeg"],
  ["medea.jpg.jpeg","love.png"]
];

// 🎮 GAME STATE
let players = {
  1: {name:p1, level:1, opened:[], score:0, finished:false, completed:false},
  2: {name:p2, level:1, opened:[], score:0, finished:false, completed:false}
};

let currentPlayer = 1;
let chance = 1;
let maxChance = 4;

let cards = [];
let first=null, second=null, lock=false;
let matched=0;

let timeLeft=30, timer;

// ❤️ HEARTS
function updateHearts(){
  heartsText.innerText = "❤️ ".repeat(maxChance - chance + 1);
}

// ▶️ START BUTTON
function confirmStart(){
  popup.style.display="none";
  startTurn(currentPlayer);
}

// 🔁 START TURN
function startTurn(player){
  updateHearts();

  turnText.innerText = getGodName(players[player].name) + "'s Turn";
  levelText.innerText = "Level " + players[player].level;

  loadCards(player);
  createBoard(player);
  startTimer(player);
}

// 🧠 LOAD CARDS
function loadCards(player){
  if(players[player].level===1)
    cards = allPairs.slice(0,4).flat();
  else
    cards = allPairs.flat();

  matched = players[player].opened.length/2;
}

// 🎴 CREATE BOARD
function createBoard(player){
  board.innerHTML="";
  let shuffled=[...cards].sort(()=>0.5-Math.random());

  shuffled.forEach(img=>{
    let card=document.createElement("div");
    card.className="card";

    let inner=document.createElement("div");
    inner.className="inner";

    let front=document.createElement("div");
    front.className="front";

    let back=document.createElement("div");
    back.className="back";
    back.innerHTML=`<img src="${img}">`;

    inner.append(front,back);
    card.appendChild(inner);

    if(players[player].opened.includes(img)){
      card.classList.add("flipped","matched");
    } else {
      card.onclick=()=>flip(card,img,player);
    }

    board.appendChild(card);
  });
}

// ⏱️ TIMER
function startTimer(player){
  timeLeft=30;
  timerText.innerText="Time: "+timeLeft;

  clearInterval(timer);
  timer=setInterval(()=>{
    timeLeft--;
    timerText.innerText="Time: "+timeLeft;

    if(timeLeft<=0){
      clearInterval(timer);
      switchPlayer();
    }
  },1000);
}

// 🔄 FLIP
function flip(card,img,player){
  if(lock || card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if(!first) first={card,img};
  else{
    second={card,img};
    checkMatch(player);
  }
}

// ✅ MATCH
function checkMatch(player){
  let match = allPairs.some(p=>p.includes(first.img)&&p.includes(second.img));

  if(match){
    players[player].opened.push(first.img,second.img);
    players[player].score += players[player].level===1?50:100;

    first.card.classList.add("matched");
    second.card.classList.add("matched");

    matched++;
    reset();

    if(matched === cards.length/2){
      clearInterval(timer);

      if(players[player].level === 1){
        players[player].finished = true;
      } else {
        players[player].completed = true;
      }

      switchPlayer();
    }

  } else {
    lock=true;
    setTimeout(()=>{
      first.card.classList.remove("flipped");
      second.card.classList.remove("flipped");
      reset();
    },600);
  }
}

function reset(){
  first=null;
  second=null;
  lock=false;
}

// 🔁 SWITCH PLAYER
function switchPlayer(){
  currentPlayer = currentPlayer === 1 ? 2 : 1;

  if(currentPlayer === 1){
    showScore();
  } else {
    showReady();
  }
}

// 🟡 READY POPUP
function showReady(){
  popup.style.display="flex";
  winnerText.innerHTML = `
    <div class="score-box">
      ${getGodName(players[currentPlayer].name)}, Ready?
      <br><br>
      <button onclick="confirmStart()">START</button>
    </div>
  `;
}

// 📊 SCOREBOARD
function showScore(){
  popup.style.display="flex";

  winnerText.innerHTML = `
    <div class="score-box">
      <h2>Scoreboard</h2>
      ${getGodName(players[1].name)}: ${players[1].score} pts<br><br>
      ${getGodName(players[2].name)}: ${players[2].score} pts
      <br><br>
      <button onclick="confirmStart()">START</button>
    </div>
  `;

  // ⭐ LEVEL UPGRADE AFTER BOTH PLAYED
  for(let i=1;i<=2;i++){
    if(players[i].finished && players[i].level===1){
      players[i].level = 2;
      players[i].opened = [];
      players[i].finished = false;
    }
  }

  chance++;

  if(chance > maxChance){
    declareWinner();
  }
}

// 🏆 FINAL WINNER
function declareWinner(){

  let p1Done = players[1].completed;
  let p2Done = players[2].completed;

  if(!p1Done && !p2Done){
    winnerText.innerHTML = `
      <div class="score-box">
        It was a great play. Try Again😍
      </div>
    `;
  }

  else if(p1Done && !p2Done){
    winnerText.innerHTML = `<h1>${getGodName(players[1].name)} Wins 🏆</h1>`;
  }

  else if(p2Done && !p1Done){
    winnerText.innerHTML = `<h1>${getGodName(players[2].name)} Wins 🏆</h1>`;
  }

  else{
    let winner =
      players[1].score > players[2].score
      ? getGodName(players[1].name)
      : getGodName(players[2].name);

    winnerText.innerHTML = `<h1>${winner} Wins 🏆</h1>`;
  }

  setTimeout(()=>{
    window.location.href="index.html";
  },3000);
}

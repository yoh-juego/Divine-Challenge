// 🎭 PLAYER DATA
let p1 = localStorage.getItem("player1God") || "Apollo";
let p2 = localStorage.getItem("player2God") || "Zeus";

// 🔊 SOUND
let bgMusic = new Audio("sounds/bg.mp3");
bgMusic.loop = true;

let winSound = new Audio("sounds/win.mp3");

// 🎮 ELEMENTS
const board = document.getElementById("board");
const timerText = document.getElementById("timer");
const turnText = document.getElementById("turn");
const levelText = document.getElementById("level");
const popup = document.getElementById("popup");
const winnerText = document.getElementById("winnerText");
const heartsText = document.getElementById("hearts");

// 🧠 PAIRS
const allPairs = [
  ["images/phrixus.jpg","images/ram.jpg"],
  ["images/fleece.jpg","images/dragon.jpg"],
  ["images/jason.jpg","images/pelias.jpg"],
  ["images/athena.jpg","images/ship.jpg"],
  ["images/phineus.png","images/harpies2.jpg.jpeg"],
  ["images/clash_rock.png","images/argonauts.png"],
  ["images/colchis.jpg.jpeg","images/aeetes.jpg.jpeg"],
  ["images/medea.jpg.jpeg","images/love.png"]
];

// 🎮 STATE
let players = {
  1: {name:p1, level:1, opened:[], score:0, completed:false, time:0},
  2: {name:p2, level:1, opened:[], score:0, completed:false, time:0}
};

let turnOrder = [1,2];
let turnIndex = 0;

let chance = 1;
let maxChance = 4;

let cards = [];
let first=null, second=null, lock=false;
let matched=0;

let timeLeft=30, timer;

// 🎭 GOD NAME
function getGodName(text){
  let match = text.match(/\((.*?)\)/);
  return match ? match[1] : text;
}

// ❤️ HEARTS
function updateHearts(){
  let hearts="";
  for(let i=0;i<maxChance-chance+1;i++){
    hearts += "❤️ ";
  }
  heartsText.innerText = hearts;
}

// 🎉 FIREWORKS
function fireworks(){
  for(let i=0;i<30;i++){
    let f=document.createElement("div");
    f.className="firework";
    f.style.left = Math.random()*100 + "vw";
    f.style.top = Math.random()*100 + "vh";
    document.body.appendChild(f);
    setTimeout(()=>f.remove(),1000);
  }
}

// ▶️ START TURN
function confirmStart(){
  popup.style.display="none";
  bgMusic.play();
  startTurn(turnOrder[turnIndex]);
}

// 🔁 TURN START
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

// 🎴 BOARD
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
      players[player].time += 30;
      nextTurn();
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
      players[player].time += (30 - timeLeft);

      // ⭐ DO NOT upgrade immediately
      players[player].finishedLevel = true;

      nextTurn();
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

// ⭐ LEVEL UP POPUP (ONLY PLACE WHERE NEXT ROUND EXISTS)
function showLevelUpgrade(player){
  popup.style.display="flex";
  winnerText.innerHTML = `
    <div class="score-box">
      ${getGodName(players[player].name)} reached Level 2 🚀
      <br><br>
      <button onclick="confirmStart()">NEXT ROUND</button>
    </div>
  `;
}

// 🔁 NEXT TURN
function nextTurn(){
  turnIndex++;

  if(turnIndex >= turnOrder.length){
    turnIndex = 0;
    showScore();
    return;
  }

  popup.style.display="flex";

  winnerText.innerHTML = `
    <div class="score-box">
      ${getGodName(players[turnOrder[turnIndex]].name)}, Ready?
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
    </div>
  `;

  // ⭐ LEVEL UPGRADE AFTER BOTH PLAYERS
  let levelUp = false;

  for(let i=1;i<=2;i++){
    if(players[i].finishedLevel && players[i].level===1){
      players[i].level = 2;
      players[i].opened = [];
      players[i].finishedLevel = false;
      levelUp = true;
    }
  }

  chance++;

  if(chance > maxChance){
    setTimeout(declareWinner, 1500);
  } else {
    setTimeout(()=>{
      popup.style.display="none";  // ⭐ IMPORTANT
      nextTurn();                  // ⭐ ONLY HERE we go next
    },1500);
  }
}

// 🏆 WINNER
function declareWinner(){

  let p1Done = players[1].completed;
  let p2Done = players[2].completed;

  if(p1Done || p2Done){

    let winner;

    if(p1Done && !p2Done) winner = getGodName(players[1].name);
    else if(p2Done && !p1Done) winner = getGodName(players[2].name);
    else{
      winner = players[1].time < players[2].time
        ? getGodName(players[1].name)
        : getGodName(players[2].name);
    }

    winnerText.innerHTML = `<h1 class="win-text">${winner} Wins 🏆</h1>`;
    winSound.play();
    fireworks();

  } else {
    winnerText.innerHTML = `
      <div class="score-box">
        It was a great play. Try Again😍
      </div>
    `;
  }

  setTimeout(()=>{
    window.location.href="index.html";
  },3000);
}
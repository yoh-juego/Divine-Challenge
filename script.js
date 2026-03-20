let p1 = localStorage.getItem("player1God") || "Player 1";
let p2 = localStorage.getItem("player2God") || "Player 2";

const board = document.getElementById("board");
const timerText = document.getElementById("timer");
const turnText = document.getElementById("turn");
const popup = document.getElementById("popup");
const winnerText = document.getElementById("winnerText");
const heartsText = document.getElementById("hearts");

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

let players = {
  1: {name:p1, level:1, opened:[], score:0, prevLevel:1},
  2: {name:p2, level:1, opened:[], score:0, prevLevel:1}
};

let currentPlayer = 1;
let chance = 1;
let maxChance = 4;

let cards = [];
let first=null, second=null, lock=false;
let matched=0;

let timeLeft=30, timer;

/* START */
function startGame(){
  popup.style.display="none";
  startTurn(1);
}

/* HEARTS */
function updateHearts(){
  heartsText.innerText = "❤️".repeat(maxChance - chance + 1);
}

/* TURN */
function startTurn(player){
  currentPlayer = player;
  updateHearts();

  turnText.innerText = players[player].name + "'s Turn";

  setTimeout(()=>{
    loadCards();
    createBoard();
    startTimer();
  },1000);
}

/* LOAD */
function loadCards(){
  if(players[currentPlayer].level===1)
    cards = allPairs.slice(0,4).flat();
  else
    cards = allPairs.flat();

  if(players[currentPlayer].prevLevel !== players[currentPlayer].level){
    players[currentPlayer].opened = [];
    players[currentPlayer].prevLevel = players[currentPlayer].level;
  }
}

/* BOARD */
function createBoard(){
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

    if(players[currentPlayer].opened.includes(img)){
      card.classList.add("flipped","matched");
    } else {
      card.onclick=()=>flip(card,img);
    }

    board.appendChild(card);
  });

  matched = players[currentPlayer].opened.length/2;
}

/* TIMER */
function startTimer(){
  timeLeft=30;
  timerText.innerText="Time: "+timeLeft;

  clearInterval(timer);
  timer=setInterval(()=>{
    timeLeft--;
    timerText.innerText="Time: "+timeLeft;

    if(timeLeft<=0){
      clearInterval(timer);
      endTurn();
    }
  },1000);
}

/* FLIP */
function flip(card,img){
  if(lock || card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if(!first) first={card,img};
  else {
    second={card,img};
    checkMatch();
  }
}

/* MATCH */
function checkMatch(){
  let match = allPairs.some(p=>p.includes(first.img)&&p.includes(second.img));

  if(match){
    players[currentPlayer].opened.push(first.img,second.img);

    players[currentPlayer].score += (players[currentPlayer].level===1)?50:100;

    first.card.classList.add("matched");
    second.card.classList.add("matched");

    matched++;
    reset();

    /* 🔥 STOP TIMER + MOVE IMMEDIATELY */
    if(matched === cards.length/2){
      clearInterval(timer);
      players[currentPlayer].level = 2;

      setTimeout(()=>{
        endTurn();
      },500);
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

/* END TURN */
function endTurn(){
  if(currentPlayer===1){
    startTurn(2);
  } else {
    showScore();
  }
}

/* SCOREBOARD */
function showScore(){
  popup.style.display="flex";

  winnerText.innerHTML = `
    <div class="score-box">
      <h2>Scoreboard</h2>
      ${players[1].name}: ${players[1].score} pts<br><br>
      ${players[2].name}: ${players[2].score} pts
    </div>
  `;

  chance++;

  if(chance > maxChance){
    declareWinner();
  }
}

/* WINNER */
function declareWinner(){
  let winner="Tie";

  if(players[1].score > players[2].score) winner = players[1].name;
  else if(players[2].score > players[1].score) winner = players[2].name;

  winnerText.innerHTML = `<h1>${winner} Wins 🏆</h1>`;
}
// ===========================
// AQUA NEBULA TIC TAC TOE
// Part 1
// ===========================

const cells = document.querySelectorAll(".cell");
const status = document.getElementById("status");
const mode = document.getElementById("mode");

const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const draw = document.getElementById("draw");

const restart = document.getElementById("restart");
const reset = document.getElementById("reset");

const popup = document.getElementById("popup");
const winnerText = document.getElementById("winnerText");

const history = document.getElementById("history");

let board = ["","","","","","","","",""];
let current = "X";
let running = true;

let sx = Number(localStorage.getItem("sx")) || 0;
let so = Number(localStorage.getItem("so")) || 0;
let sd = Number(localStorage.getItem("sd")) || 0;

scoreX.textContent = sx;
scoreO.textContent = so;
draw.textContent = sd;

const wins = [
[0,1,2],
[3,4,5],
[6,7,8],
[0,3,6],
[1,4,7],
[2,5,8],
[0,4,8],
[2,4,6]
];

//=========================
// EVENTS
//=========================

cells.forEach(cell=>cell.addEventListener("click",clickCell));

restart.onclick = restartGame;

reset.onclick = resetScore;

//=========================
// CLICK
//=========================

function clickCell(){

const i=this.dataset.index;

if(board[i]!=="" || !running) return;

playMove(i,current);

checkWinner();

if(mode.value==="ai" && running){

setTimeout(aiMove,400);

}

}

//=========================
// PLAY MOVE
//=========================

function playMove(index,player){

board[index]=player;

cells[index].textContent=player;

cells[index].classList.add(player.toLowerCase());

const li=document.createElement("li");

li.textContent=`${player} → Cell ${Number(index)+1}`;

history.appendChild(li);

current=current==="X"?"O":"X";

status.textContent=`Player ${current} Turn`;

}

//=========================
// AI
//=========================

function aiMove(){

let empty=[];

board.forEach((v,i)=>{

if(v==="") empty.push(i);

});

if(empty.length===0) return;

let move=empty[Math.floor(Math.random()*empty.length)];

playMove(move,"O");

checkWinner();

}

//=========================
// WINNER
//=========================

function checkWinner(){

let winner=null;

for(let p of wins){

const[a,b,c]=p;

if(board[a] &&
board[a]===board[b] &&
board[a]===board[c]){

winner=board[a];

break;

}

}

if(winner){

running=false;

status.textContent=`${winner} Wins!`;

winnerText.textContent=`🏆 Player ${winner} Wins`;

popup.classList.add("show");

if(winner==="X"){

sx++;

scoreX.textContent=sx;

localStorage.setItem("sx",sx);

}else{

so++;

scoreO.textContent=so;

localStorage.setItem("so",so);

}

updateStats();

return;

}

if(!board.includes("")){

running=false;

status.textContent="Draw";

winnerText.textContent="🤝 Match Draw";

popup.classList.add("show");

sd++;

draw.textContent=sd;

localStorage.setItem("sd",sd);

updateStats();

}

}

//=========================
// RESTART
//=========================

function restartGame(){

board=["","","","","","","","",""];

current="X";

running=true;

status.textContent="Player X Turn";

history.innerHTML="";

popup.classList.remove("show");

cells.forEach(cell=>{

cell.textContent="";

cell.classList.remove("x","o");

});

}

//=========================
// RESET SCORE
//=========================

function resetScore(){

sx=0;

so=0;

sd=0;

scoreX.textContent=0;

scoreO.textContent=0;

draw.textContent=0;

localStorage.clear();

restartGame();

}

//=========================
// POPUP
//=========================

function closePopup(){

popup.classList.remove("show");

restartGame();

}//=========================
// PART 2
// Statistics + Smart AI +
// Undo + Confetti
//=========================

// Statistics
let games = Number(localStorage.getItem("games")) || 0;
let streak = Number(localStorage.getItem("streak")) || 0;

const gamesText = document.getElementById("games");
const rateText = document.getElementById("rate");
const streakText = document.getElementById("streak");

gamesText.textContent = games;
streakText.textContent = streak;

let moveStack = [];

// Save original playMove
const oldPlayMove = playMove;

playMove = function(index, player){

    moveStack.push({
        index,
        player
    });

    oldPlayMove(index, player);

};

//=========================
// SMART AI
//=========================

function aiMove(){

    // Try Winning
    for(let p of wins){

        let m=findMove(p,"O");

        if(m!=-1){

            playMove(m,"O");
            checkWinner();
            return;

        }

    }

    // Block Player
    for(let p of wins){

        let m=findMove(p,"X");

        if(m!=-1){

            playMove(m,"O");
            checkWinner();
            return;

        }

    }

    // Take Center
    if(board[4]==""){

        playMove(4,"O");
        checkWinner();
        return;

    }

    // Random
    let empty=[];

    board.forEach((v,i)=>{

        if(v=="") empty.push(i);

    });

    if(empty.length){

        let r=empty[Math.floor(Math.random()*empty.length)];

        playMove(r,"O");

        checkWinner();

    }

}

function findMove(pattern,player){

    let values=pattern.map(i=>board[i]);

    if(values.filter(x=>x===player).length===2 &&
       values.includes("")){

       return pattern[values.indexOf("")];

    }

    return -1;

}

//=========================
// UPDATE STATS
//=========================

function updateStats(){

    games = sx + so + sd;

    gamesText.textContent = games;

    localStorage.setItem("games",games);

    let rate=0;

    if(games>0){

        rate=Math.round((sx/games)*100);

    }

    rateText.textContent=rate+"%";

    if(sx>so){

        streak++;

    }else{

        streak=0;

    }

    streakText.textContent=streak;

    localStorage.setItem("streak",streak);

}

//=========================
// UNDO
//=========================

document.addEventListener("keydown",e=>{

    if(e.key==="u") undoMove();

});

function undoMove(){

    if(mode.value==="ai") return;

    if(moveStack.length===0) return;

    let last=moveStack.pop();

    board[last.index]="";

    cells[last.index].textContent="";

    cells[last.index].classList.remove("x","o");

    history.removeChild(history.lastChild);

    current=last.player;

    status.textContent="Player "+current+" Turn";

    running=true;

}

//=========================
// WINNER HIGHLIGHT
//=========================

const oldCheck = checkWinner;

checkWinner=function(){

    oldCheck();

    for(let p of wins){

        let[a,b,c]=p;

        if(board[a] &&
        board[a]==board[b] &&
        board[a]==board[c]){

            [a,b,c].forEach(i=>{

                cells[i].style.background="#58C9F3";

                cells[i].style.color="#061826";

                cells[i].style.transform="scale(1.08)";

            });

            confetti();

        }

    }

};

//=========================
// CONFETTI
//=========================

function confetti(){

    const area=document.getElementById("confetti");

    area.innerHTML="";

    const colors=[
        "#58C9F3",
        "#BDE5FF",
        "#2FA0C6",
        "#ffffff"
    ];

    for(let i=0;i<80;i++){

        let c=document.createElement("div");

        c.style.position="absolute";

        c.style.left=Math.random()*100+"%";

        c.style.top="-20px";

        c.style.width="8px";

        c.style.height="8px";

        c.style.borderRadius="50%";

        c.style.background=
        colors[Math.floor(Math.random()*colors.length)];

        c.style.animation=
        `fall ${2+Math.random()*2}s linear`;

        area.appendChild(c);

    }

    setTimeout(()=>{

        area.innerHTML="";

    },4000);

}

//=========================
// CLOSE POPUP
//=========================

window.closePopup = function(){

    popup.classList.remove("show");

    restartGame();

};

updateStats();
const players = [];

function Player(name, mark, isComputer) {
  this.name = name;
  this.mark = mark;
  this.isComputer = isComputer ? true : false;
  const getMark = () => this.mark;
  const getName = () => this.name;
  return { getName, getMark, isComputer };
}

const pubSub = (function () {
  let events = {};

  function subscribe(event, fn) {
    events[event] ? events[event].push(fn) : (events[event] = [fn]);
  }
  function unSubscribe(event, fn) {
    if (events[event]) {
      events[event] = events[event].filter((func) => func !== fn);
    }
  }
  function publish(event, data) {
    if (events[event]) events[event].forEach((fn) => fn(data));
  }

  return { subscribe, unSubscribe, publish };
})();

const GameBoard = (function () {
  let gameBoard;
  resetBoard();

  const getBoard = () => gameBoard;
  function setBoard(obj) {
    gameBoard[obj.index] = obj.mark;
    pubSub.publish("gameBoardChanged");
  }
  function resetBoard() {
    gameBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  }
  function getEmptyCells(board) {
    const empltycells = [];

    for (let i = 0; i < board.length; i++) {
      if (!board[i] || typeof board[i] === "number") empltycells.push(i);
    }

    return empltycells;
  }
  function checkStatus(mark, board) {
    if (board === undefined) board = getBoard();
    if (
      (board[0] === board[1] && board[1] === board[2] && board[0] === mark) ||
      (board[3] === board[4] && board[4] === board[5] && board[3] === mark) ||
      (board[6] === board[7] && board[7] === board[8] && board[6] === mark) ||
      (board[0] === board[3] && board[3] === board[6] && board[0] === mark) ||
      (board[1] === board[4] && board[4] === board[7] && board[1] === mark) ||
      (board[2] === board[5] && board[5] === board[8] && board[2] === mark) ||
      (board[0] === board[4] && board[4] === board[8] && board[0] === mark) ||
      (board[2] === board[4] && board[4] === board[6] && board[2] === mark)
    ) {
      return true;
    } else {
      return false;
    }
  }
  function checkGameOver(obj) {
    if (checkStatus("x")) {
      pubSub.publish("gameOver", "x");
    } else if (checkStatus("o")) {
      pubSub.publish("gameOver", "o");
    }
    if (obj.totalTurnsPlayed === 9) {
      pubSub.publish("gameOver", "tie");
    }
  }

  pubSub.subscribe("roundPlayed", setBoard);
  pubSub.subscribe("roundPlayed", checkGameOver);
  pubSub.subscribe("gameOver", resetBoard);
  return { getBoard, checkStatus, getEmptyCells };
})();

const turnsControl = (function () {
  pubSub.subscribe("computerPlayed", playComputerRound);
  let totalTurnsPlayed = 0;

  function playRound(e) {
    if (!e.target.getAttribute("data-value")) {
      const index = e.target.getAttribute("data-cell");
      const mark = totalTurnsPlayed % 2 === 0 ? "x" : "o";
      totalTurnsPlayed++;
      pubSub.publish("roundPlayed", { mark, index, totalTurnsPlayed });
    }
  }
  function playComputerRound(obj) {
    const index = obj.index;
    const mark = obj.mark;
    totalTurnsPlayed++;
    pubSub.publish("roundPlayed", { mark, index, totalTurnsPlayed });
  }
  return { playRound };
})();

const displayController = (function () {
  // Cache DOM
  const gameStart = document.getElementById("game-start"),
    gameMain = document.getElementById("game-main"),
    gameOver = document.getElementById("game-over"),
    submitBtn = document.getElementById("submit-btn"),
    roundSatus = document.getElementById("round-status"),
    pages = [gameStart, gameMain, gameOver],
    statusMessage = gameOver.querySelector("p"),
    inputs = gameStart.querySelectorAll("input"),
    boardDisplay = gameMain.querySelectorAll("span"),
    cells = gameMain.querySelectorAll("span"),
    reloadBtn = gameOver.querySelector("button");

  // Bind events
  submitBtn.onclick = submit;
  cells.forEach((cell) => (cell.onclick = turnsControl.playRound));
  reloadBtn.onclick = () => location.reload();

  pubSub.subscribe("playersFormSubmitted", changeToGameMain);
  pubSub.subscribe("playersFormSubmitted", updateTurnStatus);
  pubSub.subscribe("gameBoardChanged", refreshBoardDisplay);
  pubSub.subscribe("roundPlayed", updateTurnStatus);
  pubSub.subscribe("gameOver", displayStatus);
  pubSub.subscribe("gameOver", changeToGameOver);

  function clearForm() {
    inputs.forEach((elem) => {
      if (elem.type === "radio") {
        elem.checked = false;
      } else {
        elem.value = "";
      }
    });
  }
  function getFormData() {
    return Object.fromEntries(new FormData(gameStart.querySelector("form")));
  }
  function updateBoardDisplay() {
    let board = GameBoard.getBoard();
    for (let i = 0; i < board.length; i++) {
      boardDisplay[i].textContent = board[i];
    }
  }
  function changeToGameMain() {
    clearForm();
    clearPage();
    gameMain.classList.add("active");
  }
  function changeToGameOver() {
    clearPage();
    gameOver.classList.add("active");
  }
  function clearPage() {
    pages.forEach((page) => {
      if (page.classList.contains("active")) {
        page.classList.remove("active");
      }
    });
  }
  function refreshBoardDisplay() {
    const data = GameBoard.getBoard();
    for (let i = 0; i < cells.length; i++) {
      if (typeof data[i] !== "number") {
        cells[i].textContent = data[i];
        cells[i].setAttribute("data-value", data[i]);
      }
    }
  }
  function updateTurnStatus(obj) {
    if (obj === undefined) {
      obj = { mark: "x" };
      roundSatus.textContent = `${
        players[0].getMark() === obj.mark
          ? players[0].getName()
          : players[1].getName()
      }'s turn`;
    } else {
      roundSatus.textContent = `${
        players[0].getMark() === obj.mark
          ? players[1].getName()
          : players[0].getName()
      }'s turn`;
    }
  }
  function displayStatus(str) {
    if (str !== "tie") {
      statusMessage.textContent = `${
        players[0].getMark() === str
          ? players[0].getName()
          : players[1].getName()
      } won!`;
    } else {
      statusMessage.textContent = "Tie!";
    }
  }
  return { updateBoardDisplay, clearForm, getFormData };
})();

function submit() {
  let isValid;
  let data = displayController.getFormData();

  //Validate data
  if (
    data["name1"] &&
    (data["X/O"] === "x" || data["X/O"] === "o") &&
    data["name2"] &&
    data["type"]
  )
    isValid = true;

  // Initiallize players
  if (isValid) {
    players[0] = new Player(data["name1"], data["X/O"]);
    players[1] = new Player(
      data["name2"],
      data["X/O"] === "x" ? "o" : "x",
      data["type"] === "computer" ? true : false
    );
    pubSub.publish("playersFormSubmitted");
  } else {
    alert("Fill in the fields correctly!");
  }
}

// minimax algorithm modified for compatibiliy
function minimax(currBoard, currMark) {
  const availableAreas = GameBoard.getEmptyCells(currBoard),
    computerMark = players[1].getMark(),
    humanMark = players[0].getMark();

  // Check for terminal states
  if (GameBoard.checkStatus(humanMark, currBoard)) {
    return { score: -1 };
  } else if (GameBoard.checkStatus(computerMark, currBoard)) {
    return { score: 1 };
  } else if (!availableAreas.length) {
    return { score: 0 };
  }

  const allTestPlaysInfos = [];
  for (let i = 0; i < availableAreas.length; i++) {
    const currTestInfo = {};
    currTestInfo.index = availableAreas[i];
    currBoard[availableAreas[i]] = currMark;

    if (currMark === computerMark) {
      currTestInfo.score = minimax(currBoard, humanMark).score;
    } else {
      currTestInfo.score = minimax(currBoard, computerMark).score;
    }

    currBoard[availableAreas[i]] = currTestInfo.index;
    allTestPlaysInfos.push(currTestInfo);
  }

  let bestTestPlay = null;
  if (currMark === computerMark) {
    let bestScore = -Infinity;
    for (let i = 0; i < allTestPlaysInfos.length; i++) {
      if (allTestPlaysInfos[i].score > bestScore) {
        bestScore = allTestPlaysInfos[i].score;
        bestTestPlay = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < allTestPlaysInfos.length; i++) {
      if (allTestPlaysInfos[i].score < bestScore) {
        bestScore = allTestPlaysInfos[i].score;
        bestTestPlay = i;
      }
    }
  }

  return allTestPlaysInfos[bestTestPlay];
}

const computerPlayer = (function () {
  pubSub.subscribe("playersFormSubmitted", setSelf);
  pubSub.subscribe("roundPlayed", checkTurn);
  pubSub.subscribe("gameOver", end);
  let mark, isComputer;

  function setSelf() {
    mark = players[1].getMark();
    isComputer = players[1].isComputer;
    if (mark === "x" && isComputer) play();
    if (!isComputer) end();
  }
  function checkTurn(obj) {
    if (
      (obj.totalTurnsPlayed % 2 === 0 && mark === "x") ||
      (obj.totalTurnsPlayed % 2 !== 0 && mark === "o")
    ) {
      play();
    }
  }
  function end() {
    pubSub.unSubscribe("roundPlayed", checkTurn);
  }
  function play() {
    const index = minimax(GameBoard.getBoard(), mark).index;
    pubSub.publish("computerPlayed", { mark, index });
  }
})();

const players = [];

function Player(name, char, isComputer) {
  this.name = name;
  this.char = char;
  this.isComputer = isComputer ? true : false;
  const getChar = () => this.char;
  const getName = () => this.name;
  return { getName, getChar };
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
    gameBoard[obj.index] = obj.char;
    pubSub.publish("gameBoardChanged");
  }
  function resetBoard() {
    gameBoard = ["", "", "", "", "", "", "", "", ""];
  }

  pubSub.subscribe("roundPlayed", setBoard);
  pubSub.subscribe("gameOver", resetBoard);
  return { getBoard };
})();

const turnsControl = (function () {
  let totalTurnsPlayed = 0;

  function playRound(e) {
    if (!e.target.getAttribute("data-value")) {
      const index = e.target.getAttribute("data-cell");
      const char = totalTurnsPlayed % 2 === 0 ? "x" : "o";
      pubSub.publish("roundPlayed", { char, index });
      totalTurnsPlayed++;
      checkStatus();
    }
  }
  function checkStatus() {
    const board = GameBoard.getBoard();
    if (
      (board[0] === board[1] && board[1] === board[2] && board[0] === "x") ||
      (board[3] === board[4] && board[4] === board[5] && board[3] === "x") ||
      (board[6] === board[7] && board[7] === board[8] && board[6] === "x") ||
      (board[0] === board[3] && board[3] === board[6] && board[0] === "x") ||
      (board[1] === board[4] && board[4] === board[7] && board[1] === "x") ||
      (board[2] === board[5] && board[5] === board[8] && board[2] === "x") ||
      (board[0] === board[4] && board[4] === board[8] && board[0] === "x") ||
      (board[2] === board[4] && board[4] === board[6] && board[2] === "x")
    ) {
      pubSub.publish("gameOver", "x");
    } else if (
      (board[0] === board[1] && board[1] === board[2] && board[0] === "o") ||
      (board[3] === board[4] && board[4] === board[5] && board[3] === "o") ||
      (board[6] === board[7] && board[7] === board[8] && board[6] === "o") ||
      (board[0] === board[3] && board[3] === board[6] && board[0] === "o") ||
      (board[1] === board[4] && board[4] === board[7] && board[1] === "o") ||
      (board[2] === board[5] && board[5] === board[8] && board[2] === "o") ||
      (board[0] === board[4] && board[4] === board[8] && board[0] === "o") ||
      (board[2] === board[4] && board[4] === board[6] && board[2] === "o")
    ) {
      pubSub.publish("gameOver", "o");
    } else if (totalTurnsPlayed === 9) {
      pubSub.publish("gameOver", "tie");
    }
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
      cells[i].textContent = data[i];
      cells[i].setAttribute("data-value", data[i]);
    }
  }
  function updateTurnStatus(obj) {
    if (obj === undefined) {
      obj = { char: "x" };
      roundSatus.textContent = `${
        players[0].getChar() === obj.char
          ? players[0].getName()
          : players[1].getName()
      }'s turn`;
    } else {
      roundSatus.textContent = `${
        players[0].getChar() === obj.char
          ? players[1].getName()
          : players[0].getName()
      }'s turn`;
    }
  }
  function displayStatus(str) {
    if (str !== "tie") {
      statusMessage.textContent = `${
        players[0].getChar() === str
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

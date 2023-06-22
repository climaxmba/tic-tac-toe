let player1, player2;

function Player(name, char, index, isComputer) {
    this.name = name;
    this.char = char;
    this.isComputer = (isComputer)? true : false;
    let points = 0;
    const getName = () => this.name;
    const incrementPoints = () => {
        points++;
        pubSub.publish('playerPointChanged', {index, points});
    }
    return {getName, incrementPoints, index};
}

const GameBoard = (function() {
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    const getBoard = () => gameBoard;
    const setBoard = (index, value) => {
        gameBoard[index] = value;
        pubSub.publish('gameBoardChanged');
    };
    return {setBoard, getBoard};
})()

const pubSub = (function() {
    let events = {};

    function subscribe(event, fn) {
        events[event]? events[event].push(fn) : events[event] = [fn];
    }
    function unSubscribe(event, fn) {
        if (events[event]) {
            events[event] = events[event].filter(func => func !== fn);
        }
    }
    function publish(event, data) {
        if (events[event]) events[event].forEach(fn => fn(data));
    }

    return {subscribe, unSubscribe, publish};
})()

const displayController = (function() {
    let gameStart = document.getElementById("game-start"),
      gameMain = document.getElementById("game-main"),
      gameOver = document.getElementById("game-over"),
      pages = [gameStart, gameMain, gameOver],
      submitBtn = document.getElementById("submit-btn"),
      inputs = gameStart.querySelectorAll("input"),
      boardDisplay = gameMain.querySelectorAll("span"),
      cells = gameMain.querySelectorAll('span');

    pubSub.subscribe("playersFormSubmitted", changeToGameMain);
    pubSub.subscribe('gameBoardChanged', refreshBoardDisplay);

    function clearForm() {
        inputs.forEach(elem => {
            if (elem.type === 'radio') {
                elem.checked = false;
            } else {
                elem.value = '';
            }
        })
    }
    function bindEvents() {
        submitBtn.onclick = submit;
        cells.forEach(cell => cell.onclick = playRound);
    }
    function getFormData() {
        return Object.fromEntries(new FormData(gameStart.querySelector('form')));
    }
    function updateBoardDisplay() {
        let board = GameBoard.getBoard();
        for (let i = 0; i < board.length; i++) {
            boardDisplay[i].textContent = board[i];
        }
    }
    function changeToGameMain() {
        clearForm();
        pages.forEach(page => {
            if (page.classList.contains('active')) {
                page.classList.remove('active');
            }
        })
        gameMain.classList.add('active');
    }
    function refreshBoardDisplay() {
        const data = GameBoard.getBoard();
        for (let i = 0; i < cells.length; i++) {
            cells[i].textContent = data[i];
            cells[i].setAttribute('data-value', data[i]);
        }
    }
    return {updateBoardDisplay, clearForm, bindEvents, getFormData};
})()

const main = (function() {
  displayController.bindEvents();
})()

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
    player1 = new Player(data["name1"], data["X/O"], 1);
    player2 = new Player(
      data["name2"],
      data["X/O"] === "x" ? "o" : "x",
      2,
      data["type"] === "computer" ? true : false
    );
    pubSub.publish('playersFormSubmitted');
  } else {
    alert("Fill in the fields correctly!");
  }
}
function playRound(e) {
  if (!e.target.getAttribute("data-value")) {
    const index = e.target.getAttribute("data-cell");
    GameBoard.setBoard(index, "x");
  }
}
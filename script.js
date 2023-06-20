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
    };
    return {setBoard, getBoard};
})()

const displayController = (function() {
    let gameStart, gameMain, gameOver, submitBtn, inputs, boardDisplay;

    function cacheDom() {
        gameStart = document.getElementById('game-start');
        gameMain = document.getElementById('game-main');
        gameOver = document.getElementById('game-over');
        submitBtn = document.getElementById('submit-btn');
        inputs = gameStart.querySelectorAll('input');
        boardDisplay = gameMain.querySelectorAll('span');
    }
    function clearForm() {
        inputs.forEach(elem => {
            if (elem.type === 'radio') {
                elem.checked = false;
            } else {
                elem.value = '';
            }
        })
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
    return {updateBoardDisplay, cacheDom, clearForm, getFormData};
})()

function main() {
    let player1, player2;
    displayController.cacheDom();
    displayController.clearForm();

    bindEvents();

    function bindEvents() {
        submitBtn.addEventListener('click', savePlayers)
    }
    function savePlayers() {
        let isValid;
        let data = displayController.getFormData();

        //Validate data
        if (
          data["name1"] &&
          (data["X/O"] === "x" || data["X/O"] === "o") &&
          data["name2"] &&
          data["type"]
        ) {
          isValid = true;
        }

        if (isValid) {
          player1 = new Player(data['name1'], data['X/O'], 1);
          player2 = new Player(
            data['name2'],
            data['X/O'] === "x" ? "o" : "x",
            2,
            data['type'] === "computer" ? true : false
          );
        } else {
            alert('Fill in the fields correctly!');
        }
    }
    return;
}

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

function Player(name) {
    this.name = name;
    this.points = 0;
    const setName = name => this.name = name;
    const incrementPoints = () => points++;
    return {setName, incrementPoints};
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
    function updateBoardDisplay() {
        let board = GameBoard.getBoard();
        for (let i = 0; i < board.length; i++) {
            boardDisplay[i].textContent = board[i];
        }
    }
    function bindEvents() {
        // Add events;
    }
    return {updateBoardDisplay, cacheDom, bindEvents};
})()

function main() {
    displayController.cacheDom()
    // Display home
    // Bind events
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

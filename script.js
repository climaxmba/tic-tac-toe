function Player(name) {
    this.name = name;
    this.points = 0;
    const setName = name => this.name = name;
    const incrementPoints = () => points++;
    return {setName, incrementPoints};
}

const GameBoard = (function() {
    let gameBoard = [null, null, null, null, null, null, null, null, null];
    const getGameBoard = () => gameBoard;
    const setGameBoard = (index, value) => {
        gameBoard[index] = value;
    };
    return {setGameBoard, getGameBoard};
})()

const displayController = (function() {
    // Select DOM objects

    function updateDisplay() {
        // GameBoard.getGameBoard()

    }
    return {updateDisplay};
})()

function main() {
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

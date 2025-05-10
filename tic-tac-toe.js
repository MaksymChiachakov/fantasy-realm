(function () {
    const gameBoard = document.getElementById('gameBoard');
    const resultMessage = document.getElementById('resultMessage');
    const restartButton = document.getElementById('restartButton');
    const strikeLine = document.getElementById('strikeLine');
    const gameModal = document.getElementById('gameModal');
    const modalMessage = document.getElementById('modalMessage');
    const startBtn = document.getElementById('startBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeBtn = document.getElementById('closeBtn');
    const backButton = document.getElementById('backButton');

    let board = Array(9).fill(null);
    let userRace = 'Orcs';
    let opponentRace = 'Elves';
    let userSymbol = 'X';
    let opponentSymbol = 'O';
    let isGameOver = false;
    let currentScreen = 'welcome';
    let scores = JSON.parse(localStorage.getItem("tictactoeScores")) || {
        Elves: 0,
        Orcs: 0,
        Dragons: 0,
        Dwarves: 0
    };

    let cellRects = [];
    const winningLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function updateScoreDisplay() {
        document.getElementById('score-elves').textContent = `Elves: ${scores.Elves}`;
        document.getElementById('score-orcs').textContent = `Orcs: ${scores.Orcs}`;
        document.getElementById('score-dragons').textContent = `Dragons: ${scores.Dragons}`;
        document.getElementById('score-dwarves').textContent = `Dwarves: ${scores.Dwarves}`;
    }

    function updateCellRects() {
        setTimeout(() => {
            cellRects = Array.from(gameBoard.children).map(cell => {
                const rect = cell.getBoundingClientRect();
                const parentRect = gameBoard.getBoundingClientRect();
                return {
                    left: rect.left - parentRect.left + rect.width / 2,
                    top: rect.top - parentRect.top + rect.height / 2
                };
            });
        }, 100);
    }

    function fullResetGame() {
        board.fill(null);
        clearStrikeLine();
        resultMessage.textContent = '';
        gameBoard.innerHTML = '';
        isGameOver = false;
    }

    function showCharacterSelection() {
        document.getElementById('characterSection').style.display = 'flex';
        document.getElementById('characterSection').style.animation = 'none';
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('characterDetail').style.display = 'none';
        currentScreen = 'characters';
        void document.getElementById('characterSection').offsetHeight;
    }

    function hideModal() {
        gameModal.style.display = 'none';
    }

    function createBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('role', 'button');
            cell.setAttribute('aria-label', `Cell ${i + 1}`);
            cell.setAttribute('tabindex', '0');
            cell.dataset.index = i;
            cell.addEventListener('click', onCellClick);
            cell.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCellClick(e);
                }
            });
            gameBoard.appendChild(cell);
        }
        updateCellRects(); // оновлення позицій після створення
    }

    function startGame() {
        fullResetGame();
        document.getElementById('gameScreen').style.display = 'flex';
        document.getElementById('characterSection').style.display = 'none';
        document.getElementById('characterDetail').style.display = 'none';
        currentScreen = 'game';

        setTimeout(() => {
            createBoard();
            renderBoard();

            setTimeout(() => {
                gameBoard.style.opacity = '1';
                gameBoard.style.transform = 'translateX(0)';
                updateCellRects(); // ще раз на випадок завершення анімації
            }, 100);
        }, 10);
    }

    function onCellClick(event) {
        if (isGameOver) return;
        const index = event.currentTarget.dataset.index;
        if (board[index] !== null) return;
        playerMove(index);
    }

    function playerMove(index) {
        board[index] = userSymbol;
        renderBoard();
        if (checkWin(userSymbol)) {
            finishGame(userRace, getWinningCells(userSymbol));
            return;
        }
        if (board.every(cell => cell !== null)) {
            finishGame(null, []);
            return;
        }

        isGameOver = true;
        setTimeout(() => {
            computerMove();
            isGameOver = false;
        }, 500);
    }

    function computerMove() {
        const freeIndices = board.reduce((acc, val, idx) => val === null ? acc.concat(idx) : acc, []);
        if (freeIndices.length === 0) return;
        const randomIndex = freeIndices[Math.floor(Math.random() * freeIndices.length)];
        board[randomIndex] = opponentSymbol;
        renderBoard();
        if (checkWin(opponentSymbol)) {
            finishGame(opponentRace, getWinningCells(opponentSymbol));
            return;
        }
        if (board.every(cell => cell !== null)) {
            finishGame(null, []);
            return;
        }
    }

    function renderBoard() {
        board.forEach((val, idx) => {
            const cell = gameBoard.children[idx];
            cell.textContent = val === null ? '' : val;
            cell.classList.toggle('occupied', val !== null);
            cell.classList.toggle('opponent', val === opponentSymbol);
            cell.style.color = val === userSymbol ? 'var(--user-color)' : 'var(--opponent-color)';
        });
    }

    function checkWin(symbol) {
        return winningLines.some(combo => combo.every(idx => board[idx] === symbol));
    }

    function getWinningCells(symbol) {
        return winningLines.find(combo => combo.every(idx => board[idx] === symbol));
    }

    function finishGame(winnerRace, winningCells) {
        isGameOver = true;
        if (winningCells && winningCells.length === 3) {
            drawStrikeLine(winningCells);
        }

        if (winnerRace) {
            scores[winnerRace] = (scores[winnerRace] || 0) + 1;
            localStorage.setItem("tictactoeScores", JSON.stringify(scores));
            updateScoreDisplay();
            modalMessage.textContent = `${winnerRace} win!`;
        } else {
            modalMessage.textContent = "It's a draw!";
        }

        gameModal.style.display = 'flex';
    }

    function drawStrikeLine(cells) {
        if (!cells || cells.length !== 3) return;

        // Дочекаймося, поки DOM точно відображений
        requestAnimationFrame(() => {
            const [a, , c] = cells;

            const cellA = document.getElementById(`cell-${a}`);
            const cellC = document.getElementById(`cell-${c}`);

            if (!cellA || !cellC) return;

            const rectA = cellA.getBoundingClientRect();
            const rectC = cellC.getBoundingClientRect();

            // Якщо SVG має інше позиціювання, потрібно врахувати зсув контейнера
            const board = document.querySelector('.board'); // або твій реальний контейнер
            const boardRect = board.getBoundingClientRect();

            // Вираховуємо координати відносно контейнера
            const x1 = rectA.left + rectA.width / 2 - boardRect.left;
            const y1 = rectA.top + rectA.height / 2 - boardRect.top;
            const x2 = rectC.left + rectC.width / 2 - boardRect.left;
            const y2 = rectC.top + rectC.height / 2 - boardRect.top;

            // Малюємо лінію
            const strikeLine = document.getElementById('strike-line'); // переконайся в id
            strikeLine.setAttribute('x1', x1);
            strikeLine.setAttribute('y1', y1);
            strikeLine.setAttribute('x2', x2);
            strikeLine.setAttribute('y2', y2);
            strikeLine.style.opacity = '1';
        });
    }


    function clearStrikeLine() {
        strikeLine.style.opacity = '0';
    }

    restartButton.addEventListener('click', () => {
        hideModal();
        startGame();
    });

    backButton.addEventListener('click', () => {
        fullResetGame();
        hideModal();
        document.getElementById('gameScreen').style.opacity = '0';
        document.getElementById('gameScreen').style.transform = 'translateX(-100%)';
        setTimeout(() => {
            showCharacterSelection();
            document.getElementById('characterSection').style.opacity = '1';
        }, 300);
    });

    startBtn.addEventListener('click', () => {
        document.getElementById('characterDetail').style.opacity = '0';
        document.getElementById('characterDetail').style.transform = 'translateY(100%)';
        setTimeout(() => {
            startGame();
            document.getElementById('gameScreen').style.opacity = '0';
            document.getElementById('gameScreen').style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.getElementById('gameScreen').style.opacity = '1';
                document.getElementById('gameScreen').style.transform = 'translateX(0)';
            }, 10);
        }, 300);
    });

    cancelBtn.addEventListener('click', () => {
        document.getElementById('characterDetail').style.display = 'none';
        showCharacterSelection();
    });

    closeBtn.addEventListener('click', () => {
        document.getElementById('characterDetail').style.display = 'none';
        showCharacterSelection();
    });

    gameModal.addEventListener('click', (e) => {
        if (e.target === gameModal) {
            hideModal();
        }
    });

    fullResetGame();

    window.addEventListener('load', () => {
        setTimeout(() => {
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.style.transform = 'none';
                gameContainer.style.opacity = '1';
            }
        }, 100);
    });

    updateScoreDisplay();
})();

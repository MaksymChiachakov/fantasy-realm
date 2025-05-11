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
    const currentTurnElement = document.createElement('div');
    const originalTurnTime = 30000;
    let TURN_TIME = originalTurnTime;

    let turnTimer;
    let userRaceId = null;
    let board = Array(9).fill(null);
    let userRace;
    let opponentRace;
    let userSymbol = 'X';
    let opponentSymbol = 'O';
    let isGameOver = false;
    let victorySound = null;
    let currentScreen = 'welcome';
    let scores = JSON.parse(localStorage.getItem("tictactoeScores")) || {
        Elves: 0,
        Orcs: 0,
        Dragons: 0,
        Dwarves: 0
    };

    // Змінні для спеціальних здібностей
    let moveCount = 0;
    let isBlockMode = false;
    let playerBlockUsed = false;
    let computerAbilities = {};
    let abilityInfoElement, abilityCooldownElement, abilityTimerElement;

    const characters = {
        'ork': { abilities: { speedBonus: 0.1 } },
        'elf': { abilities: { canBlock: true, blockCooldown: 2 } },
        'dragon': { abilities: { doubleMove: true, doubleMoveEvery: 3 } },
        'gnome': { abilities: { defenseBonus: 0.15 } }
    };

    let cellRects = [];
    const winningLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function setupAbilityUI() {
        // Створення індикатора ходу
        currentTurnElement.id = 'currentTurn';
        currentTurnElement.className = 'turn-indicator';
        // currentTurnElement.textContent = `Хід: Гравець (${userSymbol})`;

        abilityInfoElement = document.createElement('div');
        abilityInfoElement.id = 'abilityInfo';
        abilityInfoElement.className = 'ability-info';

        abilityCooldownElement = document.createElement('div');
        abilityCooldownElement.id = 'abilityCooldown';
        abilityCooldownElement.className = 'ability-cooldown';

        abilityTimerElement = document.createElement('div');
        abilityTimerElement.id = 'abilityTimer';
        abilityTimerElement.className = 'ability-timer';

        const abilitiesContainer = document.createElement('div');
        abilitiesContainer.id = 'abilitiesContainer';
        abilitiesContainer.className = 'abilities-container';
        abilitiesContainer.appendChild(currentTurnElement); // Додано індикатор ходу
        abilitiesContainer.appendChild(abilityInfoElement);
        abilitiesContainer.appendChild(abilityCooldownElement);
        abilitiesContainer.appendChild(abilityTimerElement);

        document.querySelector('.game-container').appendChild(abilitiesContainer);
    }

    function updateTurnIndicator(isPlayerTurn) {
        // const text = isPlayerTurn
        //     ? `Хід: Гравець (${userSymbol})`
        //     : `Хід: Комп'ютер (${opponentSymbol})`;

        currentTurnElement.style.transform = 'scale(0.9)';
        currentTurnElement.style.opacity = '0.7';

        setTimeout(() => {
            currentTurnElement.textContent = text;
            currentTurnElement.style.transform = 'scale(1)';
            currentTurnElement.style.opacity = '1';
        }, 150);
    }

    function updateAbilityUI(characterId) {
        const character = characters[characterId];
        if (!character) return;

        let abilityText = '';
        let cooldownText = '';
        let showBlockButton = false;

        const displayMove = moveCount + 1;

        if (character.abilities.canBlock) {
            const blocksUntilAvailable = (2 - (displayMove % 2)) % 2;
            abilityText = blocksUntilAvailable === 0 ? 'Можна блокувати зараз!' : `До блокування: ${blocksUntilAvailable} ходів`;
            showBlockButton = (displayMove % 2 === 0) && !playerBlockUsed;
        } else if (character.abilities.doubleMove) {
            const movesUntilAvailable = (3 - (displayMove % 3)) % 3;
            abilityText = movesUntilAvailable === 0 ? 'Можна ходити двічі!' : `До подвійного ходу: ${movesUntilAvailable} ходів`;
        } else if (character.abilities.speedBonus) {
            abilityText = 'Ваші ходи швидші!';
            cooldownText = `Час на хід: ${TURN_TIME / 1000} сек`;
        } else if (character.abilities.defenseBonus) {
            abilityText = 'Ви отримуєте бонус до захисту!';
            cooldownText = 'Зменшує шкоду від атак';
        }

        abilityInfoElement.textContent = abilityText;
        abilityCooldownElement.textContent = cooldownText;
        abilityTimerElement.textContent = `Хід №${displayMove}`;

        if (document.getElementById('blockBtn')) {
            document.getElementById('blockBtn').style.display = showBlockButton ? 'block' : 'none';
        }
    }

    function updateScoreDisplay() {
        document.getElementById('score-elves').textContent = `Elves: ${scores.Elves}`;
        document.getElementById('score-orcs').textContent = `Orcs: ${scores.Orcs}`;
        document.getElementById('score-dragons').textContent = `Dragons: ${scores.Dragons}`;
        document.getElementById('score-dwarves').textContent = `Dwarves: ${scores.Dwarves}`;
    }

    function startTurnTimer(isPlayerTurn) {
        clearTimeout(turnTimer);
        // updateTurnIndicator(isPlayerTurn); 

        const timerId = isPlayerTurn ? 'playerTimer' : 'enemyTimer';
        const timerElement = document.getElementById(timerId);
        const progressElement = timerElement.querySelector('.timer-progress');

        timerElement.classList.remove('active', 'danger');
        progressElement.style.width = '100%';

        if (isPlayerTurn) timerElement.classList.add('active');

        let timeLeft = TURN_TIME;
        const interval = 50;

        const timerInterval = setInterval(() => {
            timeLeft -= interval;
            const percent = (timeLeft / TURN_TIME) * 100;
            progressElement.style.width = `${percent}%`;

            if (percent < 20) timerElement.classList.add('danger');
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleTimeOut(isPlayerTurn);
            }
        }, interval);

        turnTimer = timerInterval;
    }

    function handleTimeOut(isPlayerTurn) {
        finishGame(isPlayerTurn ? opponentRace : userRace, []);
    }

    function applyRaceAbilities(characterId) {
        const playerChar = characters[characterId];
        const opponentId = getOpponentId(characterId);
        computerAbilities = characters[opponentId].abilities;

        if (playerChar.abilities.speedBonus) {
            TURN_TIME = Math.floor(originalTurnTime * (1 - playerChar.abilities.speedBonus));
        } else if (playerChar.abilities.speedPenalty) {
            TURN_TIME = Math.floor(originalTurnTime * (1 + playerChar.abilities.speedPenalty));
        }

        if (playerChar.abilities.canBlock) {
            setupBlockAbility();
        }

        updateAbilityUI(characterId);
    }

    function getOpponentId(characterId) {
        const opponents = {
            'ork': 'elf',
            'elf': 'ork',
            'dragon': 'gnome',
            'gnome': 'dragon'
        };
        return opponents[characterId] || 'ork';
    }

    function setupBlockAbility() {
        const blockBtn = document.getElementById('blockBtn') || document.createElement('button');
        blockBtn.id = 'blockBtn';
        blockBtn.textContent = 'Блокувати клітинку (B)';
        blockBtn.className = 'action-btn';
        blockBtn.style.display = 'none';
        document.getElementById('abilitiesContainer').appendChild(blockBtn);

        blockBtn.addEventListener('click', activateBlockMode);

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'b' && !isBlockMode) {
                activateBlockMode();
            }
        });
    }

    function activateBlockMode() {
        if (!playerBlockUsed && (moveCount + 1) % 2 === 0) {
            isBlockMode = true;
            document.getElementById('blockBtn').classList.add('active');
            // currentTurnElement.textContent = 'Режим блокування! Оберіть клітинку';
            // currentTurnElement.style.color = '#ffcc00';

            Array.from(gameBoard.children).forEach(cell => {
                if (board[cell.dataset.index] === null) {
                    cell.classList.add('blockable');
                }
            });
        }
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
        if (victorySound) {
            victorySound.pause();
            victorySound.currentTime = 0;
        }

        board.fill(null);
        clearStrikeLine();
        resultMessage.textContent = '';
        gameBoard.innerHTML = '';
        isGameOver = false;
        moveCount = 0;
        isBlockMode = false;
        playerBlockUsed = false;
        TURN_TIME = originalTurnTime;


        if (abilityInfoElement) abilityInfoElement.textContent = '';
        if (abilityCooldownElement) abilityCooldownElement.textContent = '';
        if (abilityTimerElement) abilityTimerElement.textContent = '';

        // Приховуємо кнопку блокування
        const blockBtn = document.getElementById('blockBtn');
        if (blockBtn) {
            blockBtn.style.display = 'none';
            blockBtn.classList.remove('active');
        }
        // Видаляємо класи з усіх клітинок при скиданні гри
        Array.from(gameBoard.children).forEach(cell => {
            cell.classList.remove('blockable', 'blocked');
        });

    }

    function startGameWithCharacter(characterId) {
        userRaceId = characterId;
        setRaces(characterId);
        setupAbilityUI();
        applyRaceAbilities(characterId);
        moveCount = 0;
        updateAbilityUI(userRaceId);
        updateTurnIndicator(true);
        startGame();
    }

    window.startGameWithCharacter = startGameWithCharacter;

    function startGame() {
        fullResetGame();
        document.getElementById('gameScreen').style.display = 'flex';
        document.getElementById('characterSection').style.display = 'none';
        document.getElementById('characterDetail').style.display = 'none';
        currentScreen = 'game';

        setTimeout(() => {
            createBoard();
            renderBoard();
            startTurnTimer(true);

            if (characters[userRace.toLowerCase()]?.abilities.canBlock) {
                document.getElementById('blockBtn').style.display = 'block';
            }

            setTimeout(() => {
                gameBoard.style.opacity = '1';
                gameBoard.style.transform = 'translateX(0)';
                updateCellRects();
            }, 100);
        }, 10);
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
        updateCellRects();
    }

    function onCellClick(event) {
        const index = Number(event.currentTarget.dataset.index);

        if (isBlockMode) {
            if (board[index] === null) {
                board[index] = 'B';
                event.currentTarget.textContent = '✖';
                event.currentTarget.classList.add('blocked');
                event.currentTarget.classList.remove('blockable');
                isBlockMode = false;
                playerBlockUsed = true;

                // Прибираємо підсвічування з усіх клітинок
                Array.from(gameBoard.children).forEach(cell => {
                    cell.classList.remove('blockable');
                });

                document.getElementById('blockBtn').classList.remove('active');
                abilityInfoElement.textContent = 'Клітинку заблоковано!';

                moveCount++;
                playerBlockUsed = true;
                isBlockMode = false;

                updateAbilityUI(userRaceId);
                updateTurnIndicator(false); // зміна індикатора на хід комп’ютера
                startTurnTimer(false); // запускаємо таймер комп’ютера

                setTimeout(() => {
                    computerMove();
                }, 1000);

                isGameOver = true; // блокує гравця до завершення ходу комп’ютера
            }
            return;
        }

        if (isGameOver || board[index] !== null) return;
        playerMove(index);
    }

    function playerMove(index) {
        clearTimeout(turnTimer);
        updateTurnIndicator(true);
        board[index] = userSymbol;
        renderBoard();

        moveCount++;
        updateAbilityUI(userRaceId);

        if (checkWin(userSymbol)) {
            finishGame(userRace, getWinningCells(userSymbol));
            return;
        }

        if (board.every(cell => cell !== null)) {
            finishGame(null, []);
            return;
        }

        const userAbilities = characters[userRaceId]?.abilities;
        const canDoubleMove = userAbilities?.doubleMove && ((moveCount) % userAbilities.doubleMoveEvery === 0);

        if (canDoubleMove) {
            abilityInfoElement.textContent = 'Ви можете зробити ще один хід!';
            isGameOver = false;
            return;
        }

        isGameOver = true;
        setTimeout(() => {
            computerMove();
            isGameOver = false;
        }, 500);
    }


    function computerMove() {
        const shouldDoubleMove = computerAbilities.doubleMove &&
            (moveCount % computerAbilities.doubleMoveEvery === 0);

        if (shouldDoubleMove) {
            abilityInfoElement.textContent = 'Противник використав подвійний хід!';
        }

        const firstMoveResult = makeComputerMove();

        if (shouldDoubleMove && !firstMoveResult.gameEnded && firstMoveResult.moveMade) {
            setTimeout(() => {
                makeComputerMove();
                abilityInfoElement.textContent = '';
                // moveCount++;
                // updateAbilityUI(userRaceId);
                // startTurnTimer(true);
            }, 1000);
            return;

        }
        updateAbilityUI(userRaceId);
        isGameOver = false;
        startTurnTimer(true);

        // moveCount++;
        // updateAbilityUI(userRaceId);
        // startTurnTimer(true);
    }

    function makeComputerMove() {
        const freeIndices = board.reduce((acc, val, idx) =>
            val === null ? acc.concat(idx) : acc, []);

        if (freeIndices.length === 0) return { gameEnded: true, moveMade: false };

        const randomIndex = freeIndices[Math.floor(Math.random() * freeIndices.length)];
        board[randomIndex] = opponentSymbol;
        renderBoard();

        if (checkWin(opponentSymbol)) {
            finishGame(opponentRace, getWinningCells(opponentSymbol));
            return { gameEnded: true, moveMade: true };
        } else if (board.every(cell => cell !== null)) {
            finishGame(null, []);
            return { gameEnded: true, moveMade: true };
        }

        return { gameEnded: false, moveMade: true };
    }


    function renderBoard() {
        board.forEach((val, idx) => {
            const cell = gameBoard.children[idx];
            cell.textContent = val === null ? '' : val;
            cell.classList.toggle('occupied', val !== null);
            cell.classList.toggle('opponent', val === opponentSymbol);

            if (val === userSymbol) {
                cell.style.color = getRaceColor(userRace);
            } else if (val === opponentSymbol) {
                cell.style.color = getRaceColor(opponentRace);
            }
        });
    }

    function getRaceColor(race) {
        const colors = {
            'Orcs': '#ff0000',
            'Elves': '#00ff00',
            'Dragons': '#ff9900',
            'Dwarves': '#0000ff'
        };
        return colors[race] || '#ffffff';
    }

    function checkWin(symbol) {
        return winningLines.some(combo => combo.every(idx => board[idx] === symbol));
    }

    function getWinningCells(symbol) {
        return winningLines.find(combo => combo.every(idx => board[idx] === symbol));
    }

    function playVictorySound(race) {
        const soundMap = {
            'Orcs': '../static/audio/orc.mp3',
            'Elves': '../static/audio/elf 2.mp3',
            'Dragons': '../static/audio/dragon.mp3',
            'Dwarves': '../static/audio/dwarve.mp3'
        };

        if (victorySound) {
            victorySound.pause();
            victorySound.currentTime = 0;
        }


        if (race && soundMap[race]) {
            victorySound = new Audio(soundMap[race]);
            victorySound.volume = 0.7;
            victorySound.play().catch(e => console.log("Не вдалося відтворити звук:", e));
        }
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
            playVictorySound(winnerRace);
            modalMessage.textContent = `${winnerRace} win!`;
        } else {
            modalMessage.textContent = "It's a draw!";
        }

        gameModal.style.display = 'flex';
    }

    function drawStrikeLine(cells) {
        if (!cells || cells.length !== 3) return;

        requestAnimationFrame(() => {
            const [a, , c] = cells;

            const cellA = document.getElementById(`cell-${a}`);
            const cellC = document.getElementById(`cell-${c}`);

            if (!cellA || !cellC) return;

            const rectA = cellA.getBoundingClientRect();
            const rectC = cellC.getBoundingClientRect();

            const board = document.querySelector('.board');
            const boardRect = board.getBoundingClientRect();

            const x1 = rectA.left + rectA.width / 2 - boardRect.left;
            const y1 = rectA.top + rectA.height / 2 - boardRect.top;
            const x2 = rectC.left + rectC.width / 2 - boardRect.left;
            const y2 = rectC.top + rectC.height / 2 - boardRect.top;

            const strikeLine = document.getElementById('strike-line');
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

    function setRaces(playerRaceId) {
        const races = {
            'ork': { user: 'Orcs', opponent: 'Elves' },
            'dragon': { user: 'Dragons', opponent: 'Dwarves' },
            'elf': { user: 'Elves', opponent: 'Orcs' },
            'gnome': { user: 'Dwarves', opponent: 'Dragons' }
        };

        const selected = races[playerRaceId] || races['ork'];
        userRace = selected.user;
        opponentRace = selected.opponent;
    }

    function hideModal() {
        gameModal.style.display = 'none';
    }

    restartButton.addEventListener('click', () => {
        if (victorySound) {
            victorySound.pause();
            victorySound.currentTime = 0;
        }
        hideModal();
        startGame();
    });

    backButton.addEventListener('click', () => {
        if (victorySound) {
            victorySound.pause();
            victorySound.currentTime = 0;
        }
        fullResetGame();
        hideModal();

        document.getElementById('gameScreen').style.opacity = '0';
        document.getElementById('gameScreen').style.transform = 'translateX(-100%)';

        setTimeout(() => {
            document.getElementById('gameScreen').style.display = 'none';
            document.getElementById('characterDetail').style.display = 'block';
            document.getElementById('characterDetail').style.opacity = '1';
            document.getElementById('characterDetail').style.transform = 'translateY(0)';

            currentScreen = 'characterDetail';
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

    gameModal.addEventListener('click', (e) => {
        if (e.target === gameModal) {
            hideModal();
        }
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.style.transform = 'none';
                gameContainer.style.opacity = '1';
            }
        }, 100);
    });

    fullResetGame();
    updateScoreDisplay();
})();
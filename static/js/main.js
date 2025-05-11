// DOM Elements
const arrow = document.getElementById('arrow');
const welcomeScreen = document.getElementById('welcomeScreen');
const mainText = document.getElementById('mainText');
const subText = document.getElementById('subText');
const characterSection = document.getElementById('characterSection');
const characterDetail = document.getElementById('characterDetail');
const closeBtn = document.getElementById('closeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const prevChar = document.getElementById('prevChar');
const nextChar = document.getElementById('nextChar');
const detailTitle = document.getElementById('detailTitle');
const charTitle = document.getElementById('charTitle');
const charDescription = document.getElementById('charDescription');
const detailImage = document.getElementById('detailImage');
const characterArches = document.querySelectorAll('.character-arch');

let selectedCharacter = null;
let currentCharacterSound = null;
let isSoundPlaying = false;

const clickSound = new Audio('./static/audio/click.mp3');
clickSound.volume = 0.8; // Гучність (0.8 = 80%)

// Character data
const characters = [
    {
        id: 'ork',
        name: 'ОРК',
        image: 'static/img/orc.jpeg',
        bg: 'url("static/img/orcs wallpaper 3.jpeg")',
        description: 'Орки - жорстокі воїни, що живуть у горах. Відомі своєю силою та агресивністю. Використовують примітивну, але ефективну зброю. Живуть кланами під керівництвом найсильніших.',
        sound: 'static/audio/orc.mp3',
        stats: {
            strength: 76,
            magic: 30,
            agility: 60,
            endurance: 75,
            intelligence: 40
        }
    },
    {
        id: 'dragon',
        name: 'ДРАКОН',
        image: 'static/img/dragon.avif',
        bg: 'url("static/img/dragon wallpaper 4.jpg")',
        description: 'Дракони - могутні істоти, що володіють магією та вогнем. Живуть століттями, накопичуючи знання та багатства. Деякі служать добру, інші - лиху. Всі вони мають величезну силу та мудрість.',
        sound: 'static/audio/dragon 2.mp3',
        stats: {
            strength: 95,
            magic: 80,
            agility: 32,
            endurance: 75,
            intelligence: 40
        }
    },
    {
        id: 'elf',
        name: 'ЕЛЬФ',
        image: 'static/img/elf.jpg',
        bg: "url('static/img/elf wallpaper.jpg')",
        description: 'Ельфи - граціозні та мудрі істоти, що живуть у гармонії з природою. Відмінні лучники та чарівники. Живуть у древніх лісах, охороняючи свої таємниці від сторонніх очей.',
        sound: 'static/audio/elf 2.mp3',
        stats: {
            strength: 56,
            magic: 90,
            agility: 70,
            endurance: 45,
            intelligence: 97
        }
    },
    {
        id: 'gnome',
        name: 'ГНОМ',
        image: 'static/img/dwarve.webp',
        bg: 'url("static/img/dwarve wallpaper.webp")',
        sound: 'static/audio/dwarve.mp3',
        description: "Гноми - майстри підземних царств, неперевершені ковалі та інженери. Відомі своїми винаходами та любов'ю до золота. Хоча вони невисокі на зріст, але мають величезну силу духу.",
        stats: {
            strength: 85,
            magic: 20,
            agility: 64,
            endurance: 75,
            intelligence: 67
        }
    }
];

let currentCharacterIndex = 0;

characterArches.forEach(arch => {
    const charId = arch.getAttribute('data-char');
    const character = characters.find(c => c.id === charId);

    // Попереднє завантаження звуку
    const sound = new Audio(character.sound);
    sound.volume = 0.5; // Регулюємо гучність

    arch.addEventListener('mouseenter', () => {
        // Зупиняємо попередній звук
        if (currentCharacterSound) {
            currentCharacterSound.pause();
            currentCharacterSound.currentTime = 0;
        }

        // Відтворюємо новий звук
        currentCharacterSound = sound;
        currentCharacterSound.play()
            .then(() => {
                isSoundPlaying = true;
            })
            .catch(e => console.log("Автовідтворення звуку заблоковано:", e));
    });

    arch.addEventListener('mouseleave', () => {
        if (currentCharacterSound && isSoundPlaying) {
            currentCharacterSound.pause();
            currentCharacterSound.currentTime = 0;
            isSoundPlaying = false;
        }
    });
});

document.getElementById('startBtn').addEventListener('click', function () {
    const selectedCharacter = characters[currentCharacterIndex];
    const enemyCharacter = getEnemyCharacter(selectedCharacter.id);

    if (window.startGameWithCharacter) {
        window.startGameWithCharacter(selectedCharacter.id);
    }

    characterDetail.classList.add('slide-up');

    // Встановлюємо зображення персонажів
    document.getElementById('playerCharacterImg').src = selectedCharacter.image;
    document.getElementById('enemyCharacterImg').src = enemyCharacter.image;

});

function getEnemyCharacter(playerCharId) {
    const enemies = {
        'ork': characters.find(c => c.id === 'elf'),
        'elf': characters.find(c => c.id === 'ork'),
        'dragon': characters.find(c => c.id === 'gnome'),
        'gnome': characters.find(c => c.id === 'dragon')
    };
    return enemies[playerCharId] || characters[0];
}

function typeWriterEffect() {
    const welcomeText = document.getElementById('mainText');
    const fullText = "ЛАСКАВО ПРОСИМО\nВи будете грати у Fantasy Realm.";
    let i = 0;
    const speed = 50; // Швидкість друку (мілісекунди)

    function type() {
        if (i < fullText.length) {
            // Додаємо символ за символом
            welcomeText.textContent += fullText.charAt(i);
            i++;

            // Якщо це перший рядок, додаємо затримку перед другим
            if (i === 15) {
                setTimeout(type, speed * 2); // Більша затримка перед другим рядком
            } else {
                setTimeout(type, speed);
            }
        }
    }



    welcomeText.textContent = '';
    type();

    setTimeout(() => {
        const arrow = document.getElementById('arrow');
        arrow.style.opacity = '1';
        arrow.style.transition = 'opacity 0.5s ease-in-out';
    }, 2200);

}


window.addEventListener('DOMContentLoaded', typeWriterEffect);

// document.addEventListener('DOMContentLoaded', () => {
//     setTimeout(() => {
//         const arrow = document.getElementById('arrow');
//         arrow.style.opacity = '1';
//         arrow.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
//         arrow.style.transform = 'translateY(0)';
//     }, 2200); // Затримка 2200 мс
// });

// Event Listeners
arrow.addEventListener('click', showCharacterSelection);

function playClickSound() {
    clickSound.currentTime = 0; // Перемотуємо на початок для миттєвого відтворення
    clickSound.play().catch(e => console.log("Звук не відтворився: ", e));
}

// Додаємо обробник кліку на всі клікабельні елементи
document.addEventListener('DOMContentLoaded', () => {
    // Вибірка всіх клікабельних елементів
    const clickableElements = document.querySelectorAll(
        'button, a, [role="button"], .clickable, [data-clickable], div'
    );

    // Додаємо обробник кліку до кожного елемента
    clickableElements.forEach(element => {
        element.addEventListener('click', (e) => {
            // Відтворюємо звук (якщо елемент не вимкнений)
            if (!element.disabled && !element.classList.contains('no-sound')) {
                playClickSound();
            }
        });
    });
});

characterArches.forEach(arch => {
    arch.addEventListener('mouseenter', () => {
        const bg = arch.getAttribute('data-bg');
        document.body.style.backgroundImage = bg;
    });

    arch.addEventListener('click', function () {
        const charId = this.getAttribute('data-char');
        showCharacterDetail(charId);
    });
});

if (closeBtn) {
    closeBtn.addEventListener('click', returnToSelection);
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', returnToSelection);
}

prevChar.addEventListener('click', () => {
    currentCharacterIndex = (currentCharacterIndex - 1 + characters.length) % characters.length;
    updateCharacterDetail(currentCharacterIndex);
});

nextChar.addEventListener('click', () => {
    currentCharacterIndex = (currentCharacterIndex + 1) % characters.length;
    updateCharacterDetail(currentCharacterIndex);
});

// Functions
function showCharacterSelection() {
    arrow.style.display = 'none';
    mainText.classList.add('hidden');
    // subText.classList.add('hidden');

    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        characterSection.style.display = 'flex';
        characterSection.classList.add('fade-in');
    }, 1000);
}

function showCharacterDetail(charId) {
    characterSection.style.display = 'none';

    const index = characters.findIndex(char => char.id === charId);
    currentCharacterIndex = index;
    // selectedCharacter = characters[index]; // Зберігаємо обраного персонажа
    updateCharacterDetail(index);

    characterDetail.style.display = 'block';
    characterDetail.classList.add('slide-down');
    document.body.style.backgroundImage = characters[index].bg;
}

function updateCharacterDetail(index) {
    currentCharacterIndex = index; // Оновлюємо поточний індекс
    const character = characters[index];
    detailTitle.textContent = character.name;
    charTitle.textContent = character.name;
    charDescription.textContent = character.description;
    detailImage.src = character.image;
    document.body.style.backgroundImage = character.bg;
}

function returnToSelection() {
    // Додаємо анімацію "виїзду" екрану деталей вгору
    characterDetail.classList.add('slide-up');

    // Після завершення анімації
    setTimeout(() => {
        characterDetail.style.display = 'none';
        // characterDetail.classList.remove('slide-down', 'slide-up', 'fade-in');

        characterSection.style.display = 'flex';
        // characterSection.classList.remove('slide-down', 'slide-up', 'fade-in');
        characterSection.classList.add('fade-in');

        // document.body.style.backgroundImage = 'linear-gradient(135deg, #5e2a6c, #8e44ad)';

        const gameScreen = document.getElementById('gameScreen');
        gameScreen.style.display = 'none';
    }, 300);
}




document.getElementById('startBtn').addEventListener('click', function () {
    const selectedCharacter = characters[currentCharacterIndex];

    // Передаємо його в гру
    if (window.startGameWithCharacter) {
        window.startGameWithCharacter(selectedCharacter.id);
    }

    // Анімація переходу
    characterDetail.classList.add('slide-up');
    setTimeout(() => {
        characterDetail.style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';
        document.getElementById('gameScreen').classList.add('fade-in');
    }, 500);
});

// Функція для ініціалізації гри 
function initGame() {
    console.log("Гра почалася!");
}

// test

// Ініціалізація радар-діаграми
function initRadarChart(character) {
    const ctx = document.getElementById('radarChart').getContext('2d');

    if (window.characterChart) {
        window.characterChart.destroy();
    }

    window.characterChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Сила', 'Магія', 'Спритність', 'Витривалість', 'Інтелект'],
            datasets: [{
                label: character.name,
                data: [
                    character.stats.strength,
                    character.stats.magic,
                    character.stats.agility,
                    character.stats.endurance,
                    character.stats.intelligence
                ],
                backgroundColor: 'rgba(142, 68, 173, 0.5)',
                borderColor: '#8e44ad',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.3)' },
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

// Оновлення статистики
function updateStats(character) {
    const stats = character.stats;

    // Оновлюємо прогрес-бари
    Object.keys(stats).forEach(stat => {
        const element = document.querySelector(`[data-stat="${stat}"]`);
        if (element) {
            const progressBar = element.querySelector('.stat-progress');
            const valueElement = element.querySelector('.stat-value');

            if (progressBar) {
                progressBar.style.width = `${stats[stat]}%`;
                progressBar.style.backgroundColor = getStatColor(stat);
            }

            if (valueElement) {
                valueElement.textContent = `${stats[stat]}/100`;
            }
        }
    });

    // Ініціалізуємо діаграму
    initRadarChart(character);
}

function getStatColor(stat) {
    const colors = {
        strength: '#e74c3c',
        magic: '#3498db',
        agility: '#2ecc71',
        endurance: '#f39c12',
        intelligence: '#9b59b6'
    };
    return colors[stat] || '#8e44ad';
}

// Оновлюємо функцію updateCharacterDetail
function updateCharacterDetail(index) {
    currentCharacterIndex = index;
    const character = characters[index];

    // Оновлюємо основні дані
    detailTitle.textContent = character.name;
    charTitle.textContent = character.name;
    charDescription.textContent = character.description;
    detailImage.src = character.image;
    document.body.style.backgroundImage = character.bg;

    // Оновлюємо статистику
    updateStats(character);
}

// test

// Додайте в кінці файлу main.js

// Правила гри
const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const closeRules = document.getElementById('closeRules');

if (rulesBtn && rulesModal && closeRules) {
    rulesBtn.addEventListener('click', () => {
        rulesModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Блокуємо прокрутку
    });

    closeRules.addEventListener('click', () => {
        rulesModal.style.display = 'none';
        document.body.style.overflow = ''; // Відновлюємо прокрутку
    });

    // Закриття при кліку поза вікном
    window.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            rulesModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

let bg_music = new Audio("static/audio//music.mp3");
bg_music.loop = true;
bg_music.volume = 0.7;

// Дочекаємося взаємодії користувача (будь-який клік)
document.addEventListener('click', function startMusic() {
    bg_music.play().catch((e) => console.warn("Автовідтворення заблоковане:", e));
    document.removeEventListener('click', startMusic); // більше не слухаємо
});

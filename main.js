
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

// Character data
const characters = [
    {
        id: 'ork',
        name: 'ОРК',
        image: 'orc.jpeg',
        bg: 'url("orcs wallpaper 3.jpg")',
        description: 'Орки - жорстокі воїни, що живуть у суворих горах. Відомі своєю силою та агресивністю. Використовують примітивну, але ефективну зброю. Живуть кланами під керівництвом найсильніших воїнів.'
    },
    {
        id: 'dragon',
        name: 'ДРАКОН',
        image: 'dragon.avif',
        bg: 'url("dragon wallpaper 4.jpg")',
        description: 'Дракони - могутні істоти, що володіють магією та вогнем. Живуть століттями, накопичуючи знання та багатства. Деякі служать добру, інші - лиху. Всі вони мають величезну силу та мудрість.'
    },
    {
        id: 'elf',
        name: 'ЕЛЬФ',
        image: 'elf.jpg',
        bg: "url('elf wallpaper.jpg')",
        description: 'Ельфи - граціозні та мудрі істоти, що живуть у гармонії з природою. Відмінні лучники та чарівники. Живуть у древніх лісах, охороняючи свої таємниці від сторонніх очей.'
    },
    {
        id: 'gnome',
        name: 'ГНОМ',
        image: 'dwarve.webp',
        bg: 'url("dwarve wallpaper.webp")',
        description: "Гноми - майстри підземних царств, неперевершені ковалі та інженери. Відомі своїми винаходами та любов'ю до золота. Хоча вони невисокі на зріст, але мають величезну силу духу."
    }
];

let currentCharacterIndex = 0;

// Event Listeners
arrow.addEventListener('click', showCharacterSelection);

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

closeBtn.addEventListener('click', returnToSelection);
cancelBtn.addEventListener('click', returnToSelection);

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
    subText.classList.add('hidden');

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
    updateCharacterDetail(index);

    characterDetail.style.display = 'block';
    characterDetail.classList.add('slide-down');
    document.body.style.backgroundImage = characters[index].bg;
}

function updateCharacterDetail(index) {
    const character = characters[index];
    detailTitle.textContent = character.name;
    charTitle.textContent = character.name;
    charDescription.textContent = character.description;
    detailImage.src = character.image;
    document.body.style.backgroundImage = character.bg;
}

function returnToSelection() {
    characterDetail.style.display = 'none';
    characterSection.style.display = 'flex';
    document.body.style.backgroundImage = 'linear-gradient(135deg, #5e2a6c, #8e44ad)';
}

// Замініть існуючий код для кнопки "Почати гру" на цей:
document.getElementById('startBtn').addEventListener('click', function () {
    // Додаємо анімацію "виїзду" поточного екрану вгору
    characterDetail.classList.add('slide-up');

    // Після завершення анімації - показуємо екран гри
    setTimeout(() => {
        characterDetail.style.display = 'none';

        // Отримуємо екран гри (вам потрібно його створити в HTML)
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.style.display = 'block';
        gameScreen.classList.add('fade-in');

        // Тут можна додати ініціалізацію гри
        initGame();
    }, 1000); // Час має відповідати тривалості анімації (1s)
});

// Функція для ініціалізації гри (приклад)
function initGame() {
    console.log("Гра почалася!");
    // Тут ваш код для ініціалізації гри
}

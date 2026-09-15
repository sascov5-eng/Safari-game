const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Установка размера canvas
function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 20, 800);
    const maxHeight = window.innerHeight - 140;
    canvas.width = maxWidth;
    canvas.height = Math.min(maxHeight, 600);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Игровые константы
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const ENEMY_SPEED = 2;

// Игровые переменные
let gameRunning = true;
let score = 0;
let lives = 3;
let keys = {};

// Игрок
const player = {
    x: 50,
    y: 100,
    width: 30,
    height: 30,
    vx: 0,
    vy: 0,
    jumping: false,
    color: '#5B8CFF'
};

// Платформы
const platforms = [
    { x: 0, y: canvas.height - 20, width: canvas.width, height: 20 },
    { x: 100, y: canvas.height - 100, width: 150, height: 15 },
    { x: 300, y: canvas.height - 180, width: 150, height: 15 },
    { x: 500, y: canvas.height - 260, width: 150, height: 15 },
    { x: 200, y: canvas.height - 340, width: 150, height: 15 },
    { x: 450, y: canvas.height - 420, width: 150, height: 15 }
];

// Монеты
let coins = [
    { x: 175, y: canvas.height - 140, width: 20, height: 20, collected: false },
    { x: 375, y: canvas.height - 220, width: 20, height: 20, collected: false },
    { x: 575, y: canvas.height - 300, width: 20, height: 20, collected: false },
    { x: 275, y: canvas.height - 380, width: 20, height: 20, collected: false },
    { x: 525, y: canvas.height - 460, width: 20, height: 20, collected: false }
];

// Враги
let enemies = [
    { x: 150, y: canvas.height - 130, width: 25, height: 25, vx: ENEMY_SPEED, minX: 100, maxX: 230 },
    { x: 350, y: canvas.height - 210, width: 25, height: 25, vx: ENEMY_SPEED, minX: 300, maxX: 430 },
    { x: 250, y: canvas.height - 370, width: 25, height: 25, vx: ENEMY_SPEED, minX: 200, maxX: 330 }
];

// Управление клавиатурой
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ((e.key === ' ' || e.key === 'ArrowUp') && !player.jumping) {
        player.vy = JUMP_FORCE;
        player.jumping = true;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Сенсорное управление
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');

let touchLeft = false;
let touchRight = false;

leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchLeft = true;
});

leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchLeft = false;
});

rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchRight = true;
});

rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchRight = false;
});

jumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!player.jumping) {
        player.vy = JUMP_FORCE;
        player.jumping = true;
    }
});

// Обновление игрока
function updatePlayer() {
    // Движение
    player.vx = 0;
    if (keys['ArrowLeft'] || keys['a'] || touchLeft) {
        player.vx = -MOVE_SPEED;
    }
    if (keys['ArrowRight'] || keys['d'] || touchRight) {
        player.vx = MOVE_SPEED;
    }

    player.x += player.vx;
    player.vy += GRAVITY;
    player.y += player.vy;

    // Границы экрана
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Проверка падения
    if (player.y > canvas.height) {
        loseLife();
    }

    // Столкновения с платформами
    player.jumping = true;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.vy > 0) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.jumping = false;
        }
    });
}

// Обновление врагов
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.vx;
        if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
            enemy.vx *= -1;
        }

        // Столкновение с игроком
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            loseLife();
        }
    });
}

// Обновление монет
function updateCoins() {
    coins.forEach(coin => {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            coin.collected = true;
            score++;
            updateScore();
        }
    });
}

// Потеря жизни
function loseLife() {
    lives--;
    updateLives();
    if (lives <= 0) {
        endGame();
    } else {
        resetPlayerPosition();
    }
}

function resetPlayerPosition() {
    player.x = 50;
    player.y = 100;
    player.vx = 0;
    player.vy = 0;
    player.jumping = false;
}

// Обновление UI
function updateScore() {
    document.getElementById('score').textContent = `Монеты: ${score}`;
}

function updateLives() {
    document.getElementById('lives').textContent = `Жизни: ${lives}`;
}

// Конец игры
function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// Перезапуск игры
function restartGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    updateScore();
    updateLives();
    resetPlayerPosition();
    coins.forEach(coin => coin.collected = false);
    document.getElementById('gameOver').classList.add('hidden');
}

// Рисование
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Платформы
    ctx.fillStyle = '#1E222E';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Монеты
    ctx.fillStyle = '#FBBF24';
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Враги
    ctx.fillStyle = '#F87171';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Игрок
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Игровой цикл
function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateEnemies();
        updateCoins();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

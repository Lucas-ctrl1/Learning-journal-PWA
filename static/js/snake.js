const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("current-score");
const highScoreElement = document.getElementById("high-score-display");

let score = 0;
let box = 20;
let d;
let snake = [{ x: 9 * box, y: 10 * box }];
let food = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
};

// Load High Score from Cache
let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.innerHTML = highScore;

document.addEventListener("keydown", direction);

function direction(event) {
    if(event.keyCode == 37 && d != "RIGHT") d = "LEFT";
    else if(event.keyCode == 38 && d != "DOWN") d = "UP";
    else if(event.keyCode == 39 && d != "LEFT") d = "RIGHT";
    else if(event.keyCode == 40 && d != "UP") d = "DOWN";
}

function move(newDir) {
    if(newDir == "LEFT" && d != "RIGHT") d = "LEFT";
    else if(newDir == "UP" && d != "DOWN") d = "UP";
    else if(newDir == "RIGHT" && d != "LEFT") d = "RIGHT";
    else if(newDir == "DOWN" && d != "UP") d = "DOWN";
}

function draw() {
    const isDark = document.body.classList.contains('dark-mode');
    ctx.fillStyle = isDark ? "#000" : "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#27ae60" : "#2ecc71";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = isDark ? "#000" : "#fff";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if( d == "LEFT") snakeX -= box;
    if( d == "UP") snakeY -= box;
    if( d == "RIGHT") snakeX += box;
    if( d == "DOWN") snakeY += box;

    if(snakeX == food.x && snakeY == food.y) {
        score++;
        scoreElement.innerHTML = score;
        food = {
            x: Math.floor(Math.random() * 19 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
        if (window.navigator.vibrate) window.navigator.vibrate(50);
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if(snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(gameInterval);

        // Save to LocalStorage if it's a new record
        if (score > highScore) {
            localStorage.setItem("snakeHighScore", score);
            alert("🔥 New Record: " + score);
        } else {
            alert("Game Over! Score: " + score);
        }
        location.reload();
    }
    snake.unshift(newHead);
}

function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

function resetGame() { location.reload(); }
let gameInterval = setInterval(draw, 125);

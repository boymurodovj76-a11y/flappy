
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

const W = canvas.width;
const H = canvas.height;

let bird, pipes, score = 0;
let best = Number(localStorage.getItem("flappyBest")) || 0;
let running = false;
let frame = 0;
let animationId = null;

const gravity = 0.38;
const jumpPower = -6.8;
const pipeWidth = 65;
const pipeGap = 165;
const pipeSpeed = 2.5;

bestText.textContent = best;

function resetGame() {
    bird = {
        x: 95,
        y: 280,
        radius: 15,
        velocity: 0
    };

    pipes = [];
    score = 0;
    frame = 0;
    scoreText.textContent = score;
}

function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#70d6ff");
    sky.addColorStop(1, "#c4f1f9");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.8)";

    for (let i = 0; i < 4; i++) {
        const x = ((i * 130 - frame * 0.3) % 500 + 500) % 500 - 40;
        const y = 75 + (i % 3) * 65;

        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.arc(x + 22, y - 8, 24, 0, Math.PI * 2);
        ctx.arc(x + 45, y, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = "#8bd450";
    ctx.fillRect(0, H - 28, W, 28);

    ctx.fillStyle = "#5ca832";
    ctx.fillRect(0, H - 28, W, 5);
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(Math.max(-0.5, Math.min(0.8, bird.velocity * 0.07)));

    ctx.fillStyle = "#ffdf43";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f5a623";
    ctx.beginPath();
    ctx.ellipse(-7, 5, 9, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(9, -6, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(11, -6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff7043";
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(27, 4);
    ctx.lineTo(15, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function createPipe() {
    const top = Math.random() * 280 + 55;

    pipes.push({
        x: W,
        top,
        bottom: top + pipeGap,
        passed: false
    });
}

function drawPipe(pipe) {
    ctx.fillStyle = "#28b463";
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(
        pipe.x,
        pipe.bottom,
        pipeWidth,
        H - 28 - pipe.bottom
    );

    ctx.fillStyle = "#1e8449";
    ctx.fillRect(pipe.x - 5, pipe.top - 18, pipeWidth + 10, 18);
    ctx.fillRect(pipe.x - 5, pipe.bottom, pipeWidth + 10, 18);

    ctx.fillStyle = "#58d68d";
    ctx.fillRect(pipe.x + 9, 0, 7, pipe.top - 18);
    ctx.fillRect(
        pipe.x + 9,
        pipe.bottom + 18,
        7,
        H - 28 - pipe.bottom - 18
    );
}

function collision(pipe) {
    const left = bird.x - bird.radius;
    const right = bird.x + bird.radius;
    const top = bird.y - bird.radius;
    const bottom = bird.y + bird.radius;

    if (right <= pipe.x || left >= pipe.x + pipeWidth) {
        return false;
    }

    return top < pipe.top || bottom > pipe.bottom;
}

function jump() {
    if (running) {
        bird.velocity = jumpPower;
    }
}

function endGame() {
    running = false;

    if (score > best) {
        best = score;
        localStorage.setItem("flappyBest", best);
        bestText.textContent = best;
    }

    message.innerHTML = `
        <h2>O'yin tugadi!</h2>
        <p>Hisob: ${score} | Rekord: ${best}</p>
        <button id="restartBtn">Qayta o'ynash</button>
    `;

    message.style.display = "block";

    document.getElementById("restartBtn")
        .addEventListener("click", startGame);
}

function update() {
    if (!running) return;

    frame++;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (frame % 95 === 0) {
        createPipe();
    }

    for (const pipe of pipes) {
        pipe.x -= pipeSpeed;

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            scoreText.textContent = score;
        }

        if (collision(pipe)) {
            endGame();
            return;
        }
    }

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

    if (
        bird.y - bird.radius < 0 ||
        bird.y + bird.radius > H - 28
    ) {
        endGame();
    }
}

function draw() {
    drawBackground();
    pipes.forEach(drawPipe);
    drawBird();
}

function gameLoop() {
    update();
    draw();

    if (running) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    cancelAnimationFrame(animationId);

    resetGame();
    running = true;
    message.style.display = "none";

    jump();
    gameLoop();
}

startBtn.addEventListener("click", startGame);

// Telefon va sichqoncha boshqaruvi
canvas.addEventListener("pointerdown", event => {
    event.preventDefault();

    if (!running) {
        startGame();
    } else {
        jump();
    }
});

// Klaviatura boshqaruvi
document.addEventListener("keydown", event => {
    if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();

        if (!running) {
            startGame();
        } else if (!event.repeat) {
            jump();
        }
    }
});

resetGame();
draw();

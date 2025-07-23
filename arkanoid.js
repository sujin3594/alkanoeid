// Arkanoid (벽돌깨기) 게임 - 하나의 JS 파일로 구현
// index.html에서 <canvas id="gameCanvas"></canvas>와 함께 사용하세요.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 캔버스 크기
canvas.width = 960;
canvas.height = 640;

// 벽돌 동적 계산
const brickPadding = 8;
const brickOffsetTop = 40;
const brickOffsetLeft = 32;
const brickRowCount = 8;
const brickColumnCount = Math.floor(
  (canvas.width - brickOffsetLeft * 2 + brickPadding) / (60 + brickPadding)
);
const brickWidth = Math.floor(
  (canvas.width - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) /
    brickColumnCount
);
const brickHeight = 28;
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// 벽돌 색상 배열 (알록달록)
const brickColors = [
  "#FF5733",
  "#FFD700",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF9800",
  "#00BCD4",
  "#E91E63",
];

// 패들
const paddleHeight = 16;
const paddleWidth = 120;
let paddleX = (canvas.width - paddleWidth) / 2;

// 공
let ballRadius = 12;
let balls = [
  {
    x: canvas.width / 2,
    y: canvas.height - 60,
    dx: 4,
    dy: -4,
    radius: ballRadius,
  },
];

// 점수, 목숨
let score = 0;
let lives = 3;

// 아이템
const itemTypes = ["multi", "big", "small"];
const itemColors = { multi: "#00e676", big: "#ffeb3b", small: "#00bcd4" };
let items = [];

// 키 입력
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        for (let i = 0; i < balls.length; i++) {
          const ball = balls[i];
          if (
            ball.x > b.x &&
            ball.x < b.x + brickWidth &&
            ball.y > b.y &&
            ball.y < b.y + brickHeight
          ) {
            ball.dy = -ball.dy;
            b.status = 0;
            score++;
            // 아이템 드랍 (30% 확률)
            if (Math.random() < 0.3) {
              const type =
                itemTypes[Math.floor(Math.random() * itemTypes.length)];
              items.push({
                x: b.x + brickWidth / 2,
                y: b.y + brickHeight / 2,
                type,
                active: true,
                vy: 3,
              });
            }
            if (score === brickRowCount * brickColumnCount) {
              alert("축하합니다! 모든 벽돌을 깼어요!");
              document.location.reload();
            }
          }
        }
      }
    }
  }
}

function drawBall(ball) {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = brickColors[r % brickColors.length];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("점수: " + score, 16, 32);
}

function drawLives() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("목숨: " + lives, canvas.width - 100, 32);
}

function drawItems() {
  for (const item of items) {
    if (item.active) {
      ctx.beginPath();
      ctx.arc(item.x, item.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = itemColors[item.type];
      ctx.fill();
      ctx.font = "16px Arial";
      ctx.fillStyle = "#222";
      ctx.textAlign = "center";
      ctx.fillText(
        item.type === "multi" ? "2x" : item.type === "big" ? "UP" : "DN",
        item.x,
        item.y + 6
      );
      ctx.textAlign = "left";
      ctx.closePath();
    }
  }
}

// 게임 시작 대기 상태
let gameStarted = false;
function drawStartMessage() {
  ctx.font = "36px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("스페이스바를 누르세요", canvas.width / 2, canvas.height / 2);
  ctx.textAlign = "left";
}
document.addEventListener("keydown", function (e) {
  if (!gameStarted && e.code === "Space") {
    gameStarted = true;
    draw();
  }
});

function updateItems() {
  for (const item of items) {
    if (!item.active) continue;
    item.y += item.vy;
    // 패들에 닿으면 효과 적용
    if (
      item.y + 16 > canvas.height - paddleHeight &&
      item.x > paddleX &&
      item.x < paddleX + paddleWidth
    ) {
      item.active = false;
      if (item.type === "multi") {
        // 멀티볼: 공 2배
        const newBalls = balls.map((b) => ({
          x: b.x,
          y: b.y,
          dx: -b.dx,
          dy: b.dy,
          radius: b.radius,
        }));
        balls = balls.concat(newBalls);
      } else if (item.type === "big") {
        // 공 커지기
        for (const b of balls) b.radius = Math.min(b.radius + 8, 40);
      } else if (item.type === "small") {
        // 공 작아지기
        for (const b of balls) b.radius = Math.max(b.radius - 6, 6);
      }
    }
    // 바닥에 닿으면 사라짐
    if (item.y - 16 > canvas.height) {
      item.active = false;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  for (const ball of balls) drawBall(ball);
  drawPaddle();
  drawScore();
  drawLives();
  drawItems();
  if (!gameStarted) {
    drawStartMessage();
    return;
  }
  collisionDetection();
  updateItems();

  // 벽 충돌 및 공 이동
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    if (
      ball.x + ball.dx > canvas.width - ball.radius ||
      ball.x + ball.dx < ball.radius
    ) {
      ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
      // 패들 충돌
      if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
        ball.dy = -ball.dy;
      } else {
        balls.splice(i, 1);
        if (balls.length === 0) {
          lives--;
          if (!lives) {
            alert("게임 오버!");
            document.location.reload();
          } else {
            balls = [
              {
                x: canvas.width / 2,
                y: canvas.height - 60,
                dx: 4,
                dy: -4,
                radius: ballRadius,
              },
            ];
            paddleX = (canvas.width - paddleWidth) / 2;
          }
        }
      }
    }
    // 패들 이동
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += 12;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= 12;
    }
    ball.x += ball.dx;
    ball.y += ball.dy;
  }
  requestAnimationFrame(draw);
}

if (!gameStarted) {
  draw();
}

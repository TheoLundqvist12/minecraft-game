const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const leftScoreEl = document.getElementById("leftScore");
const rightScoreEl = document.getElementById("rightScore");
const dimensionEl = document.getElementById("dimensionName");

const game = {
  width: canvas.width,
  height: canvas.height,
  leftScore: 0,
  rightScore: 0,
  worldIndex: 0,
  dimensions: ["Overworld", "Nether", "End"],
  lastDimensionSwitch: 0,
  lastFrame: 0,
};

const leftPaddle = {
  x: 28,
  y: canvas.height / 2 - 90,
  width: 18,
  height: 170,
  speed: 520,
  mouseY: canvas.height / 2,
  name: "Steve",
};

const rightPaddle = {
  x: canvas.width - 46,
  y: canvas.height / 2 - 90,
  width: 18,
  height: 170,
  speed: 430,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  vx: 350,
  vy: 220,
  speedBoost: 1,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetBall(direction = 1) {
  const randomAngle = (Math.random() * 1.2 - 0.6);
  ball.x = game.width / 2;
  ball.y = game.height / 2;
  ball.vx = 320 * direction * (1 + ball.speedBoost * 0.15);
  ball.vy = 220 * randomAngle;
}

function updateDimension() {
  const currentTime = performance.now();
  if (currentTime - game.lastDimensionSwitch > 9000) {
    game.worldIndex = (game.worldIndex + 1) % game.dimensions.length;
    game.lastDimensionSwitch = currentTime;
    dimensionEl.textContent = game.dimensions[game.worldIndex];
  }
}

function updatePaddles(delta) {
  const leftMove = (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0);
  if (leftMove !== 0) {
    leftPaddle.y += leftMove * leftPaddle.speed * delta;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, game.height - leftPaddle.height);

  if (leftPaddle.mouseY) {
    leftPaddle.y += (leftPaddle.mouseY - (leftPaddle.y + leftPaddle.height / 2)) * 0.16;
    leftPaddle.y = clamp(leftPaddle.y, 0, game.height - leftPaddle.height);
  }

  const rightTarget = ball.y - (rightPaddle.y + rightPaddle.height / 2);
  const rightStep = Math.sign(rightTarget) * rightPaddle.speed * delta * 0.9;
  rightPaddle.y += rightStep;
  rightPaddle.y = clamp(rightPaddle.y, 0, game.height - rightPaddle.height);
}

function handleBallWallCollision() {
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= game.height) {
    ball.vy *= -1;
    ball.y = clamp(ball.y, ball.radius, game.height - ball.radius);
  }

  if (ball.x - ball.radius <= 0) {
    game.rightScore += 1;
    rightScoreEl.textContent = game.rightScore;
    resetBall(1);
  }

  if (ball.x + ball.radius >= game.width) {
    game.leftScore += 1;
    leftScoreEl.textContent = game.leftScore;
    resetBall(-1);
  }
}

function handleBallPaddleCollision() {
  const leftHit =
    ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
    ball.x + ball.radius >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + leftPaddle.height;

  const rightHit =
    ball.x + ball.radius >= rightPaddle.x &&
    ball.x - ball.radius <= rightPaddle.x + rightPaddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + rightPaddle.height;

  if (leftHit) {
    const relativeIntersect = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    const bounceAngle = relativeIntersect * 1.1;
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.vx = Math.abs(ball.vx) + 15;
    ball.vy = 260 * bounceAngle;
    ball.speedBoost += 0.05;
  }

  if (rightHit) {
    const relativeIntersect = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    const bounceAngle = relativeIntersect * 1.1;
    ball.x = rightPaddle.x - ball.radius;
    ball.vx = -(Math.abs(ball.vx) + 15);
    ball.vy = 260 * bounceAngle;
    ball.speedBoost += 0.05;
  }
}

function update(delta) {
  updateDimension();
  updatePaddles(delta);
  ball.x += ball.vx * delta;
  ball.y += ball.vy * delta;
  handleBallWallCollision();
  handleBallPaddleCollision();
}

function drawBackground() {
  const dim = game.dimensions[game.worldIndex];

  if (dim === "Overworld") {
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.fillStyle = "#5cb85c";
    ctx.fillRect(0, game.height * 0.72, game.width, game.height * 0.28);

    drawMountain(80, game.height * 0.7, 120, 160, "#7c8d72");
    drawMountain(260, game.height * 0.68, 140, 180, "#7d8f74");
    drawMountain(540, game.height * 0.72, 120, 170, "#7a7068");
    drawMountain(760, game.height * 0.69, 140, 190, "#7d8f74");

    drawTree(90, game.height * 0.6);
    drawTree(680, game.height * 0.64);
    drawVillage(420, game.height * 0.74);
    drawCave(850, game.height * 0.8);
    drawDesertPatch(210, game.height * 0.78, 90, 40);
    drawAnimal(150, game.height * 0.83, "cow");
    drawAnimal(830, game.height * 0.83, "sheep");
  } else if (dim === "Nether") {
    ctx.fillStyle = "#2f0f18";
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.fillStyle = "#c84c2d";
    ctx.fillRect(0, game.height * 0.7, game.width, game.height * 0.3);

    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#7b1f1f" : "#4d1515";
      ctx.fillRect(i * 85, game.height * 0.7, 60, game.height * 0.3);
    }

    drawNetherCave(180, 200, 100, 130);
    drawNetherCave(620, 180, 120, 150);
    drawMobs("creeper", 120, 120);
    drawMobs("zombie", 220, 90);
    drawMobs("witch", 760, 120);
  } else {
    ctx.fillStyle = "#100c1a";
    ctx.fillRect(0, 0, game.width, game.height);
    ctx.fillStyle = "#2a1f3d";
    ctx.fillRect(0, game.height * 0.72, game.width, game.height * 0.28);

    drawEndGlow(140, 180, 100, 120);
    drawEndGlow(660, 120, 120, 140);
    drawCrystal(270, 220, "#bde0ff");
    drawCrystal(710, 240, "#c7a8ff");
    drawMobs("enderman", 120, 120);
    drawMobs("skeleton", 820, 120);
    drawMobs("spider", 420, 100);
  }

  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(0, 0, game.width, 26);
  ctx.fillRect(0, game.height - 26, game.width, 26);
}

function drawMountain(x, baseY, width, height, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, baseY);
  ctx.lineTo(x + width * 0.48, baseY - height);
  ctx.lineTo(x + width, baseY);
  ctx.closePath();
  ctx.fill();
}

function drawTree(x, baseY) {
  ctx.fillStyle = "#7a532f";
  ctx.fillRect(x, baseY, 18, 54);
  ctx.fillStyle = "#2f8b2f";
  ctx.beginPath();
  ctx.arc(x + 9, baseY - 10, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 10, baseY + 8, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 24, baseY + 8, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawVillage(x, baseY) {
  ctx.fillStyle = "#d8c18a";
  ctx.fillRect(x, baseY - 30, 44, 30);
  ctx.fillRect(x + 54, baseY - 26, 38, 26);
  ctx.fillStyle = "#7a521a";
  ctx.fillRect(x + 10, baseY - 20, 10, 20);
  ctx.fillRect(x + 62, baseY - 14, 10, 14);
  ctx.fillStyle = "#8fd7f7";
  ctx.fillRect(x + 12, baseY - 16, 8, 8);
  ctx.fillRect(x + 66, baseY - 11, 8, 8);

  drawVillager(x + 16, baseY + 8, "#eac9a2");
  drawVillager(x + 62, baseY + 8, "#d4a781");
}

function drawVillager(x, y, skin) {
  ctx.fillStyle = "#2f1d12";
  ctx.fillRect(x, y - 6, 10, 16);
  ctx.fillStyle = skin;
  ctx.fillRect(x - 5, y - 12, 20, 12);
  ctx.fillStyle = "#4b7a3e";
  ctx.fillRect(x - 2, y - 18, 14, 8);
}

function drawCave(x, y) {
  ctx.fillStyle = "#2e2c2d";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 48, y - 28);
  ctx.lineTo(x + 90, y);
  ctx.lineTo(x + 80, y + 40);
  ctx.lineTo(x + 28, y + 50);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#100f10";
  ctx.fillRect(x + 24, y + 10, 22, 18);
}

function drawDesertPatch(x, y, w, h) {
  ctx.fillStyle = "#d8c468";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#c7ac46";
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(x + i * 14, y + i * 2, 10, 8);
  }
}

function drawAnimal(x, y, type) {
  ctx.fillStyle = type === "cow" ? "#8c8d8d" : "#d5d5d5";
  ctx.fillRect(x, y, 28, 16);
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 4, y - 8, 6, 6);
  ctx.fillRect(x + 18, y - 8, 6, 6);
  ctx.fillStyle = "#6f3500";
  ctx.fillRect(x + 36, y + 2, 10, 4);
}

function drawNetherCave(x, y, w, h) {
  ctx.fillStyle = "#1a0d14";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#f3a64a";
  ctx.fillRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.2);
}

function drawEndGlow(x, y, w, h) {
  ctx.fillStyle = "#5d3d8c";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#d7a8ff";
  ctx.fillRect(x + w * 0.2, y + h * 0.15, w * 0.6, h * 0.7);
}

function drawCrystal(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 30);
  ctx.lineTo(x + 12, y - 4);
  ctx.lineTo(x + 28, y - 32);
  ctx.lineTo(x + 18, y + 10);
  ctx.lineTo(x, y + 28);
  ctx.lineTo(x - 16, y + 2);
  ctx.closePath();
  ctx.fill();
}

function drawMobs(type, x, y) {
  if (type === "creeper") {
    ctx.fillStyle = "#5abf46";
    ctx.fillRect(x, y, 34, 34);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 7, y + 7, 7, 7);
    ctx.fillRect(x + 20, y + 7, 7, 7);
    ctx.fillRect(x + 13, y + 18, 8, 7);
  } else if (type === "enderman") {
    ctx.fillStyle = "#1d1224";
    ctx.fillRect(x, y, 36, 36);
    ctx.fillStyle = "#8b7ad1";
    ctx.fillRect(x + 8, y + 9, 7, 7);
    ctx.fillRect(x + 20, y + 9, 7, 7);
  } else if (type === "zombie") {
    ctx.fillStyle = "#5d9d5d";
    ctx.fillRect(x, y, 30, 30);
    ctx.fillStyle = "#d0a06b";
    ctx.fillRect(x + 7, y + 5, 16, 10);
  } else if (type === "witch") {
    ctx.fillStyle = "#5f6d3d";
    ctx.fillRect(x, y, 32, 32);
    ctx.fillStyle = "#ffc82f";
    ctx.fillRect(x + 10, y - 8, 12, 8);
  } else if (type === "skeleton") {
    ctx.fillStyle = "#d9d7cb";
    ctx.fillRect(x, y, 28, 30);
    ctx.fillStyle = "#000";
    ctx.fillRect(x + 6, y + 8, 5, 5);
    ctx.fillRect(x + 18, y + 8, 5, 5);
  } else if (type === "spider") {
    ctx.fillStyle = "#1d1d20";
    ctx.fillRect(x, y, 28, 18);
    ctx.fillRect(x + 5, y + 18, 6, 18);
    ctx.fillRect(x + 17, y + 18, 6, 18);
  }
}

function drawSteve() {
  const x = leftPaddle.x + 4;
  const y = leftPaddle.y + 10;
  ctx.fillStyle = "#3d9ad8";
  ctx.fillRect(x, y, 18, 8);
  ctx.fillStyle = "#f5d8b3";
  ctx.fillRect(x + 3, y - 10, 12, 10);
  ctx.fillStyle = "#1d1d1d";
  ctx.fillRect(x + 4, y - 7, 3, 3);
  ctx.fillRect(x + 11, y - 7, 3, 3);
  ctx.fillStyle = "#7e5a3d";
  ctx.fillRect(x + 3, y + 8, 3, 14);
  ctx.fillRect(x + 12, y + 8, 3, 14);
  ctx.fillStyle = "#2d5feb";
  ctx.fillRect(x + 2, y + 22, 6, 18);
  ctx.fillRect(x + 10, y + 22, 6, 18);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(leftPaddle.name, x - 4, leftPaddle.y - 18);
}

function drawRightMob() {
  const x = rightPaddle.x + 2;
  const y = rightPaddle.y + 22;
  ctx.fillStyle = "#73d66d";
  ctx.fillRect(x, y, 14, 14);
  ctx.fillStyle = "#404040";
  ctx.fillRect(x + 2, y - 10, 10, 10);
  ctx.fillStyle = "#000";
  ctx.fillRect(x + 5, y - 8, 2, 2);
  ctx.fillRect(x + 9, y - 8, 2, 2);
}

function drawPaddles() {
  ctx.fillStyle = "#568e3d";
  ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  ctx.fillStyle = "#7d7d7d";
  ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  drawSteve();
  drawRightMob();
}

function drawBall() {
  ctx.fillStyle = "#f4d35e";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.setLineDash([16, 12]);
  ctx.beginPath();
  ctx.moveTo(game.width / 2, 0);
  ctx.lineTo(game.width / 2, game.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function render() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawBackground();
  drawCenterLine();
  drawPaddles();
  drawBall();
}

function gameLoop(timestamp) {
  const delta = Math.min((timestamp - game.lastFrame) / 1000 || 0.016, 0.032);
  game.lastFrame = timestamp;
  update(delta);
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
    event.preventDefault();
  }
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const relativeY = ((event.clientY - rect.top) / rect.height) * game.height;
  leftPaddle.mouseY = relativeY;
});

resetBall(1);
leftScoreEl.textContent = game.leftScore;
rightScoreEl.textContent = game.rightScore;
dimensionEl.textContent = game.dimensions[game.worldIndex];
requestAnimationFrame(gameLoop);

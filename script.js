const gameArea = document.getElementById("game-area");
const balloonLayer = document.getElementById("balloon-layer");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const comboElement = document.getElementById("combo");
const overlay = document.getElementById("game-overlay");
const overlayEmoji = document.getElementById("overlay-emoji");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const playButton = document.getElementById("play-button");
const toast = document.getElementById("toast");

const balloonColors = ["#f58cac", "#9d83dc", "#f7ba68", "#75c9b3", "#78afd9"];
const confettiColors = ["#f58cac", "#9d83dc", "#f7ba68", "#75c9b3", "#78afd9"];
const balloonTimers = new Map();
let score = 0;
let combo = 0;
let timeLeft = 30;
let gameRunning = false;
let countdownId;
let spawnId;
let toastId;

function updateStats() {
  scoreElement.textContent = String(score);
  timerElement.textContent = String(timeLeft);
  comboElement.textContent = String(combo);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastId);
  toastId = window.setTimeout(() => toast.classList.remove("show"), 850);
}

function removeBalloon(balloon, missed = false) {
  const timeoutId = balloonTimers.get(balloon);
  if (timeoutId) {
    window.clearTimeout(timeoutId);
    balloonTimers.delete(balloon);
  }
  balloon.remove();

  if (missed && gameRunning && combo > 0) {
    combo = 0;
    updateStats();
  }
}

function popBalloon(event) {
  const balloon = event.currentTarget;
  if (!gameRunning || balloon.classList.contains("pop")) return;

  combo += 1;
  const points = combo > 0 && combo % 5 === 0 ? 3 : 1;
  score += points;
  updateStats();

  const areaBounds = gameArea.getBoundingClientRect();
  const balloonBounds = balloon.getBoundingClientRect();
  const pointsLabel = document.createElement("span");
  pointsLabel.className = "balloon-points";
  pointsLabel.textContent = points > 1 ? `+${points} 连击！` : "+1";
  pointsLabel.style.left = `${balloonBounds.left - areaBounds.left + 5}px`;
  pointsLabel.style.top = `${balloonBounds.top - areaBounds.top}px`;
  balloonLayer.append(pointsLabel);
  window.setTimeout(() => pointsLabel.remove(), 700);

  balloon.classList.add("pop");
  const timeoutId = balloonTimers.get(balloon);
  if (timeoutId) window.clearTimeout(timeoutId);
  balloonTimers.delete(balloon);
  window.setTimeout(() => balloon.remove(), 190);

  if (combo % 5 === 0) showToast(`太棒啦！${combo} 连击 ✨`);
}

function spawnBalloon() {
  if (!gameRunning) return;

  const balloons = balloonLayer.querySelectorAll(".balloon");
  const maximumBalloons = score >= 20 ? 7 : score >= 10 ? 6 : 5;
  if (balloons.length < maximumBalloons) {
    const balloon = document.createElement("button");
    const width = 57;
    const maxX = Math.max(12, gameArea.clientWidth - width - 12);
    const maxY = Math.max(80, gameArea.clientHeight - 106);
    const minY = 62;
    const top = minY + Math.random() * Math.max(0, maxY - minY);

    balloon.className = "balloon";
    balloon.type = "button";
    balloon.setAttribute("aria-label", "点破这个生日气球");
    balloon.textContent = "✦";
    balloon.style.left = `${12 + Math.random() * (maxX - 12)}px`;
    balloon.style.top = `${top}px`;
    balloon.style.setProperty("--balloon-color", balloonColors[Math.floor(Math.random() * balloonColors.length)]);
    balloon.addEventListener("click", popBalloon);
    balloonLayer.append(balloon);

    const lifetime = score >= 20 ? 1900 : 2500;
    const timeoutId = window.setTimeout(() => removeBalloon(balloon, true), lifetime);
    balloonTimers.set(balloon, timeoutId);
  }

  const elapsed = 30 - timeLeft;
  const nextDelay = Math.max(420, 920 - elapsed * 15);
  spawnId = window.setTimeout(spawnBalloon, nextDelay);
}

function clearGameObjects() {
  for (const timeoutId of balloonTimers.values()) window.clearTimeout(timeoutId);
  balloonTimers.clear();
  balloonLayer.replaceChildren();
}

function launchConfetti() {
  for (let index = 0; index < 55; index += 1) {
    const piece = document.createElement("span");
    const duration = 1.8 + Math.random() * 2;
    piece.className = "confetti-piece";
    piece.setAttribute("aria-hidden", "true");
    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--drift", `${Math.random() * 150 - 75}px`);
    piece.style.setProperty("--duration", `${duration}s`);
    piece.style.setProperty("--confetti-color", confettiColors[Math.floor(Math.random() * confettiColors.length)]);
    gameArea.append(piece);
    window.setTimeout(() => piece.remove(), duration * 1000);
  }
}

function finishGame() {
  gameRunning = false;
  window.clearInterval(countdownId);
  window.clearTimeout(spawnId);
  clearGameObjects();

  overlayEmoji.textContent = score >= 30 ? "🥳" : "🎂";
  overlayTitle.textContent = score >= 30 ? "Kevin 的快乐值爆表！" : "生日快乐，Kevin！";
  overlayMessage.textContent = `你收集了 ${score} 份快乐${score > 0 ? "，" : "！"}愿你的新一岁每天都有惊喜和好心情！`;
  playButton.innerHTML = '再玩一次 <span aria-hidden="true">↻</span>';
  overlay.classList.remove("is-hidden");
  playButton.focus();
  launchConfetti();
}

function startGame() {
  window.clearInterval(countdownId);
  window.clearTimeout(spawnId);
  clearGameObjects();
  score = 0;
  combo = 0;
  timeLeft = 30;
  gameRunning = true;
  updateStats();
  overlay.classList.add("is-hidden");
  playButton.innerHTML = '开始游戏 <span aria-hidden="true">→</span>';
  spawnBalloon();

  countdownId = window.setInterval(() => {
    timeLeft -= 1;
    updateStats();
    if (timeLeft <= 0) finishGame();
  }, 1000);
}

playButton.addEventListener("click", startGame);

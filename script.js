/* =========================================================
   GHOST SENTINEL
   Premises: Temporality × Feedback
   Change the values in CONFIG for the live presentation.
   ========================================================= */

const CONFIG = {
  GHOST_DELAY_MS: 3000,       // Temporality: how far in the past the ghost is
  GHOST_ENABLED: true,
  SHOW_TRAIL: true,           // Feedback: show the ghost's upcoming path
  SHOW_COUNTDOWN: true,
  PLAYER_SPEED: 175,
  PLAYER_RADIUS: 10,
  GHOST_RADIUS: 12,
  COIN_RADIUS: 8,
  COIN_COUNT: 6,
  WIN_SCORE: 15,
  LIVES: 3,
  INVULNERABLE_MS: 1400,
  ARENA: 480
};

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
const $ = id => document.getElementById(id);

const keys = { up: false, down: false, left: false, right: false };
const KEYMAP = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right"
};

const css = name =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

let state;

function newGame() {
  for (const key in keys) keys[key] = false;

  const now = performance.now();
  state = {
    x: CONFIG.ARENA / 2,
    y: CONFIG.ARENA / 2,
    history: [],
    startT: now,
    score: 0,
    lives: CONFIG.LIVES,
    coins: [],
    face: { x: 0, y: 1 },
    over: false,
    won: false,
    hitAt: -Infinity,
    last: now
  };

  while (state.coins.length < CONFIG.COIN_COUNT) spawnCoin();
  setMsg(`Collect ${CONFIG.WIN_SCORE} stars. Your ghost is coming...`);
}

function setMsg(message) {
  $("msg").textContent = message;
}

function spawnCoin() {
  const margin = 28;
  const max = CONFIG.ARENA - margin;
  state.coins.push({
    x: margin + Math.random() * (max - margin),
    y: margin + Math.random() * (max - margin)
  });
}

/* Return the player's exact recorded position at a past time.
   Interpolation makes the ghost move smoothly between recorded frames. */
function ghostAt(now) {
  if (!CONFIG.GHOST_ENABLED) return null;

  const targetTime = now - CONFIG.GHOST_DELAY_MS;
  if (targetTime < state.startT || state.history.length < 2) return null;

  const history = state.history;

  for (let i = history.length - 1; i > 0; i--) {
    const newer = history[i];
    const older = history[i - 1];

    if (older.t <= targetTime && newer.t >= targetTime) {
      const span = newer.t - older.t || 1;
      const amount = (targetTime - older.t) / span;

      return {
        x: older.x + (newer.x - older.x) * amount,
        y: older.y + (newer.y - older.y) * amount
      };
    }
  }

  return history[0];
}

function update(now) {
  const dt = Math.min(0.05, (now - state.last) / 1000);
  state.last = now;

  if (state.over) return;

  let dx = Number(keys.right) - Number(keys.left);
  let dy = Number(keys.down) - Number(keys.up);

  // Keep diagonal movement at the same speed as straight movement.
  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }

  if (dx !== 0 || dy !== 0) state.face = { x: dx, y: dy };

  const radius = CONFIG.PLAYER_RADIUS;
  const edge = CONFIG.ARENA;

  state.x = Math.max(radius, Math.min(
    edge - radius, state.x + dx * CONFIG.PLAYER_SPEED * dt
  ));
  state.y = Math.max(radius, Math.min(
    edge - radius, state.y + dy * CONFIG.PLAYER_SPEED * dt
  ));

  // Temporality: continuously record the player's path.
  state.history.push({ t: now, x: state.x, y: state.y });

  // Keep only the history needed by the delayed ghost.
  const cutoff = now - CONFIG.GHOST_DELAY_MS - 250;
  while (state.history.length > 2 && state.history[1].t < cutoff) {
    state.history.shift();
  }

  // Collect stars.
  for (let i = state.coins.length - 1; i >= 0; i--) {
    const coin = state.coins[i];
    const distance = Math.hypot(coin.x - state.x, coin.y - state.y);

    if (distance < radius + CONFIG.COIN_RADIUS) {
      state.coins.splice(i, 1);
      state.score++;
      spawnCoin();
      setMsg(`Star collected! ${state.score}/${CONFIG.WIN_SCORE}`);
    }
  }

  if (state.score >= CONFIG.WIN_SCORE) {
    state.over = true;
    state.won = true;
    setMsg("You escaped your past! You win — press Enter to play again.");
    return;
  }

  // Feedback and consequence: touching the delayed ghost costs a life.
  const ghost = ghostAt(now);
  const protectedNow = now - state.hitAt < CONFIG.INVULNERABLE_MS;

  if (
    ghost &&
    !protectedNow &&
    Math.hypot(ghost.x - state.x, ghost.y - state.y) <
      radius + CONFIG.GHOST_RADIUS
  ) {
    state.lives--;
    state.hitAt = now;

    if (state.lives <= 0) {
      state.over = true;
      setMsg("Your past caught you. Game over — press Enter to restart.");
    } else {
      setMsg(`Your ghost caught you! ${state.lives} lives remaining.`);
    }
  }
}

function drawGrid() {
  const size = CONFIG.ARENA;
  ctx.save();
  ctx.strokeStyle = css("--line");
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;

  for (let i = 40; i < size; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  ctx.restore();
}

function drawStar(x, y, outer, inner, points = 5) {
  ctx.beginPath();

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * i / points) - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
}

function drawCoin(coin, now) {
  const pulse = 1 + 0.13 * Math.sin(now / 230 + coin.x);
  const radius = CONFIG.COIN_RADIUS * pulse;

  ctx.save();
  ctx.shadowColor = css("--coin");
  ctx.shadowBlur = 16;
  ctx.fillStyle = css("--coin");
  drawStar(coin.x, coin.y, radius * 1.5, radius * 0.65);
  ctx.fill();
  ctx.restore();
}

function drawEyes(x, y, radius, lookX, lookY) {
  for (const side of [-1, 1]) {
    const eyeX = x + side * radius * 0.38;
    const eyeY = y - radius * 0.12;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#14213d";
    ctx.beginPath();
    ctx.arc(
      eyeX + lookX * radius * 0.1,
      eyeY + lookY * radius * 0.1,
      radius * 0.12,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

function drawPlayer(now) {
  const radius = CONFIG.PLAYER_RADIUS * 1.3;
  const blinking =
    now - state.hitAt < CONFIG.INVULNERABLE_MS &&
    Math.floor(now / 100) % 2 === 0;

  if (blinking) return;

  ctx.save();
  ctx.shadowColor = css("--player");
  ctx.shadowBlur = 18;

  const gradient = ctx.createRadialGradient(
    state.x - radius / 3,
    state.y - radius / 3,
    2,
    state.x,
    state.y,
    radius
  );

  gradient.addColorStop(0, "#fff3b0");
  gradient.addColorStop(1, css("--player"));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(state.x, state.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawEyes(state.x, state.y, radius, state.face.x, state.face.y);
}

function drawGhost(ghost, now) {
  const radius = CONFIG.GHOST_RADIUS * 1.4;
  const x = ghost.x;
  const y = ghost.y + Math.sin(now / 190) * 2;

  ctx.save();
  ctx.shadowColor = css("--ghost");
  ctx.shadowBlur = 18;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = css("--ghost");

  // Ghost silhouette.
  ctx.beginPath();
  ctx.moveTo(x - radius, y + radius);
  ctx.lineTo(x - radius, y);
  ctx.arc(x, y, radius, Math.PI, 0);
  ctx.lineTo(x + radius, y + radius);
  ctx.quadraticCurveTo(x + radius / 2, y + radius - 7, x, y + radius);
  ctx.quadraticCurveTo(x - radius / 2, y + radius + 7, x - radius, y + radius);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const dx = state.x - x;
  const dy = state.y - y;
  const distance = Math.hypot(dx, dy) || 1;

  drawEyes(x, y, radius, dx / distance, dy / distance);

  ctx.save();
  ctx.fillStyle = css("--ink");
  ctx.font = "bold 11px Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GHOST", x, y - radius - 9);
  ctx.restore();
}

function drawTrail(now, ghost) {
  if (!CONFIG.GHOST_ENABLED || !CONFIG.SHOW_TRAIL || !ghost) return;

  const targetTime = now - CONFIG.GHOST_DELAY_MS;
  const upcoming = state.history.filter(point => point.t >= targetTime);

  if (upcoming.length < 2) return;

  ctx.save();
  ctx.strokeStyle = css("--ghost");
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([5, 7]);

  ctx.beginPath();
  ctx.moveTo(ghost.x, ghost.y);

  for (const point of upcoming) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.stroke();
  ctx.restore();
}

function drawHUD(now, ghost) {
  $("score").textContent = `★ ${state.score}/${CONFIG.WIN_SCORE}`;
  $("lives").textContent = `Lives: ${state.lives}`;

  let delayText = `Ghost delay: ${(CONFIG.GHOST_DELAY_MS / 1000).toFixed(1)}s`;

  if (!CONFIG.GHOST_ENABLED) {
    delayText = "Ghost: OFF";
  } else if (CONFIG.SHOW_COUNTDOWN && !ghost && !state.over) {
    const remaining = Math.max(
      0,
      (state.startT + CONFIG.GHOST_DELAY_MS - now) / 1000
    );
    delayText = `Ghost wakes in: ${remaining.toFixed(1)}s`;
  }

  $("delay").textContent = delayText;
}

function draw(now) {
  ctx.clearRect(0, 0, CONFIG.ARENA, CONFIG.ARENA);

  drawGrid();
  state.coins.forEach(coin => drawCoin(coin, now));

  const ghost = ghostAt(now);
  drawTrail(now, ghost);

  if (ghost) drawGhost(ghost, now);
  drawPlayer(now);
  drawHUD(now, ghost);
}

function gameLoop(now) {
  update(now);
  draw(now);
  requestAnimationFrame(gameLoop);
}

/* Keyboard controls: arrows and WASD. */
addEventListener("keydown", event => {
  if (event.code === "Enter" && state.over) {
    newGame();
    event.preventDefault();
    return;
  }

  const direction = KEYMAP[event.code];
  if (direction) {
    keys[direction] = true;
    event.preventDefault();
  }
});

addEventListener("keyup", event => {
  const direction = KEYMAP[event.code];
  if (direction) keys[direction] = false;
});

addEventListener("blur", () => {
  for (const key in keys) keys[key] = false;
});

/* On-screen controls: pointer and touch. */
document.querySelectorAll("#pad button").forEach(button => {
  const direction = button.dataset.k;

  button.addEventListener("pointerdown", event => {
    keys[direction] = true;
    button.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  const release = () => {
    keys[direction] = false;
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  button.addEventListener("pointerleave", release);
});

$("restart").addEventListener("click", newGame);

newGame();
requestAnimationFrame(gameLoop);

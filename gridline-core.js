// GRIDLINE core game logic (v0.1+)
// Pure in-memory state + helper functions for server/clients.

const width = 8;
const height = 5;

const roles = ["INFILTRATOR", "SENTINEL"];

const ROUND_DURATION_MS = 180000; // 3 minutes

const state = {
  grid: Array.from({ length: height }, () => Array.from({ length: width }, () => '.')),
  players: {}, // id -> { id, role, x, y, symbol }
  roundActive: false,
  roundEndsAt: null,
  lastResult: null,
};

function resetGrid() {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      state.grid[y][x] = '.';
    }
  }
}

function ensureRound() {
  const now = Date.now();
  if (!state.roundActive) {
    state.roundActive = true;
    state.roundEndsAt = now + ROUND_DURATION_MS;
    state.lastResult = null;
  } else if (state.roundActive && state.roundEndsAt && now >= state.roundEndsAt) {
    // End round, score, reset grid, immediately start next round
    let infil = 0;
    let secured = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (state.grid[y][x] === 'i') infil++;
        if (state.grid[y][x] === 's') secured++;
      }
    }
    let winner = 'DRAW';
    if (infil > secured) winner = 'INFILTRATORS';
    else if (secured > infil) winner = 'SENTINELS';
    state.lastResult = { infil, secured, winner, endedAt: now };
    resetGrid();
    state.roundEndsAt = now + ROUND_DURATION_MS;
  }
}

function createPlayer(id) {
  if (state.players[id]) return state.players[id];
  const existingCount = Object.keys(state.players).length;
  const role = roles[existingCount % roles.length];
  const symbol = role === 'INFILTRATOR' ? '◇' : '■';
  const x = 2 + (existingCount % 3);
  const y = 1 + (existingCount % 3);
  const player = { id, role, x, y, symbol };
  state.players[id] = player;
  ensureRound();
  return player;
}

function getSnapshot() {
  ensureRound();
  const now = Date.now();
  const remainingMs = state.roundActive && state.roundEndsAt
    ? Math.max(state.roundEndsAt - now, 0)
    : 0;
  return {
    width,
    height,
    grid: state.grid,
    players: Object.values(state.players).map(p => ({
      id: p.id,
      role: p.role,
      x: p.x,
      y: p.y,
      symbol: p.symbol,
    })),
    round: {
      active: state.roundActive,
      remainingMs,
      lastResult: state.lastResult,
    },
  };
}

function renderForPlayer(id) {
  const me = state.players[id];
  if (!me) return '[ERR] No such player.';
  const lines = [];
  lines.push('+--------- GRIDLINE: SECTOR 3F ---------+');
  for (let y = 0; y < height; y++) {
    let row = '| ';
    for (let x = 0; x < width; x++) {
      let cellChar = state.grid[y][x];
      for (const pid of Object.keys(state.players)) {
        const p = state.players[pid];
        if (p.x === x && p.y === y) {
          cellChar = (pid === id) ? p.symbol : '·';
        }
      }
      row += cellChar + '   ';
    }
    row += '|';
    lines.push(row);
  }
  lines.push('+---------------------------------------+');
  lines.push(`You are: ${me.symbol} (${me.role}_${me.id}) at (${me.x},${me.y})`);
  const snapshot = getSnapshot();
  if (snapshot.round && snapshot.round.active) {
    const secs = Math.ceil(snapshot.round.remainingMs / 1000);
    lines.push(`Round: ${secs}s remaining`);
  }
  if (snapshot.round && snapshot.round.lastResult) {
    const { infil, secured, winner } = snapshot.round.lastResult;
    lines.push(`Last round: ${winner} (i=${infil}, s=${secured})`);
  }
  lines.push('Commands: /m <w/a/s/d>, /tag, /scan, /map, /whoami, /quit');
  return lines.join('\n');
}

function handleCommand(id, input) {
  const me = state.players[id];
  if (!me) return '[ERR] Player not initialized.';
  const [cmd, arg] = input.trim().split(/\s+/, 2);

  if (cmd === '/m' && arg) {
    if (arg === 'w' && me.y > 0) me.y--;
    if (arg === 's' && me.y < height - 1) me.y++;
    if (arg === 'a' && me.x > 0) me.x--;
    if (arg === 'd' && me.x < width - 1) me.x++;
    return renderForPlayer(id);
  }

  if (cmd === '/map') return renderForPlayer(id);

  if (cmd === '/whoami') return `You are ${me.id} (${me.role}) at (${me.x},${me.y})`;

  if (cmd === '/tag') {
    const cell = state.grid[me.y][me.x];
    if (me.role === 'INFILTRATOR' && cell === '.') {
      state.grid[me.y][me.x] = 'i';
      return renderForPlayer(id) + '\n[OK] Cell infiltrated.';
    }
    if (me.role === 'SENTINEL' && cell === 'i') {
      state.grid[me.y][me.x] = 's';
      return renderForPlayer(id) + '\n[OK] Cell secured.';
    }
    return renderForPlayer(id) + '\n[WARN] Nothing to tag here.';
  }

  if (cmd === '/scan') {
    if (me.role !== 'SENTINEL') return '[WARN] /scan is SENTINEL only.';
    const seen = [];
    for (const pid of Object.keys(state.players)) {
      if (pid === id) continue;
      const p = state.players[pid];
      const dx = Math.abs(p.x - me.x);
      const dy = Math.abs(p.y - me.y);
      if (dx <= 2 && dy <= 2) seen.push(`${pid} at (${p.x},${p.y})`);
    }
    if (!seen.length) return '[SCAN] No ops in range.';
    return '[SCAN] Nearby ops: ' + seen.join(', ');
  }

  if (cmd === '/quit') return '[EXIT]';

  return '[WARN] Unknown command';
}

module.exports = {
  state,
  width,
  height,
  createPlayer,
  getSnapshot,
  renderForPlayer,
  handleCommand,
};

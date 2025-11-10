// GRIDLINE core game logic (v0.1)
// Pure in-memory state + helper functions for server/clients.

const width = 8;
const height = 5;

const roles = ["INFILTRATOR", "SENTINEL"];

const state = {
  grid: Array.from({ length: height }, () => Array.from({ length: width }, () => '.')),
  players: {}, // id -> { id, role, x, y, symbol }
};

function createPlayer(id) {
  if (state.players[id]) return state.players[id];
  const existingCount = Object.keys(state.players).length;
  const role = roles[existingCount % roles.length];
  const symbol = role === 'INFILTRATOR' ? '◇' : '■';
  // naive spawn: center-ish
  const x = 2 + (existingCount % 3);
  const y = 1 + (existingCount % 3);
  const player = { id, role, x, y, symbol };
  state.players[id] = player;
  return player;
}

function getSnapshot() {
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

// Minimal tests for GRIDLINE core (run with `node gridline-core.test.js`)

const assert = require('assert');
const core = require('./gridline-core');

function resetState() {
  // naive reset for now
  core.state.grid.forEach((row, y) => {
    row.forEach((_, x) => {
      core.state.grid[y][x] = '.';
    });
  });
  for (const id of Object.keys(core.state.players)) {
    delete core.state.players[id];
  }
}

function testRolesAlternate() {
  resetState();
  const a = core.createPlayer('A');
  const b = core.createPlayer('B');
  assert.strictEqual(a.role, 'INFILTRATOR');
  assert.strictEqual(b.role, 'SENTINEL');
}

function testMoveWithinBounds() {
  resetState();
  const p = core.createPlayer('P');
  const out = core.handleCommand('P', '/m d');
  assert.ok(out.includes('(3,')); // moved right from initial x
}

function testTagInfiltrator() {
  resetState();
  const p = core.createPlayer('I');
  core.handleCommand('I', '/tag');
  assert.strictEqual(core.state.grid[p.y][p.x], 'i');
}

function testScanSentinel() {
  resetState();
  const a = core.createPlayer('A'); // INFILTRATOR
  const s = core.createPlayer('S'); // SENTINEL
  // move A near S
  core.state.players[a.id].x = core.state.players[s.id].x;
  core.state.players[a.id].y = core.state.players[s.id].y + 1;
  const res = core.handleCommand(s.id, '/scan');
  assert.ok(res.includes('A at'));
}

function run() {
  testRolesAlternate();
  testMoveWithinBounds();
  testTagInfiltrator();
  testScanSentinel();
  console.log('gridline-core tests passed');
}

if (require.main === module) {
  run();
}

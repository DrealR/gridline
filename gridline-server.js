#!/usr/bin/env node

// GRIDLINE v0.1 server
// - In-memory game state via gridline-core
// - HTTP API for web viewer
// - Minimal built-in CLI for local testing (single player)

const http = require('http');
const readline = require('readline');
const core = require('./gridline-core');

// HTTP: expose state for web viewer and remote CLIs
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/state') {
    const snapshot = core.getSnapshot();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(snapshot));
    return;
  }

  if (req.method === 'POST' && req.url === '/join') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let id;
      try {
        const parsed = body ? JSON.parse(body) : {};
        id = parsed.id || undefined;
      } catch (_) {
        id = undefined;
      }
      if (!id) {
        // generate a simple short id
        id = Math.random().toString(36).slice(2, 6).toUpperCase();
      }
      const player = core.createPlayer(id);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify({
        id: player.id,
        role: player.role,
        x: player.x,
        y: player.y,
        symbol: player.symbol,
        message: `Welcome, OPERATIVE ${player.id}. Role: ${player.role}.`,
      }));
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/command') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const { id, command } = JSON.parse(body || '{}');
        if (!id || !core.state.players[id]) {
          res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(JSON.stringify({ error: 'Unknown or missing player id' }));
          return;
        }
        const output = core.handleCommand(id, command || '');
        const snapshot = core.getSnapshot();
        const event = output === '[EXIT]' ? 'exit' : undefined;
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ output, state: snapshot, event }));
      } catch (err) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ error: 'Invalid command payload' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(31337, () => {
  console.log('[GRIDLINE] HTTP state server listening on http://localhost:31337/state');
});

// Local CLI test client (attached to same process for now)
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',
});

const playerId = 'K7';
core.createPlayer(playerId);

function jackIn() {
  console.clear();
  setTimeout(() => console.log('[BOOT] Initializing secure tunnel...'), 60);
  setTimeout(() => console.log('[LINK] Syncing with GRIDLINE core...'), 120);
  setTimeout(() => console.log('[AUTH] Generating ident...'), 180);
  setTimeout(() => console.log(`[OK] Welcome, OPERATIVE ${playerId}.`), 240);
  setTimeout(() => {
    const me = core.state.players[playerId];
    console.log(`[ZONE] Assigned role: ${me.role}`);
  }, 300);
  setTimeout(() => {
    console.log('[ZONE] Entering Sector 3F...');
    console.log('');
    console.log(core.renderForPlayer(playerId));
    rl.prompt();
  }, 360);
}

jackIn();

rl.on('line', (line) => {
  const out = core.handleCommand(playerId, line);
  if (out === '[EXIT]') {
    rl.close();
    return;
  }
  if (out) console.log(out);
  rl.prompt();
}).on('close', () => {
  process.exit(0);
});

#!/usr/bin/env node

// GRIDLINE external CLI client
// Connects to a running GRIDLINE server via HTTP (/join, /command).

const readline = require('readline');
const http = require('http');

const SERVER_URL = process.env.GRIDLINE_SERVER || 'http://localhost:31337';

function post(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload || {});
    const url = new URL(path, SERVER_URL);

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch (e) {
          resolve({});
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  let id = process.argv[2] || null;

  const joinRes = await post('/join', { id });
  if (!joinRes || !joinRes.id) {
    console.error('[GRIDLINE] Failed to join server.');
    process.exit(1);
  }

  id = joinRes.id;

  console.clear();
  console.log('[BOOT] Initializing secure tunnel...');
  console.log('[LINK] Syncing with GRIDLINE core...');
  console.log(`[AUTH] Binding ident: ${id}`);
  console.log(joinRes.message || `[OK] Welcome, OPERATIVE ${id}.`);
  console.log(`[ZONE] Role: ${joinRes.role}`);
  console.log('[ZONE] Sector 3F linked.');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  async function send(cmd) {
    const res = await post('/command', { id, command: cmd });
    if (res.error) {
      console.log('[ERR]', res.error);
      return;
    }
    if (res.output) console.log(res.output);
    if (res.event === 'exit') {
      rl.close();
      return;
    }
  }

  rl.prompt();
  rl.on('line', async (line) => {
    await send(line.trim());
    rl.prompt();
  }).on('close', () => {
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[GRIDLINE] CLI error:', err.message || err);
    process.exit(1);
  });
}

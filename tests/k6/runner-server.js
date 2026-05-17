/**
 * k6 Runner Server — local HTTP server to run k6 tests via browser UI.
 * No npm install needed — uses only Node.js built-ins.
 *
 * Usage:
 *   node tests/k6/runner-server.js
 *   Open http://localhost:4000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { runTest, stopTest, getStatus, addSseClient, removeSseClient } = require('./runner-k6-manager.js');

const PORT = 4000;

const STATIC_FILES = {
  '/': { file: 'runner-ui.html', mime: 'text/html; charset=utf-8' },
  '/runner-ui.css': { file: 'runner-ui.css', mime: 'text/css' },
  '/runner-ui.js': { file: 'runner-ui.js', mime: 'text/javascript' },
};

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;

  // Static files
  const staticFile = STATIC_FILES[url.pathname];
  if (method === 'GET' && staticFile) {
    res.writeHead(200, { 'Content-Type': staticFile.mime });
    res.end(fs.readFileSync(path.join(__dirname, staticFile.file)));
    return;
  }

  // SSE stream
  if (method === 'GET' && url.pathname === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    addSseClient(res);
    req.on('close', () => removeSseClient(res));
    return;
  }

  // Status
  if (method === 'GET' && url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getStatus()));
    return;
  }

  // Run test
  if (method === 'POST' && url.pathname === '/api/run') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const { test, influx } = JSON.parse(body || '{}');
      const result = runTest(test, influx);
      res.writeHead(result.error ? 400 : 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
    return;
  }

  // Stop test
  if (method === 'POST' && url.pathname === '/api/stop') {
    const result = stopTest();
    res.writeHead(result.error ? 400 : 200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`k6 Runner ready → http://localhost:${PORT}`);
});

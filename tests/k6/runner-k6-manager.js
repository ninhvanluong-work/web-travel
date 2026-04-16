/**
 * k6 process manager — spawns/stops k6 tests, manages SSE clients and output buffer.
 */

const spawn = require('child_process').spawn;
const path = require('path');
const { postAnnotation } = require('./runner-grafana.js');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

const TEST_SCRIPTS = {
  api: 'tests/k6/api-test.js',
  capacity: 'tests/k6/capacity-test.js',
  fe: 'tests/k6/fe-test.js',
  stress: 'tests/k6/stress-test.js',
  spike: 'tests/k6/spike-test.js',
};

let proc = null;
let currentTest = null;
let startedAt = null;
let startMs = null;
let sseClients = [];
let outputBuffer = [];

// ---------------------------------------------------------------------------
// SSE
// ---------------------------------------------------------------------------

function broadcast(payload) {
  const msg = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients = sseClients.filter((res) => {
    try {
      res.write(msg);
      return true;
    } catch {
      return false;
    }
  });
}

function pushLine(line) {
  outputBuffer.push(line);
  if (outputBuffer.length > 200) outputBuffer.shift();
  broadcast({ type: 'output', line });
}

function addSseClient(res) {
  outputBuffer.forEach((line) => res.write(`data: ${JSON.stringify({ type: 'output', line })}\n\n`));
  sseClients.push(res);
}

function removeSseClient(res) {
  sseClients = sseClients.filter((c) => c !== res);
}

// ---------------------------------------------------------------------------
// Run / stop
// ---------------------------------------------------------------------------

function runTest(testName, useInflux) {
  if (proc) return { error: 'A test is already running.' };
  if (!TEST_SCRIPTS[testName]) return { error: `Unknown test: ${testName}` };

  outputBuffer = [];
  currentTest = testName;
  startedAt = new Date().toISOString();
  startMs = Date.now();

  const args = ['run', TEST_SCRIPTS[testName]];
  if (useInflux) args.push('--out', 'influxdb=http://localhost:8086/k6');

  proc = spawn('k6', args, { cwd: PROJECT_ROOT, env: process.env });

  const onData = (data) => data.toString().split('\n').filter(Boolean).forEach(pushLine);

  proc.stdout.on('data', onData);
  proc.stderr.on('data', onData);

  proc.on('close', (code) => {
    const passed = code === 0;
    broadcast({ type: 'done', code, test: currentTest });
    postAnnotation(currentTest, startMs, passed);
    proc = currentTest = startedAt = startMs = null;
  });

  broadcast({ type: 'started', test: testName, influx: useInflux });
  return { ok: true };
}

function stopTest() {
  if (!proc) return { error: 'No test running.' };
  proc.kill('SIGTERM');
  return { ok: true };
}

function getStatus() {
  return { running: !!proc, test: currentTest, startedAt };
}

module.exports = { runTest, stopTest, getStatus, addSseClient, removeSseClient };

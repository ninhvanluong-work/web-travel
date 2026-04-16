const $ = (id) => document.getElementById(id);

const terminal = $('terminal');
const btnRun = $('btnRun');
const btnStop = $('btnStop');
const badge = $('badge');
const dot = $('dot');
const statusTxt = $('statusText');
const hint = $('hint');

const TEST_LABELS = {
  capacity: 'Capacity Test (~21 min)',
  api: 'API Test (~4 min)',
  fe: 'Frontend Test (~13 min)',
  spike: 'Spike Test (~8 min)',
  stress: 'Stress Test (~38 min)',
};

let es = null;

// ---------------------------------------------------------------------------
// UI state
// ---------------------------------------------------------------------------

function setStatus(state, label) {
  badge.className = `badge badge-${state}`;
  dot.className = `dot${state === 'running' ? ' pulse' : ''}`;
  statusTxt.textContent = label;
}

function setRunning(running) {
  btnRun.disabled = running;
  btnStop.disabled = !running;
}

// ---------------------------------------------------------------------------
// Terminal output
// ---------------------------------------------------------------------------

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function colorize(line) {
  if (/✓|PASS|passed/.test(line)) return `<span class="line-pass">${esc(line)}</span>`;
  if (/✗|FAIL|failed|error/i.test(line)) return `<span class="line-fail">${esc(line)}</span>`;
  if (/http_req|vus|iterations/i.test(line)) return `<span class="line-info">${esc(line)}</span>`;
  if (/^\s*(INFO|default|running)/i.test(line)) return `<span class="line-dim">${esc(line)}</span>`;
  return `<span class="line-plain">${esc(line)}</span>`;
}

function appendLine(line) {
  const div = document.createElement('div');
  div.innerHTML = colorize(line);
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

// ---------------------------------------------------------------------------
// SSE stream
// ---------------------------------------------------------------------------

function connectStream() {
  if (es) es.close();
  es = new EventSource('/api/stream');
  es.onmessage = (e) => handleMessage(JSON.parse(e.data));
}

function handleMessage(msg) {
  if (msg.type === 'output') {
    appendLine(msg.line);
    return;
  }
  if (msg.type === 'started') {
    terminal.innerHTML = '';
    setStatus('running', `Running: ${TEST_LABELS[msg.test] ?? msg.test}`);
    setRunning(true);
    hint.textContent = msg.influx ? '→ Metrics đang đổ vào Grafana' : '';
    return;
  }
  if (msg.type === 'done') {
    const ok = msg.code === 0;
    setStatus(ok ? 'passed' : 'failed', ok ? '✓ PASSED' : '✗ FAILED (threshold crossed)');
    setRunning(false);
    hint.textContent = ok
      ? 'Test hoàn thành. Xem kết quả trên Grafana ↗'
      : 'Một số threshold bị vượt — xem log bên trên.';
  }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

async function init() {
  const status = await fetch('/api/status').then((r) => r.json());
  if (status.running) {
    setStatus('running', `Running: ${TEST_LABELS[status.test] ?? status.test}`);
    setRunning(true);
  }
  connectStream();
}

btnRun.addEventListener('click', async () => {
  const test = $('testSelect').value;
  const influx = $('influxToggle').checked;
  terminal.innerHTML = '';
  const result = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test, influx }),
  }).then((r) => r.json());
  if (result.error) alert(result.error);
});

btnStop.addEventListener('click', async () => {
  await fetch('/api/stop', { method: 'POST' });
  hint.textContent = 'Test bị dừng.';
});

init();

/**
 * Grafana integration helpers for the k6 runner server.
 * Posts annotations to mark test start/end on the dashboard.
 */

const http = require('http');

const GRAFANA_URL = 'http://localhost:3001';
const DASHBOARD_UID = 'gz6f48';

/**
 * Posts an annotation to Grafana marking a completed test run.
 * Silent on error — annotation is best-effort.
 */
function postAnnotation(testName, startMs, passed) {
  const text = passed ? `✅ ${testName} — PASSED` : `❌ ${testName} — FAILED (threshold crossed)`;

  const body = JSON.stringify({
    dashboardUID: DASHBOARD_UID,
    time: startMs,
    timeEnd: Date.now(),
    tags: ['k6', testName],
    text,
  });

  const req = http.request(`${GRAFANA_URL}/api/annotations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  });
  req.on('error', () => {});
  req.write(body);
  req.end();
}

module.exports = { postAnnotation };

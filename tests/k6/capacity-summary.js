/**
 * Capacity test summary: reads k6 metrics and generates a human-readable
 * evaluation report with per-stage pass/fail analysis and a recommendation.
 */

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { API_URL } from './config.js';
import { STAGE_STEPS, P95_LIMIT, ERROR_LIMIT } from './capacity-config.js';

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonFile = `tests/k6/reports/capacity-test-${timestamp}.json`;
  const reportFile = `tests/k6/reports/capacity-report-latest.txt`;
  const report = buildEvaluationReport(data);

  return {
    stdout: textSummary(data, { indent: '  ', enableColors: true }) + '\n\n' + report,
    [jsonFile]: JSON.stringify(data, null, 2),
    [reportFile]: report,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function pad(val, len) {
  return String(val).padStart(len);
}

function collectStageResults(metrics) {
  return STAGE_STEPS.map((vu) => {
    const dMetric = metrics[`http_req_duration{stage:${vu}}`];
    const fMetric = metrics[`http_req_failed{stage:${vu}}`];

    if (!dMetric) {
      return { vu, p95: null, avgMs: null, errorPct: null, passP95: false, passErr: false, pass: false };
    }

    const p95 = Math.round(dMetric.values['p(95)']);
    const avgMs = Math.round(dMetric.values['avg']);
    const errorPct = fMetric ? parseFloat((fMetric.values.rate * 100).toFixed(2)) : 0;
    const passP95 = p95 <= P95_LIMIT[vu];
    const passErr = errorPct <= ERROR_LIMIT[vu];

    return { vu, p95, avgMs, errorPct, passP95, passErr, pass: passP95 && passErr };
  });
}

function findBreakpoints(stageResults) {
  let optimalVu = 0;
  let breakingVu = null;

  for (const r of stageResults) {
    if (r.p95 === null) continue;
    if (r.pass) {
      optimalVu = r.vu;
    } else if (breakingVu === null) {
      breakingVu = r.vu;
    }
  }

  return { optimalVu, breakingVu };
}

function renderStageTable(stageResults) {
  const lines = [];
  lines.push('  VUs  │  avg (ms)  │  p95 (ms)  │  Error %  │  Result');
  lines.push('  ─────┼────────────┼────────────┼───────────┼─────────');

  for (const r of stageResults) {
    if (r.p95 === null) {
      lines.push(`   ${pad(r.vu, 3)}  │    N/A     │    N/A     │    N/A    │  ⚠ NO DATA`);
      continue;
    }

    let verdict;
    if (r.pass) verdict = '✓ PASS';
    else if (!r.passP95 && !r.passErr) verdict = '✗ FAIL (slow + errors)';
    else if (!r.passP95) verdict = '✗ FAIL (too slow)';
    else verdict = '✗ FAIL (errors)';

    lines.push(
      `   ${pad(r.vu, 3)}  │  ${pad(r.avgMs + 'ms', 8)}  │  ${pad(r.p95 + 'ms', 8)}  │  ${pad(
        r.errorPct + '%',
        7
      )}  │  ${verdict}`
    );
  }

  return lines.join('\n');
}

function renderRecommendation(optimalVu, breakingVu) {
  const lines = [];

  if (optimalVu === 0) {
    lines.push('  VERDICT: Server FAILED at all load levels.');
    lines.push('  Action  : Check backend logs immediately.');
    lines.push('            Verify API_URL is correct and server is running.');
    return lines.join('\n');
  }

  lines.push(`  Optimal concurrent users : ${optimalVu} VUs`);
  lines.push(`  Safe zone                : 1 – ${optimalVu} VUs   (all thresholds pass)`);
  if (breakingVu) {
    lines.push(`  Breaking point           : ${breakingVu} VUs       (performance degrades)`);
  }
  lines.push('');

  if (optimalVu <= 20) {
    lines.push('  VERDICT: Server is under-provisioned for production traffic.');
    lines.push('');
    lines.push('  Root cause (1GB RAM typical bottlenecks):');
    lines.push('    - Node.js process hitting memory limit under concurrency');
    lines.push('    - Database connection pool exhausted (check pool size)');
    lines.push('    - No caching — every request hits the database');
    lines.push('');
    lines.push('  Recommended actions (priority order):');
    lines.push('    1. Add Redis caching for /video and /video?query=... (TTL 30–60s)');
    lines.push('    2. Increase DB connection pool to 10–20 connections');
    lines.push('    3. Add rate limiting (60 req/min per IP)');
    lines.push('    4. Upgrade to 2GB RAM on fly.dev for ~2x capacity');
    lines.push('    5. Add CDN (Cloudflare) in front of the API');
  } else if (optimalVu <= 50) {
    lines.push('  VERDICT: Server handles light-to-moderate traffic.');
    lines.push(`           Comfortable up to ${optimalVu} concurrent users.`);
    lines.push('');
    lines.push('  Recommended actions:');
    lines.push('    1. Add caching for video list/search responses (TTL 30–60s)');
    lines.push('    2. Enable HTTP keep-alive on the backend');
    lines.push(`    3. Set up alerts when active VUs exceed ${Math.round(optimalVu * 0.8)}`);
    lines.push(`    4. Monitor memory usage — pressure starts near ${breakingVu ?? optimalVu + 10} VUs`);
  } else {
    lines.push(`  VERDICT: Server is well-optimized for 1GB RAM.`);
    lines.push(`           Handles ${optimalVu} concurrent users within thresholds.`);
    lines.push('');
    lines.push('  Recommendations:');
    lines.push(`    1. Set up monitoring/alerting at ${Math.round(optimalVu * 0.8)} VUs`);
    lines.push(`    2. Consider horizontal scaling if traffic exceeds ${optimalVu} VUs`);
  }

  return lines.join('\n');
}

function renderThresholdReference() {
  const lines = [];
  lines.push('  Threshold limits used in this test:');
  lines.push('');
  lines.push('  VUs  │ p95 limit  │ error limit');
  lines.push('  ─────┼────────────┼────────────');
  for (const vu of STAGE_STEPS) {
    lines.push(`   ${pad(vu, 3)}  │  ${pad(P95_LIMIT[vu] + 'ms', 8)}  │  ${ERROR_LIMIT[vu]}%`);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main report builder
// ---------------------------------------------------------------------------

export function buildEvaluationReport(data) {
  const sep = '='.repeat(65);
  const dash = '-'.repeat(65);

  const stageResults = collectStageResults(data.metrics);
  const { optimalVu, breakingVu } = findBreakpoints(stageResults);

  const lines = [
    '',
    sep,
    '  CAPACITY EVALUATION REPORT',
    `  Server target : ${API_URL}`,
    '  RAM limit     : 1 GB',
    `  Generated     : ${new Date().toISOString()}`,
    sep,
    '',
    '  Stage results (each stage = 30s ramp-up + 90s hold)',
    '',
    renderStageTable(stageResults),
    '',
    dash,
    '',
    '  RECOMMENDATION',
    '',
    renderRecommendation(optimalVu, breakingVu),
    '',
    dash,
    '',
    renderThresholdReference(),
    '',
    sep,
    '',
  ];

  return lines.join('\n');
}

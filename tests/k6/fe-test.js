/**
 * Frontend Test: Load test against Vercel-deployed Next.js pages.
 * Tests real page responses (HTML) under concurrent users.
 *
 * Stages: ramp 10 → 50 VUs (Vercel free tier limit consideration)
 * Total: ~13 minutes
 *
 * Run:
 *   tests\k6\run-tests.bat fe
 *   tests\k6\run-tests.bat fe --influx
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { FE_URL, API_URL, browserHeaders, commonHeaders } from './config.js';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '2m', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '2m', target: 20 },
    { duration: '30s', target: 30 },
    { duration: '2m', target: 30 },
    { duration: '30s', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // Vercel CDN should be fast — tighter limits than backend
    'http_req_duration{page:home}': ['p(95)<1500'],
    'http_req_duration{page:search}': ['p(95)<2000'],
    'http_req_duration{page:video}': ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

// ---------------------------------------------------------------------------
// Setup: fetch a real video slug from API to use in video detail test
// ---------------------------------------------------------------------------

export function setup() {
  const res = http.get(`${API_URL}/video?pageSize=3&distanceScore=0`, {
    headers: commonHeaders,
  });

  let videoSlug = 'sample-video';

  if (res.status === 200) {
    try {
      const body = JSON.parse(res.body);
      const items = body?.data?.items;
      if (items && items.length > 0) {
        videoSlug = items[0].slug || videoSlug;
      }
    } catch {
      // fallback to default
    }
  }

  console.log(`Using video slug: ${videoSlug}`);
  return { videoSlug };
}

// ---------------------------------------------------------------------------
// Test scenario
// ---------------------------------------------------------------------------

export default function (data) {
  const videoSlug = data.videoSlug;

  // --- Homepage ---
  group('Homepage (/)', () => {
    const res = http.get(FE_URL, {
      headers: browserHeaders,
      tags: { page: 'home' },
    });
    check(res, {
      'home: status 200': (r) => r.status === 200,
      'home: has html body': (r) => (r.body && r.body.includes('<!DOCTYPE html')) || r.body.includes('<html'),
      'home: not empty': (r) => r.body && r.body.length > 500,
    });
  });

  sleep(1);

  // --- Search page ---
  group('Search Page (/search)', () => {
    const res = http.get(`${FE_URL}/search?q=hanoi`, {
      headers: browserHeaders,
      tags: { page: 'search' },
    });
    check(res, {
      'search: status 200': (r) => r.status === 200,
      'search: has content': (r) => r.body && r.body.length > 500,
    });
  });

  sleep(1);

  // --- Video detail page ---
  group('Video Detail (/video/:slug)', () => {
    const res = http.get(`${FE_URL}/video/${videoSlug}`, {
      headers: browserHeaders,
      tags: { page: 'video' },
    });
    check(res, {
      'video: status 200 or 404': (r) => r.status === 200 || r.status === 404,
      'video: has content': (r) => r.body && r.body.length > 500,
    });
  });

  sleep(1);
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonFile = `tests/k6/reports/fe-test-${timestamp}.json`;
  const report = buildFEReport(data);

  return {
    stdout: textSummary(data, { indent: '  ', enableColors: true }) + '\n\n' + report,
    [jsonFile]: JSON.stringify(data, null, 2),
    'tests/k6/reports/fe-report-latest.txt': report,
  };
}

function buildFEReport(data) {
  const metrics = data.metrics;
  const sep = '='.repeat(65);
  const dash = '-'.repeat(65);

  const pages = [
    { key: 'home', label: 'Homepage     /', limit: 1500 },
    { key: 'search', label: 'Search       /search', limit: 2000 },
    { key: 'video', label: 'Video Detail /video/:slug', limit: 2000 },
  ];

  const lines = [
    '',
    sep,
    '  FRONTEND LOAD TEST REPORT',
    `  Target  : ${FE_URL}`,
    '  Platform: Vercel (free tier)',
    `  Generated: ${new Date().toISOString()}`,
    sep,
    '',
    '  Page             │  avg (ms)  │  p95 (ms)  │  Result',
    '  ─────────────────┼────────────┼────────────┼─────────',
  ];

  for (const page of pages) {
    const m = metrics[`http_req_duration{page:${page.key}}`];
    if (!m) {
      lines.push(`  ${page.label.padEnd(17)}│    N/A     │    N/A     │  ⚠ NO DATA`);
      continue;
    }
    const avg = Math.round(m.values['avg']);
    const p95 = Math.round(m.values['p(95)']);
    const pass = p95 <= page.limit;
    lines.push(
      `  ${page.label.padEnd(17)}│  ${String(avg + 'ms').padStart(8)}  │  ${String(p95 + 'ms').padStart(8)}  │  ${
        pass ? '✓ PASS' : '✗ FAIL'
      }`
    );
  }

  const errorRate = metrics['http_req_failed']?.values?.rate ?? 0;
  const totalReqs = metrics['http_reqs']?.values?.count ?? 0;
  const rps = metrics['http_reqs']?.values?.rate ?? 0;

  lines.push('');
  lines.push(dash);
  lines.push('');
  lines.push(`  Total requests : ${totalReqs}`);
  lines.push(`  Throughput     : ${rps.toFixed(1)} req/s`);
  lines.push(`  Error rate     : ${(errorRate * 100).toFixed(2)}%`);
  lines.push('');
  lines.push('  NOTE: Vercel CDN caches static HTML — p95 reflects');
  lines.push('  cache hit latency, not server render time.');
  lines.push('  High p95 usually means SSR pages calling slow backend.');
  lines.push('');
  lines.push(sep);
  lines.push('');

  return lines.join('\n');
}

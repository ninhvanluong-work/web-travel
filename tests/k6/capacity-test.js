/**
 * Capacity Test: Ramp from 10 → 100 VUs in steps of 10.
 * Each step: 30s ramp-up + 90s hold = 2 min per stage.
 * Total duration: ~21 minutes.
 *
 * Goal: Find the optimal concurrent user limit for a 1GB RAM backend server.
 *
 * Run:
 *   tests\k6\run-tests.bat capacity
 *   tests\k6\run-tests.bat capacity --dashboard
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import exec from 'k6/execution';
import { API_URL, commonHeaders } from './config.js';
import { STAGE_STEPS, buildStages, buildThresholds } from './capacity-config.js';
import { handleSummary } from './capacity-summary.js';

export { handleSummary };

export const options = {
  stages: buildStages(),
  thresholds: buildThresholds(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Buckets the current active VU count into the nearest STAGE_STEPS value.
 * Used to tag each request so per-stage metrics can be filtered in summary.
 */
function getStageTag() {
  const vus = exec.instance.vusActive;
  for (const step of STAGE_STEPS) {
    if (vus <= step) return String(step);
  }
  return '100';
}

// ---------------------------------------------------------------------------
// Test scenario — runs once per VU per iteration
// ---------------------------------------------------------------------------

const VIDEO_SLUG = __ENV.VIDEO_SLUG || 'sample-video';
const SEARCH_QUERY = __ENV.SEARCH_QUERY || 'hanoi';

export default function () {
  const stage = getStageTag();

  group('Video List', () => {
    const res = http.get(`${API_URL}/video?pageSize=6&distanceScore=0`, {
      headers: commonHeaders,
      tags: { stage, endpoint: 'video-list' },
    });
    check(res, {
      'video list: status 200': (r) => r.status === 200,
      'video list: has body': (r) => r.body && r.body.length > 0,
    });
  });

  sleep(0.5);

  group('Video Search', () => {
    const res = http.get(`${API_URL}/video?query=${encodeURIComponent(SEARCH_QUERY)}&pageSize=6&distanceScore=0`, {
      headers: commonHeaders,
      tags: { stage, endpoint: 'video-search' },
    });
    check(res, {
      'video search: status 200': (r) => r.status === 200,
      'video search: returns array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body).data?.items);
        } catch {
          return false;
        }
      },
    });
  });

  sleep(0.5);

  group('Video Detail', () => {
    const res = http.get(`${API_URL}/video/${VIDEO_SLUG}`, {
      headers: commonHeaders,
      tags: { stage, endpoint: 'video-detail' },
    });
    check(res, {
      'video detail: status 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
  });

  sleep(1);
}

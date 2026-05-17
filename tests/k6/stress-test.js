import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { BASE_URL, commonHeaders } from './config.js';
import { makeSummaryHandler } from './summary.js';

export const handleSummary = makeSummaryHandler('stress-test');

/**
 * Stress Test: Finds the breaking point of the system.
 * Gradually increases load to see how the system handles it.
 */
export const options = {
  stages: [
    { duration: '2m', target: 50 }, // below normal load
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 }, // normal load
    { duration: '5m', target: 100 },
    { duration: '2m', target: 200 }, // around breaking point
    { duration: '5m', target: 200 },
    { duration: '2m', target: 300 }, // beyond breaking point
    { duration: '5m', target: 300 },
    { duration: '10m', target: 0 }, // scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // stress test allows higher latency
    http_req_failed: ['rate<0.05'], // allow up to 5% errors under stress
  },
};

const VIDEO_ID = __ENV.VIDEO_ID || '1';
const SEARCH_QUERY = __ENV.SEARCH_QUERY || 'hanoi';

export default function () {
  group('Homepage', () => {
    const res = http.get(BASE_URL, {
      headers: commonHeaders,
      tags: { page: 'home' },
    });
    check(res, {
      'home: status 200': (r) => r.status === 200,
    });
  });

  sleep(1);

  group('Search Page', () => {
    const res = http.get(`${BASE_URL}/search?q=${SEARCH_QUERY}`, {
      headers: commonHeaders,
      tags: { page: 'search' },
    });
    check(res, {
      'search: status 200': (r) => r.status === 200,
    });
  });

  sleep(1);

  group('Video Detail Page', () => {
    const res = http.get(`${BASE_URL}/video/${VIDEO_ID}`, {
      headers: commonHeaders,
      tags: { page: 'video' },
    });
    check(res, {
      'video: status 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}

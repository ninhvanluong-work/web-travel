import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { BASE_URL, commonHeaders } from './config.js';
import { makeSummaryHandler } from './summary.js';

export const handleSummary = makeSummaryHandler('load-test');

/**
 * Load Test: Verifies system performance under expected load.
 * Ramp up to 20 users over 1 minute, stay at 20 for 3 minutes, then ramp down.
 */
export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '3m', target: 20 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    'http_req_duration{page:home}': ['p(95)<500'],
    'http_req_duration{page:search}': ['p(95)<800'],
    'http_req_duration{page:video}': ['p(95)<800'],
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
      'home: has content': (r) => r.body.length > 0,
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
      'search: has content': (r) => r.body.length > 0,
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
      'video: has content': (r) => r.body.length > 0,
    });
  });

  sleep(1);
}

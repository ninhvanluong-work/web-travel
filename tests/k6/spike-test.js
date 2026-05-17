import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { BASE_URL, commonHeaders } from './config.js';
import { makeSummaryHandler } from './summary.js';

export const handleSummary = makeSummaryHandler('spike-test');

/**
 * Spike Test: Verifies system stability during sudden bursts of traffic.
 * Rapidly increases to 200 users, stays for 3 minutes, then scales back.
 */
export const options = {
  stages: [
    { duration: '10s', target: 20 }, // normal load
    { duration: '1m', target: 20 },
    { duration: '10s', target: 200 }, // sudden spike to 200 users
    { duration: '3m', target: 200 }, // stay at 200
    { duration: '10s', target: 20 }, // rapid scale down to normal
    { duration: '3m', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // spike test: tolerate high latency during burst
    http_req_failed: ['rate<0.10'], // allow up to 10% errors during spike
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

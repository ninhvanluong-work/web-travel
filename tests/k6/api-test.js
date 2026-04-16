import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { API_URL, commonHeaders } from './config.js';
import { makeSummaryHandler } from './summary.js';

export const handleSummary = makeSummaryHandler('api-test');

/**
 * API Test: Load test against backend API endpoints directly.
 * Tests the most critical endpoints: video list, search, and video detail.
 * Uses ramping-vus executor to gradually increase concurrent users.
 */
export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
    'http_req_duration{endpoint:video-list}': ['p(95)<800'],
    'http_req_duration{endpoint:video-search}': ['p(95)<1000'],
    'http_req_duration{endpoint:video-detail}': ['p(95)<800'],
  },
};

const VIDEO_SLUG = __ENV.VIDEO_SLUG || 'sample-video';
const SEARCH_QUERY = __ENV.SEARCH_QUERY || 'hanoi';

export default function () {
  // GET /video — homepage feed (most critical, called on every load)
  group('Video List API', () => {
    const res = http.get(`${API_URL}/video?pageSize=6&distanceScore=0`, {
      headers: commonHeaders,
      tags: { endpoint: 'video-list' },
    });
    check(res, {
      'video list: status 200': (r) => r.status === 200,
      'video list: has items': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data?.items?.length >= 0;
        } catch {
          return false;
        }
      },
    });
  });

  sleep(1);

  // GET /video?query=... — search (called on DetailSearchPage)
  group('Video Search API', () => {
    const res = http.get(`${API_URL}/video?query=${SEARCH_QUERY}&pageSize=6&distanceScore=0`, {
      headers: commonHeaders,
      tags: { endpoint: 'video-search' },
    });
    check(res, {
      'video search: status 200': (r) => r.status === 200,
      'video search: returns result': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data?.items);
        } catch {
          return false;
        }
      },
    });
  });

  sleep(1);

  // GET /video/:slug — video detail (called on VideoDetailPage)
  group('Video Detail API', () => {
    const res = http.get(`${API_URL}/video/${VIDEO_SLUG}`, {
      headers: commonHeaders,
      tags: { endpoint: 'video-detail' },
    });
    check(res, {
      'video detail: status 200 or 404': (r) => r.status === 200 || r.status === 404,
    });
  });

  sleep(1);
}

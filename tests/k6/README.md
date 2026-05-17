# k6 Load Testing

Performance and load testing suite for web-travel, covering API endpoints and Next.js pages.

## Prerequisites

Install k6 (Windows):

```bash
winget install k6 --source winget
```

Verify:

```bash
k6 version
```

---

## Test Scripts

| File             | Mục đích                             | VUs     | Thời gian |
| ---------------- | ------------------------------------ | ------- | --------- |
| `api-test.js`    | Test API backend trực tiếp           | 100     | ~4 phút   |
| `load-test.js`   | Test pages Next.js ở tải bình thường | 20      | ~5 phút   |
| `stress-test.js` | Tìm breaking point của server        | tới 300 | ~38 phút  |
| `spike-test.js`  | Đột ngột tăng tải                    | tới 200 | ~8 phút   |

---

## Cách chạy

### Dùng file BAT (khuyến nghị)

Mở Command Prompt tại thư mục gốc project, chạy:

```bat
:: Xem hướng dẫn
tests\k6\run-tests.bat

:: Test API backend
tests\k6\run-tests.bat api

:: Test Next.js pages (cần pnpm dev đang chạy)
tests\k6\run-tests.bat load

:: Stress test
tests\k6\run-tests.bat stress

:: Spike test
tests\k6\run-tests.bat spike

:: Bất kỳ test nào + real-time dashboard
tests\k6\run-tests.bat api --dashboard
```

### Dùng lệnh k6 trực tiếp

```bash
# API test
k6 run tests/k6/api-test.js

# Load test với BASE_URL tùy chỉnh
BASE_URL=http://localhost:3000 k6 run tests/k6/load-test.js

# Chỉ định API URL khác
API_URL=http://192.168.0.104:3366 k6 run tests/k6/api-test.js

# Kèm dashboard real-time
k6 run --out web-dashboard tests/k6/api-test.js
```

---

## Xem báo cáo

### 1. Console output (mặc định)

Kết quả in ra terminal sau khi test xong:

```
✓ http_req_duration........: avg=181ms p(95)=435ms
✓ http_req_failed..........: 0.02%
  http_reqs.................: 3984 (16.4/s)
```

### 2. JSON report (tự động lưu)

Mỗi lần chạy tự lưu file JSON tại:

```
tests/k6/reports/api-test-YYYYMMDD-HHMMSS.json
```

Mở bằng VS Code để đọc chi tiết toàn bộ metrics.

### 3. Real-time browser dashboard

```bat
tests\k6\run-tests.bat api --dashboard
```

Sau đó mở trình duyệt tại `http://localhost:5665` — xem biểu đồ response time, VUs, error rate theo thời gian thực.

### 4. HTML report tĩnh

```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=tests/k6/reports/report.html k6 run tests/k6/api-test.js
```

Mở file `tests/k6/reports/report.html` bằng bất kỳ trình duyệt nào.

---

## Đọc kết quả

### Các metric quan trọng

| Metric                  | Ý nghĩa                                    | Mục tiêu |
| ----------------------- | ------------------------------------------ | -------- |
| `http_req_duration` p95 | 95% request hoàn thành trong thời gian này | < 800ms  |
| `http_req_failed`       | Tỷ lệ request lỗi                          | < 1%     |
| `http_reqs`             | Tổng số request / throughput               | —        |
| `vus`                   | Số virtual users đang chạy                 | —        |
| `iteration_duration`    | Thời gian 1 vòng lặp (3 API calls + sleep) | —        |

### Pass / Fail

- `✓` xanh = threshold đạt
- `✗` đỏ = threshold bị vượt → server có vấn đề ở mức tải này

### Kết quả thực tế đã đo

| VUs | p95     | Error rate | Kết quả |
| --- | ------- | ---------- | ------- |
| 30  | 435ms   | 0.02%      | ✅ PASS |
| 100 | 5,620ms | 1.34%      | ❌ FAIL |

> Server production (`fly.dev`) comfortable ở ~30 VUs. Breaking point nằm trong khoảng 50–70 VUs.

---

## Cấu hình

### Thay đổi URL

Sửa file `config.js`:

```js
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const API_URL = __ENV.API_URL || 'https://web-travel-be.fly.dev';
```

Hoặc truyền qua biến môi trường khi chạy:

```bash
API_URL=https://staging.example.com k6 run tests/k6/api-test.js
```

### Thay đổi số VUs

Sửa `stages` trong từng file test:

```js
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up
    { duration: '2m', target: 100 }, // hold
    { duration: '30s', target: 0 }, // ramp down
  ],
};
```

### Thay đổi thresholds

```js
thresholds: {
  http_req_duration: ['p(95)<500'], // stricthơn: 500ms
  http_req_failed:   ['rate<0.01'], // tối đa 1% lỗi
}
```

---

## Cấu trúc thư mục

```
tests/k6/
├── run-tests.bat       # Script chạy nhanh (Windows)
├── config.js           # BASE_URL, API_URL, headers
├── summary.js          # Auto-save JSON report helper
├── api-test.js         # Test API backend
├── load-test.js        # Test Next.js pages - load bình thường
├── stress-test.js      # Test tìm breaking point
├── spike-test.js       # Test tải đột biến
├── README.md           # File này
└── reports/            # Báo cáo tự động lưu (gitignored)
```

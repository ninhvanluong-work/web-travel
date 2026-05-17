# Hướng dẫn đọc báo cáo k6

## 1. Nhìn vào đâu trước tiên

Sau khi chạy test, nhìn ngay vào **3 dòng này**:

```
✓ http_req_duration:  p(95)=435ms   ← NHANH
✗ http_req_duration:  p(95)=23.4s   ← CHẬM

✓ http_req_failed:    0.00%         ← KHÔNG LỖI
✗ http_req_failed:    1.34%         ← CÓ LỖI

checks: 100.00% ✓ 8161  ✗ 0        ← LOGIC ĐÚNG HẾT
checks:  98.57% ✓ 9399  ✗ 136      ← CÓ REQUEST SAI
```

- `✓` xanh = đạt ngưỡng → tốt
- `✗` đỏ = vượt ngưỡng → có vấn đề

---

## 2. Server nhanh hay chậm?

### Dùng bảng này để đánh giá p(95)

| p(95)     | Đánh giá      | Ý nghĩa                                      |
| --------- | ------------- | -------------------------------------------- |
| < 200ms   | Rất nhanh     | Server xử lý tốt, user không cảm nhận độ trễ |
| 200–500ms | Nhanh         | Chấp nhận được, trải nghiệm tốt              |
| 500ms–1s  | Trung bình    | User bắt đầu cảm thấy chờ                    |
| 1s–3s     | Chậm          | User rõ ràng thấy lag                        |
| > 3s      | Rất chậm      | Server đang bị quá tải                       |
| > 10s     | Nghẽn cổ chai | Server gần như không xử lý được              |

> **p(95)** = 95% người dùng có tốc độ tốt hơn con số này.
> Ví dụ: p(95)=500ms → 95 trong 100 người nhận được response trong 0.5 giây.

---

## 3. Chậm ở đâu?

### Bước 1 — So sánh med và p(95)

```
med=107ms   p(95)=23s    ← CÁCH XA = server bị nghẽn khi tải cao
med=131ms   p(95)=435ms  ← GẦN NHAU = server ổn định
```

- `med` gần `p(95)` → server **ổn định**, tải đều
- `med` cách xa `p(95)` → có nhóm request bị **queue/chờ** khi nhiều user cùng lúc

### Bước 2 — Xem từng endpoint

```
✓ { endpoint:video-detail }  p(95)=185ms   ← NHANH
✗ { endpoint:video-list }    p(95)=24.2s   ← CHẬM ← vấn đề ở đây
✗ { endpoint:video-search }  p(95)=24.25s  ← CHẬM ← vấn đề ở đây
```

→ Endpoint nào có `✗` đỏ = **điểm nghẽn** của hệ thống.

### Bước 3 — Xem http_req_waiting

```
http_req_waiting:  avg=2.39s   ← server xử lý lâu (backend chậm)
http_req_receiving: avg=5.87ms  ← truyền dữ liệu nhanh (network ổn)
```

| Metric                     | Cao = vấn đề ở                                  |
| -------------------------- | ----------------------------------------------- |
| `http_req_waiting`         | **Backend** — server xử lý chậm, DB query nặng  |
| `http_req_connecting`      | **Network** — kết nối TCP chậm                  |
| `http_req_tls_handshaking` | **SSL/TLS** — certificate handshake chậm        |
| `http_req_receiving`       | **Network** — truyền dữ liệu chậm, response lớn |

---

## 4. Kết quả thực tế đã đo

### API Test — `https://web-travel-be.fly.dev`

| Lần | VUs | p(95)    | Error rate | Kết luận          |
| --- | --- | -------- | ---------- | ----------------- |
| 1   | 30  | 435ms    | 0.02%      | ✅ Nhanh, ổn định |
| 2   | 100 | 5,620ms  | 1.34%      | ❌ Chậm, có lỗi   |
| 3   | 100 | ~1,000ms | 0.00%      | ⚠️ Sát ngưỡng     |
| 4   | 100 | 188ms    | 0.00%      | ✅ Rất nhanh      |
| 5   | 100 | 23,440ms | 0.00%      | ❌ Nghẽn nặng     |

> Kết quả **không ổn định** giữa các lần → do `fly.dev` tự động scale up/down.
> Khi server vừa khởi động (cold start) hoặc scale down → response chậm hơn nhiều.

### Điểm nghẽn xác định được

```
video-list   (GET /video)           → chậm khi tải cao (query nhiều bản ghi)
video-search (GET /video?query=...) → chậm nhất (full-text search nặng hơn)
video-detail (GET /video/:slug)     → nhanh nhất (query 1 bản ghi, có cache)
```

---

## 5. Đọc nhanh khi nhìn vào terminal

```
running (4m00s), 100/100 VUs, 4527 complete iterations
         ↑                    ↑
    đang ở 100 VUs     số vòng lặp hoàn thành
```

```
checks: 100.00% ✓ 8161  ✗ 0
        ↑                ↑
    tất cả pass      0 fail → tốt
```

```
http_req_duration: avg=136ms  med=120ms  p(90)=180ms  p(95)=188ms
                   ↑          ↑          ↑            ↑
                trung bình   giữa      90% dưới     95% dưới → quan trọng nhất
```

```
http_reqs: 13581  (55.8/s)
           ↑       ↑
        tổng số   throughput — server xử lý được bao nhiêu req mỗi giây
```

---

## 6. Khi nào cần lo?

| Dấu hiệu                   | Nguyên nhân có thể              | Cần làm                      |
| -------------------------- | ------------------------------- | ---------------------------- |
| p(95) > 3s                 | Server quá tải hoặc DB chậm     | Giảm VUs, xem log server     |
| `http_req_failed` > 1%     | Server trả lỗi 5xx hoặc timeout | Xem error log backend        |
| `med` << `p(95)` (cách xa) | Server bị nghẽn khi tải tăng    | Tìm bottleneck theo endpoint |
| `http_req_waiting` cao     | Backend xử lý chậm              | Tối ưu query DB, thêm cache  |
| `http_req_connecting` cao  | Network hoặc DNS chậm           | Kiểm tra hạ tầng             |
| `dropped_iterations` > 0   | VUs không kịp hoàn thành        | Server không đủ tài nguyên   |

---

## 7. Template đọc báo cáo

Khi có kết quả mới, điền vào template này:

```
Test: [api / load / stress / spike]
VUs:  [số lượng]
Thời gian: [duration]

KẾT QUẢ TỔNG:
  Pass/Fail:        [✅ PASS / ❌ FAIL]
  Checks:           [xx.xx%]
  Error rate:       [x.xx%]

HIỆU NĂNG:
  avg:  [xxms]
  med:  [xxms]  ← server thực sự nhanh cỡ này
  p95:  [xxms]  ← 95% user trải nghiệm tốc độ này

ENDPOINT CHẬM NHẤT:
  [tên endpoint]: p95=[xxs] ← đây là điểm nghẽn

NGUYÊN NHÂN:
  [ ] Server scale down (fly.dev cold start)
  [ ] Query DB nặng (list/search endpoint)
  [ ] Quá nhiều concurrent users
  [ ] Network chậm (http_req_connecting cao)

KẾT LUẬN:
  Server chịu tốt đến [xx] VUs.
  Breaking point ước tính: [xx–xx] VUs.
```

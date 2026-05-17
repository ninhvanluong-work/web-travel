# k6 Load Test — Hướng dẫn chạy

## Yêu cầu

```bat
winget install k6 --source winget
```

---

## Chạy test

Mở Command Prompt tại **thư mục gốc project**, chạy lệnh sau:

```bat
tests\k6\run-tests.bat <tên-test>
```

| Lệnh                              | Mô tả                                                                   | VUs      | Thời gian |
| --------------------------------- | ----------------------------------------------------------------------- | -------- | --------- |
| `tests\k6\run-tests.bat api`      | Test API backend — xem server chịu được bao nhiêu request               | tới 100  | ~4 phút   |
| `tests\k6\run-tests.bat load`     | Test trang Next.js ở tải bình thường                                    | 20       | ~5 phút   |
| `tests\k6\run-tests.bat capacity` | **Tìm giới hạn tối ưu** — ramp từ 10 tới 100 VUs, sinh báo cáo đánh giá | 10 → 100 | ~21 phút  |
| `tests\k6\run-tests.bat stress`   | Tìm điểm server sập — đẩy lên 300 VUs                                   | tới 300  | ~38 phút  |
| `tests\k6\run-tests.bat spike`    | Mô phỏng traffic đột biến                                               | tới 200  | ~8 phút   |

> **Bắt đầu từ đâu?** Chạy `capacity` trước — kết quả sẽ cho biết server chịu được bao nhiêu VUs và gợi ý cải thiện.

---

## Xem dashboard real-time

Thêm `--dashboard` vào bất kỳ lệnh nào, sau đó mở `http://localhost:5665`:

```bat
tests\k6\run-tests.bat capacity --dashboard
tests\k6\run-tests.bat api --dashboard
```

---

## Kết quả sau khi chạy

| File                                           | Nội dung                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| Console                                        | Metrics tóm tắt in ra terminal ngay khi xong                         |
| `tests/k6/reports/capacity-report-latest.txt`  | Báo cáo đánh giá: bảng pass/fail từng stage + khuyến nghị tối ưu VUs |
| `tests/k6/reports/capacity-report-latest.html` | Dashboard HTML tĩnh, mở bằng trình duyệt                             |
| `tests/k6/reports/<tên>-<timestamp>.json`      | Raw metrics JSON toàn bộ                                             |

---

## Đọc kết quả

```
  VUs  │  avg (ms)  │  p95 (ms)  │  Error %  │  Result
  ─────┼────────────┼────────────┼───────────┼─────────
   10  │    120ms   │    310ms   │    0.00%  │  ✓ PASS   ← tốt
   30  │    420ms   │    790ms   │    0.01%  │  ✓ PASS
   40  │    950ms   │   1800ms   │    0.80%  │  ✗ FAIL   ← bắt đầu chậm
```

| Cột         | Ý nghĩa                                                             |
| ----------- | ------------------------------------------------------------------- |
| **avg**     | Thời gian phản hồi trung bình                                       |
| **p95**     | 95% request hoàn thành trong thời gian này — chỉ số quan trọng nhất |
| **Error %** | Tỷ lệ request bị lỗi (5xx, timeout)                                 |
| **✓ PASS**  | Đạt ngưỡng — server ổn ở mức VUs này                                |
| **✗ FAIL**  | Vượt ngưỡng — server bắt đầu có vấn đề                              |

---

## Ngưỡng đánh giá (capacity test)

| VUs    | p95 tối đa  | Error tối đa |
| ------ | ----------- | ------------ |
| 10–20  | 500ms       | 1%           |
| 30–40  | 800ms       | 1%           |
| 50     | 1000ms      | 2%           |
| 60     | 1200ms      | 2%           |
| 70     | 1500ms      | 5%           |
| 80–100 | 2000–3000ms | 5–10%        |

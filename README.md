# Redux Exam – Dog Breeds

Công nghệ: React 19 + Redux Toolkit + axios + **MUI (Material UI)** cho giao diện responsive.

Bài tập: Tạo Redux trong ứng dụng React, gọi API `https://dogapi.dog/api/v2/breeds`.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ Vite in ra (mặc định http://localhost:5173).

## Cấu trúc thư mục

```
src/
├── api/
│   ├── axiosClient.js        # Cấu hình axios + interceptor chuẩn hóa lỗi (mất mạng, timeout...)
│   └── breedApi.js           # Các hàm gọi API liên quan tới breed
├── app/
│   └── store.js              # Tạo Redux store
├── components/               # Component dùng chung (không gắn với feature nào)
│   ├── AppPagination.jsx     # Phân trang dùng chung (MUI Pagination + chọn số bản ghi/trang)
│   ├── ErrorMessage.jsx      # MUI Alert
│   └── Loading.jsx           # MUI Skeleton
├── features/
│   └── breeds/               # Mọi thứ của tính năng "breeds" nằm chung một chỗ
│       ├── breedsSlice.js    # state + reducer + async thunk + selectors
│       └── components/
│           ├── BreedCard.jsx # Hiển thị 1 giống chó
│           └── BreedList.jsx # Kết nối Redux, hiển thị danh sách
├── hooks/
│   └── useOnlineStatus.js    # Hook theo dõi trạng thái Online/Offline
├── App.jsx                   # AppBar + Container
├── main.jsx                  # Bọc <Provider> (Redux) + <ThemeProvider> (MUI)
└── theme.js                  # Theme MUI (màu, font, breakpoint)
```

## Responsive (MUI breakpoint)

| Màn hình | Breakpoint | Số thẻ / hàng | Toolbar | Phân trang |
|---|---|---|---|---|
| Điện thoại | xs (< 600px) | 1 | xếp dọc | size small |
| Tablet | sm (≥ 600px) | 2 | xếp ngang | size medium |
| Laptop/Desktop | md (≥ 900px) | 3 | xếp ngang | size medium |

Thử: F12 → bật **Toggle device toolbar** (Ctrl+Shift+M) → chọn iPhone / iPad.

## Phân trang phía server (server-side pagination)

- Mỗi lần đổi trang chỉ gọi `GET /breeds?page[number]=N&page[size]=S` → server trả đúng S bản ghi của trang N.
- Redux store **chỉ giữ dữ liệu của trang hiện tại** (ghi đè, không cộng dồn) → bộ nhớ không tăng theo số trang đã xem.
- Chuyển trang liên tục (2 → 3 → 4): request cũ bị **hủy** (`promise.abort()` + `AbortSignal` của axios).
- Kết quả về muộn của request cũ bị **bỏ qua** nhờ so sánh `requestId` (chống race condition).
- Bấm trùng trang đang tải: `condition` của thunk **chặn**, không gọi API lần 2.
- Đổi số bản ghi/trang → tự quay về trang 1.

## Luồng dữ liệu Redux

```
BreedList (useEffect)
   └─ dispatch(fetchBreeds({ page, size }))
        ├─ pending   → status = 'loading'    → hiện Loading
        ├─ gọi breedApi.getAll({ page, size, signal }) qua axiosClient
        ├─ fulfilled → status = 'succeeded'  → lưu items, hiện danh sách
        └─ rejected  → status = 'failed'     → lưu error, hiện ErrorMessage
```

## Kiểm tra bài tập

**Câu 1 – Có Internet:** chạy app, danh sách giống chó hiển thị (tên, mô tả, tuổi thọ, cân nặng, ít gây dị ứng).

**Câu 2 – Mất Internet:**
1. Mở DevTools (F12) → tab **Network** → đổi `No throttling` thành **Offline**
   (hoặc tắt Wi‑Fi thật).
2. Chip góc phải chuyển thành **Offline** (màu đỏ).
3. Bấm **Gọi lại API** hoặc chuyển trang.
4. Kết quả: action `breeds/fetchBreeds/rejected` được dispatch, màn hình hiện lỗi
   *"Không có kết nối Internet. Vui lòng kiểm tra mạng và thử lại!"*.
   Dữ liệu đã tải trước đó vẫn còn trong store nên vẫn được hiển thị.
5. Bật mạng lại → bấm **Thử lại** → dữ liệu tải bình thường.

> Mẹo: cài extension **Redux DevTools** để xem từng action `pending / fulfilled / rejected`
> và state thay đổi thế nào.

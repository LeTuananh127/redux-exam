import axios from 'axios';

/**
 * axiosClient: một instance axios dùng chung cho cả ứng dụng.
 * - baseURL: địa chỉ gốc của Dog API, các file api khác chỉ cần ghi phần đường dẫn phía sau.
 * - timeout: quá 10 giây không phản hồi thì tự hủy request (tránh treo mãi khi mạng yếu).
 */
const axiosClient = axios.create({
  baseURL: 'https://dogapi.dog/api/v2',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor cho RESPONSE: chạy sau khi có kết quả trả về (hoặc khi lỗi).
 * Mục đích: chuẩn hóa lỗi thành một message dễ hiểu để hiển thị cho người dùng.
 */
axiosClient.interceptors.response.use(
  // Thành công: trả về response như bình thường
  (response) => response,

  // Thất bại: phân loại lỗi
  (error) => {
    // Request bị HỦY CHỦ ĐỘNG (do người dùng chuyển trang khác) -> không phải lỗi thật,
    // ném nguyên error ra để createAsyncThunk tự nhận biết là "aborted"
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    let message = 'Đã xảy ra lỗi không xác định.';

    if (!navigator.onLine) {
      // Trình duyệt báo đang mất kết nối Internet
      message = 'Không có kết nối Internet. Vui lòng kiểm tra mạng và thử lại!';
    } else if (error.code === 'ECONNABORTED') {
      // Request bị hủy do vượt quá thời gian timeout
      message = 'Hết thời gian chờ phản hồi từ server. Vui lòng thử lại!';
    } else if (!error.response) {
      // Không nhận được response nào (mất mạng, DNS lỗi, CORS, server sập...)
      message = 'Không thể kết nối tới server (Network Error).';
    } else {
      // Server CÓ trả về nhưng với mã lỗi (4xx, 5xx)
      message = `Server trả về lỗi ${error.response.status}: ${error.response.statusText}`;
    }

    // Gắn message đã chuẩn hóa vào error rồi ném tiếp ra ngoài
    // để nơi gọi (createAsyncThunk) bắt được
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export default axiosClient;

import axiosClient from './axiosClient';

/**
 * breedApi: gom tất cả các hàm gọi API liên quan tới "breed" (giống chó).
 * Tách riêng tầng API giúp:
 *  - Component/Redux không cần biết URL cụ thể.
 *  - Khi API đổi, chỉ cần sửa ở một chỗ.
 */
const breedApi = {
  /**
   * Lấy danh sách giống chó THEO TRANG (phân trang phía server).
   * GET https://dogapi.dog/api/v2/breeds?page[number]=2&page[size]=9
   *
   * Server chỉ trả về đúng `size` bản ghi của trang `page`
   * -> không tải thừa dữ liệu, tiết kiệm băng thông và bộ nhớ.
   *
   * @param {object}      params
   * @param {number}      params.page   - số trang cần lấy (bắt đầu từ 1)
   * @param {number}      params.size   - số bản ghi mỗi trang
   * @param {AbortSignal} params.signal - tín hiệu hủy request (khi người dùng chuyển trang khác)
   * @returns Promise chứa response của axios
   */
  getAll({ page = 1, size = 9, signal } = {}) {
    return axiosClient.get('/breeds', {
      params: {
        'page[number]': page,
        'page[size]': size,
      },
      signal,
    });
  },
};

export default breedApi;

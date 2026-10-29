import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import breedApi from '../../api/breedApi';

// Số bản ghi mặc định mỗi trang (9 = chia đẹp 3 cột x 3 hàng trên desktop)
export const DEFAULT_PAGE_SIZE = 9;

/* =========================================================
 * 1. STATE BAN ĐẦU (initialState)
 * ---------------------------------------------------------
 * Chỉ lưu dữ liệu của TRANG HIỆN TẠI, không cộng dồn các trang.
 * -> Bộ nhớ luôn chỉ chứa tối đa `size` bản ghi, dù API có hàng nghìn bản ghi.
 * ========================================================= */
const initialState = {
  items: [],               // dữ liệu của trang hiện tại
  status: 'idle',          // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,             // nội dung lỗi (nếu có)
  currentRequestId: null,  // id của request mới nhất (để bỏ qua kết quả của request cũ)
  requestedPage: 1,        // trang người dùng đang yêu cầu (dùng cho nút "Thử lại")
  pagination: {
    current: 1,            // trang đang hiển thị
    last: 1,               // trang cuối cùng
    records: 0,            // tổng số bản ghi trên server
    size: DEFAULT_PAGE_SIZE, // số bản ghi mỗi trang
  },
};

/* =========================================================
 * 2. ASYNC THUNK - gọi API lấy MỘT trang
 * ---------------------------------------------------------
 * createAsyncThunk tự động sinh ra 3 action:
 *   - breeds/fetchBreeds/pending   : khi bắt đầu gọi API
 *   - breeds/fetchBreeds/fulfilled : khi gọi API thành công
 *   - breeds/fetchBreeds/rejected  : khi gọi API thất bại (hoặc bị hủy)
 *
 * Tham số: { page, size }
 * ========================================================= */
export const fetchBreeds = createAsyncThunk(
  'breeds/fetchBreeds',
  async ({ page = 1, size = DEFAULT_PAGE_SIZE } = {}, { rejectWithValue, signal }) => {
    try {
      // `signal` do Redux Toolkit cung cấp: khi gọi promise.abort() ở component,
      // signal được kích hoạt -> axios hủy request HTTP đang chạy.
      const response = await breedApi.getAll({ page, size, signal });

      // Dữ liệu API trả về theo chuẩn JSON:API có dạng:
      // { data: [ { id, type, attributes: {...} } ], meta: { pagination: {...} } }
      const { data, meta } = response.data;

      // "Làm phẳng" dữ liệu để component dễ dùng hơn
      const breeds = data.map((item) => ({
        id: item.id,
        name: item.attributes.name,
        description: item.attributes.description,
        life: item.attributes.life,                     // { min, max } - tuổi thọ
        maleWeight: item.attributes.male_weight,        // { min, max } - cân nặng con đực
        femaleWeight: item.attributes.female_weight,    // { min, max } - cân nặng con cái
        hypoallergenic: item.attributes.hypoallergenic, // có ít gây dị ứng không
      }));

      return {
        breeds,
        pagination: {
          current: meta.pagination.current,
          last: meta.pagination.last,
          records: meta.pagination.records,
          size,
        },
      };
    } catch (error) {
      // rejectWithValue: trả về giá trị tùy chỉnh cho action rejected
      // (thay vì error mặc định khó đọc của Redux Toolkit)
      return rejectWithValue(error.friendlyMessage || error.message);
    }
  },
  {
    /**
     * condition: chạy TRƯỚC khi gọi API. Trả về false -> thunk bị bỏ qua, không gọi API.
     * Ở đây: nếu đang tải đúng trang + đúng size đó rồi thì không gọi trùng nữa
     * (ví dụ người dùng bấm liên tục vào cùng 1 nút).
     */
    condition: ({ page = 1, size = DEFAULT_PAGE_SIZE } = {}, { getState }) => {
      const { status, requestedPage, pagination } = getState().breeds;
      const isSameRequest = requestedPage === page && pagination.size === size;
      if (status === 'loading' && isSameRequest) {
        return false;
      }
    },
  }
);

/* =========================================================
 * 3. SLICE - gom state + reducers + actions vào một chỗ
 * ========================================================= */
const breedsSlice = createSlice({
  name: 'breeds',
  initialState,

  // reducers: các action ĐỒNG BỘ do mình tự định nghĩa
  reducers: {
    // Xóa thông báo lỗi (ví dụ khi người dùng bấm đóng)
    clearError(state) {
      state.error = null;
    },
  },

  // extraReducers: lắng nghe các action BÊN NGOÀI slice (ở đây là 3 action của thunk)
  // Lưu ý: Redux Toolkit dùng Immer nên có thể "gán trực tiếp" state.xxx = ...
  extraReducers: (builder) => {
    builder
      // Bắt đầu gọi API
      .addCase(fetchBreeds.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        // Mỗi lần dispatch thunk có 1 requestId riêng -> ghi nhớ request MỚI NHẤT
        state.currentRequestId = action.meta.requestId;
        // action.meta.arg chính là tham số { page, size } truyền vào fetchBreeds
        state.requestedPage = action.meta.arg?.page ?? 1;
        state.pagination.size = action.meta.arg?.size ?? DEFAULT_PAGE_SIZE;
      })

      // Gọi API thành công
      .addCase(fetchBreeds.fulfilled, (state, action) => {
        // Chống "race condition": nếu đây là kết quả của request CŨ (về muộn)
        // thì bỏ qua, tránh trang 2 về sau ghi đè lên trang 3 người dùng vừa chọn.
        if (action.meta.requestId !== state.currentRequestId) return;

        state.status = 'succeeded';
        state.currentRequestId = null;
        // GHI ĐÈ (không cộng dồn) -> store chỉ giữ dữ liệu của 1 trang
        state.items = action.payload.breeds;
        state.pagination = action.payload.pagination;
      })

      // Gọi API thất bại (ví dụ: mất Internet) hoặc bị hủy
      .addCase(fetchBreeds.rejected, (state, action) => {
        // Kết quả của request cũ (đã có request mới hơn thay thế) -> bỏ qua
        if (action.meta.requestId !== state.currentRequestId) return;

        // Request MỚI NHẤT bị hủy (ví dụ component bị unmount) -> đưa về 'idle'
        // để lần mount sau tự gọi lại, tránh kẹt mãi ở trạng thái 'loading'
        if (action.meta.aborted) {
          state.status = 'idle';
          state.currentRequestId = null;
          return;
        }

        state.status = 'failed';
        state.currentRequestId = null;
        // action.payload là giá trị truyền vào rejectWithValue
        state.error = action.payload || action.error.message;
        // Không xóa state.items -> người dùng vẫn xem được trang đã tải trước đó.
      });
  },
});

/* =========================================================
 * 4. SELECTORS - các hàm lấy dữ liệu từ store
 * Dùng selector giúp component không phụ thuộc vào cấu trúc state.
 * ========================================================= */
export const selectBreeds = (state) => state.breeds.items;
export const selectBreedsStatus = (state) => state.breeds.status;
export const selectBreedsError = (state) => state.breeds.error;
export const selectBreedsPagination = (state) => state.breeds.pagination;
export const selectRequestedPage = (state) => state.breeds.requestedPage;

// Export action đồng bộ
export const { clearError } = breedsSlice.actions;

// Export reducer để đăng ký vào store
export default breedsSlice.reducer;

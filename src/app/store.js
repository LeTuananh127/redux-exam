import { configureStore } from '@reduxjs/toolkit';
import breedsReducer from '../features/breeds/breedsSlice';

/**
 * store: "kho" chứa toàn bộ state của ứng dụng.
 * configureStore (Redux Toolkit) tự động:
 *  - Gộp các reducer lại (combineReducers)
 *  - Cài sẵn middleware redux-thunk (để dùng createAsyncThunk)
 *  - Bật Redux DevTools trên trình duyệt
 */
export const store = configureStore({
  reducer: {
    // key "breeds" -> truy cập bằng state.breeds
    breeds: breedsReducer,
  },
});

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Stack, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  fetchBreeds,
  clearError,
  selectBreeds,
  selectBreedsStatus,
  selectBreedsError,
  selectBreedsPagination,
  selectRequestedPage,
} from '../breedsSlice';
import BreedCard from './BreedCard';
import Loading from '../../../components/Loading';
import ErrorMessage from '../../../components/ErrorMessage';
import AppPagination from '../../../components/AppPagination';

/**
 * BreedList: "container component" - kết nối với Redux.
 *  - useSelector: đọc dữ liệu từ store.
 *  - useDispatch: gửi action (ở đây là gọi thunk fetchBreeds).
 */
export default function BreedList() {
  const dispatch = useDispatch();

  // Lấy dữ liệu từ Redux store thông qua các selector
  const breeds = useSelector(selectBreeds);
  const status = useSelector(selectBreedsStatus);
  const error = useSelector(selectBreedsError);
  const requestedPage = useSelector(selectRequestedPage);
  const { current, last, records, size } = useSelector(selectBreedsPagination);

  // useRef: giữ lại "promise" của request đang chạy qua các lần render
  // (đổi giá trị ref KHÔNG làm component render lại)
  const requestRef = useRef(null);

  /**
   * Tải MỘT trang dữ liệu.
   * Trước khi gọi request mới -> hủy request cũ đang chạy (nếu có).
   * Ví dụ: bấm nhanh trang 2 -> 3 -> 4 thì request trang 2, 3 bị hủy ngay,
   * chỉ request trang 4 chạy tới cùng -> không lãng phí mạng và CPU.
   */
  const loadPage = useCallback(
    (page, pageSize = size) => {
      const prev = requestRef.current;

      // Đang tải ĐÚNG trang + size này rồi -> giữ nguyên request đó, không hủy, không gọi lại.
      // (promise trả về từ dispatch(thunk) có sẵn thuộc tính .arg = tham số đã truyền vào)
      if (prev && prev.arg.page === page && prev.arg.size === pageSize) return;

      // Đang tải trang KHÁC -> hủy request đó vì người dùng không cần nữa
      prev?.abort();

      const promise = dispatch(fetchBreeds({ page, size: pageSize }));
      requestRef.current = promise;

      // Request xong (thành công/thất bại/bị hủy) -> xóa khỏi ref
      // để lần sau (vd: bấm "Thử lại") được phép gọi lại cùng trang
      promise.finally(() => {
        if (requestRef.current === promise) requestRef.current = null;
      });
    },
    [dispatch, size]
  );

  // Gọi API lần đầu khi component được mount
  useEffect(() => {
    // Chỉ gọi khi chưa gọi lần nào.
    // Lưu ý StrictMode (môi trường dev) cố ý chạy effect 2 lần liên tiếp,
    // và lần 2 vẫn thấy status = 'idle' (giá trị của cùng lần render).
    // -> loadPage(1) bị gọi 2 lần, nhưng lần 2 thấy đang tải đúng trang 1 rồi
    //    nên bỏ qua -> chỉ có đúng 1 request, không có request "(canceled)".
    if (status === 'idle') {
      loadPage(1);
    }
  }, [status, loadPage]);

  // Đổi trang: tải trang mới + cuộn lên đầu để người dùng xem từ bản ghi đầu tiên
  const handlePageChange = (page) => {
    loadPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Đổi số bản ghi mỗi trang: quay về trang 1 (vì số trang đã thay đổi)
  const handlePageSizeChange = (newSize) => {
    loadPage(1, newSize);
  };

  const isLoading = status === 'loading';

  return (
    <>
      {/* Thanh công cụ responsive:
          - xs (điện thoại): xếp dọc (column), nút chiếm hết chiều ngang
          - sm trở lên: xếp ngang (row) */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, mb: 3 }}
      >
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => loadPage(current)}
          disabled={isLoading}
        >
          Gọi lại API
        </Button>

        {records > 0 && (
          <Typography variant="body2" color="text.secondary">
            Tổng: <b>{records}</b> giống chó — Trang {current}/{last}
          </Typography>
        )}
      </Stack>

      {/* Hiển thị lỗi (ví dụ khi mất mạng).
          "Thử lại" gọi lại đúng trang người dùng vừa yêu cầu (requestedPage),
          không phải trang đang hiển thị. */}
      {status === 'failed' && error && (
        <ErrorMessage
          message={error}
          onRetry={() => loadPage(requestedPage)}
          onClose={() => dispatch(clearError())}
        />
      )}

      {/* Đang tải: số skeleton bằng đúng số bản ghi mỗi trang */}
      {isLoading && <Loading count={size} />}

      {/* Danh sách giống chó của trang hiện tại */}
      {!isLoading && breeds.length > 0 && (
        <>
          {status === 'failed' && (
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
              * Đang hiển thị dữ liệu cũ của trang {current} (lưu trong Redux store).
            </Typography>
          )}

          {/* Grid responsive - mỗi thẻ chiếm bao nhiêu cột trên tổng 12 cột:
              - xs: 12/12 -> 1 thẻ/hàng (điện thoại)
              - sm: 6/12  -> 2 thẻ/hàng (tablet)
              - md: 4/12  -> 3 thẻ/hàng (laptop, desktop) */}
          <Grid container spacing={2}>
            {breeds.map((breed) => (
              <Grid key={breed.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BreedCard breed={breed} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Phân trang: component dùng chung, nằm ngoài khối danh sách
          để vẫn hiển thị (bị khóa) trong lúc đang tải */}
      <AppPagination
        page={current}
        totalPages={last}
        totalRecords={records}
        pageSize={size}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        disabled={isLoading}
      />

      {/* Không có dữ liệu sau khi gọi API thành công */}
      {status === 'succeeded' && breeds.length === 0 && (
        <Typography>Không có dữ liệu.</Typography>
      )}
    </>
  );
}

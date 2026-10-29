import {
  Stack,
  Pagination,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * AppPagination: component phân trang DÙNG CHUNG cho mọi danh sách.
 * Đây là "presentational component": không biết gì về Redux hay API,
 * chỉ nhận dữ liệu qua props và báo ngược lên cha qua callback.
 * -> Có thể tái sử dụng cho danh sách khác (facts, groups...) mà không phải sửa.
 *
 * @param {number}   page             - trang hiện tại (bắt đầu từ 1)
 * @param {number}   totalPages       - tổng số trang
 * @param {number}   totalRecords     - tổng số bản ghi (để hiện "1–9 / 283")
 * @param {number}   pageSize         - số bản ghi mỗi trang
 * @param {number[]} pageSizeOptions  - các lựa chọn số bản ghi mỗi trang
 * @param {function} onPageChange     - gọi khi đổi trang: onPageChange(page)
 * @param {function} onPageSizeChange - gọi khi đổi size: onPageSizeChange(size)
 * @param {boolean}  disabled         - khóa thao tác (ví dụ khi đang tải)
 */
export default function AppPagination({
  page,
  totalPages,
  totalRecords,
  pageSize,
  pageSizeOptions = [6, 9, 12, 30],
  onPageChange,
  onPageSizeChange,
  disabled = false,
}) {
  // Màn hình nhỏ hơn 600px -> thu gọn phân trang để không tràn ngang
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Không có dữ liệu thì không cần hiển thị phân trang
  if (!totalRecords) return null;

  // Tính khoảng bản ghi đang hiển thị, ví dụ trang 2, size 9 -> 10–18
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRecords);

  // Chỉ báo lên cha khi THỰC SỰ đổi trang (bấm lại trang hiện tại thì không gọi API)
  const handlePageChange = (_, newPage) => {
    if (newPage !== page) onPageChange(newPage);
  };

  return (
    // Responsive: điện thoại xếp dọc, từ tablet trở lên xếp ngang
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'space-between', my: 4 }}
    >
      <Typography variant="body2" color="text.secondary">
        Hiển thị <b>{from}–{to}</b> / {totalRecords} bản ghi
      </Typography>

      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        disabled={disabled}
        color="primary"
        size={isMobile ? 'small' : 'medium'}
        siblingCount={isMobile ? 0 : 1}
        showFirstButton
        showLastButton
      />

      {/* Chỉ hiện ô chọn size khi cha có truyền onPageSizeChange */}
      {onPageSizeChange && (
        <FormControl size="small" sx={{ minWidth: 120 }} disabled={disabled}>
          <InputLabel id="page-size-label">Mỗi trang</InputLabel>
          <Select
            labelId="page-size-label"
            label="Mỗi trang"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size} / trang
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}

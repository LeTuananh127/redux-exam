import { Alert, AlertTitle, Button, Stack } from '@mui/material';

/**
 * Component dùng chung: hiển thị thông báo lỗi kèm nút "Thử lại".
 * Dùng <Alert> của MUI: tự có icon, màu đỏ và nút đóng (khi truyền onClose).
 *
 * @param {string}   message - nội dung lỗi
 * @param {function} onRetry - hàm được gọi khi bấm "Thử lại" (không bắt buộc)
 * @param {function} onClose - hàm được gọi khi bấm dấu X (không bắt buộc)
 */
export default function ErrorMessage({ message, onRetry, onClose }) {
  return (
    <Alert severity="error" onClose={onClose} sx={{ mb: 2 }}>
      <AlertTitle>Lỗi</AlertTitle>
      {message}

      {onRetry && (
        <Stack direction="row" sx={{ mt: 1 }}>
          <Button size="small" variant="contained" color="error" onClick={onRetry}>
            Thử lại
          </Button>
        </Stack>
      )}
    </Alert>
  );
}

import { createTheme } from '@mui/material/styles';

/**
 * theme: cấu hình giao diện chung cho toàn bộ app (màu sắc, font, breakpoint...).
 *
 * Breakpoint mặc định của MUI (dùng cho responsive):
 *   xs: 0px      -> điện thoại
 *   sm: 600px    -> tablet dọc
 *   md: 900px    -> tablet ngang / laptop nhỏ
 *   lg: 1200px   -> desktop
 *   xl: 1536px   -> màn hình lớn
 */
const theme = createTheme({
  palette: {
    primary: { main: '#4f6ef7' },
    background: { default: '#f4f6fb' },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
});

export default theme;

import { AppBar, Toolbar, Typography, Chip, Container } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import BreedList from './features/breeds/components/BreedList';
import useOnlineStatus from './hooks/useOnlineStatus';

/**
 * App: component gốc, chịu trách nhiệm bố cục chung của trang.
 */
export default function App() {
  // Theo dõi trạng thái mạng để hiển thị badge Online/Offline
  const isOnline = useOnlineStatus();

  return (
    <>
      {/* Thanh tiêu đề cố định trên cùng */}
      <AppBar position="sticky">
        <Toolbar>
          {/* flexGrow: 1 -> tiêu đề chiếm hết chỗ trống, đẩy Chip sang phải */}
          {/* variant responsive: màn nhỏ dùng chữ h6, từ sm trở lên dùng h5 */}
          <Typography
            component="h1"
            sx={{ flexGrow: 1, fontWeight: 700, typography: { xs: 'h6', sm: 'h5' } }}
          >
            🐶 Dog Breeds
          </Typography>

          <Chip
            icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'error'}
            size="small"
          />
        </Toolbar>
      </AppBar>

      {/* Container: căn giữa nội dung, tối đa rộng "lg" (1200px), tự có padding 2 bên */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <BreedList />
      </Container>
    </>
  );
}

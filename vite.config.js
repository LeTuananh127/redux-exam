import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình Vite: dùng plugin React để hỗ trợ JSX và Fast Refresh
export default defineConfig({
  plugins: [react()],
});

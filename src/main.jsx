import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './app/store';
import theme from './theme';
import App from './App';

/**
 * Điểm khởi đầu của ứng dụng.
 * - <Provider store={store}>: "cung cấp" Redux store cho toàn bộ cây component,
 *   nhờ đó mọi component con đều dùng được useSelector / useDispatch.
 * - <ThemeProvider theme={theme}>: cung cấp theme MUI cho mọi component MUI.
 * - <CssBaseline />: reset CSS mặc định của trình duyệt (giống normalize.css)
 *   và áp dụng màu nền từ theme.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

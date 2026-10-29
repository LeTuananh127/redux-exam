import { useEffect, useState } from 'react';

/**
 * Custom hook: theo dõi trạng thái kết nối Internet của trình duyệt.
 * - navigator.onLine: giá trị ban đầu (true = đang online).
 * - Sự kiện 'online' / 'offline' của window: bắn ra khi mạng thay đổi.
 *
 * @returns {boolean} true nếu đang online, false nếu mất mạng
 */
export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Đăng ký lắng nghe sự kiện
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup: hủy lắng nghe khi component unmount (tránh rò rỉ bộ nhớ)
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

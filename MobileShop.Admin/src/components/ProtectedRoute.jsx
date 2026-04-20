import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Lấy token từ "két sắt" trình duyệt
  const token = localStorage.getItem('admin_token');

  // Nếu không có token (chưa đăng nhập), đuổi cổ về trang /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token, cho phép đi tiếp vào trong (render children)
  return children;
}

export default ProtectedRoute;
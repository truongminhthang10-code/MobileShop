import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ProductList from './pages/ProductList';
import ProductAdd from './pages/ProductAdd';
import CategoryList from './pages/CategoryList';
import ProductEdit from './pages/ProductEdit';
import OrderList from './pages/OrderList';
import Reviews from './pages/Reviews';
import UserList from './pages/UserList';
import axios from 'axios';

axios.interceptors.response.use(
  (response) => {
    // Nếu API trả về thành công, cứ để nó đi tiếp bình thường
    return response;
  },
  (error) => {
    // Nếu API trả về lỗi 401 (Token hết hạn hoặc bị sai)
    if (error.response && error.response.status === 401) {
      alert('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!');
      
      // Xóa thẻ cũ bị hỏng
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_role');
      
      // Đá văng ra cửa Login ngay lập tức
      window.location.href = '/login'; 
    }
    
    return Promise.reject(error);
  }
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang Login để tự do, ai vào cũng được */}
        <Route path="/login" element={<Login />} />
        
        {/* NHÓM CÁC TRANG ADMIN (Bị khóa bởi ProtectedRoute và bọc bởi AdminLayout) */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/add" element={<ProductAdd />} />
          <Route path="/products/edit/:id" element={<ProductEdit />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/users" element={<UserList />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
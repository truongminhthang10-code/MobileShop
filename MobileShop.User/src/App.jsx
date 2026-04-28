import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from './components/UserLayout';

// Import tất cả các trang thật mà chúng ta đã tạo
import Home from './pages/Home';
import ProductList from './pages/ProductList'; // <-- Đã import trang ProductList thật
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login'; 

function App() {
  return (
    // Toàn bộ ứng dụng PHẢI nằm trong BrowserRouter
    <BrowserRouter>
      <Routes>
        
        {/* Nhóm 1: Các trang dùng chung Layout (có Header, Footer) */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} /> {/* Đã gắn trang thật vào đây */}
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>
        
        {/* Nhóm 2: Các trang độc lập (Không có Header, Footer) */}
        {/* Trang Đăng nhập NẰM TẠI ĐÂY, hoàn toàn an toàn bên trong Routes */}
        <Route path="/login" element={<Login />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
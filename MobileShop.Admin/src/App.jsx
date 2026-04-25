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
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
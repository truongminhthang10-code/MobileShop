import { Outlet, useNavigate } from 'react-router-dom';

function AdminLayout() {
  const navigate = useNavigate();
  
  // Lấy vai trò (Role) từ localStorage để phân quyền hiển thị
  const userRole = localStorage.getItem('admin_role') || 'Admin'; 

  const handleLogout = () => {
    // Xóa toàn bộ token và role khỏi két sắt
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0 }}>
      
      {/* CỘT BÊN TRÁI: MENU (SIDEBAR) */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ textAlign: 'center', borderBottom: '1px solid #34495e', paddingBottom: '10px' }}>MOBILE SHOP</h2>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
          <li style={{ padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #34495e' }} onClick={() => navigate('/')}>
            🏠 Tổng quan (Dashboard)
          </li>
          <li style={{ padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #34495e' }} onClick={() => navigate('/products')}>
            📱 Quản lý Sản phẩm
          </li>
          <li style={{ padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #34495e' }} onClick={() => navigate('/orders')}>
            🛒 Quản lý Đơn hàng
          </li>
          <li style={{ padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #34495e' }} onClick={() => navigate('/categories')}>
            🏷️ Quản lý Danh mục
          </li>
          <li style={{ padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #34495e' }} onClick={() => navigate('/reviews')}>
            ⭐ Quản lý Đánh giá
          </li>
          
          {/* PHÂN QUYỀN: CHỈ ADMIN MỚI ĐƯỢC NHÌN THẤY MENU NÀY */}
          {userRole === 'Admin' && (
            <li style={{ padding: '10px 0', cursor: 'pointer', borderBottom: '1px solid #34495e' }} onClick={() => navigate('/users')}>
              👥 Quản lý Người dùng
            </li>
          )}
          
        </ul>
      </div>

      {/* CỘT BÊN PHẢI: NỘI DUNG CHÍNH */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
        
        {/* THANH TRÊN CÙNG (HEADER) */}
        <div style={{ height: '60px', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '0 20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* Hiển thị chức danh linh hoạt */}
          <span style={{ marginRight: '15px', fontWeight: 'bold', color: userRole === 'Admin' ? '#e74c3c' : '#3498db' }}>
            Xin chào, {userRole}!
          </span>
          <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Đăng xuất
          </button>
        </div>

        {/* KHU VỰC HIỂN THỊ TRANG CON (OUTLET) */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <Outlet /> 
        </div>

      </div>
    </div>
  );
}

export default AdminLayout;
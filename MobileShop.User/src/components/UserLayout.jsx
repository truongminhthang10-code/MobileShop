import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react'; // THÊM IMPORT NÀY

function UserLayout() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(''); // Biến lưu từ khóa tìm kiếm

  // Lấy thông tin vé đăng nhập
  const token = localStorage.getItem('user_token');
  const userName = localStorage.getItem('user_name');

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_name');
    window.location.reload();
  };

  // HÀM XỬ LÝ KHI BẤM NÚT TÌM KIẾM
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Đẩy từ khóa lên URL và chuyển về trang chủ
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/'); // Nếu để trống thì về trang chủ bình thường
    }
  };

  // Hỗ trợ bấm phím Enter để tìm
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      
      {/* HEADER */}
      <header style={{ backgroundColor: '#2c3e50', padding: '15px 50px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
          📱 MOBILE SHOP
        </div>

        {/* ĐÃ CẬP NHẬT THANH TÌM KIẾM Ở ĐÂY */}
        <div style={{ display: 'flex', width: '40%' }}>
          <input 
            type="text" 
            placeholder="Tìm theo tên máy, hãng (Apple, Samsung...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1, padding: '10px', borderRadius: '4px 0 0 4px', border: 'none', outline: 'none' }}
          />
          <button 
            onClick={handleSearch}
            style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer', fontWeight: 'bold' }}>
            Tìm
          </button>
        </div>

        {/* Chức năng: Giỏ hàng & Tài khoản */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/cart" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
            🛒 Giỏ hàng
          </Link>
          
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
                👋 Xin chào, {userName}!
              </span>
              <button 
                onClick={handleLogout} 
                style={{ padding: '5px 10px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer' }}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
              👤 Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#fff', padding: '10px 50px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Trang chủ</Link>
        <Link to="/products" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>Điện thoại</Link>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '30px 50px' }}>
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#34495e', color: '#ecf0f1', padding: '40px 50px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#e74c3c' }}>MOBILE SHOP</h3>
            <p>Hệ thống bán lẻ điện thoại di động chính hãng tại Việt Nam.</p>
          </div>
          <div style={{ flex: 1 }}>
            <h4>Hệ thống cửa hàng</h4>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
              <li>📍 <strong>TP. Hồ Chí Minh:</strong> Quận 1, Quận 10, TP. Thủ Đức</li>
              <li>📍 <strong>Hà Nội:</strong> Quận Cầu Giấy, Quận Đống Đa</li>
              <li>📍 <strong>Đà Nẵng:</strong> Quận Hải Châu</li>
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h4>Tổng đài hỗ trợ</h4>
            <p>📞 Mua hàng: 1800.1234</p>
            <p>📞 Khiếu nại: 1800.5678</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #7f8c8d', paddingTop: '10px', fontSize: '14px' }}>
          © 2026 Mobile Shop. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default UserLayout;
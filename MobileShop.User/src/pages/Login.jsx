import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Đã sửa lại state cho khớp với Backend: dùng 'username' thay vì 'email'
  const [formData, setFormData] = useState({
    fullName: '',
    username: '', // Đổi từ email sang username
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoginView) {
      // -----------------------------------------
      // GỌI API ĐĂNG NHẬP (Chuẩn 100% với C# của bạn)
      // -----------------------------------------
      try {
        const res = await axios.post('http://localhost:5293/api/auth/login', {
          Username: formData.username, 
          Password: formData.password
        });
        
        // Backend của bạn trả về: token, role, message
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user_name', formData.username); // Lưu tạm tên tài khoản để hiển thị lên Header
        
        alert(res.data.message || 'Đăng nhập thành công!');
        navigate(-1); // Trở về trang trước đó (ví dụ đang ở Chi tiết sản phẩm thì về lại đó)

      } catch (error) {
        alert(error.response?.data || 'Sai tài khoản hoặc mật khẩu!');
      }
    } else {
      // -----------------------------------------
      // GỌI API ĐĂNG KÝ (Cần Backend viết thêm)
      // -----------------------------------------
      try {
        // Hiện tại Backend chưa có /api/auth/register, nên gọi sẽ báo lỗi 404
        await axios.post('http://localhost:5293/api/auth/register', {
          Username: formData.username,
          Password: formData.password,
          FullName: formData.fullName
        });
        
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLoginView(true); // Tự động chuyển qua tab Đăng nhập
      } catch (error) {
        alert('Tính năng Đăng ký đang được bảo trì (Backend chưa có API này). Bạn hãy dùng tài khoản admin/123456 để test thử nhé!');
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f6fa' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '400px' }}>
        
        <Link to="/" style={{ textDecoration: 'none', color: '#7f8c8d', fontSize: '14px', marginBottom: '20px', display: 'inline-block' }}>
          ⬅ Về trang chủ
        </Link>

        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
          {isLoginView ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ TÀI KHOẢN'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {!isLoginView && (
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Họ và tên *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nhập họ tên" />
            </div>
          )}

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tên đăng nhập (Username) *</label>
            <input type="text" name="username" required value={formData.username} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nhập tên đăng nhập" />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mật khẩu *</label>
            <input type="password" name="password" required value={formData.password} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nhập mật khẩu" />
          </div>

          <button type="submit" style={{ padding: '15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {isLoginView ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#7f8c8d' }}>
          {isLoginView ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <span 
            onClick={() => setIsLoginView(!isLoginView)} 
            style={{ color: '#3498db', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
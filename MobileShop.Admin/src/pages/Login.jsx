import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Để hiển thị lỗi chữ đỏ
  
  const navigate = useNavigate(); // Dùng để chuyển trang

  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn trang web bị load lại khi bấm Submit
    setError(''); // Xóa lỗi cũ (nếu có)

    try {
      // Gọi API sang Backend
      const response = await axios.post('http://localhost:5293/api/auth/login', {
        username: username,
        password: password
      });

      // Nếu thành công -> Lấy Token cất vào trình duyệt
      const token = response.data.token;
      localStorage.setItem('admin_token', token);

      alert('Đăng nhập thành công! Chào mừng Admin.');
      
      // Chuyển hướng về trang chủ Dashboard
      navigate('/'); 

    } catch (err) {
      // Nếu Backend trả về lỗi 401 (Sai pass) hoặc mất kết nối
      if (err.response && err.response.status === 401) {
        setError('Sai tên đăng nhập hoặc mật khẩu!');
      } else {
        setError('Lỗi kết nối đến máy chủ Backend.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <div style={{ padding: '30px', border: '1px solid #ccc', borderRadius: '8px', width: '300px' }}>
        <h2 style={{ textAlign: 'center' }}>Đăng Nhập Admin</h2>
        
        {/* Hiện thông báo lỗi nếu có */}
        {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Tài khoản</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          
          <div>
            <label>Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
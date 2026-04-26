import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserList() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('Internal'); // 'Internal' hoặc 'Customer'

  // Các state quản lý Popup (Modal)
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'ADD' hoặc 'EDIT'
  
  // Dữ liệu Form
  const [formData, setFormData] = useState({ id: null, username: '', email: '', password: '', role: 'Staff' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('http://localhost:5293/api/admin/adminuser', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      alert('Bạn không có quyền truy cập hoặc lỗi máy chủ!');
    }
  };

  // --- CÁC HÀM XỬ LÝ NÚT BẤM ---
  const openAddModal = () => {
    setModalType('ADD');
    setFormData({ id: null, username: '', email: '', password: '', role: 'Staff' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalType('EDIT');
    setFormData({ id: user.id, username: user.username, email: user.email || '', password: '', role: user.role });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      if (modalType === 'ADD') {
        await axios.post('http://localhost:5293/api/admin/adminuser', formData, { headers });
        alert('Thêm tài khoản thành công!');
      } else {
        await axios.put(`http://localhost:5293/api/admin/adminuser/${formData.id}`, { email: formData.email, role: formData.role }, { headers });
        alert('Cập nhật thông tin thành công!');
      }
      closeModal();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data || 'Có lỗi xảy ra!');
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Hệ thống sẽ đổi mật khẩu của tài khoản này thành 'MobileShop@123'. Bạn có tiếp tục?")) return;
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.put(`http://localhost:5293/api/admin/adminuser/${id}/reset-password`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data || 'Lỗi khi reset mật khẩu!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cảnh báo: Xóa User này sẽ xóa vĩnh viễn đơn hàng và đánh giá của họ. Chắc chắn xóa?")) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`http://localhost:5293/api/admin/adminuser/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã xóa tài khoản!');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data || 'Lỗi khi xóa!');
    }
  };

  // Lọc danh sách theo Tab
  const filteredUsers = users.filter(u => activeTab === 'Internal' ? (u.role === 'Admin' || u.role === 'Staff') : u.role === 'Customer');

  return (
    <div style={{ paddingBottom: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quản lý Người dùng</h2>
        {activeTab === 'Internal' && (
          <button onClick={openAddModal} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Thêm Tài khoản Nội bộ
          </button>
        )}
      </div>

      {/* CHUYỂN TAB */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button 
          onClick={() => setActiveTab('Internal')} 
          style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', fontSize: '16px', color: activeTab === 'Internal' ? '#2980b9' : '#7f8c8d', borderBottom: activeTab === 'Internal' ? '3px solid #2980b9' : 'none' }}
        >
          Nhân viên Nội bộ (Admin/Staff)
        </button>
        <button 
          onClick={() => setActiveTab('Customer')} 
          style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', fontSize: '16px', color: activeTab === 'Customer' ? '#2980b9' : '#7f8c8d', borderBottom: activeTab === 'Customer' ? '3px solid #2980b9' : 'none' }}
        >
          Khách hàng (Customers)
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Tài khoản</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>Vai trò</th>
            <th style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? filteredUsers.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>#{u.id}</td>
              <td style={{ padding: '12px' }}>
                <strong style={{ fontSize: '15px', color: '#2c3e50' }}>{u.username}</strong> <br/>
                <small style={{ color: u.authProvider === 'Google' ? '#e74c3c' : '#7f8c8d', fontWeight: 'bold' }}>[{u.authProvider}]</small>
              </td>
              <td style={{ padding: '12px', color: '#555' }}>{u.email || <span style={{ fontStyle: 'italic', color: '#aaa' }}>Chưa cập nhật</span>}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <span style={{ padding: '4px 10px', borderRadius: '4px', backgroundColor: u.role === 'Admin' ? '#e8f8f5' : (u.role === 'Staff' ? '#ebf5fb' : '#fef9e7'), color: u.role === 'Admin' ? '#27ae60' : (u.role === 'Staff' ? '#2980b9' : '#f39c12'), fontWeight: 'bold', fontSize: '13px' }}>
                  {u.role}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button onClick={() => openEditModal(u)} style={{ marginRight: '5px', padding: '6px 10px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sửa</button>
                
                {/* Chỉ hiển thị nút Reset Pass nếu là tài khoản Local */}
                {u.authProvider === 'Local' && (
                  <button onClick={() => handleResetPassword(u.id)} style={{ marginRight: '5px', padding: '6px 10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reset Pass</button>
                )}

                {/* Ẩn nút xóa đối với Admin */}
                {u.role !== 'Admin' && (
                  <button onClick={() => handleDelete(u.id)} style={{ padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Xóa</button>
                )}
              </td>
            </tr>
          )) : (
            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Không có người dùng nào.</td></tr>
          )}
        </tbody>
      </table>

      {/* --- CỬA SỔ POPUP (MODAL) THÊM / SỬA USER --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              {modalType === 'ADD' ? 'Tạo Tài Khoản Nội Bộ' : 'Chỉnh Sửa Tài Khoản'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              {modalType === 'ADD' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Tên đăng nhập</label>
                    <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mật khẩu khởi tạo</label>
                    <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Email liên hệ</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              {/* CHỈ HIỂN THỊ CHỌN ROLE NẾU ĐANG Ở TAB NỘI BỘ HOẶC SỬA NHÂN VIÊN */}
              {formData.role !== 'Customer' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Phân quyền (Role)</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}>
                    <option value="Staff">Staff (Nhân viên)</option>
                    <option value="Admin">Admin (Quản trị viên)</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={closeModal} style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy bỏ</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ------------------------------------------- */}
      
    </div>
  );
}

export default UserList;
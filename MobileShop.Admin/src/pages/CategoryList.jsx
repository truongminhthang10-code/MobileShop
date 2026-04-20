import { useState, useEffect } from 'react';
import axios from 'axios';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  
  // States cho Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // State đặc biệt: Nếu có ID nghĩa là đang SỬA, nếu null là đang THÊM MỚI
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('http://localhost:5293/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  // Hàm đổ dữ liệu lên Form khi bấm nút Sửa
  const handleEditClick = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || '');
    setPreviewUrl(category.logoUrl ? `http://localhost:5293${category.logoUrl}` : null);
    setLogoFile(null); // Reset file upload
  };

  // Hàm hủy Sửa, quay về Form Thêm mới
  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPreviewUrl(null);
    setLogoFile(null);
  };

  // HÀM LƯU DỮ LIỆU (Dùng chung cho cả Thêm và Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Description', description);
    if (logoFile) {
      formData.append('Logo', logoFile); 
    }

    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };

      if (editingId) {
        // NẾU ĐANG SỬA -> Gọi API PUT
        await axios.put(`http://localhost:5293/api/admin/categories/${editingId}`, formData, { headers });
        alert('Cập nhật danh mục thành công!');
      } else {
        // NẾU LÀ THÊM MỚI -> Gọi API POST
        await axios.post('http://localhost:5293/api/admin/categories', formData, { headers });
        alert('Thêm danh mục thành công!');
      }
      
      handleCancelEdit(); // Xóa sạch form
      fetchCategories();  // Load lại danh sách
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu!');
    }
  };

  // HÀM XÓA (Kèm bắt lỗi có sản phẩm)
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hãng ${name} không?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`http://localhost:5293/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Xóa thành công!');
      fetchCategories();
    } catch (error) {
      // Bắt cái lỗi BadRequest từ Backend và hiển thị cho Admin thấy
      if (error.response && error.response.status === 400) {
        alert(error.response.data); // Hiện câu: "Không thể xóa! Hãng này đang có sản phẩm..."
      } else {
        alert('Có lỗi xảy ra khi xóa danh mục!');
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* FORM BÊN TRÁI */}
      <div style={{ width: '35%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
        <h3 style={{ color: editingId ? '#f39c12' : 'black' }}>
          {editingId ? `Đang chỉnh sửa: ${name}` : 'Thêm Danh Mục Mới'}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold' }}>Tên hãng</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold' }}>Mô tả ngắn</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', height: '60px' }} />
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>Logo Hãng</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', marginTop: '5px' }} />
            {previewUrl && (
              <div style={{ marginTop: '10px' }}>
                <img src={previewUrl} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px dashed #ccc', padding: '5px' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: editingId ? '#f39c12' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editingId ? 'Cập Nhật' : 'Lưu Danh Mục'}
            </button>
            
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Hủy Sửa
              </button>
            )}
          </div>
        </form>
      </div>

      {/* BẢNG BÊN PHẢI */}
      <div style={{ width: '65%', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Danh Sách Các Hãng</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f1f1', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Logo</th>
              <th style={{ padding: '12px' }}>Tên hãng</th>
              <th style={{ padding: '12px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                  {c.logoUrl ? (
                    <img src={`http://localhost:5293${c.logoUrl}`} alt={c.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#aaa' }}>No IMG</div>
                  )}
                </td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleEditClick(c)} style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#f1c40f', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Sửa</button>
                  <button onClick={() => handleDelete(c.id, c.name)} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CategoryList;
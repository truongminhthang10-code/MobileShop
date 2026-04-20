import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function ProductEdit() {
  const { id } = useParams(); // Lấy cái ID trên thanh địa chỉ (VD: /products/edit/2 thì lấy số 2)
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm state loading để chờ lấy dữ liệu cũ
  
  // Các state lưu dữ liệu Form
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [variants, setVariants] = useState([]);

  // Chạy ngay khi mở trang: Lấy Danh mục & Lấy Dữ liệu sản phẩm cũ
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Lấy danh sách hãng
        const resCat = await axios.get('http://localhost:5293/api/admin/categories', { headers });
        setCategories(resCat.data);

        // 2. Lấy thông tin sản phẩm cần sửa
        const resProd = await axios.get(`http://localhost:5293/api/admin/products/${id}`, { headers });
        const p = resProd.data;
        
        // Điền dữ liệu cũ vào Form
        setName(p.name);
        setCategoryId(p.categoryId);
        setDescription(p.description || '');
        setBasePrice(p.basePrice);
        
        // Điền danh sách cấu hình (Variants)
        if (p.variants && p.variants.length > 0) {
          setVariants(p.variants);
          // Lấy đại diện ảnh của cấu hình đầu tiên để hiển thị
          setUploadedImageUrl(p.variants[0].imageUrl || '');
        } else {
          setVariants([{ color: '', storage: '', price: 0, stockQuantity: 0 }]);
        }

        setLoading(false); // Xong việc tải dữ liệu
      } catch (error) {
        console.error(error);
        alert('Không thể tải dữ liệu sản phẩm! Có thể sản phẩm không tồn tại.');
        navigate('/products');
      }
    };

    fetchInitialData();
  }, [id, navigate]);

  // Hàm Upload ảnh (giống trang Add)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post('http://localhost:5293/api/admin/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setUploadedImageUrl(res.data.url);
      alert('Tải ảnh mới lên thành công!');
    } catch (error) {
      alert('Lỗi khi tải ảnh lên!');
    }
  };

  // Các hàm quản lý Cấu hình (Variants)
  const handleAddVariant = () => setVariants([...variants, { color: '', storage: '', price: 0, stockQuantity: 0 }]);
  const handleRemoveVariant = (indexToRemove) => {
    if (variants.length === 1) { alert("Phải có ít nhất 1 cấu hình!"); return; }
    setVariants(variants.filter((_, index) => index !== indexToRemove));
  };
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // HÀM LƯU DỮ LIỆU CẬP NHẬT (Gọi PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) { alert('Vui lòng chọn danh mục!'); return; }

    const updatedProduct = {
      name,
      categoryId: parseInt(categoryId),
      description,
      basePrice: parseFloat(basePrice),
      variants: variants.map(v => ({
        color: v.color,
        storage: v.storage,
        price: parseFloat(v.price),
        stockQuantity: parseInt(v.stockQuantity),
        imageUrl: uploadedImageUrl // Gán ảnh (mới hoặc cũ) cho tất cả biến thể
      }))
    };

    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`http://localhost:5293/api/admin/products/${id}`, updatedProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cập nhật sản phẩm thành công!');
      navigate('/products'); // Lưu xong thì về trang danh sách
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật sản phẩm!');
      console.error(error);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Chỉnh sửa Sản Phẩm: <span style={{ color: '#007bff' }}>#{id}</span></h2>
        <button type="button" onClick={() => navigate('/products')} style={{ padding: '8px 15px', cursor: 'pointer' }}>Quay lại</button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Tên sản phẩm</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            
            <div>
              <label style={{ fontWeight: 'bold' }}>Danh mục (Hãng)</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 'bold' }}>Giá cơ bản (VNĐ)</label>
              <input type="number" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>

            <div>
              <label style={{ fontWeight: 'bold' }}>Hình ảnh sản phẩm</label>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Để trống nếu không muốn đổi ảnh</div>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%' }} />
              {uploadedImageUrl && (
                <img src={`http://localhost:5293${uploadedImageUrl}`} alt="Current" style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
              )}
            </div>
          </div>

          {/* CỘT PHẢI: VARIANTS */}
          <div style={{ flex: 1.5, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Các phiên bản cấu hình</h3>
              <button type="button" onClick={handleAddVariant} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm cấu hình</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>
              <div style={{ flex: 1.2 }}>Màu sắc</div>
              <div style={{ flex: 1 }}>Dung lượng</div>
              <div style={{ flex: 1.2 }}>Giá bán (VNĐ)</div>
              <div style={{ width: '80px' }}>Tồn kho</div>
              <div style={{ width: '60px', textAlign: 'center' }}>Xóa</div>
            </div>

            {variants.map((v, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', alignItems: 'center' }}>
                <input type="text" placeholder="VD: Đen" value={v.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} required style={{ flex: 1.2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input type="text" placeholder="VD: 256GB" value={v.storage} onChange={e => handleVariantChange(index, 'storage', e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input type="number" min="0" value={v.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} required style={{ flex: 1.2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input type="number" min="0" value={v.stockQuantity} onChange={e => handleVariantChange(index, 'stockQuantity', e.target.value)} required style={{ width: '80px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <button type="button" onClick={() => handleRemoveVariant(index)} style={{ width: '60px', padding: '8px 0', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button type="submit" style={{ padding: '12px 40px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            LƯU THAY ĐỔI
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductEdit; 
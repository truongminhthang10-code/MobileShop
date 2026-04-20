import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProductAdd() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  
  const [variants, setVariants] = useState([
    { color: '', storage: '', price: 0, stockQuantity: 0 }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.get('http://localhost:5293/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
      } catch (error) {
        console.error('Lỗi tải danh mục', error);
      }
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post('http://localhost:5293/api/admin/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadedImageUrl(res.data.url);
      alert('Tải ảnh lên thành công!');
    } catch (error) {
      alert('Lỗi khi tải ảnh lên!');
      console.error(error);
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, { color: '', storage: '', price: 0, stockQuantity: 0 }]);
  };

  // HÀM MỚI: Xóa một dòng phiên bản
  const handleRemoveVariant = (indexToRemove) => {
    // Không cho phép xóa nếu chỉ còn 1 dòng
    if (variants.length === 1) {
      alert("Sản phẩm phải có ít nhất 1 phiên bản!");
      return;
    }
    // Lọc bỏ dòng có index bị trùng với index cần xóa
    const newVariants = variants.filter((_, index) => index !== indexToRemove);
    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      alert('Vui lòng chọn danh mục!'); return;
    }

    const newProduct = {
      name,
      categoryId: parseInt(categoryId),
      description,
      basePrice: parseFloat(basePrice),
      variants: variants.map(v => ({
        color: v.color,
        storage: v.storage,
        price: parseFloat(v.price),
        stockQuantity: parseInt(v.stockQuantity),
        imageUrl: uploadedImageUrl 
      }))
    };

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post('http://localhost:5293/api/admin/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Thêm sản phẩm thành công!');
      navigate('/products'); 
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu sản phẩm!');
      console.error(error);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Thêm Sản Phẩm Mới</h2>
        <button type="button" onClick={() => navigate('/products')} style={{ padding: '8px 15px', cursor: 'pointer' }}>Quay lại</button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* CỘT TRÁI */}
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
              {/* Thêm min="0" để chặn số âm */}
              <input type="number" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>

            <div>
              <label style={{ fontWeight: 'bold' }}>Hình ảnh sản phẩm</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', marginTop: '5px' }} />
              {uploadedImageUrl && (
                <img src={`http://localhost:5293${uploadedImageUrl}`} alt="Uploaded" style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px' }} />
              )}
            </div>
          </div>

          {/* CỘT PHẢI: VARIANTS */}
          <div style={{ flex: 1.5, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Các phiên bản cấu hình</h3>
              <button type="button" onClick={handleAddVariant} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                + Thêm cấu hình
              </button>
            </div>

            {/* HÀNG TIÊU ĐỀ CHO CÁC Ô NHẬP LIỆU */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>
              <div style={{ flex: 1.2 }}>Màu sắc</div>
              <div style={{ flex: 1 }}>Dung lượng</div>
              <div style={{ flex: 1.2 }}>Giá bán (VNĐ)</div>
              <div style={{ width: '80px' }}>Tồn kho</div>
              <div style={{ width: '60px', textAlign: 'center' }}>Xóa</div>
            </div>

            {variants.map((v, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', alignItems: 'center' }}>
                <input type="text" placeholder="VD: Đen Titan" value={v.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} required style={{ flex: 1.2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                
                <input type="text" placeholder="VD: 256GB" value={v.storage} onChange={e => handleVariantChange(index, 'storage', e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                
                {/* Thêm min="0" để chặn số âm */}
                <input type="number" min="0" placeholder="Giá tiền" value={v.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} required style={{ flex: 1.2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                
                {/* Thêm min="0" để chặn số âm */}
                <input type="number" min="0" placeholder="Kho" value={v.stockQuantity} onChange={e => handleVariantChange(index, 'stockQuantity', e.target.value)} required style={{ width: '80px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                
                {/* NÚT XÓA DÒNG */}
                <button type="button" onClick={() => handleRemoveVariant(index)} style={{ width: '60px', padding: '8px 0', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Xóa
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button type="submit" style={{ padding: '12px 40px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            LƯU SẢN PHẨM
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductAdd;
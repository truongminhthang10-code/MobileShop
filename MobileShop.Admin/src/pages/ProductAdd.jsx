import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProductAdd() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState(''); // State mô tả đã sẵn sàng
  const [basePrice, setBasePrice] = useState(0);
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [variants, setVariants] = useState([
    { color: '', storage: '', price: 0, stockQuantity: 0, imageUrl: '' }
  ]);
  const [specifications, setSpecifications] = useState([]);

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
    const files = Array.from(e.target.files); 
    if (files.length === 0) return;
    const token = localStorage.getItem('admin_token');
    let newUrls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post('http://localhost:5293/api/admin/upload', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        newUrls.push(res.data.url);
      } catch (error) {}
    }
    setUploadedImages(prev => [...prev, ...newUrls]);
  };

  const handleRemoveImage = (index) => setUploadedImages(uploadedImages.filter((_, i) => i !== index));

  const handleVariantImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post('http://localhost:5293/api/admin/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const newVariants = [...variants];
      newVariants[index].imageUrl = res.data.url;
      setVariants(newVariants);
    } catch (error) { alert('Lỗi tải ảnh màu sắc!'); }
  };

  const handleAddVariant = () => setVariants([...variants, { color: '', storage: '', price: 0, stockQuantity: 0, imageUrl: '' }]);
  const handleRemoveVariant = (index) => {
    if (variants.length === 1) { alert("Phải có ít nhất 1 cấu hình!"); return; }
    setVariants(variants.filter((_, i) => i !== index));
  };
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleAddSpec = () => setSpecifications([...specifications, { specKey: '', specValue: '' }]);
  const handleRemoveSpec = (index) => setSpecifications(specifications.filter((_, i) => i !== index));
  const handleClearAllSpecs = () => {
    if(window.confirm("Bạn có chắc chắn muốn xóa toàn bộ thông số để viết lại?")) setSpecifications([]);
  };
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) { alert('Vui lòng chọn danh mục!'); return; }

    const newProduct = {
      name,
      categoryId: parseInt(categoryId),
      description, // Dữ liệu mô tả sẽ được đóng gói gửi đi tại đây
      basePrice: parseFloat(basePrice),
      images: uploadedImages, 
      variants: variants.map(v => ({
        color: v.color,
        storage: v.storage,
        price: parseFloat(v.price),
        stockQuantity: parseInt(v.stockQuantity),
        imageUrl: v.imageUrl ? v.imageUrl : (uploadedImages.length > 0 ? uploadedImages[0] : '') 
      })),
      specifications: specifications.filter(s => s.specKey.trim() !== '' && s.specValue.trim() !== '')
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
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '50px' }}>
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
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option> )}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Giá cơ bản (VNĐ)</label>
              <input type="number" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            
            {/* THÊM Ô NHẬP MÔ TẢ VÀO ĐÂY */}
            <div>
              <label style={{ fontWeight: 'bold' }}>Mô tả sản phẩm</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Nhập thông tin giới thiệu, đánh giá chi tiết về sản phẩm..."
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '120px', resize: 'vertical', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit' }} 
              />
            </div>

            <div>
              <label style={{ fontWeight: 'bold' }}>Thư viện Hình ảnh (Chung)</label>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ width: '100%', marginTop: '5px' }} />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {uploadedImages.map((url, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img src={`http://localhost:5293${url}`} alt="upload" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                    <button type="button" onClick={() => handleRemoveImage(index)} style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>X</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: VARIANTS */}
          <div style={{ flex: 1.5, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Các phiên bản cấu hình</h3>
              <button type="button" onClick={handleAddVariant} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm cấu hình</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#555' }}>
              <div style={{ width: '60px', textAlign: 'center' }}>Ảnh màu</div>
              <div style={{ flex: 1.2 }}>Màu sắc</div>
              <div style={{ flex: 1 }}>Dung lượng (kèm RAM)</div>
              <div style={{ flex: 1.2 }}>Giá bán (VNĐ)</div>
              <div style={{ width: '80px' }}>Tồn kho</div>
              <div style={{ width: '60px', textAlign: 'center' }}>Xóa</div>
            </div>
            {variants.map((v, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', alignItems: 'center' }}>
                <div style={{ width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ cursor: 'pointer', color: '#007bff', fontSize: '11px', textDecoration: 'underline', marginBottom: '4px' }}>
                    Up ảnh
                    <input type="file" accept="image/*" onChange={(e) => handleVariantImageUpload(index, e)} style={{ display: 'none' }} />
                  </label>
                  {v.imageUrl ? (
                    <img src={`http://localhost:5293${v.imageUrl}`} alt="color" style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                  ) : <div style={{ width: '35px', height: '35px', backgroundColor: '#eee', borderRadius: '4px', border: '1px dashed #ccc' }}></div>}
                </div>
                <input type="text" placeholder="VD: Đen Titan" value={v.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} required style={{ flex: 1.2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input type="text" placeholder="VD: 12GB - 256GB" value={v.storage} onChange={e => handleVariantChange(index, 'storage', e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input type="number" min="0" placeholder="Giá tiền" value={v.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} required style={{ flex: 1.2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input type="number" min="0" placeholder="Kho" value={v.stockQuantity} onChange={e => handleVariantChange(index, 'stockQuantity', e.target.value)} required style={{ width: '80px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <button type="button" onClick={() => handleRemoveVariant(index)} style={{ width: '60px', padding: '8px 0', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
              </div>
            ))}
          </div>
        </div>

        {/* THÔNG SỐ KỸ THUẬT */}
        <div style={{ marginTop: '20px', backgroundColor: '#fdfefe', border: '1px solid #d5dbdb', padding: '15px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>Thông số kỹ thuật</h3>
            <div>
              <button type="button" onClick={handleClearAllSpecs} style={{ padding: '6px 12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }}>Làm mới (Clear)</button>
              <button type="button" onClick={handleAddSpec} style={{ padding: '6px 12px', backgroundColor: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm thông số</button>
            </div>
          </div>
          
          {specifications.length === 0 ? (
            <div style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d', border: '1px dashed #bdc3c7', borderRadius: '4px' }}>
              Chưa có thông số nào. Bấm "+ Thêm thông số" để bắt đầu nhập cấu hình máy.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {specifications.map((spec, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="Tên (VD: Chipset)" value={spec.specKey} onChange={e => handleSpecChange(index, 'specKey', e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <input type="text" placeholder="Giá trị (VD: Snapdragon 8 Elite)" value={spec.specValue} onChange={e => handleSpecChange(index, 'specValue', e.target.value)} style={{ flex: 2, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <button type="button" onClick={() => handleRemoveSpec(index)} style={{ padding: '8px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button type="submit" style={{ padding: '12px 40px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>
            Lưu Sản Phẩm
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductAdd;
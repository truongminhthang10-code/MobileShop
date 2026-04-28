import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5293/api/admin/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // HÀM XỬ LÝ THÊM VÀO GIỎ HÀNG THẬT (ĐÃ CÓ KIỂM TRA ĐĂNG NHẬP)
  const handleAddToCart = () => {
    // --- KIỂM TRA ĐĂNG NHẬP ---
    const token = localStorage.getItem('user_token');
    if (!token) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return; // Bắt buộc dừng lại ở đây nếu chưa có vé đăng nhập
    }
    // --------------------------

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    // Lấy ảnh chuẩn: ưu tiên mảng images từ API của bạn
    const finalImage = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : null);

    if (existingItem) {
      // Nếu đã có trong giỏ, cộng thêm số lượng khách vừa chọn
      existingItem.quantity += quantity; 
    } else {
      // Nếu chưa có, tạo mới với số lượng khách chọn
      cart.push({ 
        id: product.id, 
        name: product.name, 
        price: product.basePrice || product.price || 0, 
        imageUrl: finalImage,
        quantity: quantity 
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm ${quantity} chiếc ${product.name} vào giỏ hàng!`);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải thông tin sản phẩm...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '50px' }}>Không tìm thấy sản phẩm này!</div>;

  // Xử lý ảnh để hiển thị ra màn hình
  const displayImage = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : null);

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      
      {/* CỘT TRÁI: HÌNH ẢNH SẢN PHẨM */}
      <div style={{ flex: '1 1 400px', textAlign: 'center' }}>
        {displayImage ? (
          <img 
            src={`http://localhost:5293${displayImage}`} 
            alt={product.name} 
            style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: '8px' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '400px', backgroundColor: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', borderRadius: '8px' }}>
            Sản phẩm chưa có ảnh
          </div>
        )}
      </div>

      {/* CỘT PHẢI: THÔNG TIN VÀ NÚT MUA */}
      <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '28px', color: '#2c3e50', marginBottom: '10px' }}>{product.name}</h1>
        
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '20px' }}>
          {product.basePrice ? product.basePrice.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
        </div>

        <div style={{ backgroundColor: '#f5f6fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#34495e' }}>Mô tả sản phẩm:</h3>
          <p style={{ lineHeight: '1.6', color: '#555' }}>
            {product.description || 'Chưa có bài viết mô tả cho sản phẩm này.'}
          </p>
        </div>

        {/* Khu vực chọn số lượng và nút Thêm vào giỏ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: 'auto' }}>
          <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              style={{ padding: '10px 15px', backgroundColor: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >-</button>
            <input 
              type="number" 
              value={quantity} 
              readOnly 
              style={{ width: '50px', textAlign: 'center', border: 'none', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc', fontSize: '16px' }} 
            />
            <button 
              onClick={() => setQuantity(q => q + 1)}
              style={{ padding: '10px 15px', backgroundColor: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >+</button>
          </div>

          <button 
            style={{ flex: 1, padding: '15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={handleAddToCart}
          >
            THÊM VÀO GIỎ HÀNG 🛒
          </button>
        </div>
        
        <button 
          onClick={() => navigate(-1)} 
          style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ecf0f1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#2c3e50' }}
        >
          ⬅ Quay lại
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
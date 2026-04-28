import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm thêm vào giỏ hàng (Giống hệt trang Home)
  const addToCart = (product) => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ 
        id: product.id, 
        name: product.name, 
        price: product.basePrice || product.price || 0, 
        imageUrl: product.imageUrl || (product.images && product.images[0]), 
        quantity: 1 
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5293/api/products');
        // Đảo ngược mảng để sản phẩm mới thêm lên đầu tiên
        setProducts(response.data.reverse()); 
      } catch (error) {
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải danh sách sản phẩm...</div>;

  return (
    <div>
      <h2 style={{ borderBottom: '2px solid #e74c3c', display: 'inline-block', paddingBottom: '5px', marginBottom: '30px', color: '#2c3e50' }}>
        Tất Cả Điện Thoại
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {products.map(product => (
          <div key={product.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            
            <div style={{ height: '180px', marginBottom: '15px', textAlign: 'center' }}>
              {product.imageUrl ? (
                <img src={`http://localhost:5293${product.imageUrl}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : product.images && product.images.length > 0 ? (
                <img src={`http://localhost:5293${product.images[0]}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>No Image</div>
              )}
            </div>
            
            <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', color: '#2c3e50', flex: 1 }}>{product.name}</h3>
            <div style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '18px', marginBottom: '15px' }}>
              {product.basePrice ? product.basePrice.toLocaleString('vi-VN') + ' đ' : product.price ? product.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/product/${product.id}`} style={{ flex: 1, textAlign: 'center', padding: '8px', backgroundColor: '#ecf0f1', color: '#2c3e50', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>
                Chi tiết
              </Link>
              <button 
                onClick={() => addToCart(product)} 
                style={{ flex: 1, padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                Thêm 🛒
              </button>
            </div>
          </div>
        ))}
        
        {products.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '50px', textAlign: 'center', color: '#7f8c8d' }}>
            Chưa có sản phẩm nào được bày bán.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
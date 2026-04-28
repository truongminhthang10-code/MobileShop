import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('search')?.toLowerCase() || '';

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
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get('http://localhost:5293/api/admin/categories'), 
          axios.get('http://localhost:5293/api/admin/products')    
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu từ Backend:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ĐÃ SỬA: BỘ LỌC VÀ GIỚI HẠN SẢN PHẨM TRƯỚC KHI HIỂN THỊ
  let displayedProducts = products;

  if (keyword) {
    // Nếu có tìm kiếm: Hiện TẤT CẢ sản phẩm khớp từ khóa
    displayedProducts = products.filter(p => {
      const matchName = p.name?.toLowerCase().includes(keyword);
      const matchCategory = p.categoryName?.toLowerCase().includes(keyword);
      return matchName || matchCategory;
    });
  } else {
    // Nếu ở trang chủ bình thường: Đảo ngược (mới nhất lên đầu) và lấy đúng 5 cái
    displayedProducts = [...products].reverse().slice(0, 5);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải cửa hàng...</div>;

  return (
    <div>
      {!keyword && (
        <>
          <div style={{ backgroundColor: '#3498db', color: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', marginBottom: '30px' }}>
            <h1>SĂN DEAL ĐIỆN THOẠI KHỦNG NHẤT NĂM</h1>
            <p>Giảm giá lên đến 30% cho các dòng máy mới nhất</p>
          </div>

          <h2 style={{ borderBottom: '2px solid #e74c3c', display: 'inline-block', paddingBottom: '5px', marginBottom: '20px' }}>
            Thương Hiệu Nổi Bật
          </h2>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '40px' }}>
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => navigate(`/?search=${cat.name}`)}
                style={{ minWidth: '120px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {cat.logoUrl ? (
                  <img src={`http://localhost:5293${cat.logoUrl}`} alt={cat.name} style={{ height: '40px', objectFit: 'contain', marginBottom: '10px' }} />
                ) : (
                  <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📱</div>
                )}
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{cat.name}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ borderBottom: '2px solid #e74c3c', display: 'inline-block', paddingBottom: '5px', marginBottom: '20px' }}>
        {keyword ? `Kết quả tìm kiếm cho: "${keyword}"` : 'Sản Phẩm Mới Nhất'}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {/* ĐÃ SỬA: Dùng displayedProducts thay vì filteredProducts */}
        {displayedProducts.map(product => (
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
        
        {/* ĐÃ SỬA: Dùng displayedProducts */}
        {displayedProducts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '50px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px' }}>
            <span style={{ fontSize: '40px' }}>🔍</span>
            <h3 style={{ color: '#2c3e50', marginTop: '15px' }}>Không tìm thấy sản phẩm nào!</h3>
            <p style={{ color: '#7f8c8d' }}>Hãy thử gõ lại từ khóa khác như "Apple", "Samsung" hoặc tên máy xem sao.</p>
          </div>
        )}
      </div>
      
      {/* Thêm một nút Xem tất cả nếu không có tìm kiếm */}
      {!keyword && products.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Link to="/products" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#ecf0f1', color: '#2c3e50', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            Xem tất cả điện thoại ➔
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
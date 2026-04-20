import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // Hàm chạy ngay khi vừa mở trang
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // 1. Lấy token từ két sắt
      const token = localStorage.getItem('admin_token');
      
      // 2. Gọi API kèm theo thẻ ưu tiên (Token)
      const response = await axios.get('http://localhost:5293/api/admin/products', {
        headers: {
          Authorization: `Bearer ${token}` // Bắt buộc phải có chữ Bearer và dấu cách
        }
      });

      // 3. Cất dữ liệu vào State (Nếu bạn có làm phân trang thì nó nằm trong items)
      setProducts(response.data.items || response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      alert("Không thể tải danh sách sản phẩm!");
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Quản lý Sản phẩm</h2>
      <button onClick={() => navigate('/products/add')} // Gắn sự kiện chuyển trang
        style={{ marginBottom: '15px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        + Thêm Sản phẩm mới
      </button>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f1f1', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Tên sản phẩm</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Giá cơ bản</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>#{product.id}</td>
                  
                  {/* CỘT TÊN SẢN PHẨM & BIẾN THỂ */}
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2c3e50' }}>{product.name}</div>
                    
                    {/* Kiểm tra nếu có mảng biến thể thì in ra một danh sách nhỏ */}
                    {product.variants && product.variants.length > 0 ? (
                      <ul style={{ margin: '8px 0 0 15px', padding: 0, fontSize: '13px', color: '#555' }}>
                        {product.variants.map(v => (
                          <li key={v.id} style={{ marginBottom: '4px' }}>
                            <span style={{ fontWeight: '500' }}>{v.color} - {v.storage}</span>: {v.price.toLocaleString('vi-VN')} đ 
                            <span style={{ color: '#27ae60', marginLeft: '5px' }}>(Kho: {v.stockQuantity})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#e74c3c' }}>Chưa có phiên bản nào</span>
                    )}
                  </td>

                  {/* CỘT GIÁ CƠ BẢN (Dành cho việc so sánh nội bộ) */}
                  <td style={{ padding: '12px', color: '#7f8c8d', verticalAlign: 'top' }}>
                    {product.basePrice.toLocaleString('vi-VN')} đ
                  </td>
                  
                  {/* CỘT HÀNH ĐỘNG */}
                  <td style={{ padding: '12px', verticalAlign: 'top' }}>
                    <button 
                      onClick={() => navigate(`/products/edit/${product.id}`)} 
                      style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                      Sửa
                    </button>
                    <button style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Chưa có sản phẩm nào trong kho.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductList;
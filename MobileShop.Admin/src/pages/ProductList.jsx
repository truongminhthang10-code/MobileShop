import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // STATE MỚI: Dùng cho chức năng Xem nhanh (Quick View)
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get('http://localhost:5293/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.items || response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm:", error);
      alert("Không thể tải danh sách sản phẩm!");
      setLoading(false);
    }
  };

  // HÀM MỚI: Gọi API lấy chi tiết sản phẩm (Bao gồm Thông số kỹ thuật)
  const fetchProductDetails = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`http://localhost:5293/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductDetails(res.data);
      setExpandedProductId(id); // Mở dòng hiển thị chi tiết
    } catch (error) {
      alert('Không thể lấy chi tiết sản phẩm');
    }
  };

  // Hàm xử lý Xóa sản phẩm (Đã thêm logic)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`http://localhost:5293/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã xóa sản phẩm thành công!');
      fetchProducts(); // Tải lại danh sách
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm!');
    }
  };

  return (
    <div style={{ paddingBottom: '50px' }}>
      <h2>Quản lý Sản phẩm</h2>
      <button onClick={() => navigate('/products/add')}
        style={{ marginBottom: '15px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
        + Thêm Sản phẩm mới
      </button>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f1f1', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Hình ảnh</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Tên sản phẩm</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Giá cơ bản</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #ddd', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => {
                let displayImage = null;
                if (product.images && product.images.length > 0) {
                  displayImage = product.images[0];
                } else if (product.variants && product.variants.length > 0 && product.variants[0].imageUrl) {
                  displayImage = product.variants[0].imageUrl;
                }

                return (
                  <React.Fragment key={product.id}>
                    <tr style={{ borderBottom: '1px solid #eee', backgroundColor: expandedProductId === product.id ? '#f4f6f6' : 'white' }}>
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>#{product.id}</td>
                      
                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        {displayImage ? (
                          <img 
                            src={displayImage.includes('/products/') ? `http://localhost:5293${displayImage}` : `http://localhost:5293/uploads/products/${displayImage.replace('/uploads/', '')}`} 
                            alt={product.name} 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/60x60?text=No+Img'; }}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }} 
                          />
                        ) : (
                          <div style={{ width: '60px', height: '60px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', border: '1px dashed #ccc', borderRadius: '4px' }}>Trống</div>
                        )}
                      </td>

                      <td style={{ padding: '12px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2c3e50' }}>{product.name}</div>
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

                      <td style={{ padding: '12px', color: '#7f8c8d', verticalAlign: 'top' }}>
                        {product.basePrice.toLocaleString('vi-VN')} đ
                      </td>
                      
                      {/* NÚT THAO TÁC */}
                      <td style={{ padding: '12px', verticalAlign: 'top', textAlign: 'center' }}>
                        {/* Nút Xem chi tiết */}
                        <button 
                          onClick={() => expandedProductId === product.id ? setExpandedProductId(null) : fetchProductDetails(product.id)} 
                          style={{ marginRight: '5px', padding: '6px 10px', cursor: 'pointer', backgroundColor: expandedProductId === product.id ? '#95a5a6' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                        >
                          {expandedProductId === product.id ? 'Đóng' : 'Chi tiết'}
                        </button>

                        <button 
                          onClick={() => navigate(`/products/edit/${product.id}`)} 
                          style={{ marginRight: '5px', padding: '6px 10px', cursor: 'pointer', backgroundColor: '#f1c40f', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                        >
                          Sửa
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(product.id)}
                          style={{ padding: '6px 10px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>

                    {/* DÒNG XỔ XUỐNG HIỂN THỊ THÔNG SỐ KỸ THUẬT */}
                    {expandedProductId === product.id && productDetails && (
                      <tr style={{ backgroundColor: '#fbfcfc' }}>
                        <td colSpan="5" style={{ padding: '20px', borderBottom: '2px solid #ddd' }}>
                          <div style={{ display: 'flex', gap: '30px' }}>
                            
                            {/* Cột Mô tả ngắn */}
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Mô tả sản phẩm</h4>
                              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                {productDetails.description || 'Chưa có mô tả cho sản phẩm này.'}
                              </p>
                            </div>

                            {/* Cột Thông số kỹ thuật */}
                            <div style={{ flex: 1.5 }}>
                              <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Thông số kỹ thuật</h4>
                              {productDetails.specifications && productDetails.specifications.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                  <tbody>
                                    {productDetails.specifications.map((spec, index) => (
                                      <tr key={index} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                        <td style={{ padding: '8px', fontWeight: 'bold', width: '35%', color: '#333' }}>{spec.specKey}</td>
                                        <td style={{ padding: '8px', color: '#555' }}>{spec.specValue}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div style={{ fontSize: '13px', color: '#e74c3c', fontStyle: 'italic' }}>
                                  ⚠️ Sản phẩm này chưa được nhập thông số kỹ thuật.
                                </div>
                              )}
                            </div>
                            
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Chưa có sản phẩm nào trong kho.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductList;
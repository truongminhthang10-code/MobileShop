import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  // Lấy dữ liệu từ LocalStorage khi mở trang
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  // Hàm cập nhật số lượng
  const updateQuantity = (id, amount) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + amount);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Hàm xóa sản phẩm khỏi giỏ
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Tính tổng tiền
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2 style={{ color: '#2c3e50' }}>Giỏ hàng của bạn đang trống</h2>
        <p style={{ marginBottom: '20px', color: '#7f8c8d' }}>Hãy quay lại trang chủ để chọn sản phẩm nhé!</p>
        <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '2px solid #e74c3c', display: 'inline-block', paddingBottom: '5px', marginBottom: '20px' }}>
        Giỏ hàng của bạn
      </h2>

      {/* Danh sách sản phẩm */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f6fa', textAlign: 'left' }}>
            <th style={{ padding: '15px' }}>Sản phẩm</th>
            <th style={{ padding: '15px' }}>Đơn giá</th>
            <th style={{ padding: '15px' }}>Số lượng</th>
            <th style={{ padding: '15px' }}>Thành tiền</th>
            <th style={{ padding: '15px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #ecf0f1' }}>
              <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                {item.imageUrl ? (
                  <img src={`http://localhost:5293${item.imageUrl}`} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📱</div>
                )}
                <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{item.name}</span>
              </td>
              <td style={{ padding: '15px', color: '#e74c3c', fontWeight: 'bold' }}>
                {item.price?.toLocaleString('vi-VN')} đ
              </td>
              <td style={{ padding: '15px' }}>
                <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', width: 'fit-content' }}>
                  <button onClick={() => updateQuantity(item.id, -1)} style={{ padding: '5px 10px', border: 'none', background: '#fff', cursor: 'pointer' }}>-</button>
                  <input type="text" value={item.quantity} readOnly style={{ width: '40px', textAlign: 'center', border: 'none', borderLeft: '1px solid #ccc', borderRight: '1px solid #ccc' }} />
                  <button onClick={() => updateQuantity(item.id, 1)} style={{ padding: '5px 10px', border: 'none', background: '#fff', cursor: 'pointer' }}>+</button>
                </div>
              </td>
              <td style={{ padding: '15px', color: '#e74c3c', fontWeight: 'bold' }}>
                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
              </td>
              <td style={{ padding: '15px' }}>
                <button onClick={() => removeItem(item.id)} style={{ padding: '8px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tổng tiền và Đặt hàng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <Link to="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
          ⬅ Tiếp tục mua sắm
        </Link>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '10px' }}>
            Tổng thanh toán: <span style={{ fontSize: '24px', color: '#e74c3c', fontWeight: 'bold', marginLeft: '10px' }}>{totalPrice.toLocaleString('vi-VN')} đ</span>
          </div>
          <Link to="/checkout" style={{ display: 'inline-block', padding: '15px 30px', backgroundColor: '#27ae60', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
  TIẾN HÀNH ĐẶT HÀNG
</Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
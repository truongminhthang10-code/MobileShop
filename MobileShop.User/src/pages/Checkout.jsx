import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  
  // Thông tin giao hàng
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    paymentMethod: 'COD' // Mặc định là Thanh toán khi nhận hàng
  });

  // Lấy giỏ hàng, nếu trống thì đá về trang chủ
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (savedCart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      navigate('/');
    }
    setCartItems(savedCart);
  }, [navigate]);

  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // HÀM XỬ LÝ ĐẶT HÀNG (TRÙM CUỐI)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // 1. Chuẩn bị cục dữ liệu (Payload) chuẩn để gửi cho Backend
    const orderPayload = {
      CustomerName: formData.customerName,
      PhoneNumber: formData.phoneNumber,
      Address: formData.address,
      PaymentMethod: formData.paymentMethod,
      TotalAmount: totalPrice,
      // Chuyển đổi giỏ hàng sang định dạng OrderItems mà Backend thường dùng
      OrderItems: cartItems.map(item => ({
        VariantId: item.id, // (Lưu ý: Bạn nhắc Backend dùng ID biến thể nhé)
        Quantity: item.quantity,
        UnitPrice: item.price
      }))
    };

    // In ra Console để bạn xem trước gói hàng gửi đi xịn thế nào
    console.log("DỮ LIỆU ĐƠN HÀNG CHUẨN BỊ GỬI:", orderPayload);

    try {
      // 2. GỌI API (Đang bị comment lại vì Backend chưa có hàm này)
      // Khi nào Backend có API, bạn mở comment 2 dòng dưới đây ra và thay đường dẫn
      
      await axios.post('http://localhost:5293/api/public/orders', orderPayload, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('user_token')}` }
      });
      

      alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\nCảm ơn ${formData.customerName} đã mua sắm.\nĐơn hàng sẽ được giao đến: ${formData.address}`);
      
      // Đặt hàng xong thì xóa giỏ hàng và về trang chủ
      localStorage.removeItem('cart');
      navigate('/');
      
    } catch (error) {
      alert('Lỗi đặt hàng: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
      
      {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
      <div style={{ flex: 2, backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #e74c3c', paddingBottom: '10px', marginBottom: '20px', display: 'inline-block' }}>
          Thông tin giao hàng
        </h2>
        
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Họ và tên người nhận *</label>
            <input type="text" name="customerName" required value={formData.customerName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nhập họ tên" />
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Số điện thoại *</label>
            <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nhập số điện thoại" />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Địa chỉ cụ thể (Số nhà, đường, Thành phố) *</label>
            <input type="text" name="address" required value={formData.address} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="VD: 123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM" />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Phương thức thanh toán</label>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
              <option value="COD">Thanh toán tiền mặt khi nhận hàng (COD)</option>
              <option value="Banking">Chuyển khoản ngân hàng</option>
            </select>
          </div>

          <button type="submit" style={{ padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            XÁC NHẬN ĐẶT HÀNG
          </button>
        </form>
      </div>

      {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
      <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Tóm tắt đơn hàng</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
          {cartItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{item.quantity}x</span>
                <span style={{ color: '#555', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
              </div>
              <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', borderTop: '2px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Tổng cộng:</span>
          <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '22px' }}>
            {totalPrice.toLocaleString('vi-VN')} đ
          </span>
        </div>
        
        <Link to="/cart" style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: '#3498db', textDecoration: 'none' }}>
          ⬅ Quay lại chỉnh sửa giỏ hàng
        </Link>
      </div>

    </div>
  );
}

export default Checkout;
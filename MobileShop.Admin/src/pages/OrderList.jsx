import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [pageNumber, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('http://localhost:5293/api/admin/orders', {
        params: { pageNumber, pageSize: 10, status: statusFilter || null },
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch (error) {
      alert('Lỗi tải đơn hàng');
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`http://localhost:5293/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderDetails(res.data);
      setExpandedOrderId(id);
    } catch (error) {
      alert('Không thể lấy chi tiết đơn hàng');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`http://localhost:5293/api/admin/orders/${id}/status`, 
        parseInt(newStatus), 
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      alert('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (error) {
      alert('Lỗi cập nhật');
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm("Bạn có chắc chắn muốn hủy đơn và hoàn lại kho?")) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`http://localhost:5293/api/admin/orders/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã hủy đơn và hoàn kho thành công');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data || 'Lỗi khi hủy đơn');
    }
  };

  const getStatusText = (s) => {
    const map = { 0: 'Chờ xác nhận', 1: 'Đã xác nhận', 2: 'Đang giao', 3: 'Hoàn thành', 4: 'Đã hủy' };
    return map[s] || 'Không xác định';
  };

  return (
    <div>
      <h2>Quản lý Đơn hàng</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }} style={{ padding: '8px' }}>
          <option value="">Tất cả trạng thái</option>
          <option value="0">Chờ xác nhận</option>
          <option value="1">Đã xác nhận</option>
          <option value="2">Đang giao</option>
          <option value="3">Hoàn thành</option>
          <option value="4">Đã hủy</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Khách hàng</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Tổng tiền</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Trạng thái</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <React.Fragment key={o.id}>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', textAlign: 'center' }}>#{o.id}</td>
                <td style={{ padding: '10px' }}>
                  <strong>{o.customerName}</strong> <br/> 
                  <span style={{ color: '#666', fontSize: '14px' }}>{o.phoneNumber}</span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' }}>
                  {o.totalAmount.toLocaleString('vi-VN')} đ
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '13px', backgroundColor: o.status === 3 ? '#e8f8f5' : '#fef9e7', color: o.status === 3 ? '#27ae60' : '#d35400', fontWeight: 'bold' }}>
                    {getStatusText(o.status)}
                  </span>
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <select value={o.status} onChange={(e) => handleStatusUpdate(o.id, e.target.value)} style={{ marginRight: '5px', padding: '5px' }}>
                    <option value="0">Chờ xác nhận</option>
                    <option value="1">Đã xác nhận</option>
                    <option value="2">Đang giao</option>
                    <option value="3">Hoàn thành</option>
                  </select>
                  <button onClick={() => expandedOrderId === o.id ? setExpandedOrderId(null) : fetchOrderDetails(o.id)} style={{ padding: '6px 10px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>
                    {expandedOrderId === o.id ? 'Đóng' : 'Chi tiết'}
                  </button>
                  {o.status !== 4 && o.status !== 3 && (
                    <button onClick={() => handleCancel(o.id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', marginLeft: '5px', cursor: 'pointer' }}>Hủy</button>
                  )}
                </td>
              </tr>
              
              {expandedOrderId === o.id && orderDetails && (
                <tr style={{ backgroundColor: '#fbfcfc' }}>
                  <td colSpan="5" style={{ padding: '20px', borderBottom: '2px solid #ddd' }}>
                    <p style={{ margin: '0 0 5px 0' }}><strong>📍 Địa chỉ giao hàng:</strong> {orderDetails.address}</p>
                    <p style={{ margin: '0 0 15px 0' }}><strong>💳 Phương thức:</strong> {orderDetails.paymentMethod} - {orderDetails.shippingMethod}</p>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #ddd' }}>
                      <thead style={{ backgroundColor: '#f1f1f1' }}>
                        <tr>
                          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Sản phẩm</th>
                          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Màu / Dung lượng</th>
                          <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>SL</th>
                          <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Đơn giá</th>
                          <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                            
                            {/* CỘT ẢNH VÀ TÊN SẢN PHẨM */}
                            <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {item.imageUrl ? (
                                <img 
                                  src={`http://localhost:5293${item.imageUrl}`} 
                                  alt={item.productName} 
                                  // Sự kiện thần thánh: Nếu link ảnh bị lỗi (404), tự động thay bằng ảnh xám "No Image"
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=No+Img'; }}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }} 
                                />
                              ) : (
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', border: '1px dashed #ccc', borderRadius: '4px' }}>Trống</div>
                              )}
                              <strong style={{ color: '#2c3e50' }}>{item.productName}</strong>
                            </td>
                            
                            <td style={{ padding: '10px', color: '#555' }}>
                              {item.color} - {item.storage}
                            </td>
                            
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                              {item.quantity}
                            </td>
                            
                            <td style={{ padding: '10px', textAlign: 'right', color: '#7f8c8d' }}>
                              {item.unitPrice.toLocaleString('vi-VN')} đ
                            </td>
                            
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#c0392b' }}>
                              {item.subTotal.toLocaleString('vi-VN')} đ
                            </td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button disabled={pageNumber === 1} onClick={() => setPageNumber(pageNumber - 1)} style={{ padding: '8px 15px', cursor: pageNumber === 1 ? 'not-allowed' : 'pointer' }}>Trang trước</button>
        <span style={{ margin: '0 15px', fontWeight: 'bold' }}>Trang {pageNumber}</span>
        <button disabled={orders.length < 10} onClick={() => setPageNumber(pageNumber + 1)} style={{ padding: '8px 15px', cursor: orders.length < 10 ? 'not-allowed' : 'pointer' }}>Trang sau</button>
      </div>
    </div>
  );
}

export default OrderList;
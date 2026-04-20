import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null); // Lưu chi tiết khi bấm xem

  useEffect(() => {
    fetchOrders();
  }, [pageNumber, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      // Gửi params đúng theo Backend yêu cầu: pageNumber, status
      const res = await axios.get('http://localhost:5293/api/admin/orders', {
        params: { pageNumber, pageSize: 10, status: statusFilter || null },
        headers: { Authorization: `Bearer ${token}` }
      });
      // Vì Backend trả về PagedResult nên lấy res.data.items
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
        parseInt(newStatus), // Backend nhận [FromBody] int
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

  // Ánh xạ số (int) sang chữ cho Admin dễ đọc
  const getStatusText = (s) => {
    const map = { 0: 'Chờ xác nhận', 1: 'Đã xác nhận', 2: 'Đang giao', 3: 'Hoàn thành', 4: 'Đã hủy' };
    return map[s] || 'Không xác định';
  };

  return (
    <div>
      <h2>Quản lý Đơn hàng</h2>
      
      {/* Bộ lọc */}
      <div style={{ marginBottom: '15px' }}>
        <select onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }} style={{ padding: '8px' }}>
          <option value="">Tất cả trạng thái</option>
          <option value="0">Chờ xác nhận</option>
          <option value="1">Đã xác nhận</option>
          <option value="2">Đang giao</option>
          <option value="3">Hoàn thành</option>
          <option value="4">Đã hủy</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Khách hàng</th>
            <th style={{ padding: '10px' }}>Tổng tiền</th>
            <th style={{ padding: '10px' }}>Trạng thái</th>
            <th style={{ padding: '10px' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <React.Fragment key={o.id}>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>#{o.id}</td>
                <td style={{ padding: '10px' }}>{o.customerName} <br/> <small>{o.phoneNumber}</small></td>
                <td style={{ padding: '10px' }}>{o.totalAmount.toLocaleString()}đ</td>
                <td style={{ padding: '10px' }}><strong>{getStatusText(o.status)}</strong></td>
                <td style={{ padding: '10px' }}>
                  <select value={o.status} onChange={(e) => handleStatusUpdate(o.id, e.target.value)} style={{ marginRight: '5px' }}>
                    <option value="0">Chờ xác nhận</option>
                    <option value="1">Đã xác nhận</option>
                    <option value="2">Đang giao</option>
                    <option value="3">Hoàn thành</option>
                  </select>
                  <button onClick={() => expandedOrderId === o.id ? setExpandedOrderId(null) : fetchOrderDetails(o.id)}>Chi tiết</button>
                  {o.status !== 4 && o.status !== 3 && (
                    <button onClick={() => handleCancel(o.id)} style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', marginLeft: '5px' }}>Hủy</button>
                  )}
                </td>
              </tr>
              {expandedOrderId === o.id && orderDetails && (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', backgroundColor: '#fafafa' }}>
                    <p><strong>Địa chỉ giao hàng:</strong> {orderDetails.address}</p>
                    <p><strong>Phương thức:</strong> {orderDetails.paymentMethod} - {orderDetails.shippingMethod}</p>
                    <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #ddd' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f1f1', borderBottom: '2px solid #ccc' }}>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Sản phẩm</th>
                          <th style={{ padding: '12px', textAlign: 'left' }}>Màu / Dung lượng</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>SL</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Đơn giá</th>
                          <th style={{ padding: '12px', textAlign: 'right' }}>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                            
                            <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {item.imageUrl ? (
                                <img 
                                  src={
                                    item.imageUrl.includes('/products/') 
                                    ? `http://localhost:5293${item.imageUrl}` 
                                    : `http://localhost:5293/uploads/products/${item.imageUrl.replace('/uploads/', '')}`
                                } 
                                alt={item.productName} 
                                style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px', backgroundColor: '#fff' }} 
                                />
                              ) : (
                                <div style={{ width: '40px', height: '40px', backgroundColor: '#f8f9fa', border: '1px solid #eee', borderRadius: '4px' }}></div>
                              )}
                              <strong style={{ color: '#2c3e50' }}>{item.productName}</strong>
                            </td>
                            
                            {/* CỘT PHÂN LOẠI */}
                            <td style={{ padding: '12px', color: '#555' }}>
                              {item.color} - {item.storage}
                            </td>
                            
                            {/* CỘT SỐ LƯỢNG */}
                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                              {item.quantity}
                            </td>
                            
                            {/* CỘT ĐƠN GIÁ */}
                            <td style={{ padding: '12px', textAlign: 'right', color: '#7f8c8d' }}>
                              {item.unitPrice.toLocaleString('vi-VN')} đ
                            </td>
                            
                            {/* CỘT THÀNH TIỀN */}
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#e74c3c', fontSize: '15px' }}>
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

      {/* Phân trang đơn giản */}
      <div style={{ marginTop: '15px' }}>
        <button disabled={pageNumber === 1} onClick={() => setPageNumber(pageNumber - 1)}>Trang trước</button>
        <span style={{ margin: '0 15px' }}>Trang {pageNumber}</span>
        <button disabled={orders.length < 10} onClick={() => setPageNumber(pageNumber + 1)}>Trang sau</button>
      </div>
    </div>
  );
}

export default OrderList;
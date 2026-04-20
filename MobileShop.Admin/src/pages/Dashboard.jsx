import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    actualRevenue: 0, 
    expectedRevenue: 0, 
    pendingOrders: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const headers = { Authorization: `Bearer ${token}` };

        const resProducts = await axios.get('http://localhost:5293/api/admin/products', { headers });
        const resCategories = await axios.get('http://localhost:5293/api/admin/categories', { headers });
        const resOrders = await axios.get('http://localhost:5293/api/admin/orders?pageNumber=1&pageSize=100', { headers });
        
        const orders = resOrders.data.items || [];

        const actual = orders
          .filter(o => o.status === 3)
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const expected = orders
          .filter(o => o.status !== 4)
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const chartData = [
          { name: 'Chờ xử lý', sl: orders.filter(o => o.status === 0).length, color: '#f39c12' },
          { name: 'Đã xác nhận', sl: orders.filter(o => o.status === 1).length, color: '#3498db' },
          { name: 'Đang giao', sl: orders.filter(o => o.status === 2).length, color: '#9b59b6' },
          { name: 'Hoàn thành', sl: orders.filter(o => o.status === 3).length, color: '#27ae60' },
          { name: 'Đã hủy', sl: orders.filter(o => o.status === 4).length, color: '#c0392b' },
        ];

        setStats({
          totalProducts: resProducts.data.length,
          totalCategories: resCategories.data.length,
          totalOrders: resOrders.data.totalCount || orders.length,
          actualRevenue: actual,
          expectedRevenue: expected,
          pendingOrders: orders.filter(o => o.status === 0).length,
          chartData: chartData
        });

        setLoading(false);
      } catch (error) {
        console.error("Lỗi Dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#333', marginBottom: '25px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>BÁO CÁO TỔNG QUAN</h2>

      {/* 5 THẺ KPI - Vuông vức, không bóng đổ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#2ecc71', color: 'white', padding: '15px', border: '1px solid #27ae60', borderRadius: '2px' }}>
          <small style={{ opacity: 0.9 }}>DOANH THU THỰC TẾ</small>
          <h2 style={{ margin: '5px 0 0 0' }}>{stats.actualRevenue.toLocaleString()}đ</h2>
        </div>
        <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '15px', border: '1px solid #1e8449', borderRadius: '2px' }}>
          <small style={{ opacity: 0.9 }}>DOANH THU DỰ KIẾN</small>
          <h2 style={{ margin: '5px 0 0 0' }}>{stats.expectedRevenue.toLocaleString()}đ</h2>
        </div>
        <div style={{ backgroundColor: '#e74c3c', color: 'white', padding: '15px', border: '1px solid #c0392b', borderRadius: '2px' }}>
          <small style={{ opacity: 0.9 }}>ĐƠN CHỜ XỬ LÝ</small>
          <h2 style={{ margin: '5px 0 0 0' }}>{stats.pendingOrders} đơn</h2>
        </div>
        <div style={{ backgroundColor: '#3498db', color: 'white', padding: '15px', border: '1px solid #2980b9', borderRadius: '2px' }}>
          <small style={{ opacity: 0.9 }}>SẢN PHẨM</small>
          <h2 style={{ margin: '5px 0 0 0' }}>{stats.totalProducts} máy</h2>
        </div>
        <div style={{ backgroundColor: '#f1c40f', color: '#333', padding: '15px', border: '1px solid #f39c12', borderRadius: '2px' }}>
          <small style={{ opacity: 0.9 }}>HÃNG</small>
          <h2 style={{ margin: '5px 0 0 0' }}>{stats.totalCategories}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
        {/* BIỂU ĐỒ - Thô sơ, vuông vức */}
        <div style={{ flex: 2, backgroundColor: '#f9f9f9', padding: '20px', border: '1px solid #ccc', borderRadius: '2px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Thống kê Trạng thái Đơn hàng</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                <XAxis dataKey="name" axisLine={{stroke: '#999'}} tickLine={false} tick={{fontSize: 13, fill: '#333'}} />
                <YAxis allowDecimals={false} axisLine={{stroke: '#999'}} tickLine={false} tick={{fill: '#333'}} />
                <Tooltip cursor={{fill: '#eaeaea'}} />
                {/* Chỉnh radius=[0,0,0,0] để cột vuông đét */}
                <Bar dataKey="sl" radius={[0, 0, 0, 0]} barSize={40}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PHÍM TẮT - Đơn giản, thực dụng */}
        <div style={{ flex: 1, backgroundColor: '#fff', color: '#333', padding: '20px', border: '1px solid #ccc', borderRadius: '2px' }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Thao tác nhanh</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>Truy cập nhanh chức năng:</p>
          <button onClick={() => navigate('/products/add')} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #27ae60', borderRadius: '2px', backgroundColor: '#2ecc71', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>+ Thêm Sản Phẩm</button>
          <button onClick={() => navigate('/orders')} style={{ width: '100%', padding: '10px', border: '1px solid #e67e22', borderRadius: '2px', backgroundColor: '#f39c12', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>🛒 Duyệt Đơn Hàng</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
import { useState, useEffect } from 'react';
import axios from 'axios';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách đánh giá từ API Backend vừa viết
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('http://localhost:5293/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đánh giá:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Hàm xóa đánh giá
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`http://localhost:5293/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Đã xóa đánh giá thành công!");
      fetchReviews(); // Tải lại danh sách sau khi xóa
    } catch (error) {
      alert("Lỗi khi xóa đánh giá!");
      console.error(error);
    }
  };

  // Hàm vẽ ngôi sao (để hiển thị đẹp hơn)
  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu...</div>;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#333', marginBottom: '25px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        QUẢN LÝ ĐÁNH GIÁ & BÌNH LUẬN
      </h2>

      <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #ccc', borderRadius: '2px' }}>
        {reviews.length === 0 ? (
          <p>Hiện chưa có đánh giá nào.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Khách hàng</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Sản phẩm</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Đánh giá</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nội dung</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Ngày đăng</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{r.username}</td>
                  <td style={{ padding: '12px', color: '#2980b9' }}>{r.productName}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '18px' }}>{renderStars(r.rating)}</td>
                  <td style={{ padding: '12px', fontStyle: 'italic' }}>"{r.content}"</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDelete(r.id)}
                      style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      Xóa bỏ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reviews;
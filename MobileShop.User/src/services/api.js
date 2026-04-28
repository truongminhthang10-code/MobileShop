import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5293/api',
});

// Các hàm gọi API dành riêng cho phần Public (không cần Token)
export const publicApi = {
    // Gọi API lấy danh mục [cite: 841]
    getCategories: () => api.get('/public/categories'),
    
    // Gọi API lấy danh sách sản phẩm rút gọn [cite: 846]
    getProducts: () => api.get('/products'),
    
    // Gọi API lấy chi tiết sản phẩm [cite: 852]
    getProductDetails: (id) => api.get(`/products/${id}`),
};

export default api;
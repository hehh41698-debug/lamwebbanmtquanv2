import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Cart API calls
export const cartAPI = {
  // Lấy giỏ hàng
  getCart: () => api.get('/cart'),

  // Thêm vào giỏ hàng
  addToCart: (data) => api.post('/cart', data),

  // Cập nhật số lượng
  updateCartItem: (id, data) => api.put(`/cart/${id}`, data),

  // Xóa khỏi giỏ hàng
  removeFromCart: (id) => api.delete(`/cart/${id}`),

  // Xóa toàn bộ giỏ hàng
  clearCart: () => api.delete('/cart')
};

// Export default cho store sử dụng
export default api;
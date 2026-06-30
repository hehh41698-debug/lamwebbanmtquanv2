import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔧 API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  withCredentials: true // QUAN TRỌNG: Luôn gửi cookie
});

// ============================================
// REQUEST INTERCEPTOR - Log request
// ============================================
api.interceptors.request.use(
  (config) => {
    console.log('📡 API Request:', config.method.toUpperCase(), config.url);
    console.log('🔑 Cookies:', document.cookie);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - Xử lý lỗi 401
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    console.error('❌ Error data:', error.response?.data);

    // Nếu lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      console.log('🔐 Token expired or invalid, redirecting to login...');
      
      // Xóa cookie (client side)
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Chuyển hướng về login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
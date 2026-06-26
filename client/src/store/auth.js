import { defineStore } from 'pinia';
import api from '../api/auth';
import { useCartStore } from './cart';
import { toast } from 'vue3-toastify';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    userName: (state) => state.user?.name || 'Khách',
    userEmail: (state) => state.user?.email || '',
    userAvatar: (state) => state.user?.avatar || '/images/default-avatar.png'
  },

  actions: {
    // ============================================
    // ĐĂNG NHẬP
    // ============================================
    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔐 Đang đăng nhập:', email);

        const response = await api.post('/auth/login', {
          email: email.trim(),
          password: password.trim()
        });

        console.log('📦 Login response:', response.data);

        const data = response.data;

        // Kiểm tra response
        if (!data.success) {
          throw new Error(data.message || 'Đăng nhập thất bại');
        }

        // Lấy thông tin user và token
        const user = data.user || data;
        const token = data.token || data.accessToken;
        const refreshToken = data.refreshToken || data.refresh_token;

        if (!user || !token) {
          throw new Error('Response thiếu thông tin user hoặc token');
        }

        // Lưu thông tin
        this.user = user;
        this.token = token;
        this.refreshToken = refreshToken || null;
        this.isAuthenticated = true;

        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Load cart
        const cartStore = useCartStore();
        await cartStore.loadCart();

        toast.success(`Chào mừng ${user.name || 'User'}!`);
        return { success: true, user };
      } catch (error) {
        console.error('❌ Login error:', error);
        console.error('❌ Response data:', error.response?.data);
        
        const message = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
        this.error = message;
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.refreshToken = null;

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // ĐĂNG KÝ
    // ============================================
    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        console.log('📝 Đang đăng ký:', userData.email);

        if (userData.password !== userData.confirmPassword) {
          toast.error('Mật khẩu xác nhận không khớp');
          return { success: false, message: 'Mật khẩu xác nhận không khớp' };
        }

        if (userData.password.length < 6) {
          toast.error('Mật khẩu phải có ít nhất 6 ký tự');
          return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
        }

        const response = await api.post('/auth/register', {
          name: userData.name.trim(),
          email: userData.email.trim(),
          password: userData.password,
          phone: userData.phone || ''
        });

        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || 'Đăng ký thất bại');
        }

        const user = data.user || data;
        const token = data.token || data.accessToken;
        const refreshToken = data.refreshToken || data.refresh_token;

        this.user = user;
        this.token = token;
        this.refreshToken = refreshToken || null;
        this.isAuthenticated = true;

        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        toast.success(`Đăng ký thành công! Chào mừng ${user.name}!`);
        return { success: true, user };
      } catch (error) {
        console.error('❌ Register error:', error);
        const message = error.response?.data?.message || error.message || 'Đăng ký thất bại';
        this.error = message;
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.refreshToken = null;

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // ĐĂNG XUẤT
    // ============================================
    async logout() {
      try {
        console.log('🔓 Đang đăng xuất...');

        if (this.token) {
          await api.post('/auth/logout').catch(() => {});
        }
      } catch (error) {
        console.error('Logout API error:', error);
      } finally {
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.isAuthenticated = false;
        this.error = null;

        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        const cartStore = useCartStore();
        cartStore.clearCart();

        toast.info('Đã đăng xuất');
      }
    },

    // ============================================
    // LẤY THÔNG TIN USER HIỆN TẠI
    // ============================================
    async getCurrentUser() {
      if (!this.token) {
        console.log('ℹ️ Không có token');
        return null;
      }

      this.loading = true;

      try {
        console.log('👤 Đang lấy thông tin user...');
        const response = await api.get('/auth/me');

        if (response.data.user) {
          this.user = response.data.user;
          this.isAuthenticated = true;
          this.error = null;
          return this.user;
        }

        return null;
      } catch (error) {
        console.error('❌ Get current user error:', error);

        if (error.response?.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return await this.getCurrentUser();
          }
          this.logout();
        }

        return null;
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // REFRESH TOKEN
    // ============================================
    async refreshToken() {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('ℹ️ Không có refresh token');
          return false;
        }

        console.log('🔄 Đang refresh token...');
        const response = await api.post('/auth/refresh-token', { refreshToken });

        if (response.data.token) {
          this.token = response.data.token;
          localStorage.setItem('token', response.data.token);
          return true;
        }

        return false;
      } catch (error) {
        console.error('❌ Refresh token error:', error);
        return false;
      }
    },

    // ============================================
    // KIỂM TRA XÁC THỰC
    // ============================================
    async checkAuth() {
      if (this.isAuthenticated && this.user) {
        return true;
      }

      if (this.token) {
        const user = await this.getCurrentUser();
        return !!user;
      }

      return false;
    }
  }
});
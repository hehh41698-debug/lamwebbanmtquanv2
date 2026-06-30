import { defineStore } from 'pinia';
import api from '../api/auth';
import { useCartStore } from './cart';
import { toast } from 'vue3-toastify';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
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
    // ĐĂNG NHẬP - KHÔNG LƯU TOKEN LOCAL
    // ============================================
    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        console.log('🔐 Đang đăng nhập:', email);

        const response = await api.post('/auth/login', {
          email: email.trim(),
          password: password.trim()
        }, {
          withCredentials: true // Gửi cookie
        });

        console.log('📦 Login response:', response.data);

        // Kiểm tra response
        if (!response.data.success) {
          throw new Error(response.data.message || 'Đăng nhập thất bại');
        }

        const { user } = response.data;

        // Lưu thông tin user (không lưu token)
        this.user = user;
        this.isAuthenticated = true;

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

        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // ĐĂNG KÝ - KHÔNG LƯU TOKEN LOCAL
    // ============================================
    // ============================================
// ĐĂNG KÝ - ĐƠN GIẢN
// ============================================
async register(userData) {
  this.loading = true;
  this.error = null;

  try {
    console.log('📝 Registering:', userData.email);

    const response = await api.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || ''
    });

    console.log('📦 Response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Đăng ký thất bại');
    }

    const { user } = response.data;

    this.user = user;
    this.isAuthenticated = true;

    toast.success(`Đăng ký thành công! Chào mừng ${user.name}!`);
    return { success: true, user };
  } catch (error) {
    console.error('❌ Register error:', error);
    const message = error.response?.data?.message || error.message || 'Đăng ký thất bại';
    this.error = message;
    this.isAuthenticated = false;
    this.user = null;
    toast.error(message);
    return { success: false, message };
  } finally {
    this.loading = false;
  }
},

    // ============================================
    // ĐĂNG XUẤT - XÓA COOKIE
    // ============================================
    async logout() {
      try {
        console.log('🔓 Đang đăng xuất...');

        // Gọi API logout để xóa cookie
        await api.post('/auth/logout', {}, {
          withCredentials: true
        });
      } catch (error) {
        console.error('Logout API error:', error);
      } finally {
        // Xóa state
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;

        // Xóa cart
        const cartStore = useCartStore();
        cartStore.clearCart();

        toast.info('Đã đăng xuất');
      }
    },

   // ============================================
// LẤY THÔNG TIN USER HIỆN TẠI
// ============================================
async getCurrentUser() {
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
      // Không tự động logout, chỉ set isAuthenticated = false
      this.isAuthenticated = false;
      this.user = null;
    }

    return null;
  } finally {
    this.loading = false;
  }
},

    // ============================================
    // REFRESH TOKEN - LẤY TỪ COOKIE
    // ============================================
    async refreshToken() {
      try {
        console.log('🔄 Đang refresh token...');
        const response = await api.post('/auth/refresh-token', {}, {
          withCredentials: true
        });

        if (response.data.success) {
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

      const user = await this.getCurrentUser();
      return !!user;
    },

    // ============================================
    // CẬP NHẬT THÔNG TIN USER
    // ============================================
    async updateProfile(data) {
      this.loading = true;
      this.error = null;

      try {
        console.log('📝 Updating profile:', data);
        const response = await api.put('/users/profile', data, {
          withCredentials: true
        });

        this.user = response.data.user;
        toast.success('Cập nhật thông tin thành công');
        return { success: true, user: this.user };
      } catch (error) {
        console.error('❌ Update profile error:', error);
        const message = error.response?.data?.message || 'Cập nhật thất bại';
        this.error = message;
        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // ĐỔI MẬT KHẨU
    // ============================================
    async changePassword(currentPassword, newPassword) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put('/users/change-password', {
          currentPassword,
          newPassword
        }, {
          withCredentials: true
        });

        toast.success('Đổi mật khẩu thành công');
        return { success: true };
      } catch (error) {
        console.error('❌ Change password error:', error);
        const message = error.response?.data?.message || 'Đổi mật khẩu thất bại';
        this.error = message;
        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // CẬP NHẬT AVATAR
    // ============================================
    async updateAvatar(avatarUrl) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put('/users/avatar', { avatar: avatarUrl }, {
          withCredentials: true
        });

        this.user = response.data.user;
        toast.success('Cập nhật avatar thành công');
        return { success: true, user: this.user };
      } catch (error) {
        console.error('❌ Update avatar error:', error);
        const message = error.response?.data?.message || 'Cập nhật avatar thất bại';
        this.error = message;
        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // RESET STATE
    // ============================================
    reset() {
      this.user = null;
      this.isAuthenticated = false;
      this.loading = false;
      this.error = null;
    }
  }
});
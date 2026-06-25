import { defineStore } from 'pinia';
import api from '../api/auth';
import { useCartStore } from './cart';
import { toast } from 'vue3-toastify';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false
  }),
  
  getters: {
    // Kiểm tra user có phải admin không
    isAdmin: (state) => state.user?.role === 'admin',
    
    // Kiểm tra user đã đăng nhập chưa
    isLoggedIn: (state) => state.isAuthenticated && !!state.user,
    
    // Lấy tên user
    userName: (state) => state.user?.name || 'Guest',
    
    // Lấy email user
    userEmail: (state) => state.user?.email || '',
    
    // Lấy avatar user
    userAvatar: (state) => state.user?.avatar || '/images/default-avatar.png',
    
    // Lấy user info
    userInfo: (state) => state.user,
    
    // Kiểm tra user có active không
    isActive: (state) => state.user?.isActive !== false,
    
    // Lấy role user
    userRole: (state) => state.user?.role || 'user'
  },
  
  actions: {
    // Khởi tạo auth
    async init() {
      if (this.initialized) return;
      this.initialized = true;
      
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        await this.getCurrentUser();
      }
    },

    // Đăng nhập
    async login(email, password) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔐 Login attempt:', email);
        
        const response = await api.post('/auth/login', { email, password });
        console.log('✅ Login response:', response.data);
        
        const { user, token, refreshToken } = response.data;
        
        this.user = user;
        this.token = token;
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;
        this.error = null;
        
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Load cart after login
        const cartStore = useCartStore();
        await cartStore.loadCart();
        
        toast.success(`Chào mừng ${user.name}!`);
        return { success: true, user };
      } catch (error) {
        console.error('❌ Login error:', error);
        this.error = error.response?.data?.message || 'Đăng nhập thất bại';
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        toast.error(this.error);
        return { 
          success: false, 
          message: this.error 
        };
      } finally {
        this.loading = false;
      }
    },

    // Đăng ký
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('📝 Register attempt:', userData.email);
        
        const response = await api.post('/auth/register', userData);
        console.log('✅ Register response:', response.data);
        
        const { user, token, refreshToken } = response.data;
        
        this.user = user;
        this.token = token;
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;
        this.error = null;
        
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        toast.success(`Chào mừng ${user.name}! Đăng ký thành công.`);
        return { success: true, user };
      } catch (error) {
        console.error('❌ Register error:', error);
        this.error = error.response?.data?.message || 'Đăng ký thất bại';
        this.isAuthenticated = false;
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        toast.error(this.error);
        return { 
          success: false, 
          message: this.error 
        };
      } finally {
        this.loading = false;
      }
    },

    // Đăng xuất
    async logout() {
      try {
        console.log('🔓 Logout');
        
        // Gọi API logout nếu có token
        if (this.token) {
          await api.post('/auth/logout');
        }
      } catch (error) {
        console.error('Logout API error:', error);
      } finally {
        // Clear state
        this.user = null;
        this.token = null;
        this.refreshToken = null;
        this.isAuthenticated = false;
        this.error = null;
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Clear cart
        const cartStore = useCartStore();
        cartStore.clearCart();
        
        toast.info('Đã đăng xuất');
      }
    },

    // Lấy thông tin user hiện tại
    async getCurrentUser() {
      if (!this.token) {
        console.log('ℹ️ No token found');
        return null;
      }
      
      this.loading = true;
      
      try {
        console.log('👤 Fetching current user');
        const response = await api.get('/auth/me');
        console.log('✅ User data:', response.data);
        
        const user = response.data.user;
        if (user) {
          this.user = user;
          this.isAuthenticated = true;
          this.error = null;
          
          // Update token if provided
          if (response.data.token) {
            this.token = response.data.token;
            localStorage.setItem('token', response.data.token);
          }
          
          return this.user;
        }
        
        // No user data, logout
        this.logout();
        return null;
      } catch (error) {
        console.error('❌ Get current user error:', error);
        
        // Token expired or invalid
        if (error.response?.status === 401) {
          console.log('🔑 Token expired, refreshing...');
          const refreshed = await this.refreshToken();
          if (!refreshed) {
            this.logout();
          }
          return refreshed ? await this.getCurrentUser() : null;
        }
        
        this.error = error.response?.data?.message || 'Failed to get user info';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // Refresh token
    async refreshToken() {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('ℹ️ No refresh token');
          return false;
        }
        
        console.log('🔄 Refreshing token...');
        const response = await api.post('/auth/refresh-token', { refreshToken });
        console.log('✅ Token refreshed');
        
        const { token } = response.data;
        if (token) {
          this.token = token;
          localStorage.setItem('token', token);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ Refresh token error:', error);
        return false;
      }
    },

    // Cập nhật thông tin user
    async updateProfile(data) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('📝 Updating profile:', data);
        const response = await api.put('/users/profile', data);
        console.log('✅ Profile updated:', response.data);
        
        this.user = response.data.user;
        toast.success('Cập nhật thông tin thành công');
        return { success: true, user: this.user };
      } catch (error) {
        console.error('❌ Update profile error:', error);
        this.error = error.response?.data?.message || 'Cập nhật thất bại';
        toast.error(this.error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Đổi mật khẩu
    async changePassword(currentPassword, newPassword) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔐 Changing password');
        const response = await api.put('/users/change-password', {
          currentPassword,
          newPassword
        });
        console.log('✅ Password changed');
        
        toast.success('Đổi mật khẩu thành công');
        return { success: true };
      } catch (error) {
        console.error('❌ Change password error:', error);
        this.error = error.response?.data?.message || 'Đổi mật khẩu thất bại';
        toast.error(this.error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Quên mật khẩu
    async forgotPassword(email) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('📧 Forgot password:', email);
        const response = await api.post('/auth/forgot-password', { email });
        console.log('✅ Reset email sent');
        
        toast.success('Email khôi phục đã được gửi');
        return { success: true };
      } catch (error) {
        console.error('❌ Forgot password error:', error);
        this.error = error.response?.data?.message || 'Gửi email thất bại';
        toast.error(this.error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Đặt lại mật khẩu
    async resetPassword(token, newPassword) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🔑 Resetting password');
        const response = await api.post(`/auth/reset-password/${token}`, {
          password: newPassword
        });
        console.log('✅ Password reset');
        
        toast.success('Đặt lại mật khẩu thành công');
        return { success: true };
      } catch (error) {
        console.error('❌ Reset password error:', error);
        this.error = error.response?.data?.message || 'Đặt lại mật khẩu thất bại';
        toast.error(this.error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Xóa tài khoản (Admin)
    async deleteUser(id) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('🗑️ Deleting user:', id);
        const response = await api.delete(`/users/${id}`);
        console.log('✅ User deleted');
        
        // If deleting own account
        if (id === this.user?._id) {
          await this.logout();
        }
        
        toast.success('Xóa tài khoản thành công');
        return { success: true };
      } catch (error) {
        console.error('❌ Delete user error:', error);
        this.error = error.response?.data?.message || 'Xóa tài khoản thất bại';
        toast.error(this.error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Cập nhật avatar
    async updateAvatar(avatarUrl) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('📸 Updating avatar');
        const response = await api.put('/users/avatar', { avatar: avatarUrl });
        console.log('✅ Avatar updated');
        
        this.user = response.data.user;
        toast.success('Cập nhật avatar thành công');
        return { success: true, user: this.user };
      } catch (error) {
        console.error('❌ Update avatar error:', error);
        this.error = error.response?.data?.message || 'Cập nhật avatar thất bại';
        toast.error(this.error);
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Check authentication status
    async checkAuth() {
      if (this.isAuthenticated && this.user) {
        return true;
      }
      
      if (this.token) {
        const user = await this.getCurrentUser();
        return !!user;
      }
      
      return false;
    },

    // Reset error
    clearError() {
      this.error = null;
    },

    // Reset state
    reset() {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      this.loading = false;
      this.error = null;
      this.initialized = false;
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }
});
import { defineStore } from 'pinia';
import api from '../api/auth';
import { toast } from 'vue3-toastify';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),

  getters: {
    wishlistItems: (state) => state.items,
    wishlistCount: (state) => state.items.length,
    isInWishlist: (state) => (productId) => {
      return state.items.some(item => item.product?._id === productId);
    }
  },

  actions: {
    // Lấy danh sách yêu thích
    async fetchWishlist() {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.items = [];
          this.loadFromLocalStorage();
          return { success: true };
        }
        
        const response = await api.get('/wishlist');
        console.log('❤️ Wishlist response:', response.data);
        this.items = response.data.items || [];
        this.saveToLocalStorage();
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch wishlist error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch wishlist';
        this.loadFromLocalStorage();
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Thêm vào yêu thích
    async addToWishlist(productId) {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.warning('Vui lòng đăng nhập để thêm vào yêu thích');
          return { success: false, message: 'Vui lòng đăng nhập' };
        }
        
        const response = await api.post('/wishlist', { productId });
        this.items = response.data.items || [];
        this.saveToLocalStorage();
        toast.success('Đã thêm vào danh sách yêu thích');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Add to wishlist error:', error);
        const message = error.response?.data?.message || 'Không thể thêm vào yêu thích';
        this.error = message;
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    // Xóa khỏi yêu thích
    async removeFromWishlist(itemId) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.delete(`/wishlist/${itemId}`);
        this.items = response.data.items || [];
        this.saveToLocalStorage();
        toast.success('Đã xóa khỏi danh sách yêu thích');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Remove from wishlist error:', error);
        const message = error.response?.data?.message || 'Không thể xóa khỏi yêu thích';
        this.error = message;
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    // Toggle yêu thích
    async toggleWishlist(productId) {
      const existing = this.items.find(item => item.product?._id === productId);
      if (existing) {
        return await this.removeFromWishlist(existing._id);
      } else {
        return await this.addToWishlist(productId);
      }
    },

    // Kiểm tra sản phẩm đã yêu thích chưa
    async checkWishlist(productId) {
      try {
        const response = await api.get(`/wishlist/check/${productId}`);
        return response.data.isInWishlist || false;
      } catch (error) {
        console.error('Check wishlist error:', error);
        return false;
      }
    },

    // Xóa toàn bộ
    async clearWishlist() {
      this.loading = true;
      this.error = null;
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.delete('/wishlist');
        }
        this.items = [];
        this.saveToLocalStorage();
        toast.success('Đã xóa toàn bộ danh sách yêu thích');
        return { success: true };
      } catch (error) {
        console.error('❌ Clear wishlist error:', error);
        const message = error.response?.data?.message || 'Không thể xóa danh sách yêu thích';
        this.error = message;
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    loadFromLocalStorage() {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        try {
          this.items = JSON.parse(saved);
        } catch {
          this.items = [];
        }
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('wishlist', JSON.stringify(this.items));
    }
  }
});
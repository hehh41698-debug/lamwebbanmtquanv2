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
    // ============================================
    // LẤY DANH SÁCH YÊU THÍCH
    // ============================================
    async fetchWishlist() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('❤️ Fetching wishlist...');
        
        const response = await api.get('/wishlist');
        console.log('❤️ Wishlist response:', response.data);
        
        this.items = response.data.items || [];
        this.saveToLocalStorage();
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch wishlist error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch wishlist';
        
        // Không tự động đăng xuất, chỉ hiển thị thông báo
        if (error.response?.status === 401) {
          toast.warning('Vui lòng đăng nhập để xem danh sách yêu thích');
        }
        
        this.loadFromLocalStorage();
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // THÊM VÀO YÊU THÍCH
    // ============================================
    async addToWishlist(productId) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('❤️ Adding to wishlist:', productId);
        
        const response = await api.post('/wishlist', { productId });
        console.log('❤️ Add response:', response.data);
        
        this.items = response.data.items || [];
        this.saveToLocalStorage();
        toast.success('Đã thêm vào danh sách yêu thích');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Add to wishlist error:', error);
        console.error('❌ Error response:', error.response?.data);
        
        const message = error.response?.data?.message || 'Không thể thêm vào yêu thích';
        this.error = message;
        
        // Không tự động đăng xuất, chỉ hiển thị thông báo
        if (error.response?.status === 401) {
          toast.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          // Không chuyển hướng tự động, để user tự quyết định
        } else {
          toast.error(message);
        }
        
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // XÓA KHỎI YÊU THÍCH
    // ============================================
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

    // ============================================
    // TOGGLE YÊU THÍCH
    // ============================================
    async toggleWishlist(productId) {
      const existing = this.items.find(item => item.product?._id === productId);
      if (existing) {
        return await this.removeFromWishlist(existing._id);
      } else {
        return await this.addToWishlist(productId);
      }
    },

    // ============================================
    // KIỂM TRA SẢN PHẨM ĐÃ YÊU THÍCH CHƯA
    // ============================================
    async checkWishlist(productId) {
      try {
        const response = await api.get(`/wishlist/check/${productId}`);
        return response.data.isInWishlist || false;
      } catch (error) {
        console.error('Check wishlist error:', error);
        return false;
      }
    },

    // ============================================
    // XÓA TOÀN BỘ
    // ============================================
    async clearWishlist() {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete('/wishlist');
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

    // ============================================
    // LOCAL STORAGE METHODS
    // ============================================
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
import { defineStore } from 'pinia';
import api from '../api/auth';
import { toast } from 'vue3-toastify';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    totalItems: 0,
    subtotal: 0,
    shipping: 30000,
    total: 0,
    loading: false,
    error: null
  }),
  
  getters: {
    cartItems: (state) => state.items,
    cartTotalItems: (state) => state.totalItems,
    cartSubtotal: (state) => state.subtotal,
    cartShipping: (state) => state.shipping,
    cartTotal: (state) => state.total,
    isEmpty: (state) => state.items.length === 0
  },
  
  actions: {
    // ============================================
    // LẤY GIỎ HÀNG
    // ============================================
    async loadCart() {
      console.log('🔄 Loading cart...');
      this.loading = true;
      
      try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token exists:', !!token);
        
        if (!token) {
          console.log('ℹ️ No token, loading from localStorage');
          this.loadFromLocalStorage();
          return { success: true };
        }
        
        console.log('📡 Fetching cart from API...');
        const response = await api.get('/cart');
        console.log('📦 Cart API response:', response.data);
        
        const cart = response.data.cart || {};
        
        this.items = cart.items || [];
        this.totalItems = cart.totalItems || 0;
        this.subtotal = cart.subtotal || 0;
        this.shipping = cart.shipping || 30000;
        this.total = cart.total || 0;
        
        console.log('✅ Cart loaded:', {
          items: this.items.length,
          totalItems: this.totalItems,
          subtotal: this.subtotal,
          total: this.total
        });
        
        this.saveToLocalStorage();
        return { success: true };
      } catch (error) {
        console.error('❌ Load cart error:', error);
        console.error('❌ Error response:', error.response?.data);
        this.loadFromLocalStorage();
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },
    
    // ============================================
    // THÊM VÀO GIỎ HÀNG
    // ============================================
    async addToCart(productId, quantity = 1) {
      console.log('🛒 Adding to cart:', { productId, quantity });
      this.loading = true;
      
      try {
        const token = localStorage.getItem('token');
        console.log('🔑 Token exists:', !!token);
        
        if (!token) {
          console.warn('⚠️ No token, redirecting to login');
          toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
          return { success: false, message: 'Vui lòng đăng nhập' };
        }
        
        console.log('📡 Sending add to cart request...');
        const response = await api.post('/cart', { productId, quantity });
        console.log('📦 Add to cart response:', response.data);
        
        const cart = response.data.cart || {};
        
        this.items = cart.items || [];
        this.totalItems = cart.totalItems || 0;
        this.subtotal = cart.subtotal || 0;
        this.shipping = cart.shipping || 30000;
        this.total = cart.total || 0;
        
        console.log('✅ Cart updated:', {
          items: this.items.length,
          totalItems: this.totalItems,
          subtotal: this.subtotal,
          total: this.total
        });
        
        this.saveToLocalStorage();
        toast.success('Đã thêm vào giỏ hàng!');
        return { success: true };
      } catch (error) {
        console.error('❌ Add to cart error:', error);
        console.error('❌ Error response:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        
        const message = error.response?.data?.message || 'Không thể thêm vào giỏ hàng';
        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
    
    // ============================================
    // CẬP NHẬT SỐ LƯỢNG
    // ============================================
    async updateQuantity(itemId, quantity) {
      console.log('🔄 Updating quantity:', { itemId, quantity });
      this.loading = true;
      
      try {
        const response = await api.put(`/cart/${itemId}`, { quantity });
        console.log('📦 Update response:', response.data);
        
        const cart = response.data.cart || {};
        
        this.items = cart.items || [];
        this.totalItems = cart.totalItems || 0;
        this.subtotal = cart.subtotal || 0;
        this.shipping = cart.shipping || 30000;
        this.total = cart.total || 0;
        
        this.saveToLocalStorage();
        return { success: true };
      } catch (error) {
        console.error('❌ Update quantity error:', error);
        const message = error.response?.data?.message || 'Không thể cập nhật số lượng';
        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
    
    // ============================================
    // XÓA KHỎI GIỎ HÀNG
    // ============================================
    async removeItem(itemId) {
      console.log('🗑️ Removing item:', itemId);
      this.loading = true;
      
      try {
        const response = await api.delete(`/cart/${itemId}`);
        console.log('📦 Remove response:', response.data);
        
        const cart = response.data.cart || {};
        
        this.items = cart.items || [];
        this.totalItems = cart.totalItems || 0;
        this.subtotal = cart.subtotal || 0;
        this.shipping = cart.shipping || 30000;
        this.total = cart.total || 0;
        
        this.saveToLocalStorage();
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        return { success: true };
      } catch (error) {
        console.error('❌ Remove item error:', error);
        const message = error.response?.data?.message || 'Không thể xóa sản phẩm';
        toast.error(message);
        return { success: false, message };
      } finally {
        this.loading = false;
      }
    },
    
    // ============================================
    // XÓA TOÀN BỘ GIỎ HÀNG
    // ============================================
    async clearCart() {
      console.log('🗑️ Clearing cart');
      this.loading = true;
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.delete('/cart');
        }
        
        this.items = [];
        this.totalItems = 0;
        this.subtotal = 0;
        this.shipping = 0;
        this.total = 0;
        
        this.saveToLocalStorage();
        return { success: true };
      } catch (error) {
        console.error('❌ Clear cart error:', error);
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },
    
    // ============================================
    // LOCAL STORAGE METHODS
    // ============================================
    loadFromLocalStorage() {
      console.log('📂 Loading cart from localStorage');
      const savedCart = localStorage.getItem('cart');
      console.log('📂 Saved cart data:', savedCart);
      
      if (savedCart) {
        try {
          const data = JSON.parse(savedCart);
          this.items = data.items || [];
          this.totalItems = data.totalItems || 0;
          this.subtotal = data.subtotal || 0;
          this.shipping = data.shipping || 30000;
          this.total = data.total || 0;
          console.log('✅ Loaded from localStorage:', {
            items: this.items.length,
            totalItems: this.totalItems
          });
        } catch (error) {
          console.error('❌ Parse cart error:', error);
          this.items = [];
          this.totalItems = 0;
          this.subtotal = 0;
          this.shipping = 30000;
          this.total = 0;
        }
      } else {
        console.log('ℹ️ No cart in localStorage');
      }
    },
    
    saveToLocalStorage() {
      const data = {
        items: this.items,
        totalItems: this.totalItems,
        subtotal: this.subtotal,
        shipping: this.shipping,
        total: this.total
      };
      localStorage.setItem('cart', JSON.stringify(data));
      console.log('💾 Saved cart to localStorage:', data);
    }
  }
});
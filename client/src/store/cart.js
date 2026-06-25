import { defineStore } from 'pinia';
import { cartAPI } from '../api/cart';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false
  }),
  
  getters: {
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    totalPrice: (state) => {
      return state.items.reduce((total, item) => {
        const price = item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
        return total + price * item.quantity;
      }, 0);
    },
    
    cartItems: (state) => state.items
  },
  
  actions: {
    async loadCart() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.loadFromLocalStorage();
        return;
      }
      
      this.loading = true;
      try {
        const response = await cartAPI.getCart();
        this.items = response.data.cart?.items || [];
        this.saveToLocalStorage();
      } catch (error) {
        console.error('Load cart error:', error);
        this.loadFromLocalStorage();
      } finally {
        this.loading = false;
      }
    },
    
    async addToCart(productId, quantity = 1) {
      this.loading = true;
      try {
        const response = await cartAPI.addToCart({ productId, quantity });
        this.items = response.data.cart?.items || [];
        this.saveToLocalStorage();
        return { success: true };
      } catch (error) {
        console.error('Add to cart error:', error);
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to add to cart' 
        };
      } finally {
        this.loading = false;
      }
    },
    
    async updateQuantity(itemId, quantity) {
      this.loading = true;
      try {
        const response = await cartAPI.updateCartItem(itemId, { quantity });
        this.items = response.data.cart?.items || [];
        this.saveToLocalStorage();
        return { success: true };
      } catch (error) {
        console.error('Update quantity error:', error);
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to update quantity' 
        };
      } finally {
        this.loading = false;
      }
    },
    
    async removeItem(itemId) {
      this.loading = true;
      try {
        const response = await cartAPI.removeFromCart(itemId);
        this.items = response.data.cart?.items || [];
        this.saveToLocalStorage();
        return { success: true };
      } catch (error) {
        console.error('Remove item error:', error);
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to remove item' 
        };
      } finally {
        this.loading = false;
      }
    },
    
    async clearCart() {
      this.loading = true;
      try {
        await cartAPI.clearCart();
        this.items = [];
        this.saveToLocalStorage();
        return { success: true };
      } catch (error) {
        console.error('Clear cart error:', error);
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to clear cart' 
        };
      } finally {
        this.loading = false;
      }
    },
    
    loadFromLocalStorage() {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          this.items = JSON.parse(savedCart);
        } catch {
          this.items = [];
        }
      }
    },
    
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    }
  }
});
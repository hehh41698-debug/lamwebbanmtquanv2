import { defineStore } from 'pinia';
import api from '../api/auth';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    order: null,
    loading: false,
    error: null,
    stats: null
  }),

  actions: {
    async fetchOrders(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        
        const response = await api.get(`/orders?${queryParams.toString()}`);
        this.orders = response.data.orders || [];
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch orders';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async fetchOrderById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get(`/orders/${id}`);
        this.order = response.data.order;
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch order';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async createOrder(data) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/orders', data);
        this.orders.unshift(response.data.order);
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create order';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async updateOrderStatus(id, status) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/orders/${id}/status`, { status });
        const index = this.orders.findIndex(o => o._id === id);
        if (index !== -1) {
          this.orders[index] = response.data.order;
        }
        if (this.order?._id === id) {
          this.order = response.data.order;
        }
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update order status';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async cancelOrder(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/orders/${id}/cancel`);
        const index = this.orders.findIndex(o => o._id === id);
        if (index !== -1) {
          this.orders[index] = response.data.order;
        }
        if (this.order?._id === id) {
          this.order = response.data.order;
        }
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to cancel order';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async fetchOrderStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/orders/admin/stats');
        this.stats = response.data.stats;
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch stats';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
});
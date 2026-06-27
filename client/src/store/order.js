import { defineStore } from 'pinia';
import api from '../api/auth';
import { toast } from 'vue3-toastify';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    order: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  }),

  actions: {
    // Lấy danh sách đơn hàng
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
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Fetch orders error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch orders';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Lấy chi tiết đơn hàng
    async fetchOrderById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get(`/orders/${id}`);
        this.order = response.data.order;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Fetch order error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch order';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Tạo đơn hàng mới
    async createOrder(data) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('📦 Creating order:', data);
        const response = await api.post('/orders', data);
        console.log('✅ Order created:', response.data);
        
        this.orders.unshift(response.data.order);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Create order error:', error);
        console.error('❌ Error response:', error.response?.data);
        this.error = error.response?.data?.message || 'Failed to create order';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Cập nhật trạng thái đơn hàng (Admin)
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
        console.error('Update order status error:', error);
        this.error = error.response?.data?.message || 'Failed to update order status';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Hủy đơn hàng (User)
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
        console.error('Cancel order error:', error);
        this.error = error.response?.data?.message || 'Failed to cancel order';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Lấy thống kê đơn hàng (Admin)
    async fetchOrderStats() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/orders/admin/stats');
        this.stats = response.data.stats;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Fetch stats error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch stats';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
});
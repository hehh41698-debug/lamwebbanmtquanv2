import api from './auth';

export const orderAPI = {
  // Lấy danh sách đơn hàng
  getOrders: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/orders?${queryParams.toString()}`);
  },

  // Lấy chi tiết đơn hàng
  getOrderById: (id) => api.get(`/orders/${id}`),

  // Tạo đơn hàng
  createOrder: (data) => api.post('/orders', data),

  // Cập nhật trạng thái (admin)
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),

  // Hủy đơn hàng
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),

  // Thống kê đơn hàng (admin)
  getOrderStats: () => api.get('/orders/admin/stats')
};
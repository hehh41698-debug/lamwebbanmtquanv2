import api from './auth';

export const userAPI = {
  // Lấy danh sách users (admin)
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/users?${queryParams.toString()}`);
  },

  // Lấy chi tiết user
  getUserById: (id) => api.get(`/users/${id}`),

  // Cập nhật profile
  updateProfile: (data) => api.put('/users/profile', data),

  // Cập nhật trạng thái user (admin)
  updateUserStatus: (id, isActive) => api.put(`/users/${id}/status`, { isActive })
};
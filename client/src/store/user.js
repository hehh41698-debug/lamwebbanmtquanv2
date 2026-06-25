import { defineStore } from 'pinia';
import api from '../api/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  }),

  getters: {
    getUserById: (state) => (id) => {
      return state.users.find(user => user._id === id);
    },
    activeUsersCount: (state) => {
      return state.users.filter(user => user.isActive).length;
    },
    inactiveUsersCount: (state) => {
      return state.users.filter(user => !user.isActive).length;
    },
    userStats: (state) => {
      const total = state.users.length;
      const active = state.users.filter(u => u.isActive).length;
      const inactive = state.users.filter(u => !u.isActive).length;
      const admins = state.users.filter(u => u.role === 'admin').length;
      const regular = state.users.filter(u => u.role === 'user').length;
      return { total, active, inactive, admins, regular };
    }
  },

  actions: {
    async fetchUsers(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        
        const response = await api.get(`/users?${queryParams.toString()}`);
        this.users = response.data.users || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch users';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async updateUserStatus(id, isActive) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/users/${id}/status`, { isActive });
        const index = this.users.findIndex(u => u._id === id);
        if (index !== -1) {
          this.users[index] = response.data.user;
        }
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update user status';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async toggleUserStatus(id) {
      const user = this.users.find(u => u._id === id);
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      return await this.updateUserStatus(id, !user.isActive);
    },

    async changeUserRole(id, role) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/users/${id}/role`, { role });
        const index = this.users.findIndex(u => u._id === id);
        if (index !== -1) {
          this.users[index] = response.data.user;
        }
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to change user role';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    setPage(page) {
      this.pagination.page = page;
      this.fetchUsers();
    }
  }
});
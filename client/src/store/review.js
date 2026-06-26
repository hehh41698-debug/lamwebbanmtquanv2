import { defineStore } from 'pinia';
import api from '../api/auth';

export const useReviewStore = defineStore('review', {
  state: () => ({
    reviews: [],
    review: null,
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
    async fetchAllReviews(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        
        const response = await api.get(`/reviews/admin?${queryParams.toString()}`);
        this.reviews = response.data.reviews || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch reviews';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async approveReview(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/reviews/${id}/approve`);
        const index = this.reviews.findIndex(r => r._id === id);
        if (index !== -1) {
          this.reviews[index] = response.data.review;
        }
        return { success: true, data: response.data };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to approve review';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async deleteReview(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/reviews/${id}`);
        this.reviews = this.reviews.filter(r => r._id !== id);
        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete review';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
});
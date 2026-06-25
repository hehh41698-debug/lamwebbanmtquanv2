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

  getters: {
    // Lấy đánh giá theo product
    getReviewsByProduct: (state) => (productId) => {
      return state.reviews.filter(r => r.product === productId);
    },
    
    // Đánh giá trung bình
    averageRating: (state) => {
      if (state.reviews.length === 0) return 0;
      const sum = state.reviews.reduce((total, r) => total + r.rating, 0);
      return sum / state.reviews.length;
    },
    
    // Số lượng đánh giá theo từng mức sao
    ratingDistribution: (state) => {
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      state.reviews.forEach(r => {
        if (distribution[r.rating] !== undefined) {
          distribution[r.rating]++;
        }
      });
      return distribution;
    }
  },

  actions: {
    // Lấy đánh giá của sản phẩm
    async fetchProductReviews(productId, params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        
        const response = await api.get(`/reviews/product/${productId}?${queryParams.toString()}`);
        this.reviews = response.data.reviews || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Fetch reviews error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch reviews';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Tạo đánh giá mới
    async createReview(data) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post(`/reviews/product/${data.productId}`, {
          rating: data.rating,
          comment: data.comment,
          images: data.images || []
        });
        
        this.reviews.unshift(response.data.review);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Create review error:', error);
        this.error = error.response?.data?.message || 'Failed to create review';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Cập nhật đánh giá
    async updateReview(id, data) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/reviews/${id}`, data);
        const index = this.reviews.findIndex(r => r._id === id);
        if (index !== -1) {
          this.reviews[index] = response.data.review;
        }
        if (this.review?._id === id) {
          this.review = response.data.review;
        }
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Update review error:', error);
        this.error = error.response?.data?.message || 'Failed to update review';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Xóa đánh giá
    async deleteReview(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/reviews/${id}`);
        this.reviews = this.reviews.filter(r => r._id !== id);
        if (this.review?._id === id) {
          this.review = null;
        }
        return { success: true };
      } catch (error) {
        console.error('Delete review error:', error);
        this.error = error.response?.data?.message || 'Failed to delete review';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Duyệt đánh giá (Admin)
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
        console.error('Approve review error:', error);
        this.error = error.response?.data?.message || 'Failed to approve review';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Lấy tất cả đánh giá (Admin)
    async fetchAllReviews(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
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
        console.error('Fetch all reviews error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch reviews';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // Reset state
    reset() {
      this.reviews = [];
      this.review = null;
      this.loading = false;
      this.error = null;
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      };
    }
  }
});
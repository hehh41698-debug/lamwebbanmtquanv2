import { defineStore } from 'pinia';
import api from '../api/auth';
import { toast } from 'vue3-toastify';

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
    // ============================================
    // LẤY ĐÁNH GIÁ CỦA SẢN PHẨM
    // ============================================
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
        console.error('❌ Fetch reviews error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch reviews';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY ĐÁNH GIÁ CỦA USER HIỆN TẠI
    // ============================================
    async fetchUserReviews(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });
        
        const response = await api.get(`/reviews/user?${queryParams.toString()}`);
        this.reviews = response.data.reviews || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch user reviews error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch user reviews';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // TẠO ĐÁNH GIÁ MỚI
    // ============================================
    async createReview(data) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('📝 Creating review:', data);
        
        const response = await api.post(`/reviews/product/${data.productId}`, {
          rating: data.rating,
          comment: data.comment,
          images: data.images || []
        });
        
        console.log('✅ Review response:', response.data);
        
        if (response.data.success) {
          this.reviews.unshift(response.data.review);
          toast.success(response.data.message || 'Gửi đánh giá thành công!');
          return { success: true, data: response.data };
        } else {
          throw new Error(response.data.message || 'Gửi đánh giá thất bại');
        }
      } catch (error) {
        console.error('❌ Create review error:', error);
        console.error('❌ Error response:', error.response?.data);
        
        const message = error.response?.data?.message || error.message || 'Không thể gửi đánh giá';
        this.error = message;
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // XÓA ĐÁNH GIÁ
    // ============================================
    async deleteReview(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await api.delete(`/reviews/${id}`);
        this.reviews = this.reviews.filter(r => r._id !== id);
        toast.success('Xóa đánh giá thành công');
        return { success: true };
      } catch (error) {
        console.error('❌ Delete review error:', error);
        const message = error.response?.data?.message || 'Không thể xóa đánh giá';
        this.error = message;
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // DUYỆT ĐÁNH GIÁ (ADMIN)
    // ============================================
    async approveReview(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.put(`/reviews/${id}/approve`);
        const index = this.reviews.findIndex(r => r._id === id);
        if (index !== -1) {
          this.reviews[index] = response.data.review;
        }
        toast.success('Duyệt đánh giá thành công');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Approve review error:', error);
        const message = error.response?.data?.message || 'Không thể duyệt đánh giá';
        this.error = message;
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY TẤT CẢ ĐÁNH GIÁ (ADMIN)
    // ============================================
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
        console.error('❌ Fetch all reviews error:', error);
        this.error = error.response?.data?.message || 'Failed to fetch reviews';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
});
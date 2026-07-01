import { defineStore } from 'pinia';
import api from '../api/auth';
import { toast } from 'vue3-toastify';

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [],
    message: null,
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
    // GỬI TIN NHẮN (USER)
    // ============================================
    async sendMessage(data) {
      this.loading = true;
      this.error = null;

      try {
        console.log('📝 Sending message:', data);

        const response = await api.post('/messages', data, {
          withCredentials: true
        });

        console.log('✅ Message sent:', response.data);

        toast.success(response.data.message || 'Tin nhắn đã được gửi!');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Send message error:', error);
        console.error('❌ Error response:', error.response?.data);
        
        const message = error.response?.data?.message || 'Gửi tin nhắn thất bại';
        this.error = message;
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY TIN NHẮN CỦA USER
    // ============================================
    async fetchUserMessages(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });

        const response = await api.get(`/messages/user?${queryParams.toString()}`, {
          withCredentials: true
        });

        this.messages = response.data.messages || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };

        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch user messages error:', error);
        this.error = error.response?.data?.message || 'Lấy tin nhắn thất bại';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY TẤT CẢ TIN NHẮN (ADMIN)
    // ============================================
    async fetchAllMessages(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        console.log('📋 Admin fetching all messages...');
        
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== '') {
            queryParams.append(key, params[key]);
          }
        });

        const response = await api.get(`/messages/admin?${queryParams.toString()}`, {
          withCredentials: true
        });

        console.log('📦 Messages response:', response.data);

        this.messages = response.data.messages || [];
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        };

        console.log(`✅ Loaded ${this.messages.length} messages`);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch all messages error:', error);
        console.error('❌ Error response:', error.response?.data);
        this.error = error.response?.data?.message || 'Lấy danh sách tin nhắn thất bại';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // LẤY CHI TIẾT TIN NHẮN
    // ============================================
    async fetchMessageById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/messages/${id}`, {
          withCredentials: true
        });

        this.message = response.data.message;
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Fetch message error:', error);
        this.error = error.response?.data?.message || 'Lấy chi tiết tin nhắn thất bại';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // TRẢ LỜI TIN NHẮN (ADMIN)
    // ============================================
    async replyMessage(id, reply) {
      this.loading = true;
      this.error = null;

      try {
        console.log('📝 Replying to message:', id);
        console.log('📝 Reply content:', reply);

        const response = await api.put(`/messages/${id}/reply`, { reply }, {
          withCredentials: true
        });

        console.log('✅ Reply sent:', response.data);

        // Cập nhật tin nhắn trong danh sách
        const index = this.messages.findIndex(m => m._id === id);
        if (index !== -1) {
          this.messages[index] = response.data.data;
        }

        toast.success('Trả lời tin nhắn thành công!');
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Reply message error:', error);
        console.error('❌ Error response:', error.response?.data);
        
        const message = error.response?.data?.message || 'Trả lời tin nhắn thất bại';
        this.error = message;
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // CẬP NHẬT TRẠNG THÁI (ADMIN)
    // ============================================
    async updateMessageStatus(id, status) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/messages/${id}/status`, { status }, {
          withCredentials: true
        });

        const index = this.messages.findIndex(m => m._id === id);
        if (index !== -1) {
          this.messages[index] = response.data.data;
        }

        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ Update message status error:', error);
        this.error = error.response?.data?.message || 'Cập nhật trạng thái thất bại';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    // ============================================
    // XÓA TIN NHẮN (ADMIN)
    // ============================================
    async deleteMessage(id) {
      this.loading = true;
      this.error = null;

      try {
        await api.delete(`/messages/${id}`, {
          withCredentials: true
        });

        this.messages = this.messages.filter(m => m._id !== id);
        toast.success('Xóa tin nhắn thành công!');
        return { success: true };
      } catch (error) {
        console.error('❌ Delete message error:', error);
        this.error = error.response?.data?.message || 'Xóa tin nhắn thất bại';
        toast.error(this.error);
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
});
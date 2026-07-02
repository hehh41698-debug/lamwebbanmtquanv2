<template>
  <div class="user-messages">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-3">
          <UserSidebar />
        </div>
        <div class="col-lg-9">
          <div class="messages-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="mb-0"><i class="bi bi-envelope me-2"></i>Tin nhắn của tôi</h5>
              <router-link to="/contact" class="btn btn-primary btn-sm">
                <i class="bi bi-plus-circle"></i> Gửi tin nhắn mới
              </router-link>
            </div>

            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>

            <div v-else-if="messages.length === 0" class="text-center py-5">
              <i class="bi bi-inbox fs-1 text-muted"></i>
              <h5 class="mt-3">Chưa có tin nhắn nào</h5>
              <p class="text-muted">Liên hệ với chúng tôi để được hỗ trợ</p>
              <router-link to="/contact" class="btn btn-primary">
                <i class="bi bi-envelope"></i> Gửi tin nhắn
              </router-link>
            </div>

            <div v-else class="messages-list">
              <div v-for="message in messages" :key="message._id" class="message-card">
                <div class="message-header">
                  <div>
                    <span class="message-subject">{{ getSubjectLabel(message.subject) }}</span>
                    <span class="message-date">{{ formatDate(message.createdAt) }}</span>
                  </div>
                  <span :class="['status-badge', getStatusClass(message.status)]">
                    <i :class="getStatusIcon(message.status)"></i>
                    {{ getStatusLabel(message.status) }}
                  </span>
                </div>

                <div class="message-body">
                  <p>{{ message.message }}</p>
                </div>

                <!-- Admin Reply -->
                <div v-if="message.adminReply" class="message-reply">
                  <div class="reply-header">
                    <i class="bi bi-reply text-primary me-1"></i>
                    <span>Phản hồi từ Admin</span>
                    <span class="reply-date">{{ formatDate(message.repliedAt) }}</span>
                  </div>
                  <div class="reply-content">
                    <p>{{ message.adminReply }}</p>
                  </div>
                </div>

                <div v-else-if="message.status === 'pending' || message.status === 'read'" class="message-waiting">
                  <i class="bi bi-clock-history text-warning me-1"></i>
                  <span class="text-muted">Đang chờ phản hồi từ Admin</span>
                </div>
              </div>
            </div>

            <div v-if="pagination.totalPages > 1" class="pagination-bar">
              <nav>
                <ul class="pagination pagination-sm">
                  <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                    <button class="page-link" @click="changePage(pagination.page - 1)">Trước</button>
                  </li>
                  <li v-for="page in pagination.totalPages" :key="page" 
                      class="page-item" :class="{ active: page === pagination.page }">
                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                    <button class="page-link" @click="changePage(pagination.page + 1)">Sau</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { useMessageStore } from '../../store/message';
import UserSidebar from '../../components/user/UserSidebar.vue';
import { formatDate } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const messageStore = useMessageStore();

const messages = computed(() => messageStore.messages);
const loading = computed(() => messageStore.loading);
const pagination = computed(() => messageStore.pagination);

const getSubjectLabel = (subject) => {
  const labels = {
    order: 'Đơn hàng',
    product: 'Sản phẩm',
    return: 'Đổi trả',
    warranty: 'Bảo hành',
    other: 'Khác'
  };
  return labels[subject] || subject;
};

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xử lý',
    read: 'Đã đọc',
    replied: 'Đã trả lời',
    closed: 'Đã đóng'
  };
  return labels[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    read: 'status-read',
    replied: 'status-replied',
    closed: 'status-closed'
  };
  return classes[status] || 'status-pending';
};

const getStatusIcon = (status) => {
  const icons = {
    pending: 'bi bi-clock-history',
    read: 'bi bi-check-circle',
    replied: 'bi bi-reply-all',
    closed: 'bi bi-check2-circle'
  };
  return icons[status] || 'bi bi-clock-history';
};

const loadMessages = async () => {
  await messageStore.fetchUserMessages({ page: pagination.value.page, limit: 10 });
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  messageStore.pagination.page = page;
  loadMessages();
};

// Đánh dấu đã đọc khi xem tin nhắn
const markAsRead = async (messageId) => {
  try {
    await messageStore.updateMessageStatus(messageId, 'read');
  } catch (error) {
    console.error('Mark as read error:', error);
  }
};

// Tự động refresh mỗi 30 giây
let refreshInterval = null;

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  loadMessages();
  
  refreshInterval = setInterval(loadMessages, 30000);
});

// Cleanup
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.user-messages {
  background: #f8fafc;
  min-height: 100vh;
}

.messages-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.message-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.message-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.message-subject {
  font-weight: 600;
  color: #1a202c;
}

.message-date {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-left: 0.75rem;
}

.message-body p {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}

.status-read {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.status-replied {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.status-closed {
  background: #e2e8f0;
  color: #475569;
  border: 1px solid #94a3b8;
}

.message-reply {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #2563eb;
  margin-bottom: 0.5rem;
}

.reply-date {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 400;
}

.reply-content {
  background: #f0fdf4;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.reply-content p {
  margin: 0;
  color: #065f46;
  line-height: 1.6;
}

.message-waiting {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.9rem;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .messages-content {
    padding: 1rem;
  }
  .message-card {
    padding: 1rem;
  }
  .message-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
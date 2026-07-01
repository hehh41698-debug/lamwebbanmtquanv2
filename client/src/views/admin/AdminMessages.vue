<template>
  <div class="admin-messages">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0">
        <i class="bi bi-envelope me-2"></i>Quản lý tin nhắn
        <span class="badge bg-danger ms-2" v-if="pendingCount > 0">{{ pendingCount }} chưa xử lý</span>
      </h4>
    </div>

    <div class="filters-bar">
      <input type="text" class="form-control" v-model="searchKeyword" placeholder="Tìm kiếm..." @input="loadMessages">
      <select class="form-select" v-model="statusFilter" @change="loadMessages">
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ xử lý</option>
        <option value="read">Đã đọc</option>
        <option value="replied">Đã trả lời</option>
        <option value="closed">Đã đóng</option>
      </select>
      <button class="btn btn-outline-secondary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Đặt lại
      </button>
    </div>

    <div class="table-card">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Người gửi</th>
              <th>Chủ đề</th>
              <th>Trạng thái</th>
              <th>Ngày gửi</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
              </td>
            </tr>
            <tr v-else-if="messages.length === 0">
              <td colspan="6" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-3 d-block"></i>
                Không có tin nhắn nào
              </td>
            </tr>
            <tr v-for="(message, index) in messages" :key="message._id">
              <td>{{ index + 1 }}</td>
              <td>
                <div>
                  <strong>{{ message.name }}</strong>
                  <div class="text-muted small">{{ message.email }}</div>
                </div>
              </td>
              <td>
                <span class="subject-badge">{{ getSubjectLabel(message.subject) }}</span>
                <div class="message-preview">{{ truncateText(message.message, 30) }}</div>
              </td>
              <td>
                <span :class="['status-badge', getStatusClass(message.status)]">
                  <i :class="getStatusIcon(message.status)"></i>
                  {{ getStatusLabel(message.status) }}
                </span>
              </td>
              <td>{{ formatDate(message.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline-primary" @click="viewMessage(message)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-success" @click="openReplyModal(message)" v-if="message.status !== 'closed'">
                    <i class="bi bi-reply"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteMessage(message._id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination-bar">
      <span class="text-muted small">Hiển thị {{ messages.length }} / {{ pagination.total }} tin nhắn</span>
      <nav>
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <button class="page-link" @click="changePage(pagination.page - 1)"><i class="bi bi-chevron-left"></i></button>
          </li>
          <li v-for="page in pagination.totalPages" :key="page" class="page-item" :class="{ active: page === pagination.page }">
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
            <button class="page-link" @click="changePage(pagination.page + 1)"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- View Message Modal -->
    <div v-if="selectedMessage" class="modal-overlay" @click="closeModal">
      <div class="modal-content modal-lg" @click.stop>
        <div class="modal-header">
          <h5>Chi tiết tin nhắn</h5>
          <button class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <div class="message-detail">
            <div class="message-info">
              <div><strong>Người gửi:</strong> {{ selectedMessage.name }}</div>
              <div><strong>Email:</strong> {{ selectedMessage.email }}</div>
              <div><strong>Điện thoại:</strong> {{ selectedMessage.phone || 'Không có' }}</div>
              <div><strong>Chủ đề:</strong> {{ getSubjectLabel(selectedMessage.subject) }}</div>
              <div><strong>Ngày gửi:</strong> {{ formatDate(selectedMessage.createdAt) }}</div>
              <div>
                <strong>Trạng thái:</strong>
                <span :class="['status-badge', getStatusClass(selectedMessage.status)]">
                  <i :class="getStatusIcon(selectedMessage.status)"></i>
                  {{ getStatusLabel(selectedMessage.status) }}
                </span>
              </div>
            </div>
            <hr>
            <div class="message-content">
              <h6>Nội dung:</h6>
              <p>{{ selectedMessage.message }}</p>
            </div>

            <!-- Admin Reply -->
            <div v-if="selectedMessage.adminReply" class="message-reply">
              <hr>
              <h6><i class="bi bi-reply text-primary me-2"></i>Phản hồi của Admin:</h6>
              <div class="reply-content">
                <p>{{ selectedMessage.adminReply }}</p>
                <div class="reply-meta text-muted small">
                  <span>Trả lời bởi: {{ selectedMessage.repliedBy?.name || 'Admin' }}</span>
                  <span class="ms-3">Ngày: {{ formatDate(selectedMessage.repliedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Đóng</button>
          <button class="btn btn-success" @click="openReplyModal(selectedMessage)" v-if="selectedMessage.status !== 'closed'">
            <i class="bi bi-reply"></i> Trả lời
          </button>
        </div>
      </div>
    </div>

    <!-- Reply Modal -->
    <div v-if="showReplyModal" class="modal-overlay" @click="closeReplyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>Trả lời tin nhắn</h5>
          <button class="btn-close" @click="closeReplyModal"></button>
        </div>
        <div class="modal-body">
          <div class="reply-info">
            <p><strong>Người gửi:</strong> {{ replyTarget?.name }}</p>
            <p><strong>Email:</strong> {{ replyTarget?.email }}</p>
            <p><strong>Nội dung:</strong></p>
            <div class="original-message">{{ replyTarget?.message }}</div>
          </div>
          <div class="mb-3">
            <label class="form-label">Nội dung trả lời <span class="text-danger">*</span></label>
            <textarea class="form-control" v-model="replyContent" rows="5" required placeholder="Nhập nội dung trả lời..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeReplyModal">Hủy</button>
          <button class="btn btn-primary" @click="sendReply" :disabled="replying">
            <span v-if="replying" class="spinner-border spinner-border-sm me-2"></span>
            Gửi trả lời
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMessageStore } from '../../store/message';
import { formatDate, truncateText } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const messageStore = useMessageStore();

const messages = computed(() => messageStore.messages);
const loading = computed(() => messageStore.loading);
const pagination = computed(() => messageStore.pagination);

const searchKeyword = ref('');
const statusFilter = ref('');
const selectedMessage = ref(null);
const showReplyModal = ref(false);
const replyTarget = ref(null);
const replyContent = ref('');
const replying = ref(false);

const pendingCount = computed(() => {
  return messages.value.filter(m => m.status === 'pending').length;
});

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
  const params = {
    page: pagination.value.page,
    limit: 10,
    search: searchKeyword.value,
    status: statusFilter.value
  };
  await messageStore.fetchAllMessages(params);
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
  messageStore.pagination.page = 1;
  loadMessages();
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  messageStore.pagination.page = page;
  loadMessages();
};

const viewMessage = (message) => {
  selectedMessage.value = message;
  // Đánh dấu đã đọc nếu đang pending
  if (message.status === 'pending') {
    messageStore.updateMessageStatus(message._id, 'read');
  }
};

const closeModal = () => {
  selectedMessage.value = null;
};

const openReplyModal = (message) => {
  replyTarget.value = message;
  replyContent.value = '';
  showReplyModal.value = true;
  closeModal();
};

const closeReplyModal = () => {
  showReplyModal.value = false;
  replyTarget.value = null;
  replyContent.value = '';
};

const sendReply = async () => {
  if (!replyContent.value.trim()) {
    toast.warning('Vui lòng nhập nội dung trả lời');
    return;
  }

  replying.value = true;
  const result = await messageStore.replyMessage(replyTarget.value._id, replyContent.value);
  
  if (result.success) {
    toast.success('Trả lời tin nhắn thành công!');
    closeReplyModal();
    loadMessages();
  }
  replying.value = false;
};

const deleteMessage = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;
  const result = await messageStore.deleteMessage(id);
  if (result.success) {
    loadMessages();
  }
};

onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
.admin-messages { padding: 1rem; }

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.filters-bar .form-control,
.filters-bar .form-select { width: 200px; }

.table-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table thead { background: #f8fafc; }
.admin-table th { padding: 0.75rem 1rem; text-align: left; font-weight: 600; font-size: 0.875rem; color: #64748b; border-bottom: 2px solid #e2e8f0; }
.admin-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
.admin-table tr:hover { background: #f8fafc; }

.subject-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  background: #e2e8f0;
  color: #4a5568;
  font-size: 11px;
  font-weight: 600;
}

.message-preview {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
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

.actions { display: flex; gap: 4px; }
.actions .btn { padding: 4px 8px; font-size: 0.75rem; }

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center; justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content.modal-lg { max-width: 800px; }
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-body { padding: 1.5rem; }
.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.message-detail .message-info > div {
  padding: 4px 0;
}
.message-content p {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin: 0;
  line-height: 1.6;
}

.reply-content {
  background: #f0fdf4;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.reply-content p {
  margin: 0 0 0.5rem 0;
  line-height: 1.6;
}

.original-message {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 0.5rem 0 1rem 0;
  font-style: italic;
  color: #4a5568;
}

@media (max-width: 768px) {
  .filters-bar { flex-direction: column; }
  .filters-bar .form-control,
  .filters-bar .form-select { width: 100%; }
  .modal-content { margin: 1rem; }
}
</style>
<template>
  <div class="admin-orders">
    <h4 class="mb-4">
      <i class="bi bi-receipt me-2"></i>Quản lý đơn hàng
    </h4>

    <!-- Filters -->
    <div class="admin-filters">
      <div class="filter-group">
        <label>Mã đơn hàng</label>
        <input type="text" class="form-control" v-model="searchKeyword" placeholder="Tìm kiếm..." @input="handleSearch">
      </div>
      <div class="filter-group">
        <label>Trạng thái</label>
        <select class="form-select" v-model="statusFilter" @change="handleFilter">
          <option value="">Tất cả</option>
          <option v-for="(label, value) in ORDER_STATUS_LABELS" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Ngày</label>
        <input type="date" class="form-control" v-model="dateFilter" @change="handleFilter">
      </div>
      <button class="btn btn-outline-secondary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Đặt lại
      </button>
    </div>

    <!-- Orders Table -->
    <div class="admin-table-wrapper">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="orders.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-3 d-block"></i>
                Không có đơn hàng nào
              </td>
            </tr>
            <tr v-for="order in orders" :key="order._id">
              <td>
                <strong>#{{ order._id?.slice(-6) }}</strong>
              </td>
              <td>
                <div>{{ order.user?.name || order.shippingAddress?.name }}</div>
                <small class="text-muted">{{ order.user?.email || order.shippingAddress?.email }}</small>
              </td>
              <td>
                <strong>{{ formatPrice(order.total) }}</strong>
              </td>
              <td>
                <span class="badge bg-info">
                  {{ PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod }}
                </span>
              </td>
              <td>
                <span :class="['badge', getStatusBadge(order.orderStatus)]">
                  {{ ORDER_STATUS_LABELS[order.orderStatus] }}
                </span>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline-primary" @click="viewOrder(order)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    v-if="order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled'"
                    class="btn btn-sm btn-outline-success" 
                    @click="updateStatus(order)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted small">
          Hiển thị {{ orders.length }} / {{ pagination.total }} đơn hàng
        </span>
        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: pagination.page === 1 }">
              <button class="page-link" @click="changePage(pagination.page - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li 
              v-for="page in pagination.totalPages" 
              :key="page"
              class="page-item"
              :class="{ active: page === pagination.page }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
              <button class="page-link" @click="changePage(pagination.page + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Update Status Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">Cập nhật trạng thái đơn hàng</h5>
          <button class="btn-close" @click="closeStatusModal"></button>
        </div>
        <div class="modal-body">
          <p><strong>Mã đơn:</strong> #{{ selectedOrder?._id?.slice(-6) }}</p>
          <p><strong>Khách hàng:</strong> {{ selectedOrder?.user?.name || selectedOrder?.shippingAddress?.name }}</p>
          <div class="mb-3">
            <label class="form-label">Trạng thái mới</label>
            <select class="form-select" v-model="newStatus">
              <option v-for="(label, value) in ORDER_STATUS_LABELS" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" @click="confirmUpdateStatus" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Cập nhật
            </button>
            <button class="btn btn-secondary" @click="closeStatusModal">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useOrderStore } from '../../store/order';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS } from '../../utils/constants';
import { toast } from 'vue3-toastify';

const orderStore = useOrderStore();

const orders = computed(() => orderStore.orders);
const loading = computed(() => orderStore.loading);
const pagination = computed(() => orderStore.pagination);

const searchKeyword = ref('');
const statusFilter = ref('');
const dateFilter = ref('');
const showStatusModal = ref(false);
const selectedOrder = ref(null);
const newStatus = ref('');

const getStatusBadge = (status) => {
  return ORDER_STATUS_COLORS[status] || 'secondary';
};

const loadOrders = async () => {
  const params = {
    page: pagination.value.page,
    limit: 10
  };
  
  if (searchKeyword.value) params.search = searchKeyword.value;
  if (statusFilter.value) params.status = statusFilter.value;
  if (dateFilter.value) params.date = dateFilter.value;
  
  await orderStore.fetchOrders(params);
};

const handleSearch = () => {
  orderStore.pagination.page = 1;
  loadOrders();
};

const handleFilter = () => {
  orderStore.pagination.page = 1;
  loadOrders();
};

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
  dateFilter.value = '';
  orderStore.pagination.page = 1;
  loadOrders();
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  orderStore.pagination.page = page;
  loadOrders();
};

const viewOrder = (order) => {
  // TODO: Show order detail
  console.log('View order:', order);
};

const updateStatus = (order) => {
  selectedOrder.value = order;
  newStatus.value = order.orderStatus;
  showStatusModal.value = true;
};

const confirmUpdateStatus = async () => {
  if (!selectedOrder.value || !newStatus.value) return;
  
  const result = await orderStore.updateOrderStatus(selectedOrder.value._id, newStatus.value);
  if (result.success) {
    toast.success('Cập nhật trạng thái thành công');
    closeStatusModal();
    loadOrders();
  } else {
    toast.error(result.error);
  }
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  selectedOrder.value = null;
  newStatus.value = '';
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.admin-orders {
  padding: 1rem;
}

.admin-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.filter-group .form-control,
.filter-group .form-select {
  min-width: 150px;
  padding: 6px 12px;
  font-size: 0.875rem;
}

.admin-table-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.actions {
  display: flex;
  gap: 6px;
}

.actions .btn {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body {
  padding: 2rem;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .admin-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group .form-control,
  .filter-group .form-select {
    min-width: 100%;
  }
}
</style>
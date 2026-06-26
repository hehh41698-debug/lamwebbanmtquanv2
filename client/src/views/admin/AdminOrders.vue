<template>
  <div class="admin-orders">
    <h4 class="mb-4"><i class="bi bi-receipt me-2"></i>Quản lý đơn hàng</h4>

    <div class="filters-bar">
      <input type="text" class="form-control" v-model="searchKeyword" placeholder="Tìm kiếm..." @input="loadOrders">
      <select class="form-select" v-model="statusFilter" @change="loadOrders">
        <option value="">Tất cả trạng thái</option>
        <option v-for="(label, value) in ORDER_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
      </select>
      <input type="date" class="form-control" v-model="dateFilter" @change="loadOrders">
      <button class="btn btn-outline-secondary" @click="resetFilters"><i class="bi bi-arrow-counterclockwise"></i> Đặt lại</button>
    </div>

    <div class="table-card">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>
            <tr v-else-if="orders.length === 0"><td colspan="7" class="text-center py-4 text-muted">Không có đơn hàng nào</td></tr>
            <tr v-for="order in orders" :key="order._id">
              <td><strong>#{{ order._id?.slice(-6) }}</strong></td>
              <td>
                <div>{{ order.user?.name || order.shippingAddress?.name }}</div>
                <small class="text-muted">{{ order.user?.email || order.shippingAddress?.email }}</small>
              </td>
              <td><strong>{{ formatPrice(order.total) }}</strong></td>
              <td><span class="badge bg-info">{{ PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod }}</span></td>
              <td><span :class="['badge', getStatusBadge(order.orderStatus)]">{{ ORDER_STATUS_LABELS[order.orderStatus] }}</span></td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline-primary" @click="viewOrder(order)"><i class="bi bi-eye"></i></button>
                  <button v-if="order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled'" class="btn btn-sm btn-outline-success" @click="openStatusModal(order)"><i class="bi bi-pencil"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination-bar">
      <span class="text-muted small">Hiển thị {{ orders.length }} / {{ pagination.total }} đơn hàng</span>
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

    <!-- Update Status Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>Cập nhật trạng thái đơn hàng</h5>
          <button class="btn-close" @click="closeStatusModal"></button>
        </div>
        <div class="modal-body">
          <p><strong>Mã đơn:</strong> #{{ selectedOrder?._id?.slice(-6) }}</p>
          <p><strong>Khách hàng:</strong> {{ selectedOrder?.user?.name || selectedOrder?.shippingAddress?.name }}</p>
          <div class="mb-3">
            <label class="form-label">Trạng thái mới</label>
            <select class="form-select" v-model="newStatus">
              <option v-for="(label, value) in ORDER_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
            </select>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" @click="confirmUpdateStatus" :disabled="updating">
              <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>Cập nhật
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
const updating = ref(false);

const getStatusBadge = (status) => ORDER_STATUS_COLORS[status] || 'secondary';

const loadOrders = async () => {
  const params = {
    page: pagination.value.page,
    limit: 10,
    search: searchKeyword.value,
    status: statusFilter.value,
    date: dateFilter.value
  };
  await orderStore.fetchOrders(params);
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

const openStatusModal = (order) => {
  selectedOrder.value = order;
  newStatus.value = order.orderStatus;
  showStatusModal.value = true;
};

const closeStatusModal = () => {
  showStatusModal.value = false;
  selectedOrder.value = null;
  newStatus.value = '';
};

const confirmUpdateStatus = async () => {
  if (!selectedOrder.value || !newStatus.value) return;
  updating.value = true;
  const result = await orderStore.updateOrderStatus(selectedOrder.value._id, newStatus.value);
  if (result.success) {
    toast.success('Cập nhật trạng thái thành công');
    closeStatusModal();
    loadOrders();
  } else {
    toast.error(result.error);
  }
  updating.value = false;
};

onMounted(() => loadOrders());
</script>

<style scoped>
.admin-orders { padding: 1rem; }
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
.admin-table .badge { font-size: 12px; padding: 4px 12px; }

.actions { display: flex; gap: 6px; }
.actions .btn { padding: 4px 8px; font-size: 0.75rem; }

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

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
  max-width: 500px;
  width: 100%;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-body { padding: 2rem; }

@media (max-width: 768px) {
  .filters-bar { flex-direction: column; }
  .filters-bar .form-control,
  .filters-bar .form-select { width: 100%; }
}
</style>
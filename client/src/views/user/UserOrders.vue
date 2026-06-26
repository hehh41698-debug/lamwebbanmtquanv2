<template>
  <div class="user-orders">
    <div class="orders-header">
      <h5><i class="bi bi-box me-2"></i>Đơn hàng của tôi</h5>
      <div class="orders-filters">
        <select class="form-select form-select-sm" v-model="statusFilter" @change="loadOrders">
          <option value="">Tất cả</option>
          <option v-for="(label, value) in ORDER_STATUS_LABELS" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
        <input type="text" class="form-control form-control-sm" v-model="searchKeyword" 
               placeholder="Tìm kiếm..." @input="loadOrders">
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-5">
      <i class="bi bi-inbox fs-1 text-muted"></i>
      <p class="mt-2">Chưa có đơn hàng nào</p>
      <router-link to="/products" class="btn btn-primary btn-sm">
        <i class="bi bi-cart"></i> Mua sắm ngay
      </router-link>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order._id" class="order-card">
        <div class="order-card-header">
          <div>
            <span class="order-id">#{{ order._id?.slice(-8) }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <span :class="['badge', getStatusBadge(order.orderStatus)]">
            {{ ORDER_STATUS_LABELS[order.orderStatus] }}
          </span>
        </div>
        <div class="order-card-body">
          <div v-for="item in order.items" :key="item._id" class="order-item">
            <img :src="item.image || '/images/no-image.png'" :alt="item.name">
            <div class="order-item-info">
              <div class="order-item-name">{{ item.name }}</div>
              <div class="order-item-meta">{{ item.quantity }} x {{ formatPrice(item.price) }}</div>
            </div>
            <div class="order-item-price">{{ formatPrice(item.price * item.quantity) }}</div>
          </div>
        </div>
        <div class="order-card-footer">
          <div class="order-total">
            <span>Tổng:</span>
            <strong>{{ formatPrice(order.total) }}</strong>
          </div>
          <div class="order-actions">
            <router-link :to="`/dashboard/orders/${order._id}`" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-eye"></i>
            </router-link>
            <button v-if="canCancel(order)" class="btn btn-sm btn-outline-danger" @click="cancelOrder(order._id)">
              <i class="bi bi-x-circle"></i>
            </button>
          </div>
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useOrderStore } from '../../store/order';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import { toast } from 'vue3-toastify';

const orderStore = useOrderStore();

const orders = computed(() => orderStore.orders);
const loading = computed(() => orderStore.loading);
const pagination = computed(() => orderStore.pagination);

const statusFilter = ref('');
const searchKeyword = ref('');

const getStatusBadge = (status) => ORDER_STATUS_COLORS[status] || 'secondary';
const canCancel = (order) => ['pending', 'confirmed'].includes(order.orderStatus);

const loadOrders = async () => {
  const params = {
    page: pagination.value.page,
    limit: 10,
    status: statusFilter.value,
    search: searchKeyword.value
  };
  await orderStore.fetchOrders(params);
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  orderStore.pagination.page = page;
  loadOrders();
};

const cancelOrder = async (orderId) => {
  if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
  const result = await orderStore.cancelOrder(orderId);
  if (result.success) {
    toast.success('Đã hủy đơn hàng');
    loadOrders();
  }
};

onMounted(() => loadOrders());
</script>

<style scoped>
.user-orders { padding: 0.5rem; }

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.orders-filters {
  display: flex;
  gap: 0.5rem;
}
.orders-filters .form-select { width: 150px; }
.orders-filters .form-control { width: 200px; }

.order-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.order-id { font-weight: 600; }
.order-date { font-size: 0.875rem; color: #94a3b8; margin-left: 1rem; }

.order-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.order-item:last-child { border-bottom: none; }

.order-item img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 6px;
  background: #f8fafc;
}

.order-item-info { flex: 1; }
.order-item-name { font-weight: 500; font-size: 0.95rem; }
.order-item-meta { font-size: 0.85rem; color: #94a3b8; }

.order-item-price { font-weight: 600; color: #2563eb; }

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.order-total span { color: #64748b; margin-right: 0.5rem; }
.order-total strong { font-size: 1.1rem; }

.order-actions { display: flex; gap: 0.5rem; }

.pagination-bar {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .orders-header { flex-direction: column; align-items: stretch; }
  .orders-filters { flex-direction: column; }
  .orders-filters .form-select,
  .orders-filters .form-control { width: 100%; }
  .order-card-footer { flex-direction: column; gap: 0.5rem; }
}
</style>
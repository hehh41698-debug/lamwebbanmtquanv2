<template>
  <div class="order-table-wrapper">
    <div class="table-header">
      <h5 class="mb-0">Đơn hàng</h5>
      <div class="table-filters">
        <select class="form-select form-select-sm" v-model="statusFilter" @change="applyFilters">
          <option value="">Tất cả trạng thái</option>
          <option v-for="(label, value) in ORDER_STATUS_LABELS" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
        <input 
          type="text" 
          class="form-control form-control-sm" 
          placeholder="Tìm kiếm..."
          v-model="searchQuery"
          @input="applyFilters"
        >
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ngày đặt</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="orders.length === 0">
            <td colspan="6" class="text-center py-4 text-muted">
              <i class="bi bi-inbox fs-3 d-block"></i>
              Không có đơn hàng nào
            </td>
          </tr>
          <tr v-for="order in filteredOrders" :key="order._id">
            <td>
              <strong>#{{ order._id.slice(-6) }}</strong>
            </td>
            <td>
              <div>{{ order.shippingAddress?.name || 'N/A' }}</div>
              <small class="text-muted">{{ order.user?.email || order.shippingAddress?.email }}</small>
            </td>
            <td>
              <strong>{{ formatPrice(order.total) }}</strong>
            </td>
            <td>
              <span :class="['badge', getStatusBadge(order.orderStatus)]">
                {{ ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus }}
              </span>
            </td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="table-footer">
      <span class="text-muted small">
        Hiển thị {{ filteredOrders.length }} / {{ orders.length }} đơn hàng
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';

const props = defineProps({
  orders: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['view', 'update-status']);

const statusFilter = ref('');
const searchQuery = ref('');

const filteredOrders = computed(() => {
  let result = props.orders;
  
  if (statusFilter.value) {
    result = result.filter(o => o.orderStatus === statusFilter.value);
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(o => 
      o._id.toLowerCase().includes(query) ||
      o.shippingAddress?.name?.toLowerCase().includes(query) ||
      o.user?.email?.toLowerCase().includes(query)
    );
  }
  
  return result;
});

const getStatusBadge = (status) => {
  return ORDER_STATUS_COLORS[status] || 'secondary';
};

const applyFilters = () => {
  // Filters are reactive, no action needed
};

const viewOrder = (order) => {
  emit('view', order);
};

const updateStatus = (order) => {
  emit('update-status', order);
};
</script>

<style scoped>
.order-table-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.table-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.table-filters .form-control,
.table-filters .form-select {
  width: auto;
  min-width: 150px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table thead {
  background: #f8fafc;
}

.admin-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}

.admin-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.admin-table tr:hover {
  background: #f8fafc;
}

.admin-table .badge {
  font-size: 12px;
  padding: 4px 12px;
}

.table-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: right;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-filters {
    flex-direction: column;
  }
  
  .table-filters .form-control,
  .table-filters .form-select {
    width: 100%;
  }
}
</style>
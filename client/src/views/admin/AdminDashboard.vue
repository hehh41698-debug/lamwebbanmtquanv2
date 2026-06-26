<template>
  <div class="admin-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0">
        <i class="bi bi-speedometer2 me-2"></i>Tổng quan
      </h4>
      <span class="text-muted">Cập nhật: {{ formatDate(new Date()) }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-3 col-6">
          <div class="stat-card">
            <div class="stat-icon primary">
              <i class="bi bi-currency-dollar"></i>
            </div>
            <div class="stat-value">{{ formatPrice(totalRevenue) }}</div>
            <div class="stat-label">Doanh thu</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card">
            <div class="stat-icon success">
              <i class="bi bi-cart"></i>
            </div>
            <div class="stat-value">{{ totalOrders }}</div>
            <div class="stat-label">Đơn hàng</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card">
            <div class="stat-icon warning">
              <i class="bi bi-people"></i>
            </div>
            <div class="stat-value">{{ totalUsers }}</div>
            <div class="stat-label">Người dùng</div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="stat-card">
            <div class="stat-icon danger">
              <i class="bi bi-box"></i>
            </div>
            <div class="stat-value">{{ totalProducts }}</div>
            <div class="stat-label">Sản phẩm</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row g-4 mb-4">
        <div class="col-md-3 col-6">
          <router-link to="/admin/products" class="quick-action">
            <i class="bi bi-plus-circle text-primary"></i>
            <span>Thêm sản phẩm</span>
          </router-link>
        </div>
        <div class="col-md-3 col-6">
          <router-link to="/admin/orders" class="quick-action">
            <i class="bi bi-eye text-success"></i>
            <span>Xem đơn hàng</span>
          </router-link>
        </div>
        <div class="col-md-3 col-6">
          <router-link to="/admin/categories" class="quick-action">
            <i class="bi bi-tag text-warning"></i>
            <span>Quản lý danh mục</span>
          </router-link>
        </div>
        <div class="col-md-3 col-6">
          <router-link to="/admin/users" class="quick-action">
            <i class="bi bi-people text-info"></i>
            <span>Quản lý người dùng</span>
          </router-link>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="table-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">Đơn hàng gần đây</h6>
          <router-link to="/admin/orders" class="btn btn-sm btn-outline-primary">
            Xem tất cả <i class="bi bi-arrow-right"></i>
          </router-link>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order._id">
                <td>#{{ order._id?.slice(-6) }}</td>
                <td>{{ order.user?.name || order.shippingAddress?.name }}</td>
                <td>{{ formatPrice(order.total) }}</td>
                <td>
                  <span :class="['badge', getStatusBadge(order.orderStatus)]">
                    {{ ORDER_STATUS_LABELS[order.orderStatus] }}
                  </span>
                </td>
                <td>{{ formatDate(order.createdAt) }}</td>
              </tr>
              <tr v-if="recentOrders.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-3 d-block"></i>
                  Chưa có đơn hàng nào
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue';
import { useOrderStore } from '../../store/order';
import { useProductStore } from '../../store/product';
import { useUserStore } from '../../store/user';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';

const orderStore = useOrderStore();
const productStore = useProductStore();
const userStore = useUserStore();

const loading = ref(true);
const totalRevenue = ref(0);
const totalOrders = ref(0);
const totalUsers = ref(0);
const totalProducts = ref(0);
const recentOrders = ref([]);

const getStatusBadge = (status) => {
  return ORDER_STATUS_COLORS[status] || 'secondary';
};

const loadData = async () => {
  loading.value = true;
  try {
    await orderStore.fetchOrders({ limit: 5 });
    recentOrders.value = orderStore.orders.slice(0, 5);
    totalOrders.value = orderStore.pagination.total || 0;
    totalRevenue.value = orderStore.orders.reduce((sum, order) => sum + order.total, 0);
    
    await userStore.fetchUsers({ limit: 1 });
    totalUsers.value = userStore.pagination.total || 0;
    
    await productStore.fetchProducts({ limit: 1 });
    totalProducts.value = productStore.pagination.total || 0;
  } catch (error) {
    console.error('Load data error:', error);
  } finally {
    loading.value = false;
  }
};

// Load khi mounted và khi component được reactivated (keep-alive)
onMounted(() => {
  loadData();
});

onActivated(() => {
  loadData();
});
</script>

<style scoped>
.admin-dashboard { padding: 1rem; }

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s;
  text-align: center;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 0.75rem;
}
.stat-icon.primary { background: rgba(37,99,235,0.1); color: #2563eb; }
.stat-icon.success { background: rgba(16,185,129,0.1); color: #10b981; }
.stat-icon.warning { background: rgba(245,158,11,0.1); color: #f59e0b; }
.stat-icon.danger { background: rgba(239,68,68,0.1); color: #ef4444; }

.stat-value { font-size: 1.75rem; font-weight: 700; color: #1a202c; }
.stat-label { color: #94a3b8; font-size: 0.875rem; }

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  padding: 2rem 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  text-decoration: none;
  color: #1a202c;
  transition: all 0.3s;
  height: 100%;
}
.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.quick-action i { font-size: 2rem; margin-bottom: 0.5rem; }
.quick-action span { font-weight: 500; }

.table-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table thead { background: #f8fafc; }
.admin-table th { padding: 0.75rem 1rem; text-align: left; font-weight: 600; font-size: 0.875rem; color: #64748b; border-bottom: 2px solid #e2e8f0; }
.admin-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
.admin-table tr:hover { background: #f8fafc; }
.admin-table .badge { font-size: 12px; padding: 4px 12px; }

@media (max-width: 768px) {
  .stat-card { padding: 1rem; }
  .stat-value { font-size: 1.25rem; }
  .quick-action { padding: 1.5rem 0.5rem; }
}
</style>
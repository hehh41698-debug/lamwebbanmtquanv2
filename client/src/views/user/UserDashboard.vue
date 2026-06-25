<template>
  <div class="user-dashboard py-4">
    <div class="container">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3">
          <div class="dashboard-sidebar">
            <div class="user-profile">
              <img 
                :src="user?.avatar || '/images/default-avatar.png'" 
                class="user-avatar"
                :alt="user?.name"
              >
              <h6 class="user-name">{{ user?.name }}</h6>
              <span class="user-email">{{ user?.email }}</span>
            </div>
            <ul class="dashboard-menu">
              <li>
                <router-link to="/dashboard" exact>
                  <i class="bi bi-grid"></i> Tổng quan
                </router-link>
              </li>
              <li>
                <router-link to="/dashboard/orders">
                  <i class="bi bi-box"></i> Đơn hàng
                </router-link>
              </li>
              <li>
                <router-link to="/dashboard/profile">
                  <i class="bi bi-person"></i> Thông tin cá nhân
                </router-link>
              </li>
              <li>
                <router-link to="/dashboard/change-password">
                  <i class="bi bi-shield-lock"></i> Đổi mật khẩu
                </router-link>
              </li>
              <li>
                <router-link to="/dashboard/reviews">
                  <i class="bi bi-chat-dots"></i> Đánh giá của tôi
                </router-link>
              </li>
              <li>
                <a href="#" @click.prevent="handleLogout">
                  <i class="bi bi-box-arrow-right text-danger"></i> Đăng xuất
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Content -->
        <div class="col-lg-9">
          <div class="dashboard-content">
            <h5 class="mb-4">Tổng quan</h5>

            <!-- Stats -->
            <div class="row g-4 mb-4">
              <div class="col-md-3 col-6">
                <div class="stat-card">
                  <div class="stat-icon primary">
                    <i class="bi bi-cart"></i>
                  </div>
                  <div class="stat-number">{{ orderStats.total || 0 }}</div>
                  <div class="stat-label">Tổng đơn hàng</div>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="stat-card">
                  <div class="stat-icon success">
                    <i class="bi bi-check-circle"></i>
                  </div>
                  <div class="stat-number">{{ orderStats.delivered || 0 }}</div>
                  <div class="stat-label">Đã giao</div>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="stat-card">
                  <div class="stat-icon warning">
                    <i class="bi bi-clock-history"></i>
                  </div>
                  <div class="stat-number">{{ orderStats.pending || 0 }}</div>
                  <div class="stat-label">Đang xử lý</div>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="stat-card">
                  <div class="stat-icon danger">
                    <i class="bi bi-x-circle"></i>
                  </div>
                  <div class="stat-number">{{ orderStats.cancelled || 0 }}</div>
                  <div class="stat-label">Đã hủy</div>
                </div>
              </div>
            </div>

            <!-- Recent Orders -->
            <div class="section-card">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">Đơn hàng gần đây</h6>
                <router-link to="/dashboard/orders" class="btn btn-sm btn-outline-primary">
                  Xem tất cả <i class="bi bi-arrow-right"></i>
                </router-link>
              </div>

              <div v-if="recentOrders.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-3 d-block"></i>
                Chưa có đơn hàng nào
              </div>

              <div v-else class="table-responsive">
                <table class="dashboard-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="order in recentOrders" :key="order._id">
                      <td>#{{ order._id?.slice(-6) }}</td>
                      <td>{{ formatDate(order.createdAt) }}</td>
                      <td>{{ formatPrice(order.total) }}</td>
                      <td>
                        <span :class="['badge', getStatusBadge(order.orderStatus)]">
                          {{ ORDER_STATUS_LABELS[order.orderStatus] }}
                        </span>
                      </td>
                      <td>
                        <router-link :to="`/dashboard/orders/${order._id}`" class="btn btn-sm btn-outline-primary">
                          <i class="bi bi-eye"></i>
                        </router-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="section-card mt-4">
              <h6 class="mb-3">Hành động nhanh</h6>
              <div class="row g-3">
                <div class="col-md-4">
                  <router-link to="/products" class="quick-action">
                    <i class="bi bi-cart-plus"></i>
                    <span>Mua sắm ngay</span>
                  </router-link>
                </div>
                <div class="col-md-4">
                  <router-link to="/dashboard/profile" class="quick-action">
                    <i class="bi bi-person-gear"></i>
                    <span>Cập nhật thông tin</span>
                  </router-link>
                </div>
                <div class="col-md-4">
                  <a href="#" class="quick-action" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right text-danger"></i>
                    <span>Đăng xuất</span>
                  </a>
                </div>
              </div>
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
import { useOrderStore } from '../../store/order';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();

const user = computed(() => authStore.user);
const recentOrders = ref([]);
const orderStats = ref({
  total: 0,
  pending: 0,
  delivered: 0,
  cancelled: 0
});

const getStatusBadge = (status) => {
  return ORDER_STATUS_COLORS[status] || 'secondary';
};

const loadOrders = async () => {
  const result = await orderStore.fetchOrders({ limit: 5 });
  if (result.success) {
    recentOrders.value = result.data.orders || [];
    
    // Calculate stats
    const orders = result.data.orders || [];
    orderStats.value = {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed' || o.orderStatus === 'processing' || o.orderStatus === 'shipped').length,
      delivered: orders.filter(o => o.orderStatus === 'delivered').length,
      cancelled: orders.filter(o => o.orderStatus === 'cancelled').length
    };
  }
};

const handleLogout = async () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    await authStore.logout();
    toast.success('Đã đăng xuất');
    router.push('/');
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  loadOrders();
});
</script>

<style scoped>
.user-dashboard {
  background: #f8fafc;
  min-height: 100vh;
}

/* Sidebar */
.dashboard-sidebar {
  background: white;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 100px;
}

.user-profile {
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #2563eb;
  margin-bottom: 0.75rem;
}

.user-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.875rem;
  color: #94a3b8;
}

.dashboard-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dashboard-menu li {
  margin-bottom: 4px;
}

.dashboard-menu li a {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  color: #4a5568;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  gap: 10px;
}

.dashboard-menu li a:hover {
  background: #f8fafc;
  color: #2563eb;
}

.dashboard-menu li a.router-link-active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.dashboard-menu li a i {
  font-size: 1.1rem;
  width: 20px;
}

/* Content */
.dashboard-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Stats */
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 0.5rem;
}

.stat-icon.primary {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.stat-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* Section Card */
.section-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

/* Table */
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
}

.dashboard-table thead {
  background: #f8fafc;
}

.dashboard-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}

.dashboard-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.dashboard-table tr:hover {
  background: #f8fafc;
}

.dashboard-table .badge {
  font-size: 11px;
  padding: 4px 12px;
}

/* Quick Actions */
.quick-action {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  color: #4a5568;
  transition: all 0.3s;
}

.quick-action:hover {
  border-color: #2563eb;
  background: #f8fafc;
  color: #2563eb;
}

.quick-action i {
  font-size: 1.5rem;
}

.quick-action span {
  font-weight: 500;
}

/* Responsive */
@media (max-width: 992px) {
  .dashboard-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.2rem;
  }
}

@media (max-width: 576px) {
  .dashboard-content {
    padding: 1rem;
  }
  
  .dashboard-table {
    font-size: 0.875rem;
  }
  
  .dashboard-table th,
  .dashboard-table td {
    padding: 0.5rem;
  }
}
</style>
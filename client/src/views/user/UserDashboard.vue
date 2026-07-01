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
              <h6 class="user-name">{{ user?.name || 'Khách hàng' }}</h6>
              <span class="user-email">{{ user?.email || '' }}</span>
              <span class="badge bg-primary mt-2">{{ user?.role === 'admin' ? 'Admin' : 'Thành viên' }}</span>
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
                <router-link to="/dashboard/wishlist">
                  <i class="bi bi-heart"></i> Sản phẩm yêu thích
                  <span v-if="wishlistCount > 0" class="badge bg-danger ms-1">{{ wishlistCount }}</span>
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

            <!-- Wishlist Quick View -->
            <div class="section-card mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">
                  <i class="bi bi-heart text-danger me-2"></i>Sản phẩm yêu thích
                </h6>
                <router-link to="/dashboard/wishlist" class="btn btn-sm btn-outline-primary">
                  Xem tất cả <i class="bi bi-arrow-right"></i>
                </router-link>
              </div>
              <div v-if="wishlistItems.length === 0" class="text-center py-3 text-muted">
                <i class="bi bi-heart fs-4 d-block"></i>
                <span>Chưa có sản phẩm yêu thích</span>
              </div>
              <div v-else class="row g-3">
                <div v-for="item in wishlistItems.slice(0, 4)" :key="item._id" class="col-md-3 col-6">
                  <div class="wishlist-mini-item">
                    <img :src="item.product?.images?.[0] || '/images/no-image.png'" :alt="item.product?.name">
                    <div class="wishlist-mini-name">{{ truncateText(item.product?.name, 20) }}</div>
                    <div class="wishlist-mini-price">{{ formatPrice(item.product?.price) }}</div>
                  </div>
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
                        <!-- SỬA: Dùng status-badge thay vì badge thông thường -->
                        <span 
                          :class="['status-badge', getStatusClass(order.orderStatus)]"
                        >
                          <i :class="getStatusIcon(order.orderStatus)"></i>
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
                  <router-link to="/dashboard/orders" class="quick-action">
                    <i class="bi bi-box"></i>
                    <span>Xem đơn hàng</span>
                  </router-link>
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
import { useWishlistStore } from '../../store/wishlist';
import { formatPrice, formatDate, truncateText } from '../../utils/helpers';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();
const wishlistStore = useWishlistStore();

const user = computed(() => authStore.user);
const recentOrders = ref([]);
const wishlistItems = computed(() => wishlistStore.items);
const wishlistCount = computed(() => wishlistStore.wishlistCount);
const orderStats = ref({
  total: 0,
  pending: 0,
  delivered: 0,
  cancelled: 0
});

// CSS classes cho từng trạng thái
const getStatusClass = (status) => {
  const classes = {
    'pending': 'status-pending',
    'confirmed': 'status-confirmed',
    'processing': 'status-processing',
    'shipped': 'status-shipped',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  return classes[status] || 'status-pending';
};

// Icon cho từng trạng thái
const getStatusIcon = (status) => {
  const icons = {
    'pending': 'bi bi-clock-history',
    'confirmed': 'bi bi-check-circle',
    'processing': 'bi bi-arrow-repeat',
    'shipped': 'bi bi-truck',
    'delivered': 'bi bi-box-seam',
    'cancelled': 'bi bi-x-circle'
  };
  return icons[status] || 'bi bi-clock-history';
};

const loadOrders = async () => {
  const result = await orderStore.fetchOrders({ limit: 5 });
  if (result.success) {
    recentOrders.value = result.data.orders || [];
    
    const orders = result.data.orders || [];
    orderStats.value = {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'confirmed' || o.orderStatus === 'processing' || o.orderStatus === 'shipped').length,
      delivered: orders.filter(o => o.orderStatus === 'delivered').length,
      cancelled: orders.filter(o => o.orderStatus === 'cancelled').length
    };
  }
};

const loadWishlist = async () => {
  await wishlistStore.fetchWishlist();
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
  loadWishlist();
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
  color: #1a202c;
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
  text-align: center;
}

.dashboard-menu li a .badge {
  font-size: 11px;
  padding: 2px 8px;
}

/* Content */
.dashboard-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
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

.stat-icon.primary { background: rgba(37,99,235,0.1); color: #2563eb; }
.stat-icon.success { background: rgba(16,185,129,0.1); color: #10b981; }
.stat-icon.warning { background: rgba(245,158,11,0.1); color: #f59e0b; }
.stat-icon.danger { background: rgba(239,68,68,0.1); color: #ef4444; }

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
}

.stat-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

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

/* ============================================ */
/* STATUS BADGES - NỔI BẬT */
/* ============================================ */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s;
}

.status-badge i {
  font-size: 14px;
}

/* Pending - Chờ xác nhận - Màu vàng cam */
.status-pending {
  background: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #f59e0b !important;
}

/* Confirmed - Đã xác nhận - Màu xanh dương */
.status-confirmed {
  background: #dbeafe !important;
  color: #1e40af !important;
  border: 1px solid #3b82f6 !important;
}

/* Processing - Đang xử lý - Màu tím */
.status-processing {
  background: #e0e7ff !important;
  color: #3730a3 !important;
  border: 1px solid #6366f1 !important;
}

/* Shipped - Đang giao - Màu xanh ngọc */
.status-shipped {
  background: #cffafe !important;
  color: #0e7490 !important;
  border: 1px solid #06b6d4 !important;
}

/* Delivered - Đã giao - Màu xanh lá */
.status-delivered {
  background: #d1fae5 !important;
  color: #065f46 !important;
  border: 1px solid #10b981 !important;
}

/* Cancelled - Đã hủy - Màu đỏ */
.status-cancelled {
  background: #fee2e2 !important;
  color: #991b1b !important;
  border: 1px solid #ef4444 !important;
}

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

/* Wishlist Mini */
.wishlist-mini-item {
  text-align: center;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s;
}

.wishlist-mini-item:hover {
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.wishlist-mini-item img {
  width: 100%;
  height: 80px;
  object-fit: contain;
  margin-bottom: 0.25rem;
}

.wishlist-mini-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #1a202c;
}

.wishlist-mini-price {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2563eb;
}

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
</style>
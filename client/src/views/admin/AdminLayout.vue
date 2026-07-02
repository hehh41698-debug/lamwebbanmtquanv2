<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <i class="bi bi-laptop fs-4"></i>
        </div>
        <span>ComputerStore</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin" exact>
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/admin/products">
          <i class="bi bi-box"></i>
          <span>Sản phẩm</span>
        </router-link>

        <router-link to="/admin/orders">
          <i class="bi bi-receipt"></i>
          <span>Đơn hàng</span>
          <span v-if="pendingOrders > 0" class="badge bg-danger">{{ pendingOrders }}</span>
        </router-link>

        <router-link to="/admin/users">
          <i class="bi bi-people"></i>
          <span>Người dùng</span>
        </router-link>

        <router-link to="/admin/categories">
          <i class="bi bi-tags"></i>
          <span>Danh mục</span>
        </router-link>

        <router-link to="/admin/reviews">
          <i class="bi bi-chat-dots"></i>
          <span>Đánh giá</span>
          <span v-if="pendingReviews > 0" class="badge bg-warning">{{ pendingReviews }}</span>
        </router-link>

        <!-- THÊM MENU TIN NHẮN -->
        <router-link to="/admin/messages">
          <i class="bi bi-envelope"></i>
          <span>Tin nhắn</span>
          <span v-if="pendingMessages > 0" class="badge bg-danger">{{ pendingMessages }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="btn btn-outline-light btn-sm w-100" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i> Đăng xuất
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="admin-main">
      <header class="admin-header">
        <button class="btn btn-sm btn-outline-secondary d-lg-none" @click="toggleSidebar">
          <i class="bi bi-list"></i>
        </button>
        <div class="admin-user">
          <span class="me-2">{{ user?.name || 'Admin' }}</span>
          <img 
            :src="user?.avatar || '/images/default-avatar.png'" 
            class="admin-avatar" 
            @error="handleAvatarError"
          >
        </div>
      </header>

      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { useOrderStore } from '../../store/order';
import { useReviewStore } from '../../store/review';
import { useMessageStore } from '../../store/message';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const orderStore = useOrderStore();
const reviewStore = useReviewStore();
const messageStore = useMessageStore();

const user = computed(() => authStore.user);
const sidebarOpen = ref(false);
const pendingOrders = ref(0);
const pendingReviews = ref(0);
const pendingMessages = ref(0);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const handleAvatarError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Ccircle cx="18" cy="18" r="18" fill="%23e2e8f0"/%3E%3Ctext x="18" y="22" text-anchor="middle" fill="%2394a3b8" font-size="16"%3EU%3C/text%3E%3C/svg%3E';
};

const handleLogout = async () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    await authStore.logout();
    toast.success('Đã đăng xuất');
    router.push('/login');
  }
};

// Load pending counts
const loadPendingCounts = async () => {
  try {
    // Pending orders
    await orderStore.fetchOrders({ status: 'pending', limit: 1 });
    pendingOrders.value = orderStore.pagination.total || 0;

    // Pending reviews
    await reviewStore.fetchAllReviews({ status: 'pending', limit: 1 });
    pendingReviews.value = reviewStore.pagination.total || 0;

    // Pending messages
    await messageStore.fetchAllMessages({ status: 'pending', limit: 1 });
    pendingMessages.value = messageStore.pagination.total || 0;
  } catch (error) {
    console.error('Load pending counts error:', error);
  }
};

// Auto refresh every 30 seconds
let refreshInterval = null;

onMounted(() => {
  // Check if user is admin
  if (user.value?.role !== 'admin') {
    router.push('/');
    return;
  }
  
  // Load pending counts
  loadPendingCounts();
  
  // Refresh every 30 seconds
  refreshInterval = setInterval(loadPendingCounts, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
}

.admin-sidebar {
  width: 260px;
  background: #0f172a;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  transition: all 0.3s ease;
  flex-shrink: 0;
  z-index: 100;
}

.sidebar-brand {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  min-height: 70px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: #2563eb;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s;
  gap: 12px;
  border-left: 3px solid transparent;
}

.sidebar-nav a:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.sidebar-nav a.router-link-active {
  background: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
  border-left-color: #2563eb;
}

.sidebar-nav a i {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-nav a .badge {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 8px;
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  min-height: 70px;
}

.admin-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-content {
  flex: 1;
  padding: 1.5rem;
  max-width: 100%;
}

/* Scrollbar */
.admin-sidebar::-webkit-scrollbar {
  width: 4px;
}
.admin-sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.admin-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}
.admin-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Mobile */
@media (max-width: 992px) {
  .admin-sidebar {
    position: fixed;
    transform: translateX(-100%);
    z-index: 1000;
    width: 280px;
  }
  .admin-sidebar.open {
    transform: translateX(0);
  }
  .admin-header {
    padding: 0.75rem 1rem;
  }
  .admin-content {
    padding: 1rem;
  }
}
</style>
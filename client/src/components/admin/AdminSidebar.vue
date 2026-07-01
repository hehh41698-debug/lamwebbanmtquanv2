<template>
  <aside class="admin-sidebar" :class="{ open: isOpen }">
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
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { useMessageStore } from '../../store/message';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const messageStore = useMessageStore();

const isOpen = ref(false);
const pendingOrders = ref(0);
const pendingReviews = ref(0);
const pendingMessages = ref(0);

// Lấy số lượng tin nhắn chưa xử lý
const loadPendingMessages = async () => {
  try {
    // Chỉ lấy số lượng không lấy dữ liệu
    const result = await messageStore.fetchAllMessages({ 
      status: 'pending', 
      limit: 1 
    });
    if (result.success) {
      pendingMessages.value = messageStore.pagination.total || 0;
    }
  } catch (error) {
    console.error('Load pending messages error:', error);
  }
};

const handleLogout = async () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    await authStore.logout();
    toast.success('Đã đăng xuất');
    router.push('/login');
  }
};

// Tự động refresh số lượng tin nhắn mỗi 30 giây
let refreshInterval = null;

onMounted(() => {
  if (authStore.isAdmin) {
    loadPendingMessages();
    // Refresh mỗi 30 giây
    refreshInterval = setInterval(loadPendingMessages, 30000);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

defineExpose({ toggle: () => { isOpen.value = !isOpen.value; } });
</script>

<style scoped>
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
  border-bottom: 1px solid rgba(255,255,255,0.05);
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
  background: rgba(255,255,255,0.05);
  color: white;
}

.sidebar-nav a.router-link-active {
  background: rgba(37,99,235,0.15);
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
  border-top: 1px solid rgba(255,255,255,0.05);
}

/* Scrollbar */
.admin-sidebar::-webkit-scrollbar {
  width: 4px;
}
.admin-sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.admin-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}
.admin-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
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
}

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .admin-sidebar {
    background: #0f172a;
  }
}
</style>
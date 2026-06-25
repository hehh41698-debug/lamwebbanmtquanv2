<template>
  <aside class="admin-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="admin-sidebar-brand">
      <img src="/images/logo-white.png" alt="Computer Store">
      <span v-show="!isCollapsed">Admin</span>
    </div>
    
    <ul class="admin-sidebar-menu">
      <li>
        <router-link to="/admin" exact>
          <i class="bi bi-speedometer2"></i>
          <span v-show="!isCollapsed">Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/products">
          <i class="bi bi-box"></i>
          <span v-show="!isCollapsed">Sản phẩm</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/orders">
          <i class="bi bi-receipt"></i>
          <span v-show="!isCollapsed">Đơn hàng</span>
          <span class="badge bg-danger" v-if="pendingOrders > 0">{{ pendingOrders }}</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/users">
          <i class="bi bi-people"></i>
          <span v-show="!isCollapsed">Người dùng</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/categories">
          <i class="bi bi-tags"></i>
          <span v-show="!isCollapsed">Danh mục</span>
        </router-link>
      </li>
      <li>
        <router-link to="/admin/reviews">
          <i class="bi bi-chat-dots"></i>
          <span v-show="!isCollapsed">Đánh giá</span>
          <span class="badge bg-warning" v-if="pendingReviews > 0">{{ pendingReviews }}</span>
        </router-link>
      </li>
    </ul>
    
    <div class="admin-sidebar-footer">
      <button class="btn btn-outline-light btn-sm w-100" @click="toggleCollapse">
        <i :class="isCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
        <span v-show="!isCollapsed">Thu gọn</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';

const isCollapsed = ref(false);
const pendingOrders = ref(5);
const pendingReviews = ref(3);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.admin-sidebar {
  width: 280px;
  min-height: 100vh;
  background: #0f172a;
  color: white;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  transition: all 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.admin-sidebar.collapsed {
  width: 70px;
}

.admin-sidebar-brand {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.admin-sidebar-brand img {
  height: 35px;
}

.admin-sidebar-brand span {
  font-size: 1.2rem;
  font-weight: 700;
}

.admin-sidebar-menu {
  flex: 1;
  padding: 1rem 0;
  list-style: none;
  margin: 0;
}

.admin-sidebar-menu li {
  margin-bottom: 2px;
}

.admin-sidebar-menu li a {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s;
  gap: 12px;
  border-left: 3px solid transparent;
  position: relative;
}

.admin-sidebar-menu li a:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.admin-sidebar-menu li a.router-link-active {
  background: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
  border-left-color: #2563eb;
}

.admin-sidebar-menu li a i {
  font-size: 1.2rem;
  min-width: 24px;
  text-align: center;
}

.admin-sidebar-menu li a .badge {
  margin-left: auto;
  font-size: 11px;
}

.admin-sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.admin-sidebar.collapsed .admin-sidebar-menu li a {
  justify-content: center;
  padding: 0.75rem;
}

.admin-sidebar.collapsed .admin-sidebar-menu li a .badge {
  display: none;
}

.admin-sidebar.collapsed .admin-sidebar-brand span {
  display: none;
}

@media (max-width: 992px) {
  .admin-sidebar {
    position: fixed;
    transform: translateX(-100%);
  }
  
  .admin-sidebar.open {
    transform: translateX(0);
  }
}
</style>
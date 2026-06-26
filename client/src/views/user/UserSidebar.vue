<template>
  <div class="user-sidebar">
    <div class="user-profile">
      <img 
        :src="user?.avatar || '/images/default-avatar.png'" 
        class="user-avatar"
        :alt="user?.name"
      >
      <h6 class="user-name">{{ user?.name }}</h6>
      <span class="user-email">{{ user?.email }}</span>
    </div>
    <ul class="sidebar-menu">
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
          <i class="bi bi-chat-dots"></i> Đánh giá
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/wishlist">
          <i class="bi bi-heart"></i> Yêu thích
        </router-link>
      </li>
      <li>
        <a href="#" @click.prevent="handleLogout">
          <i class="bi bi-box-arrow-right text-danger"></i> Đăng xuất
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);

const handleLogout = async () => {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    await authStore.logout();
    toast.success('Đã đăng xuất');
    router.push('/');
  }
};
</script>

<style scoped>
.user-sidebar {
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
}

.user-email {
  font-size: 0.875rem;
  color: #94a3b8;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 4px;
}

.sidebar-menu li a {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  color: #4a5568;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  gap: 10px;
}

.sidebar-menu li a:hover {
  background: #f8fafc;
  color: #2563eb;
}

.sidebar-menu li a.router-link-active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.sidebar-menu li a i {
  font-size: 1.1rem;
  width: 20px;
}

@media (max-width: 992px) {
  .user-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 1.5rem;
  }
}
</style>
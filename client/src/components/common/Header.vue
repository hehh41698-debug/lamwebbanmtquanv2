<template>
  <header class="header">
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <!-- Logo trước chữ Computer Store -->
          <img 
            src="/images/logo.png" 
            alt="Computer Store" 
            height="40"
            class="brand-logo"
          >
          <span class="brand-text">Computer Store</span>
        </router-link>
        
        <!-- Phần còn lại giữ nguyên -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <!-- Search Bar -->
          <form class="search-form mx-auto" @submit.prevent="handleSearch">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Tìm kiếm sản phẩm..."
                v-model="searchQuery"
                @keyup.enter="handleSearch"
              >
              <button class="btn btn-primary" type="submit">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </form>
          
          <!-- Navigation -->
          <ul class="navbar-nav ms-auto align-items-lg-center">
            <li class="nav-item">
              <router-link class="nav-link" to="/products">
                <i class="bi bi-grid-3x3-gap"></i> Sản phẩm
              </router-link>
            </li>
            
            <li class="nav-item position-relative" v-if="isAuthenticated">
              <router-link class="nav-link" to="/cart">
                <i class="bi bi-cart3 fs-5"></i>
                <span class="cart-badge" v-if="totalItems > 0">{{ totalItems }}</span>
              </router-link>
            </li>
            
            <!-- User Menu -->
            <li class="nav-item dropdown" v-if="isAuthenticated">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <img 
                  :src="user?.avatar || 'https://via.placeholder.com/32x32/94a3b8/ffffff?text=U'" 
                  alt="Avatar" 
                  class="user-avatar rounded-circle"
                >
                <span class="ms-1 d-none d-lg-inline">{{ user?.name }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li v-if="isAdmin">
                  <router-link class="dropdown-item" to="/admin">
                    <i class="bi bi-speedometer2"></i> Dashboard
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/dashboard">
                    <i class="bi bi-person"></i> Tài khoản
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/dashboard/orders">
                    <i class="bi bi-box"></i> Đơn hàng
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right"></i> Đăng xuất
                  </a>
                </li>
              </ul>
            </li>
            
            <li class="nav-item" v-else>
              <router-link class="btn btn-primary btn-sm" to="/login">
                <i class="bi bi-person"></i> Đăng nhập
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { useCartStore } from '../../store/cart';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const searchQuery = ref('');
const isMobileMenuOpen = ref(false);
const isDropdownOpen = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const user = computed(() => authStore.user);
const totalItems = computed(() => cartStore.totalItems);

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ 
      path: '/products', 
      query: { search: searchQuery.value.trim() } 
    });
  }
};

const handleLogout = async () => {
  await authStore.logout();
  toast.success('Đã đăng xuất thành công');
  router.push('/');
};

// Close dropdown khi click outside
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.dropdown');
  if (!dropdown) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.25rem;
  color: #2563eb;
  text-decoration: none;
}

.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.navbar-brand .brand-text {
  display: none;
}

@media (min-width: 576px) {
  .navbar-brand .brand-text {
    display: inline;
  }
}

.search-form {
  width: 100%;
  max-width: 500px;
}

.search-form .input-group {
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-form .form-control {
  border: 2px solid #e0e0e0;
  border-right: none;
  padding: 8px 16px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-form .form-control:focus {
  border-color: #2563eb;
  box-shadow: none;
}

.search-form .btn {
  border-radius: 0 25px 25px 0;
  padding: 8px 20px;
  background: #2563eb;
  border: 2px solid #2563eb;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounceIn 0.3s ease;
}

.user-avatar {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: #4a5568;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #2563eb;
}

.nav-link i {
  font-size: 1.1rem;
}

.dropdown-menu {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
}

.dropdown-item {
  padding: 8px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4a5568;
}

.dropdown-item:hover {
  background: #f7fafc;
  color: #2563eb;
}

.dropdown-item i {
  font-size: 1rem;
  width: 20px;
}
</style>
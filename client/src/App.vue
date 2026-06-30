<template>
  <div id="app">
    <Header />
    <main>
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue';
import { useAuthStore } from './store/auth';
import { useCartStore } from './store/cart';
import Header from './components/common/Header.vue'
import Footer from './components/common/Footer.vue'

const authStore = useAuthStore();
const cartStore = useCartStore();

// ============================================
// WATCH VỚI IMMEDIATE: TRUE
// ============================================

// 1. Theo dõi auth state - chạy ngay
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    console.log('🔐 Auth state changed:', isAuthenticated);
    if (isAuthenticated) {
      cartStore.loadCart();
    }
  },
  { immediate: true }
);

// 2. Theo dõi user - chạy ngay
watch(
  () => authStore.user,
  (user) => {
    if (user) {
      console.log('👤 User logged in:', user.email);
    }
  },
  { immediate: true, deep: true }
);

// 3. Theo dõi cart items
watch(
  () => cartStore.items,
  (items) => {
    console.log('🛒 Cart updated:', items?.length || 0);
  },
  { immediate: true, deep: true }
);

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  console.log('🚀 App mounted');
  // Load cart if user is authenticated
  if (authStore.isAuthenticated) {
    cartStore.loadCart();
  }
});
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
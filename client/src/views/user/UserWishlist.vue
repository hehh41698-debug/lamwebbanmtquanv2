<template>
  <div class="user-wishlist">
    <h5 class="mb-4"><i class="bi bi-heart me-2"></i>Sản phẩm yêu thích</h5>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="wishlist.length === 0" class="text-center py-5">
      <i class="bi bi-heart fs-1 text-muted"></i>
      <p class="mt-2">Chưa có sản phẩm yêu thích</p>
      <router-link to="/products" class="btn btn-primary btn-sm">
        <i class="bi bi-cart"></i> Khám phá sản phẩm
      </router-link>
    </div>

    <div v-else class="row g-4">
      <div v-for="item in wishlist" :key="item._id" class="col-md-4 col-6">
        <div class="wishlist-item">
          <img :src="item.product?.images?.[0] || '/images/no-image.png'" :alt="item.product?.name">
          <div class="wishlist-info">
            <h6>{{ item.product?.name }}</h6>
            <div class="wishlist-price">{{ formatPrice(item.product?.price) }}</div>
          </div>
          <button class="btn btn-sm btn-danger remove-btn" @click="removeFromWishlist(item._id)">
            <i class="bi bi-heart-fill"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useWishlistStore } from '../../store/wishlist';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const wishlistStore = useWishlistStore();

const wishlist = computed(() => wishlistStore.items);
const loading = computed(() => wishlistStore.loading);

const removeFromWishlist = async (id) => {
  const result = await wishlistStore.removeItem(id);
  if (result.success) {
    toast.success('Đã xóa khỏi danh sách yêu thích');
  }
};

onMounted(() => {
  wishlistStore.fetchWishlist();
});
</script>

<style scoped>
.user-wishlist { padding: 0.5rem; }

.wishlist-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  position: relative;
  text-align: center;
  transition: all 0.3s;
}
.wishlist-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

.wishlist-item img {
  width: 100%;
  height: 120px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

.wishlist-info h6 {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.wishlist-price { font-weight: 600; color: #2563eb; }

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  font-size: 0.75rem;
}
</style>
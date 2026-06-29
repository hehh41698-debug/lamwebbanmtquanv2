<template>
  <div class="user-wishlist">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-3">
          <UserSidebar />
        </div>
        <div class="col-lg-9">
          <div class="wishlist-content">
            <h5 class="mb-4">
              <i class="bi bi-heart text-danger me-2"></i>Sản phẩm yêu thích
              <span v-if="wishlistCount > 0" class="badge bg-danger ms-2">{{ wishlistCount }} sản phẩm</span>
            </h5>

            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>

            <div v-else-if="wishlistItems.length === 0" class="text-center py-5">
              <i class="bi bi-heart fs-1 text-muted"></i>
              <h5 class="mt-3">Chưa có sản phẩm yêu thích</h5>
              <p class="text-muted">Khám phá và thêm sản phẩm bạn yêu thích</p>
              <router-link to="/products" class="btn btn-primary">
                <i class="bi bi-cart"></i> Khám phá sản phẩm
              </router-link>
            </div>

            <div v-else class="row g-4">
              <div v-for="item in wishlistItems" :key="item._id" class="col-md-4 col-6">
                <div class="wishlist-item">
                  <div class="wishlist-item-image">
                    <img 
                      :src="item.product?.images?.[0] || '/images/no-image.png'" 
                      :alt="item.product?.name"
                      @error="handleImageError"
                    >
                    <button 
                      class="btn-remove" 
                      @click="removeItem(item._id)"
                      title="Xóa khỏi yêu thích"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="wishlist-item-overlay">
                      <router-link :to="`/product/${item.product?._id}`" class="btn btn-sm btn-primary">
                        <i class="bi bi-eye"></i> Xem chi tiết
                      </router-link>
                      <button 
                        class="btn btn-sm btn-success"
                        @click="addToCart(item.product)"
                        :disabled="item.product?.stock === 0"
                      >
                        <i class="bi bi-cart-plus"></i> Thêm
                      </button>
                    </div>
                  </div>
                  <div class="wishlist-item-info">
                    <h6 class="wishlist-item-name">{{ truncateText(item.product?.name, 30) }}</h6>
                    <div class="wishlist-item-price">{{ formatPrice(item.product?.price) }}</div>
                    <div class="wishlist-item-stock">
                      <span :class="['badge', item.product?.stock > 0 ? 'bg-success' : 'bg-danger']">
                        {{ item.product?.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}
                      </span>
                    </div>
                  </div>
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
import { useWishlistStore } from '../../store/wishlist';
import { useCartStore } from '../../store/cart';
import UserSidebar from '../../components/user/UserSidebar.vue';
import { formatPrice, truncateText } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();
const cartStore = useCartStore();

const wishlistItems = computed(() => wishlistStore.items);
const wishlistCount = computed(() => wishlistStore.wishlistCount);
const loading = computed(() => wishlistStore.loading);

const removeItem = async (itemId) => {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) return;
  const result = await wishlistStore.removeFromWishlist(itemId);
  if (result.success) {
    toast.success('Đã xóa khỏi danh sách yêu thích');
  }
};

const addToCart = async (product) => {
  if (!product) return;
  if (product.stock === 0) {
    toast.warning('Sản phẩm đã hết hàng');
    return;
  }
  
  const result = await cartStore.addToCart(product._id, 1);
  if (result.success) {
    toast.success('Đã thêm vào giỏ hàng');
  } else {
    toast.error(result.message || 'Không thể thêm vào giỏ hàng');
  }
};

const handleImageError = (event) => {
  event.target.src = '/images/no-image.png';
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  wishlistStore.fetchWishlist();
});
</script>

<style scoped>
.user-wishlist {
  background: #f8fafc;
  min-height: 100vh;
}

.wishlist-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.wishlist-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
  height: 100%;
}

.wishlist-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.wishlist-item-image {
  position: relative;
  padding-top: 75%;
  background: #f8fafc;
  overflow: hidden;
}

.wishlist-item-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
  transition: transform 0.3s;
}

.wishlist-item:hover .wishlist-item-image img {
  transform: scale(1.05);
}

.btn-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.9);
  color: #ef4444;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-remove:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

.wishlist-item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 20px 12px 12px;
  display: flex;
  gap: 8px;
  justify-content: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s;
}

.wishlist-item:hover .wishlist-item-overlay {
  opacity: 1;
  transform: translateY(0);
}

.wishlist-item-overlay .btn {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
}

.wishlist-item-info {
  padding: 1rem;
}

.wishlist-item-name {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  min-height: 40px;
}

.wishlist-item-price {
  font-weight: 600;
  color: #2563eb;
  font-size: 1rem;
}

.wishlist-item-stock {
  margin-top: 4px;
}

.wishlist-item-stock .badge {
  font-size: 10px;
  padding: 2px 10px;
}

@media (max-width: 768px) {
  .wishlist-content {
    padding: 1rem;
  }
}
</style>
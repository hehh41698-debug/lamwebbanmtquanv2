<template>
  <div class="cart-page py-4">
    <div class="container">
      <h4 class="mb-4">
        <i class="bi bi-cart3 me-2"></i>Giỏ hàng
        <span v-if="totalItems > 0" class="badge bg-primary ms-2">{{ totalItems }} sản phẩm</span>
      </h4>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="items.length === 0" class="empty-cart text-center py-5">
        <i class="bi bi-cart-x fs-1 text-muted"></i>
        <h5 class="mt-3">Giỏ hàng trống</h5>
        <p class="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <router-link to="/products" class="btn btn-primary">
          <i class="bi bi-arrow-left"></i> Tiếp tục mua sắm
        </router-link>
      </div>

      <!-- Cart Content -->
      <div v-else class="row g-4">
        <div class="col-lg-8">
          <div class="cart-items">
            <div v-for="item in items" :key="item._id" class="cart-item">
              <img 
                :src="item.product?.images?.[0] || '/images/no-image.png'" 
                class="cart-item-image"
                :alt="item.product?.name"
              >
              <div class="cart-item-info">
                <h6>{{ item.product?.name }}</h6>
                <span class="text-muted">{{ item.product?.brand }}</span>
                <div class="cart-item-price">
                  {{ formatPrice(item.product?.discount 
                    ? item.product.price * (1 - item.product.discount / 100) 
                    : item.product?.price) }}
                </div>
              </div>
              <div class="cart-item-actions">
                <div class="quantity-control">
                  <button 
                    class="btn btn-sm btn-outline-secondary" 
                    @click="updateQuantity(item._id, item.quantity - 1)" 
                    :disabled="item.quantity <= 1"
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button 
                    class="btn btn-sm btn-outline-secondary" 
                    @click="updateQuantity(item._id, item.quantity + 1)"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
                <button class="btn btn-sm btn-danger" @click="removeItem(item._id)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <button class="btn btn-outline-danger mt-3" @click="clearCart">
            <i class="bi bi-trash"></i> Xóa tất cả
          </button>
        </div>

        <div class="col-lg-4">
          <div class="cart-summary">
            <h6 class="mb-3">Tóm tắt đơn hàng</h6>
            <div class="summary-item">
              <span>Số lượng sản phẩm</span>
              <span>{{ totalItems }}</span>
            </div>
            <div class="summary-item">
              <span>Tạm tính</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="summary-item">
              <span>Phí vận chuyển</span>
              <span>{{ formatPrice(shipping) }}</span>
            </div>
            <hr>
            <div class="summary-total">
              <span>Tổng cộng</span>
              <span>{{ formatPrice(total) }}</span>
            </div>
            <button 
              class="btn btn-primary w-100 mt-3" 
              @click="checkout"
              :disabled="items.length === 0"
            >
              <i class="bi bi-credit-card"></i> Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const items = computed(() => cartStore.items);
const totalItems = computed(() => cartStore.totalItems);
const subtotal = computed(() => cartStore.subtotal);
const shipping = computed(() => cartStore.shipping);
const total = computed(() => cartStore.total);
const loading = computed(() => cartStore.loading);

const updateQuantity = async (itemId, quantity) => {
  if (quantity < 1) return;
  const result = await cartStore.updateQuantity(itemId, quantity);
  if (!result.success) {
    toast.error(result.message);
  }
};

const removeItem = async (itemId) => {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
  await cartStore.removeItem(itemId);
};

const clearCart = async () => {
  if (!confirm('Bạn có chắc muốn xóa tất cả?')) return;
  await cartStore.clearCart();
  toast.success('Đã xóa giỏ hàng');
};

const checkout = () => {
  if (!authStore.isAuthenticated) {
    toast.warning('Vui lòng đăng nhập để thanh toán');
    router.push('/login');
    return;
  }
  router.push('/checkout');
};

onMounted(() => {
  cartStore.loadCart();
});
</script>

<style scoped>
.cart-page { background: #f8fafc; min-height: 100vh; }

.empty-cart {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s;
}

.cart-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background: #f8fafc;
}

.cart-item-info { flex: 1; }
.cart-item-info h6 { margin-bottom: 0.25rem; }
.cart-item-price { font-weight: 600; color: #2563eb; }

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

.quantity-control .quantity { min-width: 30px; text-align: center; font-weight: 600; }

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: sticky;
  top: 100px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #4a5568;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1a202c;
}

@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
    padding: 0.75rem;
  }
  .cart-item-image {
    width: 60px;
    height: 60px;
  }
  .cart-item-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .cart-summary {
    position: relative;
    top: 0;
  }
}
</style>
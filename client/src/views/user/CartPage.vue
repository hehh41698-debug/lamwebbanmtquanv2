<template>
  <div class="cart-page py-4">
    <div class="container">
      <h4 class="mb-4">
        <i class="bi bi-cart3 me-2"></i>Giỏ hàng
      </h4>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="cartItems.length === 0" class="empty-cart text-center py-5">
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
            <CartItem 
              v-for="item in cartItems" 
              :key="item._id"
              :item="item"
              @update="updateQuantity"
              @remove="removeItem"
            />
          </div>
          <div class="mt-3">
            <button class="btn btn-outline-danger" @click="clearCart">
              <i class="bi bi-trash"></i> Xóa tất cả
            </button>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="cart-summary">
            <h6 class="mb-3">Tóm tắt đơn hàng</h6>
            <div class="summary-item">
              <span>Tổng số sản phẩm</span>
              <span>{{ totalItems }}</span>
            </div>
            <div class="summary-item">
              <span>Tạm tính</span>
              <span>{{ formatPrice(totalPrice) }}</span>
            </div>
            <div class="summary-item">
              <span>Phí vận chuyển</span>
              <span>{{ formatPrice(shippingFee) }}</span>
            </div>
            <div class="summary-item" v-if="discount > 0">
              <span>Giảm giá</span>
              <span class="text-danger">-{{ formatPrice(discount) }}</span>
            </div>
            <hr>
            <div class="summary-total">
              <span>Tổng cộng</span>
              <span>{{ formatPrice(totalPrice + shippingFee - discount) }}</span>
            </div>

            <!-- Coupon -->
            <div class="coupon-section mt-3">
              <div class="input-group">
                <input type="text" class="form-control" v-model="couponCode" placeholder="Nhập mã giảm giá">
                <button class="btn btn-outline-primary" @click="applyCoupon">Áp dụng</button>
              </div>
            </div>

            <button class="btn btn-primary w-100 mt-3" @click="checkout" :disabled="cartItems.length === 0">
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
import CartItem from '../../components/user/CartItem.vue';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const cartItems = computed(() => cartStore.items);
const totalItems = computed(() => cartStore.totalItems);
const totalPrice = computed(() => cartStore.totalPrice);
const loading = computed(() => cartStore.loading);

const shippingFee = ref(30000);
const discount = ref(0);
const couponCode = ref('');

const updateQuantity = async (itemId, quantity) => {
  const result = await cartStore.updateQuantity(itemId, quantity);
  if (!result.success) {
    toast.error(result.message);
  }
};

const removeItem = async (itemId) => {
  const result = await cartStore.removeItem(itemId);
  if (result.success) {
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  } else {
    toast.error(result.message);
  }
};

const clearCart = async () => {
  if (!confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) return;
  
  const result = await cartStore.clearCart();
  if (result.success) {
    toast.success('Đã xóa tất cả sản phẩm');
  } else {
    toast.error(result.message);
  }
};

const applyCoupon = () => {
  if (!couponCode.value) {
    toast.warning('Vui lòng nhập mã giảm giá');
    return;
  }
  
  // TODO: Implement coupon validation
  if (couponCode.value === 'SAVE10') {
    discount.value = totalPrice.value * 0.1;
    toast.success('Áp dụng mã giảm giá thành công!');
  } else {
    toast.error('Mã giảm giá không hợp lệ');
  }
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
.cart-page {
  background: #f8fafc;
  min-height: 100vh;
}

.empty-cart {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 100px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #4a5568;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1a202c;
}

.summary-total .total-amount {
  color: #2563eb;
}

.coupon-section .input-group {
  border-radius: 8px;
  overflow: hidden;
}

.coupon-section .form-control {
  border: 1px solid #e2e8f0;
}

.coupon-section .form-control:focus {
  border-color: #2563eb;
  box-shadow: none;
}

@media (max-width: 992px) {
  .cart-summary {
    position: relative;
    top: 0;
  }
}
</style>
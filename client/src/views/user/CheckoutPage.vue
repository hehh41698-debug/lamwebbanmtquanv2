<template>
  <div class="checkout-page py-4">
    <div class="container">
      <h4 class="mb-4">
        <i class="bi bi-credit-card me-2"></i>Thanh toán
      </h4>

      <div class="row g-4">
        <!-- Checkout Form -->
        <div class="col-lg-8">
          <div class="checkout-form">
            <h6 class="mb-3">Thông tin giao hàng</h6>
            <form @submit.prevent="placeOrder">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.name" 
                    required
                    placeholder="Nguyễn Văn A"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    v-model="form.phone" 
                    required
                    placeholder="0123456789"
                  >
                </div>
                <div class="col-12">
                  <label class="form-label">Email <span class="text-danger">*</span></label>
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="form.email" 
                    required
                    placeholder="example@email.com"
                  >
                </div>
                <div class="col-12">
                  <label class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.address" 
                    required
                    placeholder="Số nhà, tên đường, phường/xã"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Thành phố <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.city" 
                    required
                    placeholder="TP. Hồ Chí Minh"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Mã bưu điện</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="form.zipCode" 
                    placeholder="700000"
                  >
                </div>
                <div class="col-12">
                  <label class="form-label">Ghi chú</label>
                  <textarea 
                    class="form-control" 
                    v-model="form.note" 
                    rows="3"
                    placeholder="Ghi chú cho đơn hàng..."
                  ></textarea>
                </div>
              </div>

              <hr>

              <h6 class="mb-3">Phương thức thanh toán</h6>
              <div class="payment-methods">
                <div 
                  v-for="(label, value) in PAYMENT_METHOD_LABELS" 
                  :key="value" 
                  class="payment-option"
                  :class="{ active: form.paymentMethod === value }"
                  @click="form.paymentMethod = value"
                >
                  <input 
                    type="radio" 
                    :id="value" 
                    :value="value" 
                    v-model="form.paymentMethod"
                  >
                  <label :for="value">
                    <i :class="PAYMENT_METHOD_ICONS[value]"></i>
                    {{ label }}
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="col-lg-4">
          <div class="order-summary">
            <h6 class="mb-3">Đơn hàng của bạn</h6>
            
            <div v-for="item in items" :key="item._id" class="order-item">
              <img 
                :src="item.product?.images?.[0] || '/images/no-image.png'" 
                :alt="item.product?.name"
              >
              <div>
                <div class="order-item-name">{{ truncateText(item.product?.name, 25) }}</div>
                <div class="order-item-meta">{{ item.quantity }} x {{ formatPrice(item.product?.price) }}</div>
              </div>
              <div class="order-item-price">
                {{ formatPrice((item.product?.discount 
                  ? item.product.price * (1 - item.product.discount / 100) 
                  : item.product?.price) * item.quantity) }}
              </div>
            </div>

            <hr>

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
              @click="placeOrder" 
              :disabled="submitting || items.length === 0"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-check2"></i> 
              {{ submitting ? 'Đang xử lý...' : 'Đặt hàng' }}
            </button>

            <div v-if="errorMessage" class="alert alert-danger mt-3">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { useOrderStore } from '../../store/order';
import { formatPrice, truncateText } from '../../utils/helpers';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_ICONS } from '../../utils/constants';
import { toast } from 'vue3-toastify';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const orderStore = useOrderStore();

const items = computed(() => cartStore.items);
const subtotal = computed(() => cartStore.subtotal);
const shipping = computed(() => cartStore.shipping);
const total = computed(() => cartStore.total);

const submitting = ref(false);
const errorMessage = ref('');

const form = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  zipCode: '',
  note: '',
  paymentMethod: 'cod'
});

const placeOrder = async () => {
  // Reset error
  errorMessage.value = '';

  // Validate
  if (!form.name || !form.phone || !form.email || !form.address || !form.city) {
    errorMessage.value = 'Vui lòng điền đầy đủ thông tin giao hàng';
    toast.warning(errorMessage.value);
    return;
  }

  if (!authStore.isAuthenticated) {
    errorMessage.value = 'Vui lòng đăng nhập để đặt hàng';
    toast.warning(errorMessage.value);
    router.push('/login');
    return;
  }

  if (items.value.length === 0) {
    errorMessage.value = 'Giỏ hàng trống';
    toast.warning(errorMessage.value);
    router.push('/cart');
    return;
  }

  submitting.value = true;

  try {
    // Chuẩn bị dữ liệu đơn hàng
    const orderData = {
      shippingAddress: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        zipCode: form.zipCode || ''
      },
      paymentMethod: form.paymentMethod,
      note: form.note || '',
      items: items.value.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100) 
          : item.product.price,
        name: item.product.name,
        image: item.product.images?.[0] || ''
      })),
      total: total.value
    };

    console.log('📦 Order Data:', orderData);

    // Gọi API tạo đơn hàng
    const result = await orderStore.createOrder(orderData);
    
    if (result.success) {
      toast.success('Đặt hàng thành công!');
      await cartStore.clearCart();
      router.push('/dashboard/orders');
    } else {
      errorMessage.value = result.error || 'Đặt hàng thất bại';
      toast.error(errorMessage.value);
    }
  } catch (error) {
    console.error('❌ Place order error:', error);
    errorMessage.value = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    toast.error(errorMessage.value);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (items.value.length === 0) {
    toast.warning('Giỏ hàng trống');
    router.push('/cart');
    return;
  }
  
  // Load user info
  if (authStore.user) {
    form.name = authStore.user.name || '';
    form.email = authStore.user.email || '';
    form.phone = authStore.user.phone || '';
    form.address = authStore.user.address?.street || '';
    form.city = authStore.user.address?.city || '';
  }
});
</script>

<style scoped>
.checkout-page {
  background: #f8fafc;
  min-height: 100vh;
}

.checkout-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #2563eb;
  background: #f8fafc;
}

.payment-option.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.payment-option input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
  cursor: pointer;
}

.payment-option label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin: 0;
}

.payment-option label i {
  font-size: 1.2rem;
}

.order-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: sticky;
  top: 100px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 8px;
  background: #f8fafc;
}

.order-item-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.order-item-meta {
  font-size: 0.8rem;
  color: #94a3b8;
}

.order-item-price {
  margin-left: auto;
  font-weight: 600;
  color: #2563eb;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: #4a5568;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1a202c;
}

.alert {
  border-radius: 8px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .checkout-form {
    padding: 1rem;
  }
  
  .order-summary {
    position: relative;
    top: 0;
  }
}
</style>
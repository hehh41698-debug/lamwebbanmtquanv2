<template>
  <div class="product-card" @click="navigateToDetail">
    <div class="product-image-wrapper">
      <img 
        :src="product.images?.[0] || '/images/no-image.png'" 
        class="product-image"
        :alt="product.name"
        @error="handleImageError"
      >
      <div class="product-badge" v-if="product.discount > 0">
        -{{ product.discount }}%
      </div>
      <div class="product-badge stock" v-else-if="product.stock === 0">
        Hết hàng
      </div>
      <div class="product-overlay">
        <button class="btn btn-primary btn-sm" @click.stop="quickView">
          <i class="bi bi-eye"></i> Xem nhanh
        </button>
        <button 
          class="btn btn-success btn-sm" 
          @click.stop="addToCart"
          :disabled="product.stock === 0 || adding"
        >
          <span v-if="adding" class="spinner-border spinner-border-sm me-1"></span>
          <i class="bi bi-cart-plus"></i> Thêm
        </button>
      </div>
    </div>
    
    <div class="card-body">
      <div class="product-brand">{{ product.brand }}</div>
      <h6 class="product-title">{{ truncateText(product.name, 40) }}</h6>
      
      <div class="product-rating">
        <div class="stars">
          <i 
            v-for="n in 5" 
            :key="n" 
            class="bi bi-star-fill"
            :class="{ 'text-warning': n <= Math.round(product.rating || 0), 'text-secondary': n > Math.round(product.rating || 0) }"
          ></i>
        </div>
        <span class="rating-count">({{ product.rating || 0 }})</span>
      </div>
      
      <div class="product-price">
        <span class="current-price" v-if="product.discount > 0">
          {{ formatPrice(product.price * (1 - product.discount / 100)) }}
        </span>
        <span class="current-price" v-else>
          {{ formatPrice(product.price) }}
        </span>
        <span class="old-price" v-if="product.discount > 0">
          {{ formatPrice(product.price) }}
        </span>
      </div>
      
      <div class="product-stock">
        <span class="badge bg-success" v-if="product.stock > 10">Còn hàng</span>
        <span class="badge bg-warning" v-else-if="product.stock > 0">Sắp hết</span>
        <span class="badge bg-danger" v-else>Hết hàng</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { formatPrice, truncateText } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['quick-view']);

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const adding = ref(false);

const navigateToDetail = () => {
  router.push(`/product/${props.product._id}`);
};

const quickView = () => {
  emit('quick-view', props.product);
};

const addToCart = async () => {
  if (props.product.stock === 0) {
    toast.warning('Sản phẩm đã hết hàng');
    return;
  }

  // Kiểm tra đăng nhập
  if (!authStore.isAuthenticated) {
    toast.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
    router.push('/login');
    return;
  }

  adding.value = true;
  
  try {
    console.log('🛒 Adding to cart:', props.product._id);
    
    const result = await cartStore.addToCart(props.product._id, 1);
    console.log('📦 Add to cart result:', result);
    
    if (result.success) {
      toast.success('Đã thêm vào giỏ hàng!');
    } else {
      toast.error(result.message || 'Không thể thêm vào giỏ hàng');
    }
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    toast.error('Đã có lỗi xảy ra');
  } finally {
    adding.value = false;
  }
};

const handleImageError = (event) => {
  event.target.src = '/images/no-image.png';
};
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.product-image-wrapper {
  position: relative;
  overflow: hidden;
  padding-top: 75%;
  background: #f8fafc;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #ef4444;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  z-index: 2;
}

.product-badge.stock {
  background: #6b7280;
}

.product-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px 15px 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.product-card:hover .product-overlay {
  transform: translateY(0);
}

.product-overlay .btn {
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 20px;
}

.card-body {
  padding: 1rem;
}

.product-brand {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #1a202c;
  line-height: 1.4;
  min-height: 40px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  font-size: 13px;
}

.rating-count {
  font-size: 12px;
  color: #94a3b8;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #2563eb;
}

.old-price {
  font-size: 14px;
  color: #94a3b8;
  text-decoration: line-through;
}

.product-stock {
  margin-top: 8px;
}

.product-stock .badge {
  font-size: 11px;
  padding: 4px 12px;
}

@media (max-width: 576px) {
  .product-title {
    font-size: 13px;
    min-height: 35px;
  }
  
  .current-price {
    font-size: 16px;
  }
  
  .product-overlay .btn {
    font-size: 11px;
    padding: 4px 10px;
  }
}
</style>
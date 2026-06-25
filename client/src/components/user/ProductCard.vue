<template>
  <div class="product-card card h-100 shadow-sm" @click="navigateToDetail">
    <div class="product-image-wrapper">
      <img 
        :src="product.images[0] || '/images/no-image.png'" 
        class="card-img-top product-image"
        :alt="product.name"
      >
      <div class="product-badge" v-if="product.discount > 0">
        -{{ product.discount }}%
      </div>
      <div class="product-overlay">
        <button class="btn btn-primary btn-sm" @click.stop="quickView">
          <i class="bi bi-eye"></i> Xem nhanh
        </button>
        <button class="btn btn-success btn-sm" @click.stop="addToCart">
          <i class="bi bi-cart-plus"></i> Thêm
        </button>
      </div>
    </div>
    
    <div class="card-body">
      <h6 class="product-title text-truncate">{{ product.name }}</h6>
      <div class="product-rating mb-1">
        <span class="stars">
          <i class="bi bi-star-fill text-warning" v-for="n in 5" :key="n" 
             :class="{'text-warning': n <= Math.round(product.rating), 'text-secondary': n > Math.round(product.rating)}"></i>
        </span>
        <span class="text-muted small">({{ product.rating || 0 }})</span>
      </div>
      <div class="product-price">
        <span class="current-price" v-if="product.discount > 0">
          {{ formatPrice(product.price * (1 - product.discount / 100)) }}
        </span>
        <span class="current-price" v-else>
          {{ formatPrice(product.price) }}
        </span>
        <span class="old-price text-muted" v-if="product.discount > 0">
          {{ formatPrice(product.price) }}
        </span>
      </div>
      <div class="product-stock">
        <span class="badge bg-success" v-if="product.stock > 0">Còn hàng</span>
        <span class="badge bg-danger" v-else>Hết hàng</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../store/cart'
import { formatPrice } from '../../utils/helpers'
import { toast } from 'vue3-toastify'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['quick-view'])
const router = useRouter()
const cartStore = useCartStore()

const navigateToDetail = () => {
  router.push(`/product/${props.product._id}`)
}

const quickView = () => {
  emit('quick-view', props.product)
}

const addToCart = async () => {
  const result = await cartStore.addToCart(props.product._id, 1)
  if (result.success) {
    toast.success('Đã thêm vào giỏ hàng')
  } else {
    toast.error(result.message)
  }
}
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.product-image-wrapper {
  position: relative;
  overflow: hidden;
  padding-top: 75%;
  background: #f8f9fa;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ef4444;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.product-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  padding: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.product-card:hover .product-overlay {
  transform: translateY(0);
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #2563eb;
}

.old-price {
  font-size: 14px;
  text-decoration: line-through;
}

.product-stock {
  margin-top: 8px;
}
</style>
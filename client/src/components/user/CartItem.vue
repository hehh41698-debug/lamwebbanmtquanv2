<template>
  <div class="cart-item">
    <div class="cart-item-image">
      <img 
        :src="item.product.images[0] || '/images/no-image.png'" 
        :alt="item.product.name"
        @error="handleImageError"
      >
    </div>
    
    <div class="cart-item-info">
      <h6 class="cart-item-title">{{ item.product.name }}</h6>
      <div class="cart-item-meta">
        <span class="brand">{{ item.product.brand }}</span>
        <span class="price">
          {{ formatPrice(item.product.discount 
            ? item.product.price * (1 - item.product.discount / 100) 
            : item.product.price) }}
        </span>
      </div>
    </div>
    
    <div class="cart-item-actions">
      <div class="quantity-control">
        <button 
          class="btn btn-outline-secondary btn-sm"
          @click="updateQuantity(item.quantity - 1)"
          :disabled="item.quantity <= 1"
        >
          <i class="bi bi-dash"></i>
        </button>
        <span class="quantity">{{ item.quantity }}</span>
        <button 
          class="btn btn-outline-secondary btn-sm"
          @click="updateQuantity(item.quantity + 1)"
          :disabled="item.quantity >= item.product.stock"
        >
          <i class="bi bi-plus"></i>
        </button>
      </div>
      
      <div class="item-total">
        {{ formatPrice((item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100) 
          : item.product.price) * item.quantity) }}
      </div>
      
      <button class="btn btn-danger btn-sm remove-btn" @click="removeItem">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update', 'remove']);

const updateQuantity = (quantity) => {
  if (quantity < 1) return;
  if (quantity > props.item.product.stock) {
    toast.warning('Số lượng vượt quá tồn kho');
    return;
  }
  emit('update', props.item._id, quantity);
};

const removeItem = () => {
  if (confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
    emit('remove', props.item._id);
  }
};

const handleImageError = (event) => {
  event.target.src = '/images/no-image.png';
};
</script>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.cart-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.cart-item-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #1a202c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.cart-item-meta .brand {
  font-size: 12px;
  color: #94a3b8;
}

.cart-item-meta .price {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
}

.quantity-control .btn {
  width: 30px;
  height: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.quantity-control .quantity {
  min-width: 30px;
  text-align: center;
  font-weight: 600;
}

.item-total {
  font-size: 16px;
  font-weight: 700;
  color: #1a202c;
  min-width: 100px;
  text-align: right;
}

.remove-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .cart-item-image {
    width: 60px;
    height: 60px;
  }
  
  .cart-item-title {
    font-size: 13px;
  }
  
  .cart-item-actions {
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
  }
  
  .item-total {
    min-width: auto;
    font-size: 14px;
  }
}
</style>
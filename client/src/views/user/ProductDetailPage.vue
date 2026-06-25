<template>
  <div class="product-detail-page py-4">
    <div class="container">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="!product" class="text-center py-5">
        <i class="bi bi-exclamation-triangle fs-1 text-warning"></i>
        <h5 class="mt-3">Không tìm thấy sản phẩm</h5>
        <router-link to="/products" class="btn btn-primary">
          <i class="bi bi-arrow-left"></i> Quay lại
        </router-link>
      </div>

      <div v-else>
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
            <li class="breadcrumb-item"><router-link to="/products">Sản phẩm</router-link></li>
            <li class="breadcrumb-item active">{{ product.name }}</li>
          </ol>
        </nav>

        <div class="row g-4">
          <!-- Product Images -->
          <div class="col-lg-6">
            <div class="product-image-main">
              <img :src="selectedImage || product.images[0] || '/images/no-image.png'" :alt="product.name">
            </div>
            <div class="product-image-thumbs" v-if="product.images.length > 1">
              <img 
                v-for="(img, idx) in product.images" 
                :key="idx"
                :src="img"
                :alt="'Image ' + (idx + 1)"
                :class="{ active: selectedImage === img || (!selectedImage && idx === 0) }"
                @click="selectedImage = img"
              >
            </div>
          </div>

          <!-- Product Info -->
          <div class="col-lg-6">
            <h4 class="product-title">{{ product.name }}</h4>
            <p class="product-brand">{{ product.brand }}</p>

            <div class="product-rating">
              <div class="stars">
                <i v-for="n in 5" :key="n" class="bi bi-star-fill"
                   :class="{ 'text-warning': n <= Math.round(product.rating), 'text-secondary': n > Math.round(product.rating) }"></i>
              </div>
              <span class="rating-text">({{ product.rating || 0 }} đánh giá)</span>
            </div>

            <div class="product-price">
              <span class="current-price">
                {{ formatPrice(product.discount ? product.price * (1 - product.discount / 100) : product.price) }}
              </span>
              <span class="old-price" v-if="product.discount > 0">
                {{ formatPrice(product.price) }}
              </span>
              <span class="discount-badge" v-if="product.discount > 0">
                -{{ product.discount }}%
              </span>
            </div>

            <div class="product-stock">
              <span :class="['badge', product.stock > 0 ? 'bg-success' : 'bg-danger']">
                {{ product.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}
              </span>
              <span v-if="product.stock > 0" class="stock-count">
                Còn {{ product.stock }} sản phẩm
              </span>
            </div>

            <div class="product-description">
              <h6>Mô tả</h6>
              <p>{{ product.description }}</p>
            </div>

            <div class="product-actions">
              <div class="quantity-selector">
                <button class="btn btn-outline-secondary" @click="quantity--" :disabled="quantity <= 1">
                  <i class="bi bi-dash"></i>
                </button>
                <span class="quantity">{{ quantity }}</span>
                <button class="btn btn-outline-secondary" @click="quantity++" :disabled="quantity >= product.stock">
                  <i class="bi bi-plus"></i>
                </button>
              </div>
              <button class="btn btn-primary flex-grow-1" @click="addToCart" :disabled="product.stock === 0 || addingToCart">
                <span v-if="addingToCart" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-cart-plus"></i> Thêm vào giỏ hàng
              </button>
              <button class="btn btn-success flex-grow-1" @click="buyNow" :disabled="product.stock === 0">
                <i class="bi bi-lightning"></i> Mua ngay
              </button>
            </div>

            <!-- Specs -->
            <div class="product-specs" v-if="product.specs">
              <h6>Thông số kỹ thuật</h6>
              <div class="specs-grid">
                <div v-for="(value, key) in product.specs" :key="key" class="spec-item">
                  <span class="spec-label">{{ formatSpecLabel(key) }}</span>
                  <span class="spec-value">{{ value || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews -->
        <div class="reviews-section mt-5">
          <h5 class="mb-4">Đánh giá sản phẩm</h5>
          <div v-if="!authStore.isAuthenticated" class="text-center py-3">
            <p class="text-muted">Vui lòng <router-link to="/login">đăng nhập</router-link> để đánh giá sản phẩm</p>
          </div>
          <div v-else class="review-form mb-4">
            <h6>Viết đánh giá</h6>
            <div class="mb-2">
              <RatingStars v-model="reviewRating" />
            </div>
            <div class="mb-2">
              <textarea class="form-control" v-model="reviewComment" rows="3" placeholder="Chia sẻ trải nghiệm của bạn..."></textarea>
            </div>
            <button class="btn btn-primary" @click="submitReview" :disabled="submittingReview">
              <span v-if="submittingReview" class="spinner-border spinner-border-sm me-2"></span>
              Gửi đánh giá
            </button>
          </div>

          <div v-if="reviews.length === 0" class="text-center py-4 text-muted">
            <i class="bi bi-chat-dots fs-3 d-block"></i>
            Chưa có đánh giá nào
          </div>
          <div v-else>
            <ReviewItem 
              v-for="review in reviews" 
              :key="review._id"
              :review="review"
              @delete="handleDeleteReview"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../../store/product';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';
import { useReviewStore } from '../../store/review';
import RatingStars from '../../components/user/RatingStars.vue';
import ReviewItem from '../../components/user/ReviewItem.vue';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const reviewStore = useReviewStore();

const product = computed(() => productStore.product);
const loading = computed(() => productStore.loading);
const reviews = computed(() => reviewStore.reviews);

const selectedImage = ref('');
const quantity = ref(1);
const addingToCart = ref(false);
const reviewRating = ref(0);
const reviewComment = ref('');
const submittingReview = ref(false);

const formatSpecLabel = (key) => {
  const labels = {
    processor: 'CPU',
    ram: 'RAM',
    storage: 'Ổ cứng',
    display: 'Màn hình',
    graphics: 'Card đồ họa',
    os: 'Hệ điều hành',
    weight: 'Cân nặng',
    battery: 'Pin',
    ports: 'Cổng kết nối',
    color: 'Màu sắc'
  };
  return labels[key] || key;
};

const loadProduct = async () => {
  const id = route.params.id;
  const result = await productStore.fetchProductById(id);
  if (result.success) {
    selectedImage.value = product.value.images[0] || '';
    await reviewStore.fetchProductReviews(id);
  } else {
    toast.error('Không tìm thấy sản phẩm');
    router.push('/products');
  }
};

const addToCart = async () => {
  if (product.value.stock === 0) {
    toast.warning('Sản phẩm đã hết hàng');
    return;
  }
  
  addingToCart.value = true;
  const result = await cartStore.addToCart(product.value._id, quantity.value);
  if (result.success) {
    toast.success('Đã thêm vào giỏ hàng');
  } else {
    toast.error(result.message || 'Không thể thêm vào giỏ hàng');
  }
  addingToCart.value = false;
};

const buyNow = async () => {
  if (product.value.stock === 0) {
    toast.warning('Sản phẩm đã hết hàng');
    return;
  }
  
  if (!authStore.isAuthenticated) {
    toast.warning('Vui lòng đăng nhập để mua hàng');
    router.push('/login');
    return;
  }
  
  await cartStore.addToCart(product.value._id, quantity.value);
  router.push('/checkout');
};

const submitReview = async () => {
  if (!reviewRating.value) {
    toast.warning('Vui lòng chọn số sao');
    return;
  }
  if (!reviewComment.value.trim()) {
    toast.warning('Vui lòng nhập nội dung đánh giá');
    return;
  }
  
  submittingReview.value = true;
  const result = await reviewStore.createReview({
    productId: product.value._id,
    rating: reviewRating.value,
    comment: reviewComment.value
  });
  
  if (result.success) {
    toast.success('Đánh giá đã được gửi');
    reviewRating.value = 0;
    reviewComment.value = '';
    await reviewStore.fetchProductReviews(product.value._id);
    await productStore.fetchProductById(product.value._id);
  } else {
    toast.error(result.error || 'Gửi đánh giá thất bại');
  }
  submittingReview.value = false;
};

const handleDeleteReview = async (id) => {
  const result = await reviewStore.deleteReview(id);
  if (result.success) {
    toast.success('Đã xóa đánh giá');
    await reviewStore.fetchProductReviews(product.value._id);
    await productStore.fetchProductById(product.value._id);
  } else {
    toast.error(result.error || 'Xóa đánh giá thất bại');
  }
};

onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
.product-detail-page {
  background: #f8fafc;
  min-height: 100vh;
}

.breadcrumb {
  background: transparent;
  padding: 0;
}

.breadcrumb-item a {
  color: #2563eb;
  text-decoration: none;
}

.product-image-main {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.product-image-main img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-image-thumbs {
  display: flex;
  gap: 8px;
  margin-top: 1rem;
}

.product-image-thumbs img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.product-image-thumbs img.active {
  border-color: #2563eb;
}

.product-image-thumbs img:hover {
  border-color: #2563eb;
}

.product-title {
  font-weight: 700;
  color: #1a202c;
}

.product-brand {
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.5rem;
}

.product-rating .stars {
  display: flex;
  gap: 2px;
}

.product-rating .rating-text {
  color: #94a3b8;
  font-size: 0.9rem;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.5rem;
}

.product-price .current-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2563eb;
}

.product-price .old-price {
  font-size: 1.1rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.product-price .discount-badge {
  background: #ef4444;
  color: white;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.product-stock .badge {
  font-size: 0.875rem;
  padding: 4px 16px;
}

.stock-count {
  font-size: 0.875rem;
  color: #94a3b8;
}

.product-description {
  margin: 1.5rem 0;
}

.product-description h6 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.product-description p {
  color: #4a5568;
  line-height: 1.6;
}

.product-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  border: 1px solid #e2e8f0;
}

.quantity-selector .btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-selector .quantity {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
}

.product-actions .btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
}

.product-specs {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.product-specs h6 {
  font-weight: 600;
  margin-bottom: 1rem;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px 20px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}

.spec-item .spec-label {
  color: #94a3b8;
}

.spec-item .spec-value {
  font-weight: 500;
  color: #1a202c;
}

.reviews-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.review-form {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .product-image-main {
    height: 250px;
  }
  
  .product-price .current-price {
    font-size: 1.5rem;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .specs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
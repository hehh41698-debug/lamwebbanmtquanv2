<template>
  <div class="product-list">
    <!-- DEBUG: Hiển thị trạng thái -->
    <div class="debug-info" style="background: #e0f2fe; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #7dd3fc;">
      <strong>🔍 Debug:</strong>
      Sản phẩm: {{ products.length }} | 
      Đang tải: {{ loading }} | 
      Tổng: {{ total }} |
      Trang: {{ currentPage }}/{{ totalPages }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row g-4">
      <div v-for="n in 8" :key="n" class="col-6 col-md-3">
        <div class="skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="empty-state text-center py-5">
      <div class="empty-state-icon">
        <i class="bi bi-inbox display-1 text-muted"></i>
      </div>
      <h4 class="mt-3">Không tìm thấy sản phẩm</h4>
      <p class="text-muted">Vui lòng thử lại với bộ lọc khác hoặc tìm kiếm từ khóa khác</p>
      <button class="btn btn-primary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Đặt lại bộ lọc
      </button>
    </div>

    <!-- Product Grid -->
    <div v-else>
      <div class="product-list-header">
        <div class="product-count">
          <span class="fw-bold">{{ products.length }}</span> sản phẩm
          <span v-if="total > 0" class="text-muted">({{ total }} sản phẩm)</span>
        </div>
        <div class="view-options">
          <button 
            class="btn btn-outline-secondary btn-sm" 
            :class="{ active: viewMode === 'grid' }"
            @click="changeView('grid')"
          >
            <i class="bi bi-grid-3x3-gap"></i>
          </button>
          <button 
            class="btn btn-outline-secondary btn-sm" 
            :class="{ active: viewMode === 'list' }"
            @click="changeView('list')"
          >
            <i class="bi bi-list-ul"></i>
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="row g-4">
        <div 
          v-for="product in products" 
          :key="product._id" 
          class="col-6 col-md-4 col-lg-3"
        >
          <ProductCard :product="product" @quick-view="handleQuickView" />
        </div>
      </div>

      <!-- List View -->
      <div v-else class="list-view">
        <div 
          v-for="product in products" 
          :key="product._id" 
          class="list-view-item"
        >
          <div class="list-view-image">
            <img 
              :src="product.images[0] || '/images/no-image.png'" 
              :alt="product.name"
              @error="handleImageError"
            >
          </div>
          <div class="list-view-info">
            <h5 class="list-view-title">{{ product.name }}</h5>
            <div class="list-view-meta">
              <span class="brand">{{ product.brand }}</span>
              <span class="category">{{ product.category?.name || 'Chưa phân loại' }}</span>
            </div>
            <div class="list-view-rating">
              <div class="stars">
                <i 
                  v-for="n in 5" 
                  :key="n" 
                  class="bi bi-star-fill"
                  :class="{ 'text-warning': n <= Math.round(product.rating), 'text-secondary': n > Math.round(product.rating) }"
                ></i>
              </div>
              <span class="rating-count">({{ product.rating || 0 }})</span>
            </div>
            <p class="list-view-description">{{ truncateText(product.description, 120) }}</p>
            <div class="list-view-bottom">
              <div class="list-view-price">
                <span class="current-price">
                  {{ formatPrice(product.discount 
                    ? product.price * (1 - product.discount / 100) 
                    : product.price) }}
                </span>
                <span class="old-price" v-if="product.discount > 0">
                  {{ formatPrice(product.price) }}
                </span>
                <span class="discount-badge" v-if="product.discount > 0">
                  -{{ product.discount }}%
                </span>
              </div>
              <div class="list-view-actions">
                <button 
                  class="btn btn-primary btn-sm"
                  @click="addToCart(product)"
                  :disabled="product.stock === 0"
                >
                  <i class="bi bi-cart-plus"></i> Thêm vào giỏ
                </button>
                <button 
                  class="btn btn-outline-primary btn-sm"
                  @click="viewProduct(product)"
                >
                  <i class="bi bi-eye"></i> Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-wrapper">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li 
              v-for="page in visiblePages" 
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
        <div class="pagination-info">
          <span class="text-muted">
            Trang {{ currentPage }} / {{ totalPages }} 
            ({{ total }} sản phẩm)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ProductCard from './ProductCard.vue';
import { useCartStore } from '../../store/cart';
import { formatPrice, truncateText } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    default: 1
  },
  total: {
    type: Number,
    default: 0
  },
  limit: {
    type: Number,
    default: 12
  }
});

const emit = defineEmits(['page-change', 'quick-view', 'reset-filters']);

// Debug log khi props thay đổi
watch(() => props.products, (newVal) => {
  console.log('📦 ProductList received products:', newVal.length);
}, { immediate: true, deep: true });

const router = useRouter();
const cartStore = useCartStore();

const viewMode = ref('grid');

const visiblePages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, current - 2);
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const changePage = (page) => {
  if (page < 1 || page > props.totalPages) return;
  emit('page-change', page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const changeView = (mode) => {
  viewMode.value = mode;
  localStorage.setItem('productViewMode', mode);
};

const loadViewMode = () => {
  const saved = localStorage.getItem('productViewMode');
  if (saved && (saved === 'grid' || saved === 'list')) {
    viewMode.value = saved;
  }
};

const addToCart = async (product) => {
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

const viewProduct = (product) => {
  router.push(`/product/${product._id}`);
};

const handleQuickView = (product) => {
  emit('quick-view', product);
};

const resetFilters = () => {
  emit('reset-filters');
};

const handleImageError = (event) => {
  event.target.src = '/images/no-image.png';
};

watch(() => props.currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

onMounted(() => {
  loadViewMode();
  console.log('🔍 ProductList mounted, products:', props.products.length);
});
</script>

<style scoped>
/* ... giữ nguyên styles ... */
</style>
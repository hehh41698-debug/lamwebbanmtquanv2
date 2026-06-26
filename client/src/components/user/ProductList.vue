<template>
  <div class="product-list">
    <!-- Debug Info -->
    <div 
      v-if="showDebug" 
      class="debug-info"
      style="background: #e0f2fe; border: 1px solid #7dd3fc; color: #0369a1; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;"
    >
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
      <!-- View Options -->
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
              :src="product.images?.[0] || '/images/no-image.png'" 
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
                  :class="{ 'text-warning': n <= Math.round(product.rating || 0), 'text-secondary': n > Math.round(product.rating || 0) }"
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
  },
  showDebug: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['page-change', 'quick-view', 'reset-filters']);

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

watch(() => props.products, (newVal) => {
  console.log('📦 ProductList received products:', newVal?.length || 0);
}, { immediate: true, deep: true });

watch(() => props.currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

onMounted(() => {
  loadViewMode();
  console.log('🔍 ProductList mounted, products:', props.products?.length || 0);
});
</script>

<style scoped>
.product-list { width: 100%; }
.skeleton-card { background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.skeleton-image { width: 100%; padding-top: 75%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
.skeleton-text { height: 12px; margin-top: 12px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
.skeleton-text.short { width: 60%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.empty-state { background: white; border-radius: 12px; padding: 3rem 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.empty-state-icon { margin-bottom: 1rem; }
.empty-state .btn { margin-top: 1rem; }
.product-list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
.product-count { font-size: 0.95rem; color: #4a5568; }
.view-options { display: flex; gap: 4px; }
.view-options .btn { padding: 4px 10px; border-radius: 6px; }
.view-options .btn.active { background: #2563eb; color: white; border-color: #2563eb; }
.view-options .btn:hover:not(.active) { background: #f8fafc; }
.list-view { display: flex; flex-direction: column; gap: 1.5rem; }
.list-view-item { display: flex; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.3s; }
.list-view-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.list-view-image { width: 200px; min-height: 200px; flex-shrink: 0; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.list-view-image img { width: 100%; height: 100%; object-fit: contain; max-height: 180px; }
.list-view-info { flex: 1; padding: 1.5rem; display: flex; flex-direction: column; }
.list-view-title { font-size: 1.1rem; font-weight: 600; color: #1a202c; margin-bottom: 0.5rem; }
.list-view-meta { display: flex; gap: 1rem; margin-bottom: 0.75rem; font-size: 0.875rem; color: #94a3b8; }
.list-view-meta .brand { font-weight: 500; color: #4a5568; }
.list-view-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 0.75rem; }
.list-view-rating .stars { display: flex; gap: 2px; }
.list-view-rating .stars i { font-size: 14px; }
.list-view-description { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem; flex: 1; }
.list-view-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
.list-view-price { display: flex; align-items: center; gap: 10px; }
.list-view-price .current-price { font-size: 1.25rem; font-weight: 700; color: #2563eb; }
.list-view-price .old-price { font-size: 0.95rem; color: #94a3b8; text-decoration: line-through; }
.list-view-price .discount-badge { background: #ef4444; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.list-view-actions { display: flex; gap: 0.5rem; }
.pagination-wrapper { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; flex-wrap: wrap; gap: 1rem; }
.pagination { display: flex; gap: 4px; margin: 0; }
.pagination .page-link { display: flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; padding: 0 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #4a5568; transition: all 0.3s; cursor: pointer; }
.pagination .page-link:hover { background: #f8fafc; border-color: #2563eb; }
.pagination .page-item.active .page-link { background: #2563eb; border-color: #2563eb; color: white; }
.pagination .page-item.disabled .page-link { opacity: 0.5; cursor: not-allowed; }
.pagination-info { font-size: 0.875rem; color: #94a3b8; }
@media (max-width: 992px) { .list-view-image { width: 150px; min-height: 150px; } .list-view-image img { max-height: 130px; } }
@media (max-width: 768px) { .list-view-item { flex-direction: column; } .list-view-image { width: 100%; min-height: 120px; padding: 0.5rem; } .list-view-image img { max-height: 100px; } .list-view-info { padding: 1rem; } .list-view-bottom { flex-direction: column; align-items: stretch; } .list-view-actions { flex-direction: column; } .list-view-actions .btn { width: 100%; } .pagination-wrapper { flex-direction: column; align-items: center; } }
@media (max-width: 576px) { .product-list-header { flex-direction: column; align-items: stretch; } .product-count { text-align: center; } .view-options { justify-content: center; } }
</style>
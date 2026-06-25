<template>
  <div class="products-page">
    <div class="container py-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3">
          <Sidebar />
        </div>
        
        <!-- Products -->
        <div class="col-lg-9">
          <!-- Breadcrumb -->
          <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/">Trang chủ</router-link>
              </li>
              <li class="breadcrumb-item active">Sản phẩm</li>
            </ol>
          </nav>
          
          <!-- Debug Info -->
          <div 
            v-if="showDebug" 
            class="debug-info"
            style="background: #e0f2fe; border: 1px solid #7dd3fc; color: #0369a1; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;"
          >
            <strong>🔍 Debug:</strong> 
            Sản phẩm: {{ productStore.products.length }} | 
            Đang tải: {{ productStore.loading }} | 
            Tổng: {{ productStore.pagination.total }} |
            Trang: {{ productStore.pagination.page }}/{{ productStore.pagination.totalPages }}
          </div>
          
          <ProductList 
            :products="productStore.products"
            :loading="productStore.loading"
            :current-page="productStore.pagination.page"
            :total-pages="productStore.pagination.totalPages"
            :total="productStore.pagination.total"
            @page-change="handlePageChange"
            @quick-view="handleQuickView"
            @reset-filters="handleResetFilters"
          />
        </div>
      </div>
    </div>
    
    <!-- Quick View Modal -->
    <div v-if="quickViewProduct" class="quick-view-overlay" @click="closeQuickView">
      <div class="quick-view-modal" @click.stop>
        <button class="btn-close-modal" @click="closeQuickView">
          <i class="bi bi-x-lg"></i>
        </button>
        
        <div class="row g-4">
          <div class="col-md-6">
            <div class="quick-view-image">
              <img 
                :src="quickViewProduct.images?.[0] || '/images/no-image.png'" 
                :alt="quickViewProduct.name"
                @error="handleImageError"
              >
            </div>
            <div class="quick-view-thumbs" v-if="quickViewProduct.images?.length > 1">
              <img 
                v-for="(img, idx) in quickViewProduct.images.slice(1, 4)" 
                :key="idx"
                :src="img"
                :alt="'Image ' + (idx + 1)"
                @click="quickViewProduct.images[0] = img"
              >
            </div>
          </div>
          
          <div class="col-md-6">
            <h4 class="quick-view-title">{{ quickViewProduct.name }}</h4>
            <p class="quick-view-brand">{{ quickViewProduct.brand }}</p>
            
            <div class="quick-view-rating">
              <div class="stars">
                <i 
                  v-for="n in 5" 
                  :key="n" 
                  class="bi bi-star-fill"
                  :class="{ 'text-warning': n <= Math.round(quickViewProduct.rating || 0), 'text-secondary': n > Math.round(quickViewProduct.rating || 0) }"
                ></i>
              </div>
              <span>({{ quickViewProduct.rating || 0 }})</span>
            </div>
            
            <div class="quick-view-price">
              <span class="current-price">
                {{ formatPrice(quickViewProduct.discount 
                  ? quickViewProduct.price * (1 - quickViewProduct.discount / 100) 
                  : quickViewProduct.price) }}
              </span>
              <span class="old-price" v-if="quickViewProduct.discount > 0">
                {{ formatPrice(quickViewProduct.price) }}
              </span>
              <span class="discount-badge" v-if="quickViewProduct.discount > 0">
                -{{ quickViewProduct.discount }}%
              </span>
            </div>
            
            <div class="quick-view-stock">
              <span :class="['badge', quickViewProduct.stock > 0 ? 'bg-success' : 'bg-danger']">
                {{ quickViewProduct.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}
              </span>
              <span v-if="quickViewProduct.stock > 0" class="stock-count">
                Còn {{ quickViewProduct.stock }} sản phẩm
              </span>
            </div>
            
            <div class="quick-view-description">
              <p>{{ truncateText(quickViewProduct.description, 300) }}</p>
            </div>
            
            <div class="quick-view-specs" v-if="quickViewProduct.specs">
              <h6>Thông số kỹ thuật</h6>
              <div 
                v-for="(value, key) in quickViewProduct.specs" 
                :key="key" 
                class="spec-item"
                v-if="value"
              >
                <span class="spec-label">{{ formatSpecLabel(key) }}</span>
                <span class="spec-value">{{ value || 'N/A' }}</span>
              </div>
            </div>
            
            <div class="quick-view-actions">
              <button 
                class="btn btn-primary btn-lg flex-grow-1"
                @click="addToCart(quickViewProduct)"
                :disabled="quickViewProduct.stock === 0"
              >
                <i class="bi bi-cart-plus"></i> Thêm vào giỏ hàng
              </button>
              <button 
                class="btn btn-outline-primary btn-lg"
                @click="viewProduct(quickViewProduct)"
              >
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from '../../components/common/Sidebar.vue';
import ProductList from '../../components/user/ProductList.vue';
import { useProductStore } from '../../store/product';
import { useCartStore } from '../../store/cart';
import { formatPrice, truncateText } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

// ============================================
// COMPOSABLES
// ============================================
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();

// ============================================
// STATE
// ============================================
const quickViewProduct = ref(null);
const showDebug = ref(true); // Set to false to hide debug

// ============================================
// METHODS
// ============================================

// Format spec label
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

// Fetch products
const fetchProducts = async () => {
  console.log('🔄 Fetching products...');
  
  const params = {
    page: productStore.pagination.page || 1,
    limit: 12,
    ...route.query
  };
  
  console.log('📋 Params:', params);
  
  const result = await productStore.fetchProducts(params);
  console.log('📦 Result:', result);
  
  if (result.success) {
    console.log('✅ Products loaded:', result.data?.products?.length || 0);
  } else {
    console.error('❌ Failed to load products:', result.error);
  }
};

// Handle page change
const handlePageChange = (page) => {
  console.log('📄 Page changed:', page);
  productStore.pagination.page = page;
  updateQuery({ page });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Handle quick view
const handleQuickView = (product) => {
  console.log('👁️ Quick view:', product.name);
  quickViewProduct.value = product;
  document.body.style.overflow = 'hidden';
};

// Close quick view
const closeQuickView = () => {
  quickViewProduct.value = null;
  document.body.style.overflow = '';
};

// Handle reset filters
const handleResetFilters = () => {
  console.log('🔄 Reset filters');
  router.push({ path: '/products' });
  productStore.pagination.page = 1;
  fetchProducts();
};

// Add to cart
const addToCart = async (product) => {
  if (product.stock === 0) {
    toast.warning('Sản phẩm đã hết hàng');
    return;
  }
  
  const result = await cartStore.addToCart(product._id, 1);
  if (result.success) {
    toast.success('Đã thêm vào giỏ hàng');
    closeQuickView();
  } else {
    toast.error(result.message || 'Không thể thêm vào giỏ hàng');
  }
};

// View product detail
const viewProduct = (product) => {
  closeQuickView();
  router.push(`/product/${product._id}`);
};

// Update query params
const updateQuery = (params) => {
  const query = { ...route.query, ...params };
  router.push({ query });
};

// Handle image error
const handleImageError = (event) => {
  event.target.src = '/images/no-image.png';
};

// ============================================
// WATCHERS
// ============================================

// Watch route changes
watch(
  () => route.query,
  () => {
    console.log('🔄 Route changed:', route.query);
    productStore.pagination.page = Number(route.query.page) || 1;
    fetchProducts();
  },
  { deep: true }
);

// ============================================
// LIFECYCLE
// ============================================

onMounted(() => {
  console.log('🚀 ProductsPage mounted');
  console.log('📦 Initial store products:', productStore.products);
  console.log('🔄 Initial store loading:', productStore.loading);
  
  productStore.pagination.page = Number(route.query.page) || 1;
  fetchProducts();
});
</script>

<style scoped>
.products-page {
  background: #f8fafc;
  min-height: 100vh;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 1.5rem;
}

.breadcrumb-item a {
  color: #2563eb;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #4a5568;
}

/* Quick View Overlay */
.quick-view-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
  animation: fadeIn 0.3s ease;
}

.quick-view-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease;
}

.btn-close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.btn-close-modal:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

/* Quick View Content */
.quick-view-image {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.quick-view-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.quick-view-thumbs {
  display: flex;
  gap: 8px;
  margin-top: 0.75rem;
}

.quick-view-thumbs img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.quick-view-thumbs img:hover {
  border-color: #2563eb;
}

.quick-view-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.quick-view-brand {
  color: #94a3b8;
  margin-bottom: 0.75rem;
}

.quick-view-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.75rem;
}

.quick-view-rating .stars {
  display: flex;
  gap: 2px;
}

.quick-view-rating .stars i {
  font-size: 16px;
}

.quick-view-price {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.75rem;
}

.quick-view-price .current-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2563eb;
}

.quick-view-price .old-price {
  font-size: 1.1rem;
  color: #94a3b8;
  text-decoration: line-through;
}

.quick-view-price .discount-badge {
  background: #ef4444;
  color: white;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
}

.quick-view-stock {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.quick-view-stock .badge {
  font-size: 0.875rem;
  padding: 4px 16px;
}

.quick-view-stock .stock-count {
  font-size: 0.875rem;
  color: #94a3b8;
}

.quick-view-description {
  margin-bottom: 1rem;
}

.quick-view-description p {
  color: #4a5568;
  line-height: 1.6;
}

.quick-view-specs {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.quick-view-specs h6 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.quick-view-specs .spec-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
}

.quick-view-specs .spec-item:last-child {
  border-bottom: none;
}

.quick-view-specs .spec-label {
  color: #94a3b8;
}

.quick-view-specs .spec-value {
  color: #1a202c;
  font-weight: 500;
}

.quick-view-actions {
  display: flex;
  gap: 0.75rem;
}

.quick-view-actions .btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 992px) {
  .quick-view-modal {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .quick-view-image {
    height: 200px;
  }
  
  .quick-view-title {
    font-size: 1.1rem;
  }
  
  .quick-view-price .current-price {
    font-size: 1.4rem;
  }
  
  .quick-view-actions {
    flex-direction: column;
  }
  
  .quick-view-actions .btn {
    width: 100%;
  }
  
  .quick-view-thumbs img {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 576px) {
  .quick-view-modal {
    padding: 1rem;
  }
  
  .quick-view-image {
    height: 150px;
  }
}
</style>
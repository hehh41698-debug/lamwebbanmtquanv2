<template>
  <aside class="sidebar">
    <div class="sidebar-inner">
      <!-- Categories -->
      <div class="sidebar-section">
        <h5 class="sidebar-title">Danh mục</h5>
        <ul class="sidebar-menu">
          <li>
            <router-link to="/products" :class="{ active: !categoryFilter }">
              <i class="bi bi-grid"></i> Tất cả sản phẩm
            </router-link>
          </li>
          <li v-for="category in categories" :key="category._id">
            <router-link 
              :to="{ path: '/products', query: { ...route.query, category: category.slug, page: 1 } }"
              :class="{ active: categoryFilter === category.slug }"
              @click="handleCategoryClick(category.slug)"
            >
              <i :class="category.icon || 'bi bi-tag'"></i>
              {{ category.name }}
              <span class="badge" v-if="category.productCount">{{ category.productCount }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Filter by Price -->
      <div class="sidebar-section">
        <h5 class="sidebar-title">Khoảng giá</h5>
        <div class="price-range">
          <div class="price-inputs">
            <div class="input-group">
              <span class="input-group-text">Từ</span>
              <input 
                type="number" 
                class="form-control" 
                v-model="minPrice" 
                placeholder="0"
                min="0"
                @keyup.enter="applyPriceFilter"
              >
            </div>
            <div class="input-group">
              <span class="input-group-text">Đến</span>
              <input 
                type="number" 
                class="form-control" 
                v-model="maxPrice" 
                placeholder="10000000"
                min="0"
                @keyup.enter="applyPriceFilter"
              >
            </div>
          </div>
          <button class="btn btn-primary btn-sm w-100 mt-2" @click="applyPriceFilter">
            <i class="bi bi-search"></i> Áp dụng
          </button>
          <button class="btn btn-outline-secondary btn-sm w-100 mt-1" @click="clearPriceFilter">
            <i class="bi bi-x-circle"></i> Xóa
          </button>
        </div>
      </div>

      <!-- Filter by Brand -->
      <div class="sidebar-section">
        <h5 class="sidebar-title">Thương hiệu</h5>
        <div class="brand-filter">
          <div 
            v-for="brand in availableBrands" 
            :key="brand"
            class="form-check"
          >
            <input 
              type="checkbox" 
              class="form-check-input" 
              :id="'brand-' + brand"
              :value="brand"
              v-model="selectedBrands"
              @change="applyBrandFilter"
            >
            <label class="form-check-label" :for="'brand-' + brand">
              {{ brand }}
              <span class="badge bg-light text-dark">{{ getBrandCount(brand) }}</span>
            </label>
          </div>
        </div>
        <button 
          v-if="selectedBrands.length > 0" 
          class="btn btn-link btn-sm text-danger mt-2"
          @click="clearBrandFilter"
        >
          <i class="bi bi-x-circle"></i> Xóa bộ lọc
        </button>
      </div>

      <!-- Filter by Rating -->
      <div class="sidebar-section">
        <h5 class="sidebar-title">Đánh giá</h5>
        <div class="rating-filter">
          <div 
            v-for="star in [5, 4, 3, 2, 1]" 
            :key="star"
            class="rating-option"
            :class="{ active: selectedRating === star }"
            @click="toggleRating(star)"
          >
            <div class="stars">
              <i 
                v-for="n in 5" 
                :key="n" 
                class="bi bi-star-fill"
                :class="{ 
                  'text-warning': n <= star, 
                  'text-secondary': n > star 
                }"
              ></i>
            </div>
            <span class="rating-label">{{ star }} sao trở lên</span>
            <span class="rating-check" v-if="selectedRating === star">
              <i class="bi bi-check-circle-fill text-primary"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- Sort -->
      <div class="sidebar-section">
        <h5 class="sidebar-title">Sắp xếp</h5>
        <select class="form-select" v-model="sortBy" @change="applySort">
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá thấp đến cao</option>
          <option value="price-desc">Giá cao đến thấp</option>
          <option value="name-asc">Tên A-Z</option>
          <option value="name-desc">Tên Z-A</option>
          <option value="rating">Đánh giá cao nhất</option>
          <option value="sold">Bán chạy nhất</option>
        </select>
      </div>

      <!-- Reset Filters -->
      <div class="sidebar-section">
        <button class="btn btn-outline-secondary btn-sm w-100" @click="resetAllFilters">
          <i class="bi bi-arrow-counterclockwise"></i> Đặt lại bộ lọc
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCategoryStore } from '../../store/category';
import { useProductStore } from '../../store/product';
import { formatPrice } from '../../utils/helpers';
import { storeToRefs } from 'pinia';

const router = useRouter();
const route = useRoute();
const categoryStore = useCategoryStore();
const productStore = useProductStore();

const { categories } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);

// State
const categoryFilter = ref('');
const minPrice = ref('');
const maxPrice = ref('');
const selectedBrands = ref([]);
const selectedRating = ref(0);
const sortBy = ref('newest');

// Available brands from products
const availableBrands = computed(() => {
  const brands = new Set();
  products.value.forEach(p => {
    if (p.brand) brands.add(p.brand);
  });
  return Array.from(brands).sort();
});

// Get product count by brand
const getBrandCount = (brand) => {
  return products.value.filter(p => p.brand === brand).length;
};

// Handle category click
const handleCategoryClick = (slug) => {
  categoryFilter.value = slug;
};

// Apply price filter
const applyPriceFilter = () => {
  const query = { ...route.query };
  
  if (minPrice.value) {
    query.minPrice = minPrice.value;
  } else {
    delete query.minPrice;
  }
  
  if (maxPrice.value) {
    query.maxPrice = maxPrice.value;
  } else {
    delete query.maxPrice;
  }
  
  query.page = 1;
  router.push({ path: '/products', query });
};

// Clear price filter
const clearPriceFilter = () => {
  minPrice.value = '';
  maxPrice.value = '';
  const query = { ...route.query };
  delete query.minPrice;
  delete query.maxPrice;
  query.page = 1;
  router.push({ path: '/products', query });
};

// Apply brand filter
const applyBrandFilter = () => {
  const query = { ...route.query };
  
  if (selectedBrands.value.length > 0) {
    query.brand = selectedBrands.value.join(',');
  } else {
    delete query.brand;
  }
  
  query.page = 1;
  router.push({ path: '/products', query });
};

// Clear brand filter
const clearBrandFilter = () => {
  selectedBrands.value = [];
  applyBrandFilter();
};

// Toggle rating filter
const toggleRating = (star) => {
  if (selectedRating.value === star) {
    selectedRating.value = 0;
  } else {
    selectedRating.value = star;
  }
  
  const query = { ...route.query };
  if (selectedRating.value > 0) {
    query.minRating = selectedRating.value;
  } else {
    delete query.minRating;
  }
  
  query.page = 1;
  router.push({ path: '/products', query });
};

// Apply sort
const applySort = () => {
  const [sort, order] = sortBy.value.split('-');
  const query = { ...route.query, sort, order: order || 'desc' };
  query.page = 1;
  router.push({ path: '/products', query });
};

// Reset all filters
const resetAllFilters = () => {
  categoryFilter.value = '';
  minPrice.value = '';
  maxPrice.value = '';
  selectedBrands.value = [];
  selectedRating.value = 0;
  sortBy.value = 'newest';
  
  router.push({ path: '/products' });
};

// Load filters from URL
const loadFiltersFromUrl = () => {
  const query = route.query;
  
  if (query.category) {
    categoryFilter.value = query.category;
  }
  
  if (query.minPrice) {
    minPrice.value = query.minPrice;
  }
  
  if (query.maxPrice) {
    maxPrice.value = query.maxPrice;
  }
  
  if (query.brand) {
    selectedBrands.value = query.brand.split(',');
  }
  
  if (query.minRating) {
    selectedRating.value = Number(query.minRating);
  }
  
  if (query.sort) {
    const order = query.order || 'desc';
    sortBy.value = `${query.sort}-${order}`;
  }
};

// ============================================
// WATCH VỚI IMMEDIATE: TRUE
// ============================================

// 1. Theo dõi route.query - CHẠY NGAY LẬP TỨC KHI COMPONENT MOUNT
const stopRouteWatch = watch(
  () => route.query,
  (newQuery) => {
    console.log('🔄 Sidebar - Route changed:', newQuery);
    loadFiltersFromUrl();
  },
  { immediate: true, deep: true }
);

// 2. Theo dõi categoryFilter - tự động cập nhật URL
watch(
  categoryFilter,
  (newValue) => {
    if (newValue) {
      router.push({ 
        path: '/products', 
        query: { ...route.query, category: newValue, page: 1 } 
      });
    }
  },
  { immediate: false }
);

// 3. Theo dõi selectedBrands - áp dụng filter khi thay đổi
watch(
  selectedBrands,
  (newValue) => {
    console.log('🏷️ Brands changed:', newValue);
    applyBrandFilter();
  },
  { deep: true }
);

// 4. Theo dõi minPrice và maxPrice - debug khi thay đổi
watch(
  [minPrice, maxPrice],
  ([newMin, newMax]) => {
    console.log('💰 Price changed:', { min: newMin, max: newMax });
  },
  { immediate: true }
);

// 5. Theo dõi selectedRating
watch(
  selectedRating,
  (newValue) => {
    console.log('⭐ Rating changed:', newValue);
  },
  { immediate: true }
);

// 6. Theo dõi sortBy
watch(
  sortBy,
  (newValue) => {
    console.log('📊 Sort changed:', newValue);
  },
  { immediate: true }
);

// 7. Theo dõi categories
watch(
  categories,
  (newCategories) => {
    console.log('📂 Categories loaded:', newCategories?.length || 0);
  },
  { immediate: true, deep: true }
);

// ============================================
// HỦY WATCH KHI COMPONENT UNMOUNT
// ============================================
onUnmounted(() => {
  stopRouteWatch();
});

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  console.log('🚀 Sidebar mounted');
  loadFiltersFromUrl();
  categoryStore.fetchCategories();
});
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 80px;
}

.sidebar-inner {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.sidebar-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.sidebar-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
}

/* Menu */
.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 4px;
}

.sidebar-menu li a {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: #4a5568;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  gap: 10px;
  font-size: 0.95rem;
}

.sidebar-menu li a:hover {
  background: #f8fafc;
  color: #2563eb;
}

.sidebar-menu li a.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.sidebar-menu li a i {
  font-size: 1.1rem;
  min-width: 20px;
}

.sidebar-menu li a .badge {
  margin-left: auto;
  background: #e2e8f0;
  color: #4a5568;
  font-size: 11px;
}

/* Price Range */
.price-inputs {
  display: flex;
  gap: 8px;
}

.price-inputs .input-group {
  flex: 1;
}

.price-inputs .input-group-text {
  font-size: 0.75rem;
  padding: 0 8px;
  background: #f8fafc;
}

.price-inputs .form-control {
  font-size: 0.875rem;
  padding: 4px 8px;
}

/* Brand Filter */
.brand-filter .form-check {
  margin-bottom: 6px;
}

.brand-filter .form-check:last-child {
  margin-bottom: 0;
}

.brand-filter .form-check .badge {
  font-size: 10px;
  padding: 2px 8px;
  margin-left: 4px;
}

/* Rating Filter */
.rating-filter .rating-option {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  gap: 10px;
}

.rating-filter .rating-option:hover {
  background: #f8fafc;
}

.rating-filter .rating-option.active {
  background: #eff6ff;
}

.rating-filter .rating-option .stars {
  display: flex;
  gap: 2px;
}

.rating-filter .rating-option .stars i {
  font-size: 14px;
}

.rating-filter .rating-option .rating-label {
  font-size: 0.875rem;
  color: #4a5568;
  flex: 1;
}

.rating-filter .rating-option .rating-check {
  margin-left: auto;
}

/* Form Select */
.form-select {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
  padding: 6px 12px;
}

.form-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Responsive */
@media (max-width: 992px) {
  .sidebar {
    position: relative;
    top: 0;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 576px) {
  .sidebar-inner {
    padding: 1rem;
  }
  
  .price-inputs {
    flex-direction: column;
  }
  
  .rating-filter .rating-option {
    padding: 4px 8px;
  }
  
  .rating-filter .rating-option .stars i {
    font-size: 12px;
  }
}
</style>
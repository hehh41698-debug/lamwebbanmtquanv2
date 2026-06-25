<template>
  <div class="admin-products">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <h4 class="mb-0">
        <i class="bi bi-box me-2"></i>Quản lý sản phẩm
      </h4>
      <button class="btn btn-primary" @click="showProductForm = true">
        <i class="bi bi-plus-circle"></i> Thêm sản phẩm
      </button>
    </div>

    <!-- Filters -->
    <div class="admin-filters">
      <div class="filter-group">
        <label>Tìm kiếm</label>
        <input type="text" class="form-control" v-model="searchKeyword" placeholder="Tên sản phẩm..." @input="handleSearch">
      </div>
      <div class="filter-group">
        <label>Danh mục</label>
        <select class="form-select" v-model="categoryFilter" @change="handleFilter">
          <option value="">Tất cả</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Trạng thái</label>
        <select class="form-select" v-model="statusFilter" @change="handleFilter">
          <option value="">Tất cả</option>
          <option value="in-stock">Còn hàng</option>
          <option value="out-of-stock">Hết hàng</option>
        </select>
      </div>
      <button class="btn btn-outline-secondary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Đặt lại
      </button>
    </div>

    <!-- Products Table -->
    <div class="admin-table-wrapper">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-3 d-block"></i>
                Không có sản phẩm nào
              </td>
            </tr>
            <tr v-for="product in products" :key="product._id">
              <td>
                <img :src="product.images[0] || '/images/no-image.png'" class="product-image" :alt="product.name">
              </td>
              <td>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-brand text-muted small">{{ product.brand }}</div>
              </td>
              <td>{{ product.category?.name || 'Chưa phân loại' }}</td>
              <td>
                <div class="product-price">{{ formatPrice(product.price) }}</div>
                <div v-if="product.discount > 0" class="text-danger small">-{{ product.discount }}%</div>
              </td>
              <td>
                <span :class="['badge', product.stock > 0 ? 'bg-success' : 'bg-danger']">
                  {{ product.stock }}
                </span>
              </td>
              <td>
                <span :class="['badge', product.stock > 0 ? 'bg-success' : 'bg-danger']">
                  {{ product.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline-primary" @click="editProduct(product)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(product._id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted small">
          Hiển thị {{ products.length }} / {{ pagination.total }} sản phẩm
        </span>
        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: pagination.page === 1 }">
              <button class="page-link" @click="changePage(pagination.page - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li 
              v-for="page in pagination.totalPages" 
              :key="page"
              class="page-item"
              :class="{ active: page === pagination.page }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
              <button class="page-link" @click="changePage(pagination.page + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Product Form Modal -->
    <div v-if="showProductForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">{{ editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}</h5>
          <button class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <ProductForm 
            :product="editingProduct"
            @submit="handleSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProductStore } from '../../store/product';
import { useCategoryStore } from '../../store/category';
import ProductForm from '../../components/admin/ProductForm.vue';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const productStore = useProductStore();
const categoryStore = useCategoryStore();

const products = computed(() => productStore.products);
const loading = computed(() => productStore.loading);
const pagination = computed(() => productStore.pagination);
const categories = computed(() => categoryStore.categories);

const showProductForm = ref(false);
const editingProduct = ref(null);
const searchKeyword = ref('');
const categoryFilter = ref('');
const statusFilter = ref('');

const loadProducts = async () => {
  const params = {
    page: pagination.value.page,
    limit: 12
  };
  
  if (searchKeyword.value) params.search = searchKeyword.value;
  if (categoryFilter.value) params.category = categoryFilter.value;
  if (statusFilter.value === 'in-stock') params.inStock = true;
  if (statusFilter.value === 'out-of-stock') params.inStock = false;
  
  await productStore.fetchProducts(params);
};

const handleSearch = () => {
  productStore.pagination.page = 1;
  loadProducts();
};

const handleFilter = () => {
  productStore.pagination.page = 1;
  loadProducts();
};

const resetFilters = () => {
  searchKeyword.value = '';
  categoryFilter.value = '';
  statusFilter.value = '';
  productStore.pagination.page = 1;
  loadProducts();
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  productStore.pagination.page = page;
  loadProducts();
};

const editProduct = (product) => {
  editingProduct.value = { ...product };
  showProductForm.value = true;
};

const deleteProduct = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
  
  const result = await productStore.deleteProduct(id);
  if (result.success) {
    toast.success('Xóa sản phẩm thành công');
    loadProducts();
  } else {
    toast.error(result.error);
  }
};

const handleSubmit = async (productData) => {
  let result;
  if (editingProduct.value) {
    result = await productStore.updateProduct(editingProduct.value._id, productData);
  } else {
    result = await productStore.createProduct(productData);
  }
  
  if (result.success) {
    toast.success(editingProduct.value ? 'Cập nhật thành công' : 'Thêm sản phẩm thành công');
    closeForm();
    loadProducts();
  } else {
    toast.error(result.error);
  }
};

const closeForm = () => {
  showProductForm.value = false;
  editingProduct.value = null;
};

onMounted(() => {
  categoryStore.fetchCategories();
  loadProducts();
});
</script>

<style scoped>
.admin-products {
  padding: 1rem;
}

.admin-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.filter-group .form-control,
.filter-group .form-select {
  min-width: 150px;
  padding: 6px 12px;
  font-size: 0.875rem;
}

.admin-table-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.product-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.product-price {
  font-weight: 600;
  color: #2563eb;
}

.actions {
  display: flex;
  gap: 6px;
}

.actions .btn {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body {
  padding: 2rem;
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

@media (max-width: 768px) {
  .admin-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group .form-control,
  .filter-group .form-select {
    min-width: 100%;
  }
  
  .modal-content {
    margin: 1rem;
  }
}
</style>
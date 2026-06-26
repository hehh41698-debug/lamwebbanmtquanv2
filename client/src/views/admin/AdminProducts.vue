<template>
  <div class="admin-products">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0"><i class="bi bi-box me-2"></i>Quản lý sản phẩm</h4>
      <button class="btn btn-primary" @click="openForm()">
        <i class="bi bi-plus-circle"></i> Thêm sản phẩm
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <input type="text" class="form-control" v-model="searchKeyword" placeholder="Tìm kiếm..." @input="loadProducts">
      <select class="form-select" v-model="categoryFilter" @change="loadProducts">
        <option value="">Tất cả danh mục</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
      </select>
      <button class="btn btn-outline-secondary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Đặt lại
      </button>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>
            <tr v-else-if="products.length === 0"><td colspan="6" class="text-center py-4 text-muted">Không có sản phẩm nào</td></tr>
            <tr v-for="product in products" :key="product._id">
              <td><img :src="product.images?.[0] || '/images/no-image.png'" class="product-image" :alt="product.name"></td>
              <td>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-brand text-muted small">{{ product.brand }}</div>
              </td>
              <td>{{ product.category?.name || 'Chưa phân loại' }}</td>
              <td>{{ formatPrice(product.price) }}</td>
              <td><span :class="['badge', product.stock > 0 ? 'bg-success' : 'bg-danger']">{{ product.stock }}</span></td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline-primary" @click="openForm(product)" title="Sửa">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(product._id)" title="Xóa">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar">
      <span class="text-muted small">Hiển thị {{ products.length }} / {{ pagination.total }} sản phẩm</span>
      <nav>
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <button class="page-link" @click="changePage(pagination.page - 1)"><i class="bi bi-chevron-left"></i></button>
          </li>
          <li v-for="page in pagination.totalPages" :key="page" class="page-item" :class="{ active: page === pagination.page }">
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
            <button class="page-link" @click="changePage(pagination.page + 1)"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Product Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>
            <i class="bi bi-box me-2"></i>
            {{ editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}
          </h5>
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

const showForm = ref(false);
const editingProduct = ref(null);
const searchKeyword = ref('');
const categoryFilter = ref('');

const loadProducts = async () => {
  const params = {
    page: pagination.value.page,
    limit: 12,
    search: searchKeyword.value,
    category: categoryFilter.value
  };
  await productStore.fetchProducts(params);
};

const resetFilters = () => {
  searchKeyword.value = '';
  categoryFilter.value = '';
  productStore.pagination.page = 1;
  loadProducts();
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  productStore.pagination.page = page;
  loadProducts();
};

const openForm = (product = null) => {
  console.log('🔓 Opening form with product:', product);
  editingProduct.value = product ? { ...product } : null;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingProduct.value = null;
};

const handleSubmit = async (productData) => {
  console.log('📤 Submitting form data:', productData);
  console.log('📝 Editing product:', editingProduct.value);
  
  let result;
  
  if (editingProduct.value) {
    // UPDATE product
    const productId = editingProduct.value._id;
    console.log('🔄 Updating product ID:', productId);
    
    result = await productStore.updateProduct(productId, productData);
    
    if (result.success) {
      toast.success('Cập nhật sản phẩm thành công!');
      closeForm();
      await loadProducts();
    } else {
      toast.error(result.error || 'Cập nhật thất bại');
    }
  } else {
    // CREATE product
    result = await productStore.createProduct(productData);
    
    if (result.success) {
      toast.success('Thêm sản phẩm thành công!');
      closeForm();
      await loadProducts();
    } else {
      toast.error(result.error || 'Thêm sản phẩm thất bại');
    }
  }
};

const deleteProduct = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
  
  const result = await productStore.deleteProduct(id);
  if (result.success) {
    toast.success('Xóa sản phẩm thành công');
    await loadProducts();
  } else {
    toast.error(result.error || 'Xóa sản phẩm thất bại');
  }
};

onMounted(() => {
  categoryStore.fetchCategories();
  loadProducts();
});
</script>

<style scoped>
.admin-products { padding: 1rem; }

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.filters-bar .form-control,
.filters-bar .form-select { width: 200px; }

.table-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table thead { background: #f8fafc; }
.admin-table th { padding: 0.75rem 1rem; text-align: left; font-weight: 600; font-size: 0.875rem; color: #64748b; border-bottom: 2px solid #e2e8f0; }
.admin-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
.admin-table tr:hover { background: #f8fafc; }

.product-image { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; }
.product-name { font-weight: 500; }
.actions { display: flex; gap: 6px; }
.actions .btn { padding: 4px 8px; font-size: 0.75rem; }

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center; justify-content: center;
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
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-body { padding: 2rem; }

@media (max-width: 768px) {
  .filters-bar { flex-direction: column; }
  .filters-bar .form-control,
  .filters-bar .form-select { width: 100%; }
  .modal-content { margin: 1rem; }
}
</style>
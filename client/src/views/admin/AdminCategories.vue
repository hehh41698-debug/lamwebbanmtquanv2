<template>
  <div class="admin-categories">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0">
        <i class="bi bi-tags me-2"></i>Quản lý danh mục
      </h4>
      <button class="btn btn-primary" @click="showForm = true">
        <i class="bi bi-plus-circle"></i> Thêm danh mục
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="row g-4">
      <div v-for="category in categories" :key="category._id" class="col-md-4 col-lg-3">
        <div class="category-card">
          <div class="category-icon">
            <i :class="category.icon || 'bi bi-tag'"></i>
          </div>
          <div class="category-info">
            <h6 class="category-name">{{ category.name }}</h6>
            <span class="category-slug text-muted small">{{ category.slug }}</span>
          </div>
          <div class="category-actions">
            <button class="btn btn-sm btn-outline-primary" @click="editCategory(category)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteCategory(category._id)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="categories.length === 0 && !loading" class="col-12">
        <div class="text-center py-5">
          <i class="bi bi-tags fs-1 text-muted"></i>
          <h5 class="mt-3">Chưa có danh mục</h5>
          <p class="text-muted">Bắt đầu bằng cách tạo danh mục mới</p>
        </div>
      </div>
    </div>

    <!-- Category Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5 class="modal-title">{{ editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}</h5>
          <button class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label class="form-label">Tên danh mục <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="form.name" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Slug <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="form.slug" required>
              <small class="text-muted">Ví dụ: laptop, desktop, linh-kien</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Icon</label>
              <input type="text" class="form-control" v-model="form.icon" placeholder="bi bi-tag">
              <small class="text-muted">Sử dụng Bootstrap Icons (ví dụ: bi bi-laptop)</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Mô tả</label>
              <textarea class="form-control" v-model="form.description" rows="3"></textarea>
            </div>
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingCategory ? 'Cập nhật' : 'Tạo mới' }}
              </button>
              <button type="button" class="btn btn-secondary" @click="closeForm">Hủy</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useCategoryStore } from '../../store/category';
import { toast } from 'vue3-toastify';
import { createSlug } from '../../utils/helpers';

const categoryStore = useCategoryStore();

const categories = computed(() => categoryStore.categories);
const loading = computed(() => categoryStore.loading);

const showForm = ref(false);
const editingCategory = ref(null);
const form = reactive({
  name: '',
  slug: '',
  icon: '',
  description: ''
});

const loadCategories = async () => {
  await categoryStore.fetchCategories();
};

const editCategory = (category) => {
  editingCategory.value = { ...category };
  form.name = category.name;
  form.slug = category.slug;
  form.icon = category.icon || '';
  form.description = category.description || '';
  showForm.value = true;
};

const deleteCategory = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
  
  const result = await categoryStore.deleteCategory(id);
  if (result.success) {
    toast.success('Xóa danh mục thành công');
    loadCategories();
  } else {
    toast.error(result.error);
  }
};

const submitForm = async () => {
  // Auto generate slug if empty
  if (!form.slug && form.name) {
    form.slug = createSlug(form.name);
  }
  
  const data = { ...form };
  let result;
  
  if (editingCategory.value) {
    result = await categoryStore.updateCategory(editingCategory.value._id, data);
  } else {
    result = await categoryStore.createCategory(data);
  }
  
  if (result.success) {
    toast.success(editingCategory.value ? 'Cập nhật thành công' : 'Thêm danh mục thành công');
    closeForm();
    loadCategories();
  } else {
    toast.error(result.error);
  }
};

const closeForm = () => {
  showForm.value = false;
  editingCategory.value = null;
  form.name = '';
  form.slug = '';
  form.icon = '';
  form.description = '';
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.admin-categories {
  padding: 1rem;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.category-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.category-slug {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
}

.category-actions {
  display: flex;
  gap: 4px;
}

.category-actions .btn {
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
  max-width: 500px;
  width: 100%;
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

@media (max-width: 576px) {
  .category-card {
    flex-wrap: wrap;
  }
  
  .category-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
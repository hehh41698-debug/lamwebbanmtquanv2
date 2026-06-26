<template>
  <div class="admin-categories">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0">
        <i class="bi bi-tags me-2"></i>Quản lý danh mục
        <span class="badge bg-primary ms-2">{{ categories.length }}</span>
      </h4>
      <button class="btn btn-primary" @click="openForm()">
        <i class="bi bi-plus-circle"></i> Thêm danh mục
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Categories Grid -->
    <div v-else class="row g-4">
      <div v-for="category in categories" :key="category._id" class="col-md-4 col-lg-3">
        <div class="category-card">
          <div class="category-icon">
            <i :class="category.icon || 'bi bi-tag'"></i>
          </div>
          <div class="category-info">
            <h6 class="category-name">{{ category.name }}</h6>
            <span class="category-slug text-muted small">{{ category.slug }}</span>
            <p v-if="category.description" class="category-desc small text-muted mt-1">
              {{ truncateText(category.description, 30) }}
            </p>
          </div>
          <div class="category-actions">
            <button class="btn btn-sm btn-outline-primary" @click="openForm(category)" title="Sửa">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="deleteCategory(category._id)" title="Xóa">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="categories.length === 0" class="col-12">
        <div class="empty-state text-center py-5">
          <i class="bi bi-tags fs-1 text-muted"></i>
          <h5 class="mt-3">Chưa có danh mục</h5>
          <p class="text-muted">Bắt đầu bằng cách tạo danh mục mới</p>
          <button class="btn btn-primary" @click="openForm()">
            <i class="bi bi-plus-circle"></i> Tạo danh mục đầu tiên
          </button>
        </div>
      </div>
    </div>

    <!-- Category Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>
            <i class="bi bi-tag me-2"></i>
            {{ editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}
          </h5>
          <button class="btn-close" @click="closeForm"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label class="form-label">Tên danh mục <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.name" 
                required 
                @input="generateSlug"
                placeholder="Nhập tên danh mục"
              >
              <small class="text-muted">Tên danh mục sẽ hiển thị trên trang chủ</small>
            </div>

            <div class="mb-3">
              <label class="form-label">Slug <span class="text-danger">*</span></label>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.slug" 
                required
                placeholder="vi-du-slug"
              >
              <small class="text-muted">Ví dụ: laptop, desktop, linh-kien</small>
            </div>

            <div class="mb-3">
              <label class="form-label">Icon</label>
              <div class="input-group">
                <span class="input-group-text"><i :class="form.icon || 'bi bi-tag'"></i></span>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="form.icon" 
                  placeholder="bi bi-laptop"
                >
              </div>
              <small class="text-muted">Sử dụng Bootstrap Icons (ví dụ: bi bi-laptop, bi bi-pc-display)</small>
            </div>

            <div class="mb-3">
              <label class="form-label">Mô tả</label>
              <textarea 
                class="form-control" 
                v-model="form.description" 
                rows="3"
                placeholder="Mô tả ngắn về danh mục"
              ></textarea>
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i :class="editingCategory ? 'bi bi-pencil' : 'bi bi-plus-circle'"></i>
                {{ editingCategory ? 'Cập nhật' : 'Tạo mới' }}
              </button>
              <button type="button" class="btn btn-secondary" @click="closeForm">
                <i class="bi bi-x-circle"></i> Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="closeDeleteConfirm">
      <div class="modal-content modal-sm" @click.stop>
        <div class="modal-header">
          <h5><i class="bi bi-exclamation-triangle text-danger me-2"></i>Xác nhận xóa</h5>
          <button class="btn-close" @click="closeDeleteConfirm"></button>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc muốn xóa danh mục <strong>{{ deleteTarget?.name }}</strong>?</p>
          <p class="text-danger small">Hành động này không thể hoàn tác!</p>
          <div class="d-flex gap-2">
            <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-trash"></i> Xóa
            </button>
            <button class="btn btn-secondary" @click="closeDeleteConfirm">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useCategoryStore } from '../../store/category';
import { createSlug, truncateText } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const categoryStore = useCategoryStore();

const categories = computed(() => categoryStore.categories);
const loading = computed(() => categoryStore.loading);

const showForm = ref(false);
const showDeleteConfirm = ref(false);
const editingCategory = ref(null);
const deleteTarget = ref(null);
const deleting = ref(false);

const form = reactive({
  name: '',
  slug: '',
  icon: '',
  description: ''
});

// Auto generate slug from name
const generateSlug = () => {
  if (!editingCategory.value && form.name) {
    form.slug = createSlug(form.name);
  }
};

// Load categories
const loadCategories = async () => {
  await categoryStore.fetchCategories();
};

// Open form (create or edit)
const openForm = (category = null) => {
  editingCategory.value = category ? { ...category } : null;
  
  if (category) {
    Object.assign(form, {
      name: category.name || '',
      slug: category.slug || '',
      icon: category.icon || '',
      description: category.description || ''
    });
  } else {
    Object.assign(form, {
      name: '',
      slug: '',
      icon: '',
      description: ''
    });
  }
  
  showForm.value = true;
};

// Close form
const closeForm = () => {
  showForm.value = false;
  editingCategory.value = null;
  Object.assign(form, {
    name: '',
    slug: '',
    icon: '',
    description: ''
  });
};

// Submit form (create or update)
const submitForm = async () => {
  // Validate
  if (!form.name || !form.slug) {
    toast.warning('Vui lòng điền đầy đủ thông tin');
    return;
  }

  // Auto generate slug if empty
  if (!form.slug && form.name) {
    form.slug = createSlug(form.name);
  }

  let result;
  if (editingCategory.value) {
    // Update
    result = await categoryStore.updateCategory(editingCategory.value._id, {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      icon: form.icon || 'bi bi-tag',
      description: form.description || ''
    });
  } else {
    // Create
    result = await categoryStore.createCategory({
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      icon: form.icon || 'bi bi-tag',
      description: form.description || ''
    });
  }

  if (result.success) {
    toast.success(editingCategory.value ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
    closeForm();
    await loadCategories();
  } else {
    toast.error(result.error || 'Có lỗi xảy ra');
  }
};

// Delete category
const deleteCategory = (category) => {
  deleteTarget.value = category;
  showDeleteConfirm.value = true;
};

// Close delete confirm
const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  deleteTarget.value = null;
  deleting.value = false;
};

// Confirm delete
const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  
  deleting.value = true;
  const result = await categoryStore.deleteCategory(deleteTarget.value._id);
  
  if (result.success) {
    toast.success('Xóa danh mục thành công');
    closeDeleteConfirm();
    await loadCategories();
  } else {
    toast.error(result.error || 'Xóa danh mục thất bại');
    deleting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.admin-categories { padding: 1rem; }

.category-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
  position: relative;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(37,99,235,0.1);
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
  font-size: 0.95rem;
}

.category-slug {
  font-size: 0.75rem;
  color: #94a3b8;
}

.category-desc {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
}

.category-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.category-actions .btn {
  padding: 4px 8px;
  font-size: 0.75rem;
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
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

.modal-content.modal-sm {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h5 {
  margin: 0;
  display: flex;
  align-items: center;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body .form-label {
  font-weight: 500;
  font-size: 0.9rem;
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
@media (max-width: 576px) {
  .category-card {
    flex-wrap: wrap;
    padding: 1rem;
  }
  
  .category-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .modal-content {
    margin: 1rem;
  }
}
</style>
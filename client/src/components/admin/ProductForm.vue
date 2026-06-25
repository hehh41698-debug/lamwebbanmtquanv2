<template>
  <form @submit.prevent="submitForm" class="admin-form">
    <div class="form-row">
      <div class="form-group">
        <label>Tên sản phẩm <span class="text-danger">*</span></label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.name"
          :class="{ 'is-invalid': errors.name }"
          required
        >
        <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
      </div>
      
      <div class="form-group">
        <label>Slug <span class="text-danger">*</span></label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.slug"
          :class="{ 'is-invalid': errors.slug }"
          required
        >
        <div class="invalid-feedback" v-if="errors.slug">{{ errors.slug }}</div>
      </div>
    </div>
    
    <div class="form-group">
      <label>Mô tả <span class="text-danger">*</span></label>
      <textarea 
        class="form-control" 
        v-model="form.description"
        rows="4"
        :class="{ 'is-invalid': errors.description }"
        required
      ></textarea>
      <div class="invalid-feedback" v-if="errors.description">{{ errors.description }}</div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Giá <span class="text-danger">*</span></label>
        <input 
          type="number" 
          class="form-control" 
          v-model="form.price"
          :class="{ 'is-invalid': errors.price }"
          min="0"
          required
        >
        <div class="invalid-feedback" v-if="errors.price">{{ errors.price }}</div>
      </div>
      
      <div class="form-group">
        <label>Giảm giá (%)</label>
        <input 
          type="number" 
          class="form-control" 
          v-model="form.discount"
          min="0"
          max="100"
        >
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Danh mục <span class="text-danger">*</span></label>
        <select class="form-select" v-model="form.category" :class="{ 'is-invalid': errors.category }" required>
          <option value="">Chọn danh mục</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
        <div class="invalid-feedback" v-if="errors.category">{{ errors.category }}</div>
      </div>
      
      <div class="form-group">
        <label>Thương hiệu <span class="text-danger">*</span></label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.brand"
          :class="{ 'is-invalid': errors.brand }"
          required
        >
        <div class="invalid-feedback" v-if="errors.brand">{{ errors.brand }}</div>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Tồn kho <span class="text-danger">*</span></label>
        <input 
          type="number" 
          class="form-control" 
          v-model="form.stock"
          :class="{ 'is-invalid': errors.stock }"
          min="0"
          required
        >
        <div class="invalid-feedback" v-if="errors.stock">{{ errors.stock }}</div>
      </div>
      
      <div class="form-group">
        <label>Sản phẩm nổi bật</label>
        <div class="form-check mt-2">
          <input type="checkbox" class="form-check-input" v-model="form.isFeatured">
          <label class="form-check-label">Hiển thị ở trang chủ</label>
        </div>
      </div>
    </div>
    
    <!-- Thông số kỹ thuật -->
    <div class="form-group">
      <label>Thông số kỹ thuật</label>
      <div class="specs-grid">
        <div v-for="(value, key) in form.specs" :key="key" class="spec-item">
          <label>{{ formatSpecLabel(key) }}</label>
          <input type="text" class="form-control" v-model="form.specs[key]">
        </div>
      </div>
    </div>
    
    <!-- Hình ảnh -->
    <div class="form-group">
      <label>Hình ảnh <span class="text-danger">*</span></label>
      <div class="image-upload">
        <div class="image-preview" v-if="form.images && form.images.length > 0">
          <div v-for="(image, index) in form.images" :key="index" class="image-item">
            <img :src="image" alt="Product image">
            <button type="button" class="btn btn-danger btn-sm" @click="removeImage(index)">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        <div class="upload-area" @click="triggerFileInput">
          <i class="bi bi-cloud-upload fs-2"></i>
          <p>Click để upload ảnh</p>
          <input 
            type="file" 
            ref="fileInput"
            accept="image/*"
            multiple
            @change="handleFileUpload"
            style="display: none"
          >
        </div>
      </div>
      <div class="invalid-feedback" v-if="errors.images">{{ errors.images }}</div>
    </div>
    
    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ isEdit ? 'Cập nhật' : 'Tạo sản phẩm' }}
      </button>
      <button type="button" class="btn btn-secondary" @click="resetForm">Hủy</button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useCategoryStore } from '../../store/category';
import { toast } from 'vue3-toastify';
import { createSlug } from '../../utils/helpers';

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

const categoryStore = useCategoryStore();
const categories = computed(() => categoryStore.categories);

const loading = ref(false);
const errors = reactive({});
const fileInput = ref(null);

const defaultSpecs = {
  processor: '',
  ram: '',
  storage: '',
  display: '',
  graphics: '',
  os: '',
  weight: '',
  battery: '',
  ports: '',
  color: ''
};

const form = reactive({
  name: '',
  slug: '',
  description: '',
  price: '',
  discount: 0,
  category: '',
  brand: '',
  specs: { ...defaultSpecs },
  images: [],
  stock: '',
  isFeatured: false
});

const isEdit = computed(() => !!props.product);

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

const validateForm = () => {
  const newErrors = {};
  if (!form.name) newErrors.name = 'Vui lòng nhập tên sản phẩm';
  if (!form.slug) newErrors.slug = 'Vui lòng nhập slug';
  if (!form.description) newErrors.description = 'Vui lòng nhập mô tả';
  if (!form.price || form.price <= 0) newErrors.price = 'Vui lòng nhập giá hợp lệ';
  if (!form.category) newErrors.category = 'Vui lòng chọn danh mục';
  if (!form.brand) newErrors.brand = 'Vui lòng nhập thương hiệu';
  if (!form.stock || form.stock < 0) newErrors.stock = 'Vui lòng nhập tồn kho hợp lệ';
  if (!form.images || form.images.length === 0) newErrors.images = 'Vui lòng thêm ít nhất 1 hình ảnh';
  
  Object.assign(errors, newErrors);
  return Object.keys(newErrors).length === 0;
};

const submitForm = () => {
  if (!validateForm()) {
    toast.warning('Vui lòng kiểm tra lại thông tin');
    return;
  }
  
  const productData = {
    ...form,
    price: Number(form.price),
    discount: Number(form.discount),
    stock: Number(form.stock)
  };
  
  emit('submit', productData);
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  // Convert to base64 (temporary)
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.images.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
  
  fileInput.value.value = '';
};

const removeImage = (index) => {
  form.images.splice(index, 1);
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const resetForm = () => {
  Object.assign(form, {
    name: '',
    slug: '',
    description: '',
    price: '',
    discount: 0,
    category: '',
    brand: '',
    specs: { ...defaultSpecs },
    images: [],
    stock: '',
    isFeatured: false
  });
  Object.keys(errors).forEach(key => delete errors[key]);
  emit('cancel');
};

const loadProductData = () => {
  if (!props.product) return;
  
  Object.assign(form, {
    name: props.product.name || '',
    slug: props.product.slug || '',
    description: props.product.description || '',
    price: props.product.price || '',
    discount: props.product.discount || 0,
    category: props.product.category?._id || props.product.category || '',
    brand: props.product.brand || '',
    specs: props.product.specs || { ...defaultSpecs },
    images: props.product.images || [],
    stock: props.product.stock || '',
    isFeatured: props.product.isFeatured || false
  });
};

// Auto generate slug from name
watch(() => form.name, (newName) => {
  if (!isEdit.value && !form.slug) {
    form.slug = createSlug(newName);
  }
});

onMounted(() => {
  categoryStore.fetchCategories();
  if (isEdit.value) {
    loadProductData();
  }
});

// Import watch
import { watch } from 'vue';
</script>

<style scoped>
.admin-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
  font-size: 0.95rem;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.spec-item label {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.image-preview {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-item .btn {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  font-size: 12px;
}

.upload-area {
  width: 100px;
  height: 100px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8fafc;
}

.upload-area:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.upload-area p {
  font-size: 12px;
  color: #94a3b8;
  margin: 4px 0 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .admin-form {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .specs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
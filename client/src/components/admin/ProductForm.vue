<template>
  <form @submit.prevent="submitForm" class="product-form">
    <div class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Tên sản phẩm <span class="text-danger">*</span></label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.name" 
          required
          @input="generateSlug"
        >
      </div>

      <div class="col-md-6">
        <label class="form-label">Slug <span class="text-danger">*</span></label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.slug" 
          required
        >
        <small class="text-muted">Đường dẫn thân thiện với SEO</small>
      </div>

      <div class="col-12">
        <label class="form-label">Mô tả <span class="text-danger">*</span></label>
        <textarea 
          class="form-control" 
          v-model="form.description" 
          rows="3" 
          required
        ></textarea>
      </div>

      <div class="col-md-3">
        <label class="form-label">Giá <span class="text-danger">*</span></label>
        <input 
          type="number" 
          class="form-control" 
          v-model="form.price" 
          required 
          min="0"
        >
      </div>

      <div class="col-md-3">
        <label class="form-label">Giảm giá (%)</label>
        <input 
          type="number" 
          class="form-control" 
          v-model="form.discount" 
          min="0" 
          max="100"
        >
      </div>

      <div class="col-md-3">
        <label class="form-label">Tồn kho <span class="text-danger">*</span></label>
        <input 
          type="number" 
          class="form-control" 
          v-model="form.stock" 
          required 
          min="0"
        >
      </div>

      <div class="col-md-3">
        <label class="form-label">Thương hiệu <span class="text-danger">*</span></label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.brand" 
          required
        >
      </div>

      <div class="col-md-6">
        <label class="form-label">Danh mục <span class="text-danger">*</span></label>
        <select class="form-select" v-model="form.category" required>
          <option value="">Chọn danh mục</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label">Hình ảnh <span class="text-danger">*</span></label>
        <input 
          type="text" 
          class="form-control" 
          v-model="form.imagesText" 
          placeholder="URL hình ảnh (cách nhau bằng dấu phẩy)"
        >
        <small class="text-muted">Ví dụ: https://example.com/image1.jpg, https://example.com/image2.jpg</small>
      </div>

      <div class="col-12">
        <label class="form-label">Thông số kỹ thuật</label>
        <div class="row g-2">
          <div class="col-md-4">
            <input type="text" class="form-control" v-model="form.specs.processor" placeholder="CPU">
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control" v-model="form.specs.ram" placeholder="RAM">
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control" v-model="form.specs.storage" placeholder="Ổ cứng">
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control" v-model="form.specs.display" placeholder="Màn hình">
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control" v-model="form.specs.graphics" placeholder="Card đồ họa">
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control" v-model="form.specs.os" placeholder="Hệ điều hành">
          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="form-check">
          <input type="checkbox" class="form-check-input" id="isFeatured" v-model="form.isFeatured">
          <label class="form-check-label" for="isFeatured">Sản phẩm nổi bật</label>
        </div>
      </div>

      <div class="col-12">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          <i :class="isEdit ? 'bi bi-pencil' : 'bi bi-plus-circle'"></i>
          {{ isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm' }}
        </button>
        <button type="button" class="btn btn-secondary ms-2" @click="$emit('cancel')">
          <i class="bi bi-x-circle"></i> Hủy
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useCategoryStore } from '../../store/category';
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

const submitting = ref(false);
const isEdit = computed(() => !!props.product);

const defaultSpecs = {
  processor: '',
  ram: '',
  storage: '',
  display: '',
  graphics: '',
  os: ''
};

const form = reactive({
  name: '',
  slug: '',
  description: '',
  price: '',
  discount: 0,
  stock: '',
  brand: '',
  category: '',
  imagesText: '',
  specs: { ...defaultSpecs },
  isFeatured: false
});

// Auto generate slug from name
const generateSlug = () => {
  if (!isEdit.value && form.name) {
    form.slug = createSlug(form.name);
  }
};

// Load product data when editing
const loadProductData = () => {
  if (!props.product) return;
  
  console.log('📦 Loading product for edit:', props.product);
  
  form.name = props.product.name || '';
  form.slug = props.product.slug || '';
  form.description = props.product.description || '';
  form.price = props.product.price || '';
  form.discount = props.product.discount || 0;
  form.stock = props.product.stock || '';
  form.brand = props.product.brand || '';
  form.category = props.product.category?._id || props.product.category || '';
  form.imagesText = Array.isArray(props.product.images) 
    ? props.product.images.join(', ') 
    : props.product.images || '';
  form.specs = props.product.specs || { ...defaultSpecs };
  form.isFeatured = props.product.isFeatured || false;
};

// Submit form
const submitForm = () => {
  // Validate
  if (!form.name || !form.slug || !form.price || !form.stock || !form.brand || !form.category) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc');
    return;
  }

  // Convert images text to array
  const images = form.imagesText
    .split(',')
    .map(img => img.trim())
    .filter(img => img);

  if (images.length === 0) {
    alert('Vui lòng thêm ít nhất 1 hình ảnh');
    return;
  }

  const productData = {
    name: form.name.trim(),
    slug: form.slug.trim().toLowerCase(),
    description: form.description.trim(),
    price: Number(form.price),
    discount: Number(form.discount) || 0,
    stock: Number(form.stock),
    brand: form.brand.trim(),
    category: form.category,
    images: images,
    specs: form.specs,
    isFeatured: form.isFeatured
  };

  console.log('📤 Submitting product data:', productData);
  emit('submit', productData);
};

// Watch for product prop changes
watch(() => props.product, (newVal) => {
  if (newVal) {
    loadProductData();
  }
}, { immediate: true });

// Load categories on mount
onMounted(() => {
  categoryStore.fetchCategories();
});
</script>

<style scoped>
.product-form {
  padding: 0.5rem;
}

.product-form .form-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.product-form .form-control,
.product-form .form-select {
  border-radius: 8px;
}

.product-form .form-control:focus,
.product-form .form-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
</style>
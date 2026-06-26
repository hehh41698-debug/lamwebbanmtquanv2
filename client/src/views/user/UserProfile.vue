<template>
  <div class="user-profile">
    <h5 class="mb-4"><i class="bi bi-person me-2"></i>Thông tin cá nhân</h5>

    <div class="row">
      <div class="col-md-4 text-center">
        <div class="avatar-section">
          <img :src="user?.avatar || '/images/default-avatar.png'" class="profile-avatar">
          <button class="btn btn-sm btn-outline-primary mt-2" @click="openAvatarModal">
            <i class="bi bi-camera"></i> Đổi avatar
          </button>
        </div>
      </div>
      <div class="col-md-8">
        <form @submit.prevent="updateProfile">
          <div class="mb-3">
            <label class="form-label">Họ và tên</label>
            <input type="text" class="form-control" v-model="form.name" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" v-model="form.email" disabled>
          </div>
          <div class="mb-3">
            <label class="form-label">Số điện thoại</label>
            <input type="tel" class="form-control" v-model="form.phone">
          </div>
          <div class="mb-3">
            <label class="form-label">Địa chỉ</label>
            <input type="text" class="form-control" v-model="form.address" placeholder="Số nhà, tên đường">
          </div>
          <div class="mb-3">
            <label class="form-label">Thành phố</label>
            <input type="text" class="form-control" v-model="form.city">
          </div>
          <button type="submit" class="btn btn-primary" :disabled="updating">
            <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
            Cập nhật thông tin
          </button>
        </form>
      </div>
    </div>

    <!-- Avatar Modal -->
    <div v-if="showAvatarModal" class="modal-overlay" @click="closeAvatarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h5>Đổi avatar</h5>
          <button class="btn-close" @click="closeAvatarModal"></button>
        </div>
        <div class="modal-body text-center">
          <img :src="avatarPreview || user?.avatar || '/images/default-avatar.png'" class="avatar-preview">
          <input type="file" class="form-control mt-3" accept="image/*" @change="handleAvatarUpload" ref="fileInput">
          <div class="mt-3 d-flex gap-2 justify-content-center">
            <button class="btn btn-primary" @click="updateAvatar" :disabled="uploading">
              <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
              Cập nhật
            </button>
            <button class="btn btn-secondary" @click="closeAvatarModal">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useAuthStore } from '../../store/auth';
import { toast } from 'vue3-toastify';

const authStore = useAuthStore();

const user = computed(() => authStore.user);
const updating = ref(false);
const uploading = ref(false);
const showAvatarModal = ref(false);
const avatarPreview = ref(null);
const selectedFile = ref(null);
const fileInput = ref(null);

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: ''
});

const loadUserData = () => {
  if (user.value) {
    form.name = user.value.name || '';
    form.email = user.value.email || '';
    form.phone = user.value.phone || '';
    form.address = user.value.address?.street || '';
    form.city = user.value.address?.city || '';
  }
};

const updateProfile = async () => {
  updating.value = true;
  const result = await authStore.updateProfile({
    name: form.name,
    phone: form.phone,
    address: { street: form.address, city: form.city }
  });
  if (result.success) {
    toast.success('Cập nhật thông tin thành công');
    loadUserData();
  }
  updating.value = false;
};

const openAvatarModal = () => {
  showAvatarModal.value = true;
  avatarPreview.value = user.value?.avatar || null;
};

const closeAvatarModal = () => {
  showAvatarModal.value = false;
  avatarPreview.value = null;
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

const handleAvatarUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target.result;
    selectedFile.value = file;
  };
  reader.readAsDataURL(file);
};

const updateAvatar = async () => {
  if (!selectedFile.value) {
    toast.warning('Vui lòng chọn ảnh');
    return;
  }
  uploading.value = true;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const result = await authStore.updateAvatar(e.target.result);
    if (result.success) {
      toast.success('Cập nhật avatar thành công');
      closeAvatarModal();
      loadUserData();
    }
    uploading.value = false;
  };
  reader.readAsDataURL(selectedFile.value);
};

onMounted(() => loadUserData());
</script>

<style scoped>
.user-profile { padding: 0.5rem; }

.avatar-section { text-align: center; }
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
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
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body { padding: 1.5rem; }

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
}
</style>
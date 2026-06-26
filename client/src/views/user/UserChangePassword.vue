<template>
  <div class="user-change-password">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-3"><UserSidebar /></div>
        <div class="col-lg-9">
          <div class="password-content">
            <h5 class="mb-4"><i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu</h5>
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">Mật khẩu hiện tại</label>
                <input type="password" class="form-control" v-model="form.currentPassword" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Mật khẩu mới</label>
                <input type="password" class="form-control" v-model="form.newPassword" required minlength="6">
                <small class="text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Xác nhận mật khẩu mới</label>
                <input type="password" class="form-control" v-model="form.confirmPassword" required>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                Đổi mật khẩu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import UserSidebar from '../../components/user/UserSidebar.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();

const submitting = ref(false);
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const changePassword = async () => {
  if (form.newPassword !== form.confirmPassword) {
    toast.warning('Mật khẩu xác nhận không khớp');
    return;
  }
  
  if (form.newPassword.length < 6) {
    toast.warning('Mật khẩu phải có ít nhất 6 ký tự');
    return;
  }
  
  submitting.value = true;
  const result = await authStore.changePassword(form.currentPassword, form.newPassword);
  if (result.success) {
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
  }
  submitting.value = false;
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }
});
</script>

<style scoped>
.user-change-password { background: #f8fafc; min-height: 100vh; }
.password-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
</style>
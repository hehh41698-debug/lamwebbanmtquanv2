<template>
  <div class="user-change-password">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-3">
          <UserSidebar />
        </div>
        <div class="col-lg-9">
          <div class="password-content">
            <h5 class="mb-4">
              <i class="bi bi-shield-lock me-2"></i>Đổi mật khẩu
            </h5>

            <!-- Hiển thị thông báo -->
            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
              <i class="bi bi-check-circle me-2"></i>
              {{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>

            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
            </div>

            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">Mật khẩu hiện tại <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-lock"></i></span>
                  <input 
                    :type="showCurrentPassword ? 'text' : 'password'" 
                    class="form-control" 
                    v-model="form.currentPassword" 
                    required
                    placeholder="Nhập mật khẩu hiện tại"
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Mật khẩu mới <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-shield-lock"></i></span>
                  <input 
                    :type="showNewPassword ? 'text' : 'password'" 
                    class="form-control" 
                    v-model="form.newPassword" 
                    required
                    minlength="6"
                    placeholder="Ít nhất 6 ký tự"
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="showNewPassword = !showNewPassword"
                  >
                    <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <small class="text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
              </div>

              <div class="mb-3">
                <label class="form-label">Xác nhận mật khẩu mới <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-shield-check"></i></span>
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    class="form-control" 
                    v-model="form.confirmPassword" 
                    required
                    placeholder="Nhập lại mật khẩu mới"
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="submitting"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
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
const successMessage = ref('');
const errorMessage = ref('');
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const changePassword = async () => {
  // Reset messages
  successMessage.value = '';
  errorMessage.value = '';

  // Validate
  if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
    errorMessage.value = 'Vui lòng điền đầy đủ thông tin';
    toast.warning(errorMessage.value);
    return;
  }

  if (form.newPassword !== form.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp';
    toast.warning(errorMessage.value);
    return;
  }

  if (form.newPassword.length < 6) {
    errorMessage.value = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    toast.warning(errorMessage.value);
    return;
  }

  submitting.value = true;

  try {
    console.log('🔐 Đang đổi mật khẩu...');
    console.log('👤 User:', authStore.user?.email);
    console.log('📝 Current password length:', form.currentPassword.length);
    console.log('📝 New password length:', form.newPassword.length);

    const result = await authStore.changePassword(
      form.currentPassword,
      form.newPassword
    );

    console.log('📦 Result:', result);

    if (result.success) {
      successMessage.value = 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.';
      toast.success('Đổi mật khẩu thành công!');
      
      // Reset form
      form.currentPassword = '';
      form.newPassword = '';
      form.confirmPassword = '';
      
      // Tự động đăng xuất và chuyển về login sau 2.5 giây
      setTimeout(async () => {
        await authStore.logout();
        router.push('/login');
      }, 2500);
    } else {
      errorMessage.value = result.message || 'Đổi mật khẩu thất bại';
      toast.error(errorMessage.value);
    }
  } catch (error) {
    console.error('❌ Lỗi đổi mật khẩu:', error);
    console.error('❌ Error response:', error.response?.data);
    
    errorMessage.value = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    toast.error(errorMessage.value);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
  }
});
</script>

<style scoped>
.user-change-password {
  background: #f8fafc;
  min-height: 100vh;
}

.password-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.alert {
  border-radius: 8px;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .password-content {
    padding: 1rem;
  }
}
</style>
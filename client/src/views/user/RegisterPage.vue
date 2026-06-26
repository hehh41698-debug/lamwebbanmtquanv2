<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/images/logo.png" alt="Computer Store" height="50" @error="handleImageError">
          <h4>Đăng ký tài khoản</h4>
          <p>Tham gia cộng đồng Computer Store</p>
        </div>

        <!-- Hiển thị lỗi -->
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''"></button>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>Họ và tên <span class="text-danger">*</span></label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
              <input 
                type="text" 
                class="form-control" 
                v-model="form.name" 
                placeholder="Nguyễn Văn A" 
                required
                :disabled="loading"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Email <span class="text-danger">*</span></label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input 
                type="email" 
                class="form-control" 
                v-model="form.email" 
                placeholder="example@email.com" 
                required
                :disabled="loading"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Số điện thoại</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-phone"></i></span>
              <input 
                type="tel" 
                class="form-control" 
                v-model="form.phone" 
                placeholder="0123456789"
                :disabled="loading"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Mật khẩu <span class="text-danger">*</span></label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                class="form-control" 
                v-model="form.password" 
                placeholder="Ít nhất 6 ký tự" 
                required
                :disabled="loading"
              >
              <button 
                class="btn btn-outline-secondary" 
                type="button" 
                @click="showPassword = !showPassword"
                :disabled="loading"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <small class="text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
          </div>

          <div class="form-group">
            <label>Xác nhận mật khẩu <span class="text-danger">*</span></label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-shield-lock"></i></span>
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                class="form-control" 
                v-model="form.confirmPassword" 
                placeholder="Nhập lại mật khẩu" 
                required
                :disabled="loading"
              >
              <button 
                class="btn btn-outline-secondary" 
                type="button" 
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="loading"
              >
                <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-check mb-3">
            <input 
              type="checkbox" 
              class="form-check-input" 
              id="terms" 
              v-model="form.agreeTerms" 
              required
              :disabled="loading"
            >
            <label class="form-check-label" for="terms">
              Tôi đồng ý với <a href="#" class="text-primary">Điều khoản sử dụng</a>
            </label>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100" 
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Đã có tài khoản? <router-link to="/login">Đăng nhập ngay</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%232563eb"/%3E%3Ctext x="25" y="32" text-anchor="middle" fill="white" font-size="20" font-weight="bold"%3ECS%3C/text%3E%3C/svg%3E';
};

const handleRegister = async () => {
  // Reset error
  errorMessage.value = '';

  // Validate
  if (!form.name || !form.email || !form.password || !form.confirmPassword) {
    errorMessage.value = 'Vui lòng điền đầy đủ thông tin bắt buộc';
    return;
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp';
    return;
  }

  if (form.password.length < 6) {
    errorMessage.value = 'Mật khẩu phải có ít nhất 6 ký tự';
    return;
  }

  if (!form.agreeTerms) {
    errorMessage.value = 'Vui lòng đồng ý với điều khoản sử dụng';
    return;
  }

  loading.value = true;

  try {
    const result = await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone
    });

    if (result.success) {
      // Đăng ký thành công, chuyển về trang chủ
      toast.success('Đăng ký thành công!');
      router.push('/');
    } else {
      errorMessage.value = result.message || 'Đăng ký thất bại';
    }
  } catch (error) {
    console.error('Register error:', error);
    errorMessage.value = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.5s ease;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header img {
  margin-bottom: 1rem;
}

.auth-header h4 {
  font-weight: 700;
  color: #1a202c;
}

.auth-header p {
  color: #94a3b8;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
}

.alert {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.auth-footer a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.auth-footer a:hover {
  text-decoration: underline;
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
  .auth-card {
    padding: 1.5rem;
  }
}
</style>
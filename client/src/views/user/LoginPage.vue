<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/images/logo.png" alt="Computer Store" height="50" @error="handleImageError">
          <h4>Đăng nhập</h4>
          <p>Chào mừng bạn quay trở lại</p>
        </div>

        <!-- Hiển thị lỗi -->
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          {{ errorMessage }}
          <button type="button" class="btn-close" @click="errorMessage = ''"></button>
        </div>

        <!-- Hiển thị thành công -->
        <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
          <i class="bi bi-check-circle me-2"></i>
          {{ successMessage }}
          <button type="button" class="btn-close" @click="successMessage = ''"></button>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Email</label>
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
            <label>Mật khẩu</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                class="form-control" 
                v-model="form.password" 
                placeholder="Nhập mật khẩu" 
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
          </div>

          <div class="form-options">
            <div class="form-check">
              <input type="checkbox" class="form-check-input" id="remember" v-model="form.remember">
              <label class="form-check-label" for="remember">Ghi nhớ</label>
            </div>
            <a href="#" class="forgot-link">Quên mật khẩu?</a>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-100" 
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link></p>
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
  email: 'admin@computerstore.com',
  password: 'admin123',
  remember: false
});

const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleImageError = (event) => {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%232563eb"/%3E%3Ctext x="25" y="32" text-anchor="middle" fill="white" font-size="20" font-weight="bold"%3ECS%3C/text%3E%3C/svg%3E';
};

const handleLogin = async () => {
  // Reset messages
  errorMessage.value = '';
  successMessage.value = '';

  // Validate
  if (!form.email || !form.password) {
    errorMessage.value = 'Vui lòng nhập đầy đủ email và mật khẩu';
    return;
  }

  loading.value = true;

  try {
    console.log('🔐 Attempting login with:', form.email);
    
    const result = await authStore.login(form.email, form.password);

    console.log('📦 Login result:', result);

    if (result.success) {
      successMessage.value = 'Đăng nhập thành công! Đang chuyển hướng...';
      toast.success('Đăng nhập thành công!');
      
      // Chuyển hướng sau 1 giây
      setTimeout(() => {
        const redirect = router.currentRoute.value.query.redirect || '/';
        router.push(redirect);
      }, 1000);
    } else {
      errorMessage.value = result.message || 'Đăng nhập thất bại';
      toast.error(errorMessage.value);
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    errorMessage.value = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    toast.error(errorMessage.value);
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.forgot-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
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

.alert {
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
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
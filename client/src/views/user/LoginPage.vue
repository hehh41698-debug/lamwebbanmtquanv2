<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img src="/images/logo.png" alt="Computer Store" height="50">
          <h4>Đăng nhập</h4>
          <p>Chào mừng bạn quay trở lại</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Email</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input type="email" class="form-control" v-model="form.email" placeholder="example@email.com" required>
            </div>
          </div>

          <div class="form-group">
            <label>Mật khẩu</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input :type="showPassword ? 'text' : 'password'" class="form-control" v-model="form.password" placeholder="Nhập mật khẩu" required>
              <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
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

          <button type="submit" class="btn btn-primary w-100" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Đăng nhập
          </button>
        </form>

        <div class="auth-footer">
          <p>Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link></p>
        </div>

        <div class="auth-divider">
          <span>Hoặc</span>
        </div>

        <div class="social-login">
          <button class="btn btn-outline-danger w-100">
            <i class="bi bi-google me-2"></i> Đăng nhập với Google
          </button>
          <button class="btn btn-outline-primary w-100">
            <i class="bi bi-facebook me-2"></i> Đăng nhập với Facebook
          </button>
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
  email: '',
  password: '',
  remember: false
});

const showPassword = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  const result = await authStore.login(form.email, form.password);
  
  if (result.success) {
    toast.success('Đăng nhập thành công');
    router.push('/');
  } else {
    toast.error(result.message || 'Đăng nhập thất bại');
  }
  
  loading.value = false;
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

.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #94a3b8;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.auth-divider::before {
  margin-right: 10px;
}

.auth-divider::after {
  margin-left: 10px;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-login .btn {
  padding: 10px;
  font-weight: 500;
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
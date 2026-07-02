<template>
  <div class="contact-page py-4">
    <div class="container">
      <h4 class="mb-4">
        <i class="bi bi-envelope text-primary me-2"></i>Liên hệ
      </h4>

      <div class="row g-4">
        <div class="col-lg-6">
          <div class="contact-info">
            <h6>Thông tin liên hệ</h6>
            <div class="contact-item">
              <i class="bi bi-geo-alt text-primary"></i>
              <div>
                <strong>Địa chỉ</strong>
                <p>123 Đường ABC, Quận 1, TP.HCM</p>
              </div>
            </div>
            <div class="contact-item">
              <i class="bi bi-phone text-primary"></i>
              <div>
                <strong>Điện thoại</strong>
                <p>(028) 1234 5678</p>
              </div>
            </div>
            <div class="contact-item">
              <i class="bi bi-envelope text-primary"></i>
              <div>
                <strong>Email</strong>
                <p>info@computerstore.com</p>
              </div>
            </div>
            <div class="contact-item">
              <i class="bi bi-clock text-primary"></i>
              <div>
                <strong>Giờ làm việc</strong>
                <p>8:00 - 22:00 hàng ngày</p>
              </div>
            </div>
          </div>

          <div class="social-contact mt-4">
            <h6>Kết nối với chúng tôi</h6>
            <div class="social-links">
              <a href="#" class="btn btn-outline-primary"><i class="bi bi-facebook"></i> Facebook</a>
              <a href="#" class="btn btn-outline-primary"><i class="bi bi-instagram"></i> Instagram</a>
              <a href="#" class="btn btn-outline-primary"><i class="bi bi-youtube"></i> YouTube</a>
              <a href="#" class="btn btn-outline-primary"><i class="bi bi-tiktok"></i> TikTok</a>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="contact-form">
            <h6>Gửi tin nhắn cho chúng tôi</h6>

            <!-- Thông báo -->
            <div v-if="successMessage" class="alert alert-success">
              <i class="bi bi-check-circle me-2"></i>
              {{ successMessage }}
            </div>

            <div v-if="errorMessage" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ errorMessage }}
            </div>

            <form @submit.prevent="submitContact">
              <div class="mb-3">
                <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="form.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email <span class="text-danger">*</span></label>
                <input type="email" class="form-control" v-model="form.email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Số điện thoại</label>
                <input type="tel" class="form-control" v-model="form.phone">
              </div>
              <div class="mb-3">
                <label class="form-label">Chủ đề <span class="text-danger">*</span></label>
                <select class="form-select" v-model="form.subject" required>
                  <option value="">Chọn chủ đề</option>
                  <option value="order">Đơn hàng</option>
                  <option value="product">Sản phẩm</option>
                  <option value="return">Đổi trả</option>
                  <option value="warranty">Bảo hành</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Nội dung <span class="text-danger">*</span></label>
                <textarea class="form-control" v-model="form.message" rows="5" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                Gửi tin nhắn
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
import { useAuthStore } from '../store/auth';
import { useMessageStore } from '../store/message';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const messageStore = useMessageStore();

const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
});

const submitContact = async () => {
  // Reset messages
  successMessage.value = '';
  errorMessage.value = '';

  // Validate
  if (!form.name || !form.email || !form.subject || !form.message) {
    errorMessage.value = 'Vui lòng điền đầy đủ thông tin';
    toast.warning(errorMessage.value);
    return;
  }

  submitting.value = true;

  try {
    console.log('📝 Sending message:', form);

    const result = await messageStore.sendMessage({
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      subject: form.subject,
      message: form.message
    });

    console.log('📦 Result:', result);

    if (result.success) {
      successMessage.value = 'Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi sớm.';
      toast.success('Gửi tin nhắn thành công!');
      
      // Reset form
      Object.assign(form, {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => {
        successMessage.value = '';
      }, 5000);
    } else {
      errorMessage.value = result.error || 'Gửi tin nhắn thất bại';
      toast.error(errorMessage.value);
    }
  } catch (error) {
    console.error('❌ Submit contact error:', error);
    errorMessage.value = error.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
    toast.error(errorMessage.value);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  // Kiểm tra đăng nhập
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  // Load user info
  if (authStore.user) {
    form.name = authStore.user.name || '';
    form.email = authStore.user.email || '';
    form.phone = authStore.user.phone || '';
  }
});
</script>

<style scoped>
.contact-page {
  background: #f8fafc;
  min-height: 100vh;
}

.contact-info {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.contact-info h6 {
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1a202c;
}

.contact-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item i {
  font-size: 1.5rem;
  margin-top: 4px;
}

.contact-item strong {
  display: block;
  color: #1a202c;
}

.contact-item p {
  margin: 0;
  color: #4a5568;
}

.social-contact {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.social-contact h6 {
  font-weight: 600;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.social-links .btn {
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
}

.contact-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.contact-form h6 {
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.alert {
  border-radius: 8px;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .contact-info,
  .social-contact,
  .contact-form {
    padding: 1.5rem;
  }
  
  .social-links {
    flex-direction: column;
  }
  
  .social-links .btn {
    width: 100%;
  }
}
</style>
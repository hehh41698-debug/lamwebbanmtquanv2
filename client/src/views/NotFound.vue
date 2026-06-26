<template>
  <div class="not-found-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="not-found-content text-center">
            <div class="not-found-icon">
              <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
            </div>
            <h1 class="display-1 fw-bold text-primary">404</h1>
            <h2 class="mb-3">Không tìm thấy trang</h2>
            <p class="text-muted mb-4">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <router-link to="/" class="btn btn-primary btn-lg">
                <i class="bi bi-house"></i> Về trang chủ
              </router-link>
              <router-link to="/products" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-grid-3x3-gap"></i> Xem sản phẩm
              </router-link>
            </div>
            <div class="mt-4">
              <router-link to="/login" class="text-muted text-decoration-none me-3">
                <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
              </router-link>
              <router-link to="/register" class="text-muted text-decoration-none">
                <i class="bi bi-person-plus"></i> Đăng ký
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Không cần logic gì thêm
</script>

<style scoped>
.not-found-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 1rem;
}

.not-found-content {
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  animation: fadeInUp 0.5s ease;
}

.not-found-icon {
  margin-bottom: 1rem;
}

.not-found-icon i {
  font-size: 4rem;
}

@keyframes fadeInUp {
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
  .not-found-content {
    padding: 2rem 1rem;
  }
  .not-found-content h1 {
    font-size: 4rem;
  }
}
</style>
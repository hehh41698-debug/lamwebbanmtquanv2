<template>
  <footer class="footer bg-dark text-white pt-5 pb-3 mt-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4">
          <h5 class="mb-3">Computer Store</h5>
          <p>Chuyên cung cấp các sản phẩm máy tính, laptop và linh kiện chất lượng cao với giá tốt nhất.</p>
          <div class="social-icons">
            <a href="#" class="text-white me-3"><i class="bi bi-facebook fs-5"></i></a>
            <a href="#" class="text-white me-3"><i class="bi bi-twitter fs-5"></i></a>
            <a href="#" class="text-white me-3"><i class="bi bi-instagram fs-5"></i></a>
            <a href="#" class="text-white"><i class="bi bi-youtube fs-5"></i></a>
          </div>
        </div>
        
        <div class="col-lg-2">
          <h6 class="mb-3">Sản phẩm</h6>
          <ul class="list-unstyled">
            <li><router-link to="/products" class="text-white-50 text-decoration-none">Laptop</router-link></li>
            <li><router-link to="/products" class="text-white-50 text-decoration-none">Desktop</router-link></li>
            <li><router-link to="/products" class="text-white-50 text-decoration-none">Linh kiện</router-link></li>
            <li><router-link to="/products" class="text-white-50 text-decoration-none">Phụ kiện</router-link></li>
          </ul>
        </div>
        
        <div class="col-lg-3">
          <h6 class="mb-3">Hỗ trợ</h6>
          <ul class="list-unstyled">
            <li><a href="#" class="text-white-50 text-decoration-none">Chính sách bảo hành</a></li>
            <li><a href="#" class="text-white-50 text-decoration-none">Chính sách đổi trả</a></li>
            <li><a href="#" class="text-white-50 text-decoration-none">Hướng dẫn mua hàng</a></li>
            <li><a href="#" class="text-white-50 text-decoration-none">Liên hệ</a></li>
          </ul>
        </div>
        
        <div class="col-lg-3">
          <h6 class="mb-3">Liên hệ</h6>
          <ul class="list-unstyled">
            <li><i class="bi bi-geo-alt me-2"></i>123 Đường ABC, TP.HCM</li>
            <li><i class="bi bi-phone me-2"></i>0123 456 789</li>
            <li><i class="bi bi-envelope me-2"></i>info@computerstore.com</li>
            <li><i class="bi bi-clock me-2"></i>8:00 - 22:00 hàng ngày</li>
          </ul>
        </div>
      </div>
      
      <hr class="border-secondary">
      
      <div class="text-center">
        <p class="mb-0 text-white-50">© 2024 Computer Store. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
}

.social-icons a {
  transition: color 0.3s;
}

.social-icons a:hover {
  color: #2563eb !important;
}

.footer ul li {
  margin-bottom: 8px;
}

.footer ul li a:hover {
  color: #2563eb !important;
}
</style>
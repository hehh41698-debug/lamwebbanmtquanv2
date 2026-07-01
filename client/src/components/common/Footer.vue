<template>
  <footer class="footer bg-dark text-white pt-5 pb-3 mt-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4">
          <h5 class="mb-3">Computer Store</h5>
          <p>Chuyên cung cấp các sản phẩm máy tính, laptop và linh kiện chất lượng cao với giá tốt nhất.</p>
          <div class="social-icons">
            <a 
              href="https://www.facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-white me-3"
              aria-label="Facebook"
              title="Theo dõi chúng tôi trên Facebook"
            >
              <i class="bi bi-facebook fs-5"></i>
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-white me-3"
              aria-label="Twitter"
              title="Theo dõi chúng tôi trên Twitter"
            >
              <i class="bi bi-twitter fs-5"></i>
            </a>
            <a 
              href="https://www.instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-white me-3"
              aria-label="Instagram"
              title="Theo dõi chúng tôi trên Instagram"
            >
              <i class="bi bi-instagram fs-5"></i>
            </a>
            <a 
              href="https://www.youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-white"
              aria-label="YouTube"
              title="Đăng ký kênh YouTube của chúng tôi"
            >
              <i class="bi bi-youtube fs-5"></i>
            </a>
            <a 
              href="https://www.tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-white ms-3"
              aria-label="TikTok"
              title="Theo dõi chúng tôi trên TikTok"
            >
              <i class="bi bi-tiktok fs-5"></i>
            </a>
          </div>
        </div>
        
        <div class="col-lg-2">
          <h6 class="mb-3">Sản phẩm</h6>
          <ul class="list-unstyled">
            <li><router-link to="/products?category=laptop" class="text-white-50 text-decoration-none">Laptop</router-link></li>
            <li><router-link to="/products?category=desktop" class="text-white-50 text-decoration-none">Desktop</router-link></li>
            <li><router-link to="/products?category=components" class="text-white-50 text-decoration-none">Linh kiện</router-link></li>
            <li><router-link to="/products?category=accessories" class="text-white-50 text-decoration-none">Phụ kiện</router-link></li>
          </ul>
        </div>
        
        <div class="col-lg-3">
          <h6 class="mb-3">Hỗ trợ</h6>
          <ul class="list-unstyled">
            <li><router-link to="/support/warranty" class="text-white-50 text-decoration-none">Chính sách bảo hành</router-link></li>
            <li><router-link to="/support/return" class="text-white-50 text-decoration-none">Chính sách đổi trả</router-link></li>
            <li><router-link to="/support/guide" class="text-white-50 text-decoration-none">Hướng dẫn mua hàng</router-link></li>
            <li><router-link to="/support/faq" class="text-white-50 text-decoration-none">Câu hỏi thường gặp</router-link></li>
          </ul>
        </div>
        
        <div class="col-lg-3">
          <h6 class="mb-3">Liên hệ</h6>
          <ul class="list-unstyled">
            <li><i class="bi bi-geo-alt me-2"></i>123 Đường ABC, Quận 1, TP.HCM</li>
            <li><i class="bi bi-phone me-2"></i>(028) 1234 5678</li>
            <li><i class="bi bi-envelope me-2"></i>info@computerstore.com</li>
            <li><i class="bi bi-clock me-2"></i>8:00 - 22:00 hàng ngày</li>
          </ul>
        </div>
      </div>
      
      <hr class="border-secondary">
      
      <div class="row align-items-center">
        <div class="col-md-6 text-center text-md-start">
          <p class="mb-0 text-white-50">© 2024 Computer Store. All rights reserved.</p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <div class="payment-methods">
            <i class="bi bi-credit-card fs-4 text-white-50 me-2" title="Thanh toán bằng thẻ"></i>
            <i class="bi bi-bank fs-4 text-white-50 me-2" title="Chuyển khoản ngân hàng"></i>
            <i class="bi bi-wallet2 fs-4 text-white-50" title="Ví điện tử"></i>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Không cần logic gì thêm
</script>

<style scoped>
.footer {
  margin-top: auto;
  background: #0f172a !important;
}

.social-icons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.social-icons a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  text-decoration: none;
  color: #94a3b8 !important;
}

.social-icons a:hover {
  background: #2563eb;
  color: white !important;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.social-icons a i {
  font-size: 1.2rem;
}

.footer ul li {
  margin-bottom: 8px;
}

.footer ul li a {
  transition: color 0.3s ease;
  color: #94a3b8 !important;
}

.footer ul li a:hover {
  color: #2563eb !important;
}

.footer ul li i {
  color: #2563eb;
  width: 20px;
}

.payment-methods i {
  transition: color 0.3s ease;
}

.payment-methods i:hover {
  color: #2563eb !important;
}

@media (max-width: 768px) {
  .social-icons {
    justify-content: center;
  }
  
  .social-icons a {
    width: 36px;
    height: 36px;
  }
}
</style>
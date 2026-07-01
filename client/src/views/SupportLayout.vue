<template>
  <div class="support-layout py-4">
    <div class="container">
      <div class="row">
        <div class="col-lg-3">
          <div class="support-sidebar">
            <h6 class="support-sidebar-title">Hỗ trợ</h6>
            <ul class="support-sidebar-menu">
              <li>
                <router-link to="/support/warranty" exact>
                  <i class="bi bi-shield-check"></i> Chính sách bảo hành
                </router-link>
              </li>
              <li>
                <router-link to="/support/return">
                  <i class="bi bi-arrow-return-left"></i> Chính sách đổi trả
                </router-link>
              </li>
              <li>
                <router-link to="/support/guide">
                  <i class="bi bi-book"></i> Hướng dẫn mua hàng
                </router-link>
              </li>
              <li>
                <router-link to="/support/faq">
                  <i class="bi bi-question-circle"></i> Câu hỏi thường gặp
                </router-link>
              </li>
              <li>
                <router-link to="/contact">
                  <i class="bi bi-envelope"></i> Liên hệ
                </router-link>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-lg-9">
          <div class="support-content">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed
</script>

<style scoped>
.support-layout {
  background: #f8fafc;
  min-height: 100vh;
}

.support-sidebar {
  background: white;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  position: sticky;
  top: 100px;
}

.support-sidebar-title {
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.support-sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.support-sidebar-menu li {
  margin-bottom: 4px;
}

.support-sidebar-menu li a {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  color: #4a5568;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  gap: 10px;
}

.support-sidebar-menu li a:hover {
  background: #f8fafc;
  color: #2563eb;
}

.support-sidebar-menu li a.router-link-active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.support-sidebar-menu li a i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.support-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  min-height: 500px;
}

@media (max-width: 992px) {
  .support-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 768px) {
  .support-content {
    padding: 1.5rem;
  }
}
</style>
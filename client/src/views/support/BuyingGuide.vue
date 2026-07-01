<template>
  <div class="buying-guide">
    <h4 class="mb-4">
      <i class="bi bi-book text-primary me-2"></i>Hướng dẫn mua hàng
    </h4>

    <div class="guide-content">
      <div class="step-card">
        <div class="step-number">1</div>
        <div class="step-content">
          <h6>Chọn sản phẩm</h6>
          <p>Duyệt danh sách sản phẩm trên website, sử dụng bộ lọc để tìm kiếm nhanh.</p>
          <router-link to="/products" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-grid-3x3-gap"></i> Xem sản phẩm
          </router-link>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">2</div>
        <div class="step-content">
          <h6>Thêm vào giỏ hàng</h6>
          <p>Chọn số lượng và nhấn "Thêm vào giỏ hàng". Tiếp tục mua sắm hoặc vào giỏ để thanh toán.</p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">3</div>
        <div class="step-content">
          <h6>Kiểm tra giỏ hàng</h6>
          <p>Xem lại sản phẩm, số lượng và tổng tiền. Có thể cập nhật số lượng hoặc xóa sản phẩm.</p>
          <router-link to="/cart" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-cart"></i> Xem giỏ hàng
          </router-link>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">4</div>
        <div class="step-content">
          <h6>Đăng nhập</h6>
          <p>Đăng nhập tài khoản để tiến hành thanh toán. Nếu chưa có tài khoản, đăng ký ngay.</p>
          <div class="d-flex gap-2">
            <router-link to="/login" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-box-arrow-in-right"></i> Đăng nhập
            </router-link>
            <router-link to="/register" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-person-plus"></i> Đăng ký
            </router-link>
          </div>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">5</div>
        <div class="step-content">
          <h6>Nhập thông tin giao hàng</h6>
          <p>Điền đầy đủ thông tin nhận hàng: họ tên, số điện thoại, địa chỉ.</p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">6</div>
        <div class="step-content">
          <h6>Thanh toán</h6>
          <p>Chọn phương thức thanh toán và hoàn tất đơn hàng. Đơn hàng sẽ được xử lý ngay lập tức.</p>
        </div>
      </div>

      <div class="step-card">
        <div class="step-number">7</div>
        <div class="step-content">
          <h6>Theo dõi đơn hàng</h6>
          <p>Kiểm tra trạng thái đơn hàng trong phần "Đơn hàng của tôi" trong tài khoản.</p>
          <router-link to="/dashboard/orders" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-box"></i> Xem đơn hàng
          </router-link>
        </div>
      </div>

      <div class="guide-note mt-4">
        <h6><i class="bi bi-headset me-2"></i>Cần hỗ trợ?</h6>
        <p>Liên hệ với chúng tôi để được tư vấn chi tiết:</p>
        <ul>
          <li><strong>Hotline:</strong> 0123 456 789</li>
          <li><strong>Email:</strong> support@computerstore.com</li>
          <li><strong>Zalo:</strong> 0123 456 789</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.buying-guide {
  padding: 0.5rem;
}

.step-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;
}

.step-card:hover {
  background: #f1f5f9;
  transform: translateX(5px);
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h6 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1a202c;
}

.step-content p {
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.guide-note {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #2563eb;
}

.guide-note h6 {
  margin-top: 0;
  color: #1a202c;
}

.guide-note ul {
  padding-left: 1.5rem;
  color: #4a5568;
  margin-bottom: 0;
}

@media (max-width: 576px) {
  .step-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
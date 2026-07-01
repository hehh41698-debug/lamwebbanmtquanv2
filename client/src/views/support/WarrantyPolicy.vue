<template>
  <div class="warranty-policy">
    <h4 class="mb-4">
      <i class="bi bi-shield-check text-primary me-2"></i>Chính sách bảo hành
    </h4>

    <div class="policy-content">
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        Computer Store cam kết bảo hành sản phẩm theo đúng quy định của nhà sản xuất và các điều khoản dưới đây.
      </div>

      <h6>1. Thời gian bảo hành</h6>
      <ul>
        <li><strong>Laptop:</strong> 12 tháng (có thể lên đến 24 tháng tùy hãng)</li>
        <li><strong>Linh kiện máy tính:</strong> 12 tháng</li>
        <li><strong>Phụ kiện:</strong> 6 tháng</li>
        <li><strong>Pin laptop:</strong> 6 tháng</li>
        <li><strong>Bộ nguồn:</strong> 12 tháng</li>
      </ul>

      <h6>2. Điều kiện bảo hành</h6>
      <ul>
        <li>Sản phẩm còn trong thời hạn bảo hành</li>
        <li>Có phiếu bảo hành hoặc hóa đơn mua hàng</li>
        <li>Tem bảo hành còn nguyên vẹn</li>
        <li>Lỗi do nhà sản xuất (không do tác động bên ngoài)</li>
      </ul>

      <h6>3. Các trường hợp không được bảo hành</h6>
      <ul>
        <li>Sản phẩm hết thời hạn bảo hành</li>
        <li>Mất tem bảo hành hoặc tem bị rách</li>
        <li>Sản phẩm bị va đập, rơi vỡ, ngấm nước</li>
        <li>Tự ý sửa chữa, tháo lắp khi chưa có sự đồng ý</li>
        <li>Sử dụng sai cách gây hư hỏng</li>
      </ul>

      <h6>4. Quy trình bảo hành</h6>
      <ol>
        <li>Khách hàng mang sản phẩm và phiếu bảo hành đến cửa hàng</li>
        <li>Nhân viên kiểm tra và xác nhận tình trạng sản phẩm</li>
        <li>Nếu đủ điều kiện, tiếp nhận và nhập vào hệ thống</li>
        <li>Thời gian xử lý: 3-7 ngày làm việc</li>
        <li>Thông báo kết quả và bàn giao sản phẩm</li>
      </ol>

      <div class="policy-note mt-4">
        <h6><i class="bi bi-telephone me-2"></i>Hotline hỗ trợ bảo hành</h6>
        <p><strong>Số điện thoại:</strong> 0123 456 789</p>
        <p><strong>Email:</strong> warranty@computerstore.com</p>
        <p><strong>Giờ làm việc:</strong> 8:00 - 22:00 hàng ngày</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed
</script>

<style scoped>
.warranty-policy {
  padding: 0.5rem;
}

.policy-content h6 {
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1a202c;
}

.policy-content ul,
.policy-content ol {
  padding-left: 1.5rem;
  color: #4a5568;
  line-height: 1.8;
}

.policy-content li {
  margin-bottom: 0.25rem;
}

.policy-note {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #2563eb;
}

.policy-note h6 {
  margin-top: 0;
  color: #1a202c;
}

.policy-note p {
  margin-bottom: 0.25rem;
  color: #4a5568;
}
</style>
<template>
  <div class="return-policy">
    <h4 class="mb-4">
      <i class="bi bi-arrow-return-left text-primary me-2"></i>Chính sách đổi trả
    </h4>

    <div class="policy-content">
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Quý khách vui lòng kiểm tra kỹ sản phẩm trước khi nhận hàng để đảm bảo quyền lợi.
      </div>

      <h6>1. Điều kiện đổi trả</h6>
      <ul>
        <li>Sản phẩm bị lỗi kỹ thuật từ nhà sản xuất</li>
        <li>Sản phẩm không đúng mẫu mã, màu sắc</li>
        <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
        <li>Thời gian đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng</li>
      </ul>

      <h6>2. Các trường hợp không được đổi trả</h6>
      <ul>
        <li>Sản phẩm đã qua sử dụng</li>
        <li>Mất tem, hộp, phụ kiện đi kèm</li>
        <li>Sản phẩm bị trầy xước, va đập do người dùng</li>
        <li>Sản phẩm đã kích hoạt bảo hành hoặc đăng ký</li>
      </ul>

      <h6>3. Quy trình đổi trả</h6>
      <ol>
        <li>Liên hệ với bộ phận CSKH để được hướng dẫn</li>
        <li>Chuẩn bị đầy đủ sản phẩm, hóa đơn, phụ kiện</li>
        <li>Mang hoặc gửi sản phẩm về cửa hàng</li>
        <li>Kiểm tra và xác nhận tình trạng sản phẩm</li>
        <li>Thực hiện đổi hoặc hoàn tiền (3-5 ngày)</li>
      </ol>

      <div class="policy-note mt-4">
        <h6><i class="bi bi-credit-card me-2"></i>Hình thức hoàn tiền</h6>
        <ul>
          <li><strong>Chuyển khoản:</strong> 1-3 ngày làm việc</li>
          <li><strong>Tiền mặt:</strong> Nhận tại cửa hàng</li>
          <li><strong>Ví điện tử:</strong> 1-2 ngày làm việc</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.return-policy {
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

.policy-note ul {
  margin-bottom: 0;
}
</style>
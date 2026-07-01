<template>
  <div class="faq-page">
    <h4 class="mb-4">
      <i class="bi bi-question-circle text-primary me-2"></i>Câu hỏi thường gặp
    </h4>

    <div class="faq-search mb-4">
      <div class="input-group">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" class="form-control" v-model="searchQuery" placeholder="Tìm kiếm câu hỏi...">
      </div>
    </div>

    <div class="faq-list">
      <div v-for="(faq, index) in filteredFAQs" :key="index" class="faq-item">
        <div class="faq-question" @click="toggleFAQ(index)">
          <i :class="faq.open ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
          <span>{{ faq.question }}</span>
        </div>
        <div v-show="faq.open" class="faq-answer">
          <p>{{ faq.answer }}</p>
        </div>
      </div>
    </div>

    <div class="faq-contact mt-4">
      <h6><i class="bi bi-envelope me-2"></i>Chưa tìm thấy câu trả lời?</h6>
      <p>Liên hệ với chúng tôi để được hỗ trợ:</p>
      <router-link to="/contact" class="btn btn-primary">
        <i class="bi bi-envelope"></i> Liên hệ ngay
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');

const faqs = ref([
  {
    question: 'Làm thế nào để đặt hàng?',
    answer: 'Bạn có thể đặt hàng bằng cách chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán. Bạn cần đăng nhập để hoàn tất đơn hàng.',
    open: false
  },
  {
    question: 'Thời gian giao hàng là bao lâu?',
    answer: 'Thời gian giao hàng thường từ 1-3 ngày làm việc đối với khu vực nội thành, 3-7 ngày đối với khu vực tỉnh xa.',
    open: false
  },
  {
    question: 'Phí vận chuyển được tính như thế nào?',
    answer: 'Phí vận chuyển được tính dựa trên địa chỉ giao hàng và tổng giá trị đơn hàng. Miễn phí vận chuyển cho đơn hàng từ 500.000đ.',
    open: false
  },
  {
    question: 'Tôi có thể đổi trả sản phẩm không?',
    answer: 'Có, bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tem, hộp và chưa qua sử dụng.',
    open: false
  },
  {
    question: 'Làm thế nào để kiểm tra trạng thái đơn hàng?',
    answer: 'Bạn có thể kiểm tra trạng thái đơn hàng trong phần "Đơn hàng của tôi" tại trang tài khoản.',
    open: false
  },
  {
    question: 'Tôi có thể thanh toán bằng những phương thức nào?',
    answer: 'Chúng tôi hỗ trợ các phương thức: Thanh toán khi nhận hàng (COD), Chuyển khoản ngân hàng, VNPay, MoMo.',
    open: false
  },
  {
    question: 'Có chính sách bảo hành không?',
    answer: 'Có, tất cả sản phẩm đều được bảo hành theo chính sách của nhà sản xuất, từ 6-24 tháng tùy loại sản phẩm.',
    open: false
  },
  {
    question: 'Làm thế nào để liên hệ với bộ phận hỗ trợ?',
    answer: 'Bạn có thể liên hệ qua hotline 0123 456 789, email support@computerstore.com hoặc chat trực tuyến trên website.',
    open: false
  }
]);

const filteredFAQs = computed(() => {
  if (!searchQuery.value) return faqs.value;
  const query = searchQuery.value.toLowerCase();
  return faqs.value.filter(faq => 
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  );
});

const toggleFAQ = (index) => {
  faqs.value[index].open = !faqs.value[index].open;
};
</script>

<style scoped>
.faq-page {
  padding: 0.5rem;
}

.faq-search .input-group {
  border-radius: 8px;
  overflow: hidden;
}

.faq-search .form-control {
  border: 2px solid #e2e8f0;
}

.faq-search .form-control:focus {
  border-color: #2563eb;
  box-shadow: none;
}

.faq-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.3s;
  font-weight: 500;
  color: #1a202c;
}

.faq-question:hover {
  background: #f1f5f9;
}

.faq-question i {
  font-size: 1.1rem;
  color: #2563eb;
  transition: transform 0.3s;
}

.faq-answer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.faq-answer p {
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
}

.faq-contact {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.faq-contact h6 {
  font-weight: 600;
  color: #1a202c;
}

.faq-contact p {
  color: #4a5568;
  margin-bottom: 1rem;
}
</style>
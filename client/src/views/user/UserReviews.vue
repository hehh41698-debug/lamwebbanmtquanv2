<template>
  <div class="user-reviews">
    <h5 class="mb-4"><i class="bi bi-chat-dots me-2"></i>Đánh giá của tôi</h5>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="reviews.length === 0" class="text-center py-5">
      <i class="bi bi-chat-dots fs-1 text-muted"></i>
      <p class="mt-2">Chưa có đánh giá nào</p>
      <router-link to="/products" class="btn btn-primary btn-sm">
        <i class="bi bi-cart"></i> Mua sắm ngay
      </router-link>
    </div>

    <div v-else class="reviews-list">
      <div v-for="review in reviews" :key="review._id" class="review-card">
        <div class="review-header">
          <div>
            <div class="review-product">{{ review.product?.name }}</div>
            <div class="review-rating">
              <i v-for="n in 5" :key="n" class="bi bi-star-fill"
                 :class="n <= review.rating ? 'text-warning' : 'text-secondary'"></i>
            </div>
          </div>
          <span :class="['badge', review.isApproved ? 'bg-success' : 'bg-warning']">
            {{ review.isApproved ? 'Đã duyệt' : 'Chờ duyệt' }}
          </span>
        </div>
        <div class="review-body">
          <p>{{ review.comment }}</p>
        </div>
        <div class="review-footer">
          <span class="text-muted small">{{ formatDate(review.createdAt) }}</span>
          <button class="btn btn-sm btn-outline-danger" @click="deleteReview(review._id)">
            <i class="bi bi-trash"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useReviewStore } from '../../store/review';
import { formatDate } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const reviewStore = useReviewStore();

const reviews = computed(() => reviewStore.reviews);
const loading = computed(() => reviewStore.loading);

const deleteReview = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
  const result = await reviewStore.deleteReview(id);
  if (result.success) {
    toast.success('Xóa đánh giá thành công');
    reviewStore.fetchUserReviews();
  }
};

onMounted(() => {
  reviewStore.fetchUserReviews();
});
</script>

<style scoped>
.user-reviews { padding: 0.5rem; }

.review-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.review-product { font-weight: 500; }
.review-rating { display: flex; gap: 2px; margin-top: 4px; }
.review-rating i { font-size: 14px; }

.review-body p { margin: 0; }

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}
</style>
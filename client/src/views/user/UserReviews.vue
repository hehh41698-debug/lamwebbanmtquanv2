<template>
  <div class="user-reviews">
    <div class="container py-4">
      <div class="row">
        <div class="col-lg-3">
          <UserSidebar />
        </div>
        <div class="col-lg-9">
          <div class="reviews-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="mb-0"><i class="bi bi-chat-dots me-2"></i>Đánh giá của tôi</h5>
              <span class="badge bg-primary">{{ pagination.total || 0 }} đánh giá</span>
            </div>

            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
            </div>

            <div v-else-if="reviews.length === 0" class="text-center py-5">
              <i class="bi bi-chat-dots fs-1 text-muted"></i>
              <h5 class="mt-3">Chưa có đánh giá nào</h5>
              <p class="text-muted">Hãy mua sắm và đánh giá sản phẩm bạn yêu thích</p>
              <router-link to="/products" class="btn btn-primary">
                <i class="bi bi-cart"></i> Mua sắm ngay
              </router-link>
            </div>

            <div v-else class="reviews-list">
              <div v-for="review in reviews" :key="review._id" class="review-card">
                <div class="review-header">
                  <div class="review-product-info">
                    <img 
                      :src="review.product?.images?.[0] || '/images/no-image.png'" 
                      :alt="review.product?.name"
                      class="review-product-image"
                    >
                    <div>
                      <router-link :to="`/product/${review.product?._id}`" class="review-product-name">
                        {{ review.product?.name }}
                      </router-link>
                      <div class="review-product-price">{{ formatPrice(review.product?.price) }}</div>
                    </div>
                  </div>
                  <span :class="['badge', review.isApproved ? 'bg-success' : 'bg-warning']">
                    {{ review.isApproved ? 'Đã duyệt' : 'Chờ duyệt' }}
                  </span>
                </div>

                <div class="review-body">
                  <div class="review-rating">
                    <i v-for="n in 5" :key="n" class="bi bi-star-fill"
                       :class="n <= review.rating ? 'text-warning' : 'text-secondary'"></i>
                    <span class="review-rating-text">{{ review.rating }} sao</span>
                  </div>
                  <p class="review-comment">{{ review.comment }}</p>
                  <div v-if="review.images?.length" class="review-images">
                    <img v-for="img in review.images" :key="img" :src="img" alt="Review image">
                  </div>
                </div>

                <div class="review-footer">
                  <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteReview(review._id)">
                    <i class="bi bi-trash"></i> Xóa
                  </button>
                </div>
              </div>
            </div>

            <div v-if="pagination.totalPages > 1" class="pagination-bar">
              <nav>
                <ul class="pagination pagination-sm">
                  <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                    <button class="page-link" @click="changePage(pagination.page - 1)">Trước</button>
                  </li>
                  <li v-for="page in pagination.totalPages" :key="page" 
                      class="page-item" :class="{ active: page === pagination.page }">
                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                    <button class="page-link" @click="changePage(pagination.page + 1)">Sau</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { useReviewStore } from '../../store/review';
import UserSidebar from '../../components/user/UserSidebar.vue';
import { formatPrice, formatDate } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const router = useRouter();
const authStore = useAuthStore();
const reviewStore = useReviewStore();

const reviews = computed(() => reviewStore.reviews);
const loading = computed(() => reviewStore.loading);
const pagination = computed(() => reviewStore.pagination);

const loadReviews = async () => {
  await reviewStore.fetchUserReviews({ page: pagination.value.page, limit: 10 });
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  reviewStore.pagination.page = page;
  loadReviews();
};

const deleteReview = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
  const result = await reviewStore.deleteReview(id);
  if (result.success) {
    toast.success('Xóa đánh giá thành công');
    loadReviews();
  }
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  loadReviews();
});
</script>

<style scoped>
.user-reviews {
  background: #f8fafc;
  min-height: 100vh;
}

.reviews-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.review-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s;
}

.review-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.review-product-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
  background: #f8fafc;
}

.review-product-name {
  font-weight: 500;
  color: #1a202c;
  text-decoration: none;
}

.review-product-name:hover {
  color: #2563eb;
}

.review-product-price {
  font-size: 0.875rem;
  color: #94a3b8;
}

.review-body {
  margin-bottom: 1rem;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.review-rating i {
  font-size: 16px;
}

.review-rating-text {
  font-size: 0.875rem;
  color: #94a3b8;
}

.review-comment {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-top: 0.5rem;
}

.review-images img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.review-date {
  font-size: 0.875rem;
  color: #94a3b8;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .reviews-content {
    padding: 1rem;
  }
  .review-card {
    padding: 1rem;
  }
  .review-product-info {
    flex-direction: column;
    align-items: flex-start;
  }
  .review-header {
    flex-direction: column;
  }
}
</style>
<template>
  <div class="admin-reviews">
    <h4 class="mb-4">
      <i class="bi bi-chat-dots me-2"></i>Quản lý đánh giá
    </h4>

    <!-- Filters -->
    <div class="admin-filters">
      <div class="filter-group">
        <label>Tìm kiếm</label>
        <input type="text" class="form-control" v-model="searchKeyword" placeholder="Tìm kiếm..." @input="handleSearch">
      </div>
      <div class="filter-group">
        <label>Trạng thái</label>
        <select class="form-select" v-model="statusFilter" @change="handleFilter">
          <option value="">Tất cả</option>
          <option value="approved">Đã duyệt</option>
          <option value="pending">Chờ duyệt</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Đánh giá</label>
        <select class="form-select" v-model="ratingFilter" @change="handleFilter">
          <option value="">Tất cả</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>
      <button class="btn btn-outline-secondary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Đặt lại
      </button>
    </div>

    <!-- Reviews List -->
    <div class="reviews-list">
      <div v-for="review in reviews" :key="review._id" class="review-item">
        <div class="review-header">
          <div class="review-user">
            <img :src="review.user?.avatar || '/images/default-avatar.png'" class="review-avatar" :alt="review.user?.name">
            <div>
              <div class="review-name">{{ review.user?.name || 'Khách hàng' }}</div>
              <div class="review-product text-muted small">
                <router-link :to="`/product/${review.product?._id}`">
                  {{ review.product?.name || 'Sản phẩm' }}
                </router-link>
              </div>
            </div>
          </div>
          <div class="review-meta">
            <div class="review-rating">
              <i v-for="n in 5" :key="n" class="bi bi-star-fill" 
                 :class="{ 'text-warning': n <= review.rating, 'text-secondary': n > review.rating }"></i>
            </div>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
        </div>
        <div class="review-body">
          <p>{{ review.comment }}</p>
          <div v-if="review.images && review.images.length > 0" class="review-images">
            <img v-for="(img, idx) in review.images" :key="idx" :src="img" alt="Review image">
          </div>
        </div>
        <div class="review-footer">
          <span :class="['badge', review.isApproved ? 'bg-success' : 'bg-warning']">
            {{ review.isApproved ? 'Đã duyệt' : 'Chờ duyệt' }}
          </span>
          <div class="review-actions">
            <button v-if="!review.isApproved" class="btn btn-sm btn-success" @click="approveReview(review)">
              <i class="bi bi-check2"></i> Duyệt
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteReview(review._id)">
              <i class="bi bi-trash"></i> Xóa
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="reviews.length === 0 && !loading" class="text-center py-5">
        <i class="bi bi-chat-dots fs-1 text-muted"></i>
        <h5 class="mt-3">Chưa có đánh giá</h5>
        <p class="text-muted">Đánh giá sẽ hiển thị ở đây khi khách hàng gửi đánh giá</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
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

const searchKeyword = ref('');
const statusFilter = ref('');
const ratingFilter = ref('');

const loadReviews = async () => {
  const params = {};
  if (searchKeyword.value) params.search = searchKeyword.value;
  if (statusFilter.value) params.isApproved = statusFilter.value === 'approved';
  if (ratingFilter.value) params.rating = Number(ratingFilter.value);
  
  await reviewStore.fetchReviews(params);
};

const handleSearch = () => loadReviews();
const handleFilter = () => loadReviews();

const resetFilters = () => {
  searchKeyword.value = '';
  statusFilter.value = '';
  ratingFilter.value = '';
  loadReviews();
};

const approveReview = async (review) => {
  const result = await reviewStore.approveReview(review._id);
  if (result.success) {
    toast.success('Đã duyệt đánh giá');
    loadReviews();
  } else {
    toast.error(result.error);
  }
};

const deleteReview = async (id) => {
  if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
  
  const result = await reviewStore.deleteReview(id);
  if (result.success) {
    toast.success('Xóa đánh giá thành công');
    loadReviews();
  } else {
    toast.error(result.error);
  }
};

onMounted(() => {
  loadReviews();
});
</script>

<style scoped>
.admin-reviews {
  padding: 1rem;
}

.admin-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
}

.filter-group .form-control,
.filter-group .form-select {
  min-width: 150px;
  padding: 6px 12px;
  font-size: 0.875rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.review-name {
  font-weight: 600;
}

.review-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-rating i {
  font-size: 14px;
}

.review-date {
  font-size: 12px;
  color: #94a3b8;
}

.review-body {
  margin-bottom: 1rem;
}

.review-body p {
  color: #4a5568;
  line-height: 1.6;
}

.review-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.review-actions {
  display: flex;
  gap: 6px;
}

.review-actions .btn {
  padding: 4px 12px;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .admin-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group .form-control,
  .filter-group .form-select {
    min-width: 100%;
  }
  
  .review-header {
    flex-direction: column;
  }
  
  .review-meta {
    align-items: flex-start;
    width: 100%;
  }
}
</style>
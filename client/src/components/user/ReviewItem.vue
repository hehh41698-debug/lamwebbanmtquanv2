<template>
  <div class="review-item">
    <div class="review-header">
      <div class="review-user">
        <img 
          :src="review.user?.avatar || '/images/default-avatar.png'" 
          class="review-avatar"
          :alt="review.user?.name"
        >
        <div>
          <div class="review-name">{{ review.user?.name || 'Khách hàng' }}</div>
          <div class="review-date">{{ formatDate(review.createdAt) }}</div>
        </div>
      </div>
      <div class="review-rating">
        <i 
          v-for="n in 5" 
          :key="n" 
          class="bi bi-star-fill"
          :class="{ 'text-warning': n <= review.rating, 'text-secondary': n > review.rating }"
        ></i>
      </div>
    </div>
    
    <div class="review-content">
      <p>{{ review.comment }}</p>
    </div>
    
    <div class="review-images" v-if="review.images && review.images.length > 0">
      <img 
        v-for="(image, index) in review.images" 
        :key="index"
        :src="image"
        alt="Review image"
        @click="openImage(image)"
      >
    </div>
    
    <div class="review-actions" v-if="canModify">
      <button class="btn btn-sm btn-outline-primary" @click="editReview">
        <i class="bi bi-pencil"></i> Sửa
      </button>
      <button class="btn btn-sm btn-outline-danger" @click="deleteReview">
        <i class="bi bi-trash"></i> Xóa
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatDate } from '../../utils/helpers';
import { useAuthStore } from '../../store/auth';
import { toast } from 'vue3-toastify';

const props = defineProps({
  review: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);

const authStore = useAuthStore();

const canModify = computed(() => {
  if (!authStore.isAuthenticated) return false;
  if (authStore.isAdmin) return true;
  return authStore.user?._id === props.review.user?._id;
});

const openImage = (image) => {
  window.open(image, '_blank');
};

const editReview = () => {
  emit('edit', props.review);
};

const deleteReview = () => {
  if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
    emit('delete', props.review._id);
  }
};
</script>

<style scoped>
.review-item {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 1rem;
}

.review-item:last-child {
  margin-bottom: 0;
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
  border: 2px solid #e2e8f0;
}

.review-name {
  font-weight: 600;
  color: #1a202c;
}

.review-date {
  font-size: 12px;
  color: #94a3b8;
}

.review-rating {
  display: flex;
  gap: 2px;
}

.review-rating i {
  font-size: 16px;
}

.review-content {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.review-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.review-images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
  border: 2px solid #e2e8f0;
}

.review-images img:hover {
  transform: scale(1.05);
}

.review-actions {
  display: flex;
  gap: 8px;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.review-actions .btn {
  font-size: 12px;
  padding: 4px 12px;
}
</style>
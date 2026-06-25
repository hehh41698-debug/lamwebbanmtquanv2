<template>
  <div class="rating-stars">
    <div class="stars-container">
      <div 
        v-for="n in totalStars" 
        :key="n"
        class="star-wrapper"
        @mouseenter="hoverStar(n)"
        @mouseleave="hoverStar(0)"
        @click="selectRating(n)"
      >
        <i 
          class="bi"
          :class="[
            isStarFilled(n) ? 'bi-star-fill text-warning' : 'bi-star text-secondary',
            { 'hover': isHovered && n <= hoverValue }
          ]"
        ></i>
      </div>
    </div>
    <span class="rating-label" v-if="label">{{ label }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  totalStars: {
    type: Number,
    default: 5
  },
  label: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const hoverValue = ref(0);
const isHovered = ref(false);

const currentRating = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!props.readonly) {
      emit('update:modelValue', value);
      emit('change', value);
    }
  }
});

const isStarFilled = (star) => {
  if (isHovered.value && hoverValue.value >= star) {
    return true;
  }
  return currentRating.value >= star;
};

const hoverStar = (value) => {
  if (props.readonly) return;
  hoverValue.value = value;
  isHovered.value = value > 0;
};

const selectRating = (value) => {
  if (props.readonly) return;
  currentRating.value = value;
  isHovered.value = false;
};
</script>

<style scoped>
.rating-stars {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars-container {
  display: flex;
  gap: 4px;
}

.star-wrapper {
  cursor: pointer;
  transition: transform 0.2s;
}

.star-wrapper:hover {
  transform: scale(1.2);
}

.star-wrapper i {
  font-size: 20px;
  transition: all 0.2s;
}

.star-wrapper i.hover {
  transform: scale(1.1);
}

.rating-label {
  font-size: 14px;
  color: #64748b;
  margin-left: 4px;
}

@media (max-width: 576px) {
  .star-wrapper i {
    font-size: 18px;
  }
}
</style>
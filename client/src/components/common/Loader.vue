<template>
  <div v-if="loading" class="loader-overlay">
    <div class="loader-container">
      <!-- Spinner -->
      <div class="loader-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      
      <!-- Progress Bar -->
      <div v-if="showProgress" class="loader-progress">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      
      <!-- Message -->
      <p class="loader-message">{{ message }}</p>
      
      <!-- Sub message -->
      <p v-if="subMessage" class="loader-sub-message">{{ subMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Đang tải...'
  },
  subMessage: {
    type: String,
    default: ''
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  fullScreen: {
    type: Boolean,
    default: true
  },
  overlay: {
    type: Boolean,
    default: true
  }
});

// Prevent body scroll when loading
const preventScroll = (prevent) => {
  if (prevent) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

// Watch loading changes
import { watch } from 'vue';
watch(() => props.loading, (newVal) => {
  if (props.fullScreen) {
    preventScroll(newVal);
  }
});

// Cleanup on unmount
onUnmounted(() => {
  preventScroll(false);
});
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
}

/* Spinner Rings */
.loader-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.loader-spinner .spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.loader-spinner .spinner-ring:nth-child(1) {
  border-top-color: #2563eb;
  animation-delay: -0.45s;
}

.loader-spinner .spinner-ring:nth-child(2) {
  border-right-color: #7c3aed;
  animation-delay: -0.3s;
}

.loader-spinner .spinner-ring:nth-child(3) {
  border-bottom-color: #10b981;
  animation-delay: -0.15s;
}

.loader-spinner .spinner-ring:nth-child(4) {
  border-left-color: #f59e0b;
  animation-delay: 0s;
}

/* Progress Bar */
.loader-progress {
  width: 100%;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.loader-progress .progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 2px;
  transition: width 0.5s ease;
  width: 0%;
}

/* Messages */
.loader-message {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a202c;
  margin: 0.5rem 0;
  text-align: center;
}

.loader-sub-message {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0;
  text-align: center;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Variants */
.loader-overlay.inline {
  position: relative;
  background: transparent;
  backdrop-filter: none;
  min-height: 200px;
}

.loader-overlay.inline .loader-container {
  padding: 1rem;
}

.loader-overlay.inline .loader-spinner {
  width: 50px;
  height: 50px;
}

.loader-overlay.inline .loader-spinner .spinner-ring {
  border-width: 3px;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .loader-overlay {
    background: rgba(15, 23, 42, 0.9);
  }
  
  .loader-message {
    color: #f1f5f9;
  }
  
  .loader-sub-message {
    color: #94a3b8;
  }
}

/* Responsive */
@media (max-width: 576px) {
  .loader-spinner {
    width: 60px;
    height: 60px;
  }
  
  .loader-message {
    font-size: 1rem;
  }
  
  .loader-sub-message {
    font-size: 0.8rem;
  }
}
</style>
<template>
  <div class="stats-grid">
    <div v-for="stat in stats" :key="stat.label" class="stat-card">
      <div class="stat-card-icon" :class="stat.color">
        <i :class="stat.icon"></i>
      </div>
      <div class="stat-card-value">{{ stat.value }}</div>
      <div class="stat-card-label">{{ stat.label }}</div>
      <div v-if="stat.change" class="stat-card-change" :class="stat.change > 0 ? 'up' : 'down'">
        <i :class="stat.change > 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
        {{ Math.abs(stat.change) }}% so với tháng trước
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: {
    type: Array,
    default: () => [
      {
        icon: 'bi bi-cart',
        value: '0',
        label: 'Đơn hàng',
        color: 'primary',
        change: 12
      },
      {
        icon: 'bi bi-currency-dollar',
        value: '0đ',
        label: 'Doanh thu',
        color: 'success',
        change: 8
      },
      {
        icon: 'bi bi-people',
        value: '0',
        label: 'Người dùng',
        color: 'warning',
        change: -3
      },
      {
        icon: 'bi bi-box',
        value: '0',
        label: 'Sản phẩm',
        color: 'danger',
        change: 5
      }
    ]
  }
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.stat-card-icon.primary {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.stat-card-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-card-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-card-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.stat-card-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.stat-card-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.stat-card-change.up {
  color: #10b981;
}

.stat-card-change.down {
  color: #ef4444;
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
<template>
  <div class="admin-dashboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0">
        <i class="bi bi-speedometer2 me-2"></i>Tổng quan
      </h4>
      <div>
        <span class="text-muted">Cập nhật: {{ formatDate(new Date()) }}</span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-icon primary">
          <i class="bi bi-currency-dollar"></i>
        </div>
        <div class="stat-card-value">{{ formatPrice(totalRevenue) }}</div>
        <div class="stat-card-label">Doanh thu</div>
        <div class="stat-card-change up">
          <i class="bi bi-arrow-up"></i> 12.5% so với tháng trước
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-icon success">
          <i class="bi bi-cart"></i>
        </div>
        <div class="stat-card-value">{{ totalOrders }}</div>
        <div class="stat-card-label">Đơn hàng</div>
        <div class="stat-card-change up">
          <i class="bi bi-arrow-up"></i> 8.2% so với tháng trước
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-icon warning">
          <i class="bi bi-people"></i>
        </div>
        <div class="stat-card-value">{{ totalUsers }}</div>
        <div class="stat-card-label">Người dùng</div>
        <div class="stat-card-change down">
          <i class="bi bi-arrow-down"></i> 3.1% so với tháng trước
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-icon danger">
          <i class="bi bi-box"></i>
        </div>
        <div class="stat-card-value">{{ totalProducts }}</div>
        <div class="stat-card-label">Sản phẩm</div>
        <div class="stat-card-change up">
          <i class="bi bi-arrow-up"></i> 5.7% so với tháng trước
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="row g-4">
      <div class="col-md-8">
        <div class="chart-container">
          <h6 class="chart-title">Doanh thu theo tháng</h6>
          <canvas ref="revenueChart"></canvas>
        </div>
      </div>
      <div class="col-md-4">
        <div class="chart-container">
          <h6 class="chart-title">Đơn hàng theo trạng thái</h6>
          <canvas ref="orderStatusChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0">Đơn hàng gần đây</h6>
        <router-link to="/admin/orders" class="btn btn-sm btn-outline-primary">
          Xem tất cả <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order._id">
              <td>#{{ order._id?.slice(-6) }}</td>
              <td>{{ order.user?.name || order.shippingAddress?.name }}</td>
              <td>{{ formatPrice(order.total) }}</td>
              <td>
                <span :class="['badge', getStatusBadge(order.orderStatus)]">
                  {{ ORDER_STATUS_LABELS[order.orderStatus] }}
                </span>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
            </tr>
            <tr v-if="recentOrders.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-3 d-block"></i>
                Chưa có đơn hàng nào
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useOrderStore } from '../../store/order';
import { useProductStore } from '../../store/product';
import { useUserStore } from '../../store/user';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const orderStore = useOrderStore();
const productStore = useProductStore();
const userStore = useUserStore();

const totalRevenue = ref(0);
const totalOrders = ref(0);
const totalUsers = ref(0);
const totalProducts = ref(0);
const recentOrders = ref([]);

const revenueChart = ref(null);
const orderStatusChart = ref(null);

const getStatusBadge = (status) => {
  return ORDER_STATUS_COLORS[status] || 'secondary';
};

const loadData = async () => {
  // Load orders
  await orderStore.fetchOrders({ limit: 5 });
  recentOrders.value = orderStore.orders.slice(0, 5);
  totalOrders.value = orderStore.pagination.total || 0;
  
  // Calculate revenue
  totalRevenue.value = orderStore.orders.reduce((sum, order) => sum + order.total, 0);
  
  // Load users
  await userStore.fetchUsers({ limit: 1 });
  totalUsers.value = userStore.pagination.total || 0;
  
  // Load products
  await productStore.fetchProducts({ limit: 1 });
  totalProducts.value = productStore.pagination.total || 0;
};

const initCharts = () => {
  // Revenue Chart
  if (revenueChart.value) {
    new Chart(revenueChart.value, {
      type: 'line',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
          label: 'Doanh thu',
          data: [12, 19, 15, 22, 18, 25, 30, 28, 35, 32, 40, 45],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatPrice(value)
            }
          }
        }
      }
    });
  }

  // Order Status Chart
  if (orderStatusChart.value) {
    new Chart(orderStatusChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'],
        datasets: [{
          data: [12, 19, 8, 25, 5],
          backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
};

onMounted(() => {
  loadData();
  setTimeout(initCharts, 500);
});
</script>

<style scoped>
.admin-dashboard {
  padding: 1rem;
}

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

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5rem;
}

.chart-container .chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.chart-container canvas {
  max-height: 250px;
  width: 100% !important;
}

.admin-table-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table thead {
  background: #f8fafc;
}

.admin-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}

.admin-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.admin-table tr:hover {
  background: #f8fafc;
}

.admin-table .badge {
  font-size: 12px;
  padding: 4px 12px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
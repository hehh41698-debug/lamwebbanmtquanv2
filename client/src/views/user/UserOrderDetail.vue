<template>
  <div class="user-order-detail">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5>Chi tiết đơn hàng #{{ order?._id?.slice(-8) }}</h5>
      <router-link to="/dashboard/orders" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left"></i> Quay lại
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="order" class="order-detail-card">
      <div class="row g-4">
        <div class="col-md-6">
          <h6>Thông tin đơn hàng</h6>
          <div class="detail-item">
            <span>Mã đơn:</span>
            <strong>#{{ order._id?.slice(-8) }}</strong>
          </div>
          <div class="detail-item">
            <span>Ngày đặt:</span>
            <strong>{{ formatDate(order.createdAt) }}</strong>
          </div>
          <div class="detail-item">
            <span>Trạng thái:</span>
            <span :class="['badge', getStatusBadge(order.orderStatus)]">
              {{ ORDER_STATUS_LABELS[order.orderStatus] }}
            </span>
          </div>
          <div class="detail-item">
            <span>Phương thức:</span>
            <strong>{{ PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod }}</strong>
          </div>
        </div>
        <div class="col-md-6">
          <h6>Thông tin giao hàng</h6>
          <div class="detail-item">
            <span>Người nhận:</span>
            <strong>{{ order.shippingAddress?.name }}</strong>
          </div>
          <div class="detail-item">
            <span>Số điện thoại:</span>
            <strong>{{ order.shippingAddress?.phone }}</strong>
          </div>
          <div class="detail-item">
            <span>Địa chỉ:</span>
            <strong>{{ order.shippingAddress?.address }}, {{ order.shippingAddress?.city }}</strong>
          </div>
        </div>
      </div>

      <hr>

      <h6>Sản phẩm</h6>
      <div class="order-items">
        <div v-for="item in order.items" :key="item._id" class="order-item">
          <img :src="item.image || '/images/no-image.png'" :alt="item.name">
          <div>
            <div class="fw-medium">{{ item.name }}</div>
            <div class="text-muted small">{{ item.quantity }} x {{ formatPrice(item.price) }}</div>
          </div>
          <div class="ms-auto fw-bold">{{ formatPrice(item.price * item.quantity) }}</div>
        </div>
      </div>

      <div class="order-summary">
        <div class="d-flex justify-content-between">
          <span>Tạm tính</span>
          <span>{{ formatPrice(order.total) }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Phí vận chuyển</span>
          <span>{{ formatPrice(0) }}</span>
        </div>
        <hr>
        <div class="d-flex justify-content-between fw-bold">
          <span>Tổng cộng</span>
          <span>{{ formatPrice(order.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '../../store/order';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, PAYMENT_METHOD_LABELS } from '../../utils/constants';

const route = useRoute();
const orderStore = useOrderStore();

const order = computed(() => orderStore.order);
const loading = computed(() => orderStore.loading);

const getStatusBadge = (status) => ORDER_STATUS_COLORS[status] || 'secondary';

onMounted(() => {
  const id = route.params.id;
  if (id) {
    orderStore.fetchOrderById(id);
  }
});
</script>

<style scoped>
.user-order-detail { padding: 0.5rem; }

.order-detail-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.detail-item:last-child { border-bottom: none; }

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.order-item:last-child { border-bottom: none; }

.order-item img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 6px;
  background: #f8fafc;
}

.order-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
</style>
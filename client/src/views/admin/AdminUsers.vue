<template>
  <div class="admin-users">
    <h4 class="mb-4"><i class="bi bi-people me-2"></i>Quản lý người dùng</h4>

    <div class="filters-bar">
      <input type="text" class="form-control" v-model="searchKeyword" placeholder="Tìm kiếm..." @input="loadUsers">
      <select class="form-select" v-model="roleFilter" @change="loadUsers">
        <option value="">Tất cả vai trò</option>
        <option value="user">Người dùng</option>
        <option value="admin">Quản trị viên</option>
      </select>
      <select class="form-select" v-model="statusFilter" @change="loadUsers">
        <option value="">Tất cả trạng thái</option>
        <option value="true">Hoạt động</option>
        <option value="false">Bị khóa</option>
      </select>
      <button class="btn btn-outline-secondary" @click="resetFilters"><i class="bi bi-arrow-counterclockwise"></i> Đặt lại</button>
    </div>

    <div class="table-card">
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>
            <tr v-else-if="users.length === 0"><td colspan="7" class="text-center py-4 text-muted">Không có người dùng nào</td></tr>
            <tr v-for="user in users" :key="user._id">
              <td><img :src="user.avatar || '/images/default-avatar.png'" class="user-avatar"></td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td><span :class="['badge', user.role === 'admin' ? 'bg-primary' : 'bg-secondary']">{{ user.role === 'admin' ? 'Admin' : 'User' }}</span></td>
              <td><span :class="['badge', user.isActive ? 'bg-success' : 'bg-danger']">{{ user.isActive ? 'Hoạt động' : 'Bị khóa' }}</span></td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline-primary" @click="viewUser(user)"><i class="bi bi-eye"></i></button>
                  <button class="btn btn-sm" :class="user.isActive ? 'btn-outline-danger' : 'btn-outline-success'" @click="toggleUserStatus(user)">
                    <i :class="user.isActive ? 'bi bi-lock' : 'bi bi-unlock'"></i>
                  </button>
                  <button v-if="user.role !== 'admin' && user.email !== 'admin@computerstore.com'" class="btn btn-sm btn-outline-warning" @click="changeUserRole(user)"><i class="bi bi-arrow-up"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination-bar">
      <span class="text-muted small">Hiển thị {{ users.length }} / {{ pagination.total }} người dùng</span>
      <nav>
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <button class="page-link" @click="changePage(pagination.page - 1)"><i class="bi bi-chevron-left"></i></button>
          </li>
          <li v-for="page in pagination.totalPages" :key="page" class="page-item" :class="{ active: page === pagination.page }">
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
            <button class="page-link" @click="changePage(pagination.page + 1)"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '../../store/user';
import { formatDate } from '../../utils/helpers';
import { toast } from 'vue3-toastify';

const userStore = useUserStore();

const users = computed(() => userStore.users);
const loading = computed(() => userStore.loading);
const pagination = computed(() => userStore.pagination);

const searchKeyword = ref('');
const roleFilter = ref('');
const statusFilter = ref('');

const loadUsers = async () => {
  const params = {
    page: pagination.value.page,
    limit: 10,
    search: searchKeyword.value,
    role: roleFilter.value,
    isActive: statusFilter.value ? statusFilter.value === 'true' : null
  };
  await userStore.fetchUsers(params);
};

const resetFilters = () => {
  searchKeyword.value = '';
  roleFilter.value = '';
  statusFilter.value = '';
  userStore.pagination.page = 1;
  loadUsers();
};

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  userStore.pagination.page = page;
  loadUsers();
};

const viewUser = (user) => {
  console.log('View user:', user);
};

const toggleUserStatus = async (user) => {
  const result = await userStore.toggleUserStatus(user._id);
  if (result.success) {
    toast.success(`Đã ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản ${user.name}`);
    loadUsers();
  } else {
    toast.error(result.error);
  }
};

const changeUserRole = async (user) => {
  if (!confirm(`Nâng cấp ${user.name} lên Admin?`)) return;
  const result = await userStore.changeUserRole(user._id, 'admin');
  if (result.success) {
    toast.success(`Đã nâng cấp ${user.name} lên Admin`);
    loadUsers();
  } else {
    toast.error(result.error);
  }
};

onMounted(() => loadUsers());
</script>

<style scoped>
.admin-users { padding: 1rem; }

.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.filters-bar .form-control,
.filters-bar .form-select { width: 200px; }

.table-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}

.admin-table { width: 100%; border-collapse: collapse; }
.admin-table thead { background: #f8fafc; }
.admin-table th { padding: 0.75rem 1rem; text-align: left; font-weight: 600; font-size: 0.875rem; color: #64748b; border-bottom: 2px solid #e2e8f0; }
.admin-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
.admin-table tr:hover { background: #f8fafc; }

.user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }

.actions { display: flex; gap: 6px; }
.actions .btn { padding: 4px 8px; font-size: 0.75rem; }

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .filters-bar { flex-direction: column; }
  .filters-bar .form-control,
  .filters-bar .form-select { width: 100%; }
}
</style>
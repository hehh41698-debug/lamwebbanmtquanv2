<template>
  <div class="admin-users">
    <h4 class="mb-4">
      <i class="bi bi-people me-2"></i>Quản lý người dùng
    </h4>

    <!-- Filters -->
    <div class="admin-filters">
      <div class="filter-group">
        <label>Tìm kiếm</label>
        <input type="text" class="form-control" v-model="searchKeyword" placeholder="Tên hoặc email..." @input="handleSearch">
      </div>
      <div class="filter-group">
        <label>Vai trò</label>
        <select class="form-select" v-model="roleFilter" @change="handleFilter">
          <option value="">Tất cả</option>
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Trạng thái</label>
        <select class="form-select" v-model="statusFilter" @change="handleFilter">
          <option value="">Tất cả</option>
          <option value="true">Hoạt động</option>
          <option value="false">Bị khóa</option>
        </select>
      </div>
      <button class="btn btn-outline-secondary" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Đặt lại
      </button>
    </div>

    <!-- Users Table -->
    <div class="admin-table-wrapper">
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
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                <i class="bi bi-inbox fs-3 d-block"></i>
                Không có người dùng nào
              </td>
            </tr>
            <tr v-for="user in users" :key="user._id">
              <td>
                <img :src="user.avatar || '/images/default-avatar.png'" class="user-avatar" :alt="user.name">
              </td>
              <td>
                <div class="user-name">{{ user.name }}</div>
                <div class="user-phone text-muted small">{{ user.phone || 'Chưa có số điện thoại' }}</div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['badge', user.role === 'admin' ? 'bg-primary' : 'bg-secondary']">
                  {{ user.role === 'admin' ? 'Admin' : 'User' }}
                </span>
              </td>
              <td>
                <span :class="['badge', user.isActive ? 'bg-success' : 'bg-danger']">
                  {{ user.isActive ? 'Hoạt động' : 'Bị khóa' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline-primary" @click="viewUser(user)">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button 
                    class="btn btn-sm" 
                    :class="user.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                    @click="toggleUserStatus(user)"
                  >
                    <i :class="user.isActive ? 'bi bi-lock' : 'bi bi-unlock'"></i>
                  </button>
                  <button 
                    v-if="user.role !== 'admin'"
                    class="btn btn-sm btn-outline-warning"
                    @click="changeUserRole(user)"
                  >
                    <i class="bi bi-arrow-up"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted small">
          Hiển thị {{ users.length }} / {{ pagination.total }} người dùng
        </span>
        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: pagination.page === 1 }">
              <button class="page-link" @click="changePage(pagination.page - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li 
              v-for="page in pagination.totalPages" 
              :key="page"
              class="page-item"
              :class="{ active: page === pagination.page }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
              <button class="page-link" @click="changePage(pagination.page + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
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
    limit: 10
  };
  
  if (searchKeyword.value) params.search = searchKeyword.value;
  if (roleFilter.value) params.role = roleFilter.value;
  if (statusFilter.value) params.isActive = statusFilter.value === 'true';
  
  await userStore.fetchUsers(params);
};

const handleSearch = () => {
  userStore.pagination.page = 1;
  loadUsers();
};

const handleFilter = () => {
  userStore.pagination.page = 1;
  loadUsers();
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
  // TODO: Show user detail
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
  if (!confirm(`Bạn có muốn nâng cấp ${user.name} lên Admin?`)) return;
  
  const result = await userStore.changeUserRole(user._id, 'admin');
  if (result.success) {
    toast.success(`Đã nâng cấp ${user.name} lên Admin`);
    loadUsers();
  } else {
    toast.error(result.error);
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.admin-users {
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

.admin-table-wrapper {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 6px;
}

.actions .btn {
  padding: 4px 8px;
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
}
</style>
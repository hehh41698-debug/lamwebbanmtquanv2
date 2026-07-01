const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUserProfile, 
  updateUserStatus,
  changePassword,
  changeUserRole,
  deleteUser
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// ============================================
// USER ROUTES (Cần xác thực)
// ============================================

// Lấy thông tin profile của user hiện tại
router.get('/profile', authenticate, getUserById);

// Cập nhật profile
router.put('/profile', authenticate, updateUserProfile);

// Đổi mật khẩu
router.put('/change-password', authenticate, changePassword);

// ============================================
// ADMIN ROUTES (Cần xác thực + quyền admin)
// ============================================

// Lấy danh sách users
router.get('/', authenticate, adminOnly, getUsers);

// Lấy chi tiết user theo ID
router.get('/:id', authenticate, adminOnly, getUserById);

// Cập nhật trạng thái user (khóa/mở khóa)
router.put('/:id/status', authenticate, adminOnly, updateUserStatus);

// Thay đổi vai trò user
router.put('/:id/role', authenticate, adminOnly, changeUserRole);

// Xóa user
router.delete('/:id', authenticate, adminOnly, deleteUser);

module.exports = router;
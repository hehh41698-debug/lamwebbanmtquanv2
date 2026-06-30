const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  register, 
  login, 
  getMe, 
  logout, 
  refreshToken 
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// ============================================
// VALIDATION RULES
// ============================================

const registerValidation = [
  body('name')
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/\d/).withMessage('Mật khẩu phải chứa ít nhất 1 số'),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Số điện thoại không hợp lệ')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
];

// ============================================
// ROUTES
// ============================================

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
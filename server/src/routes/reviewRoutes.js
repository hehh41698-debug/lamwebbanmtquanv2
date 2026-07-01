const express = require('express');
const router = express.Router();
const { 
  getProductReviews,
  createReview,
  deleteReview,
  approveReview,
  getAllReviews,
  getUserReviews
} = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/product/:productId', getProductReviews);

// ============================================
// USER ROUTES (Cần xác thực)
// ============================================
router.get('/user', authenticate, getUserReviews); // Lấy đánh giá của user hiện tại
router.post('/product/:productId', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

// ============================================
// ADMIN ROUTES
// ============================================
router.get('/admin', authenticate, adminOnly, getAllReviews);
router.put('/:id/approve', authenticate, adminOnly, approveReview);

module.exports = router;
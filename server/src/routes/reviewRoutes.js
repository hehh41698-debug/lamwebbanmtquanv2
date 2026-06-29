const express = require('express');
const router = express.Router();
const { 
  getProductReviews,
  createReview,
  deleteReview
} = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', getProductReviews);

// Authenticated routes
router.post('/product/:productId', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;
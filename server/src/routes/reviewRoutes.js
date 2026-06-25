const express = require('express');
const router = express.Router();

// Tạo các function giả để test
const getProductReviews = (req, res) => {
  res.json({ success: true, reviews: [] });
};

const createReview = (req, res) => {
  res.json({ success: true, message: 'Review created' });
};

const updateReview = (req, res) => {
  res.json({ success: true, message: 'Review updated' });
};

const deleteReview = (req, res) => {
  res.json({ success: true, message: 'Review deleted' });
};

// Routes
router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
const express = require('express');
const router = express.Router();

// Tạo các function giả để test
const getCart = (req, res) => {
  res.json({ success: true, items: [] });
};

const addToCart = (req, res) => {
  res.json({ success: true, message: 'Added to cart' });
};

const updateCartItem = (req, res) => {
  res.json({ success: true, message: 'Cart updated' });
};

const removeFromCart = (req, res) => {
  res.json({ success: true, message: 'Item removed' });
};

const clearCart = (req, res) => {
  res.json({ success: true, message: 'Cart cleared' });
};

// Routes
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
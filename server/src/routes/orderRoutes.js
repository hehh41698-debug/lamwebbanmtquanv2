const express = require('express');
const router = express.Router();
const { 
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.put('/:id/status', adminOnly, updateOrderStatus);
router.get('/admin/stats', adminOnly, getOrderStats);

module.exports = router;
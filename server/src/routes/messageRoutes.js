const express = require('express');
const router = express.Router();
const { 
  sendMessage,
  getUserMessages,
  getAllMessages,
  getMessageById,
  replyMessage,
  updateMessageStatus,
  deleteMessage
} = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// ============================================
// ADMIN ROUTES (Cần xác thực + Admin) - ĐẶT LÊN TRƯỚC
// ============================================
router.get('/admin', authenticate, adminOnly, getAllMessages);

// ============================================
// USER ROUTES (Cần xác thực)
// ============================================
router.post('/', authenticate, sendMessage);
router.get('/user', authenticate, getUserMessages);

// ============================================
// ROUTE CÓ THAM SỐ ID - ĐẶT SAU CÙNG
// ============================================
router.get('/:id', authenticate, getMessageById);
router.put('/:id/reply', authenticate, adminOnly, replyMessage);
router.put('/:id/status', authenticate, adminOnly, updateMessageStatus);
router.delete('/:id', authenticate, adminOnly, deleteMessage);

module.exports = router;
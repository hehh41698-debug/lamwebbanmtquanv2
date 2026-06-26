const express = require('express');
const router = express.Router();
const { 
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getCategories);

// Admin routes
router.post('/', authenticate, adminOnly, createCategory);
router.put('/:id', authenticate, adminOnly, updateCategory);
router.delete('/:id', authenticate, adminOnly, deleteCategory);

module.exports = router;
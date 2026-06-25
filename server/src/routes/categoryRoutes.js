const express = require('express');
const router = express.Router();

// Tạo các function giả để test
const getCategories = (req, res) => {
  res.json({ success: true, categories: [] });
};

const createCategory = (req, res) => {
  res.json({ success: true, message: 'Category created' });
};

const updateCategory = (req, res) => {
  res.json({ success: true, message: 'Category updated' });
};

const deleteCategory = (req, res) => {
  res.json({ success: true, message: 'Category deleted' });
};

// Routes
router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
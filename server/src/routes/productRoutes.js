const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// ============================================
// TẤT CẢ ROUTE ĐỀU PUBLIC ĐỂ TEST
// ============================================

// GET routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/brands', productController.getAllBrands);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/brand/:brand', productController.getProductsByBrand);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id/similar', productController.getSimilarProducts);
router.get('/:id', productController.getProductById);

// POST, PUT, DELETE routes (tạm thời bỏ auth để test)
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.put('/:id/stock', productController.updateStock);
router.delete('/:id', productController.deleteProduct);
router.get('/admin/stats', productController.getProductStats);

console.log('✅ Product routes loaded (public mode)');

module.exports = router;
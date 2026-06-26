const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES
// ============================================
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

// ============================================
// ADMIN ROUTES
// ============================================
router.post('/', authenticate, adminOnly, productController.createProduct);
router.put('/:id', authenticate, adminOnly, productController.updateProduct);
router.put('/:id/stock', authenticate, adminOnly, productController.updateStock);
router.delete('/:id', authenticate, adminOnly, productController.deleteProduct);
router.get('/admin/stats', authenticate, adminOnly, productController.getProductStats);

module.exports = router;
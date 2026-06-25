const { body, param, query } = require('express-validator');

// User validators
exports.validateRegister = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number')
];

exports.validateLogin = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Product validators
exports.validateProduct = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3 }).withMessage('Product name must be at least 3 characters'),
  body('description')
    .notEmpty().withMessage('Description is required'),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price must be greater than 0'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('brand')
    .notEmpty().withMessage('Brand is required'),
  body('stock')
    .isNumeric().withMessage('Stock must be a number')
    .isInt({ min: 0 }).withMessage('Stock must be greater than or equal to 0'),
  body('images')
    .isArray().withMessage('Images must be an array')
    .notEmpty().withMessage('At least one image is required')
];

// Order validators
exports.validateOrder = [
  body('shippingAddress.name')
    .notEmpty().withMessage('Recipient name is required'),
  body('shippingAddress.phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Please provide a valid phone number'),
  body('shippingAddress.address')
    .notEmpty().withMessage('Address is required'),
  body('shippingAddress.city')
    .notEmpty().withMessage('City is required'),
  body('paymentMethod')
    .isIn(['cod', 'bank_transfer', 'vnpay']).withMessage('Invalid payment method')
];

// Review validators
exports.validateReview = [
  body('rating')
    .isNumeric().withMessage('Rating must be a number')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 10 }).withMessage('Comment must be at least 10 characters')
];

// Category validators
exports.validateCategory = [
  body('name')
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2 }).withMessage('Category name must be at least 2 characters'),
  body('slug')
    .notEmpty().withMessage('Slug is required')
    .isSlug().withMessage('Slug must be a valid slug')
];

// Coupon validators
exports.validateCoupon = [
  body('code')
    .notEmpty().withMessage('Coupon code is required')
    .isLength({ min: 3 }).withMessage('Coupon code must be at least 3 characters'),
  body('discountType')
    .isIn(['percent', 'fixed']).withMessage('Invalid discount type'),
  body('value')
    .isNumeric().withMessage('Discount value must be a number')
    .isFloat({ min: 0 }).withMessage('Discount value must be greater than 0'),
  body('expiryDate')
    .isISO8601().withMessage('Invalid expiry date')
    .toDate()
];

// Pagination validators
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt()
];

// ID validators
exports.validateId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];
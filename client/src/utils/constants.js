// ============================================
// CONSTANTS - Application constants
// ============================================

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const API_TIMEOUT = 30000; // 30 seconds

// User Roles
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// User Roles with labels
export const ROLE_LABELS = {
  [ROLES.USER]: 'Người dùng',
  [ROLES.ADMIN]: 'Quản trị viên'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUS.SHIPPED]: 'Đang giao hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy'
};

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.CONFIRMED]: 'info',
  [ORDER_STATUS.PROCESSING]: 'primary',
  [ORDER_STATUS.SHIPPED]: 'secondary',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'danger'
};

// Order Status Icons
export const ORDER_STATUS_ICONS = {
  [ORDER_STATUS.PENDING]: 'bi-clock-history',
  [ORDER_STATUS.CONFIRMED]: 'bi-check-circle',
  [ORDER_STATUS.PROCESSING]: 'bi-arrow-repeat',
  [ORDER_STATUS.SHIPPED]: 'bi-truck',
  [ORDER_STATUS.DELIVERED]: 'bi-box-seam',
  [ORDER_STATUS.CANCELLED]: 'bi-x-circle'
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: 'cod',
  BANK_TRANSFER: 'bank_transfer',
  VNPAY: 'vnpay',
  MOMO: 'momo'
};

// Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.COD]: 'Thanh toán khi nhận hàng (COD)',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PAYMENT_METHODS.VNPAY]: 'VNPay',
  [PAYMENT_METHODS.MOMO]: 'MoMo Wallet'
};

// Payment Method Icons
export const PAYMENT_METHOD_ICONS = {
  [PAYMENT_METHODS.COD]: 'bi-cash',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'bi-bank',
  [PAYMENT_METHODS.VNPAY]: 'bi-credit-card',
  [PAYMENT_METHODS.MOMO]: 'bi-wallet'
};

// Product Sort Options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'name-asc', label: 'Tên A-Z' },
  { value: 'name-desc', label: 'Tên Z-A' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'sold', label: 'Bán chạy nhất' }
];

// Pagination Defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const PAGE_SIZES = [12, 24, 48, 96];

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  VIEW_MODE: 'viewMode'
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast Defaults
export const TOAST_DEFAULTS = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
};

// Regex Patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(0|84)[0-9]{9,10}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^\d{2}:\d{2}$/,
  DATE_TIME: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
};

// Default Images
export const DEFAULT_IMAGES = {
  PRODUCT: '/images/no-image.png',
  AVATAR: '/images/default-avatar.png',
  BANNER: '/images/default-banner.jpg',
  LOGO: '/images/logo.png'
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 5
};

// Currency
export const CURRENCY = {
  CODE: 'VND',
  SYMBOL: '₫',
  LOCALE: 'vi-VN'
};

// Timeouts
export const TIMEOUTS = {
  DEBOUNCE: 300,
  THROTTLE: 300,
  TOAST: 3000,
  LOADING: 5000
};

// Routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/product/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin'
};

// Breadcrumb Mapping
export const BREADCRUMBS = {
  '/': 'Trang chủ',
  '/products': 'Sản phẩm',
  '/cart': 'Giỏ hàng',
  '/checkout': 'Thanh toán',
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
  '/dashboard': 'Tài khoản',
  '/admin': 'Quản trị'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập vào trang này.',
  NOT_FOUND: 'Không tìm thấy trang yêu cầu.',
  SERVER: 'Đã có lỗi xảy ra từ máy chủ. Vui lòng thử lại sau.',
  VALIDATION: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Đăng nhập thành công!',
  REGISTER: 'Đăng ký tài khoản thành công!',
  LOGOUT: 'Đăng xuất thành công!',
  UPDATE: 'Cập nhật thành công!',
  DELETE: 'Xóa thành công!',
  ADD: 'Thêm mới thành công!'
};
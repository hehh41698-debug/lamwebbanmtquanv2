const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// XÁC THỰC TOKEN - LẤY TỪ COOKIE HOẶC HEADER
// ============================================
exports.authenticate = async (req, res, next) => {
  try {
    let token = null;
    
    // 1. Thử lấy token từ cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('🔑 Token from cookie:', token.substring(0, 20) + '...');
    }
    
    // 2. Nếu không có cookie, thử lấy từ Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
        console.log('🔑 Token from header:', token.substring(0, 20) + '...');
      }
    }
    
    // 3. Nếu không có token
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // 4. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // 5. Tìm user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('❌ User not found:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      console.log('❌ User inactive:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Account is disabled'
      });
    }

    // 6. Thêm user vào request
    req.user = user;
    console.log('✅ User authenticated:', user.email);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// ============================================
// KIỂM TRA QUYỀN ADMIN
// ============================================
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Vui lòng đăng nhập'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
  
  next();
};
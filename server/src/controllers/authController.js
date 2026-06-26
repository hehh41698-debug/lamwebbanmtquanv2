const User = require('../models/User');
const { validationResult } = require('express-validator');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// ============================================
// ĐĂNG NHẬP
// ============================================
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu'
      });
    }

    // Tìm user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra tài khoản bị khóa
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    console.log('🔑 Password match:', isMatch ? 'Yes' : 'No');
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Tạo token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log('✅ Login successful:', user.email);
    console.log('📦 Token generated:', token ? 'Yes' : 'No');

    // TRẢ VỀ ĐẦY ĐỦ THÔNG TIN
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        phone: user.phone || '',
        isActive: user.isActive
      },
      token: token,
      refreshToken: refreshToken || null
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.'
    });
  }
};

// ============================================
// ĐĂNG KÝ
// ============================================
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => err.msg)
      });
    }

    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được đăng ký'
      });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      phone: phone || '',
      role: 'user',
      isActive: true
    });

    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        isActive: user.isActive
      },
      token: token,
      refreshToken: refreshToken
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// ============================================
// LẤY THÔNG TIN USER
// ============================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        phone: user.phone || '',
        isActive: user.isActive,
        address: user.address || null,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// ============================================
// ĐĂNG XUẤT
// ============================================
exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Đăng xuất thành công!'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// ============================================
// REFRESH TOKEN
// ============================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token không hợp lệ'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key_here_123456');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const newToken = generateToken(user._id);
    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token không hợp lệ'
    });
  }
};
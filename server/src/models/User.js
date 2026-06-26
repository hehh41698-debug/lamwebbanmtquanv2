const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  avatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('⚠️ Password not modified, skipping hash');
    return next();
  }
  console.log('🔑 Hashing password...');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('✅ Password hashed');
  next();
});

// Compare password method - FIXED
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔍 Comparing passwords...');
    console.log('📦 Stored hash:', this.password);
    console.log('🔑 Candidate:', candidatePassword);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('✅ Compare result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('❌ Compare password error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
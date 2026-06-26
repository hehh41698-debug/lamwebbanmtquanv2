const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function createUserFinal() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/computer-store');
    console.log('✅ Connected to MongoDB');

    const User = require('./src/models/User');
    
    // Xóa user cũ
    await User.deleteOne({ email: 'user@test.com' });
    console.log('🧹 Removed old user');

    // Tạo user mới
    const user = new User({
      name: 'Test User',
      email: 'user@test.com',
      password: 'user123', // Password sẽ tự động hash trong pre-save
      role: 'user',
      isActive: true,
      phone: '0123456789'
    });

    await user.save();

    console.log('✅ User created:', user.email);
    console.log('👤 Role:', user.role);
    console.log('📦 Stored hash:', user.password);

    // Kiểm tra lại
    const checkUser = await User.findOne({ email: 'user@test.com' });
    const isMatch = await checkUser.comparePassword('user123');
    console.log('🔑 Password match test (using comparePassword):', isMatch);
    
    // Kiểm tra trực tiếp với bcrypt
    const directMatch = await bcrypt.compare('user123', checkUser.password);
    console.log('🔑 Direct bcrypt compare:', directMatch);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUserFinal();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function createUserFixed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/computer-store');
    console.log('✅ Connected to MongoDB');

    const User = require('./src/models/User');
    
    // Xóa user cũ
    await User.deleteOne({ email: 'user@test.com' });
    console.log('🧹 Removed old user');

    // Tạo user mới với password đúng
    const password = 'user123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('🔑 Password:', password);
    console.log('📦 Hashed:', hashedPassword);

    const user = new User({
      name: 'Test User',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'user',
      isActive: true,
      phone: '0123456789'
    });

    await user.save();

    console.log('✅ User created:', user.email);
    console.log('👤 Role:', user.role);

    // Kiểm tra lại
    const checkUser = await User.findOne({ email: 'user@test.com' });
    const isMatch = await bcrypt.compare(password, checkUser.password);
    console.log('🔑 Password match test:', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUserFixed();
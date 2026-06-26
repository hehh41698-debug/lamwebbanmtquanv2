const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function updateUserPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/computer-store');
    console.log('✅ Connected to MongoDB');

    const User = require('./src/models/User');
    
    const user = await User.findOne({ email: 'user@test.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      process.exit(1);
    }

    console.log('👤 User found:', user.email);

    const newPassword = 'user123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password updated for:', user.email);
    console.log('🔑 New password:', newPassword);

    const isMatch = await bcrypt.compare(newPassword, user.password);
    console.log('🔑 Password match test:', isMatch);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserPassword();
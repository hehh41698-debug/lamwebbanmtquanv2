const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/computer-store')
  .then(async () => {
    const User = require('./src/models/User');
    const user = await User.findOne({ email: 'admin@computerstore.com' });
    
    if (user) {
      const password = 'admin123';
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('🔑 Password match:', isMatch);
      console.log('👤 User:', user.email);
      console.log('👔 Role:', user.role);
      console.log('✅ Active:', user.isActive);
    } else {
      console.log('❌ User not found!');
    }
    process.exit(0);
  });
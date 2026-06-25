const mongoose = require('mongoose');

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/computer-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Đóng kết nối
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error(`❌ MongoDB Disconnect Error: ${error.message}`);
  }
};

// Xử lý lỗi kết nối
const handleConnectionError = (error) => {
  console.error(`❌ MongoDB Error: ${error.message}`);
  if (error.name === 'MongoNetworkError') {
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(() => connectDB(), 5000);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  handleConnectionError
};
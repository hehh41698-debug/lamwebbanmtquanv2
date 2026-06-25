const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/computer-store');
    console.log('✅ Connected to MongoDB');
    
    // Kiểm tra collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections:', collections.map(c => c.name));
    
    // Kiểm tra products
    const Product = require('./src/models/Product');
    const products = await Product.find();
    console.log('📦 Products in DB:', products.length);
    
    if (products.length > 0) {
      console.log('✅ Sample product:', products[0].name);
      console.log('✅ Product ID:', products[0]._id);
    } else {
      console.log('⚠️ No products found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDB();
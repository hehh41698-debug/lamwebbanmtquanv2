const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

async function fixProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/computer-store');
    console.log('✅ Connected to MongoDB');

    // 1. Kiểm tra categories
    const categories = await Category.find();
    console.log(`📂 Categories found: ${categories.length}`);
    if (categories.length === 0) {
      console.log('⚠️ No categories found. Please create categories first.');
      process.exit(1);
    }

    // 2. Kiểm tra products
    const products = await Product.find();
    console.log(`📦 Products in DB: ${products.length}`);

    if (products.length === 0) {
      console.log('⚠️ No products found. Please run seed.js');
      process.exit(1);
    }

    // 3. Kiểm tra từng product
    console.log('\n🔍 Checking products...');
    let fixCount = 0;

    for (const product of products) {
      let needsFix = false;
      
      // Kiểm tra category có hợp lệ không
      if (product.category) {
        const categoryExists = await Category.findById(product.category);
        if (!categoryExists) {
          console.log(`❌ Product "${product.name}" has invalid category: ${product.category}`);
          // Gán category đầu tiên
          product.category = categories[0]._id;
          needsFix = true;
          fixCount++;
        }
      } else {
        console.log(`❌ Product "${product.name}" has no category`);
        product.category = categories[0]._id;
        needsFix = true;
        fixCount++;
      }

      // Kiểm tra images
      if (!product.images || product.images.length === 0) {
        console.log(`❌ Product "${product.name}" has no images`);
        product.images = ['https://picsum.photos/seed/default/400/300'];
        needsFix = true;
        fixCount++;
      }

      // Kiểm tra price
      if (!product.price || product.price <= 0) {
        console.log(`❌ Product "${product.name}" has invalid price: ${product.price}`);
        product.price = 1000000;
        needsFix = true;
        fixCount++;
      }

      // Kiểm tra stock
      if (product.stock === undefined || product.stock === null) {
        console.log(`❌ Product "${product.name}" has no stock`);
        product.stock = 10;
        needsFix = true;
        fixCount++;
      }

      if (needsFix) {
        await product.save();
        console.log(`✅ Fixed product: ${product.name}`);
      }
    }

    // 4. Hiển thị kết quả
    const fixedProducts = await Product.find().populate('category');
    console.log(`\n📊 Total products: ${fixedProducts.length}`);
    console.log('📋 Products list:');
    fixedProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - ${p.price}đ - Category: ${p.category?.name || 'N/A'}`);
    });

    console.log(`\n✅ Fixed ${fixCount} products`);
    console.log('🎉 All products are valid!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProducts();
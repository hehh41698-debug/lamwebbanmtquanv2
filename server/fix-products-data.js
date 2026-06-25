const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

async function fixProductData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/computer-store');
    console.log('✅ Connected to MongoDB');

    // 1. Kiểm tra categories
    const categories = await Category.find();
    console.log(`📂 Categories: ${categories.length}`);
    if (categories.length === 0) {
      console.log('⚠️ No categories! Creating default categories...');
      await Category.create([
        { name: 'Laptop', slug: 'laptop', icon: 'bi-laptop', description: 'Máy tính xách tay' },
        { name: 'Desktop', slug: 'desktop', icon: 'bi-pc-display', description: 'Máy tính để bàn' },
        { name: 'Linh kiện', slug: 'components', icon: 'bi-motherboard', description: 'Linh kiện máy tính' },
        { name: 'Phụ kiện', slug: 'accessories', icon: 'bi-headphones', description: 'Phụ kiện máy tính' }
      ]);
      console.log('✅ Categories created');
    }

    // 2. Lấy lại categories
    const updatedCategories = await Category.find();
    const laptopCategory = updatedCategories.find(c => c.slug === 'laptop');
    const desktopCategory = updatedCategories.find(c => c.slug === 'desktop');
    const componentsCategory = updatedCategories.find(c => c.slug === 'components');
    const accessoriesCategory = updatedCategories.find(c => c.slug === 'accessories');

    // 3. Lấy tất cả products
    const products = await Product.find();
    console.log(`📦 Products in DB: ${products.length}`);

    let fixedCount = 0;

    for (const product of products) {
      let needsFix = false;
      
      // Kiểm tra và sửa category
      if (!product.category) {
        console.log(`❌ Product "${product.name}" has no category`);
        product.category = laptopCategory?._id || updatedCategories[0]?._id;
        needsFix = true;
        fixedCount++;
      } else {
        // Kiểm tra category có hợp lệ không
        const catExists = await Category.findById(product.category);
        if (!catExists) {
          console.log(`❌ Product "${product.name}" has invalid category: ${product.category}`);
          product.category = laptopCategory?._id || updatedCategories[0]?._id;
          needsFix = true;
          fixedCount++;
        }
      }

      // Kiểm tra images
      if (!product.images || product.images.length === 0) {
        console.log(`❌ Product "${product.name}" has no images`);
        product.images = ['https://picsum.photos/seed/default/400/300'];
        needsFix = true;
        fixedCount++;
      }

      // Kiểm tra price
      if (!product.price || product.price <= 0) {
        console.log(`❌ Product "${product.name}" has invalid price: ${product.price}`);
        product.price = 1000000;
        needsFix = true;
        fixedCount++;
      }

      // Kiểm tra stock
      if (product.stock === undefined || product.stock === null) {
        console.log(`❌ Product "${product.name}" has no stock`);
        product.stock = 10;
        needsFix = true;
        fixedCount++;
      }

      if (needsFix) {
        await product.save();
        console.log(`✅ Fixed: ${product.name}`);
      }
    }

    // 4. Hiển thị kết quả
    const fixedProducts = await Product.find().populate('category');
    console.log(`\n📊 Total products: ${fixedProducts.length}`);
    console.log('📋 Products list:');
    fixedProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - ${p.price}đ - Category: ${p.category?.name || 'N/A'}`);
    });

    console.log(`\n✅ Fixed ${fixedCount} products`);
    console.log('🎉 Done!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProductData();
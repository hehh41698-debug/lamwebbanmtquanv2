const Product = require('../models/Product');
const Category = require('../models/Category');

// ============================================
// LẤY DANH SÁCH SẢN PHẨM VỚI BỘ LỌC ĐẦY ĐỦ
// ============================================
exports.getProducts = async (req, res) => {
  try {
    console.log('🔍 Fetching products with filters:', req.query);
    
    const { 
      page = 1, 
      limit = 12, 
      category, 
      brand,
      minPrice,
      maxPrice,
      minRating,
      sort = 'createdAt',
      order = 'desc',
      search,
      isFeatured,
      inStock
    } = req.query;

    const query = {};
    const sortOptions = {};

    // 1. Lọc theo danh mục
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
        console.log('📂 Filter by category:', categoryDoc.name);
      } else {
        console.log('⚠️ Category not found:', category);
      }
    }

    // 2. Lọc theo thương hiệu
    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      query.brand = { $in: brands };
      console.log('🏷️ Filter by brand:', brands);
    }

    // 3. Lọc theo khoảng giá
    if (minPrice !== undefined && minPrice !== '' && !isNaN(minPrice)) {
      query.price = { $gte: parseFloat(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(maxPrice)) {
      if (!query.price) query.price = {};
      query.price.$lte = parseFloat(maxPrice);
    }
    if (query.price) {
      console.log('💰 Price range:', query.price);
    }

    // 4. Lọc theo đánh giá
    if (minRating && minRating > 0 && !isNaN(minRating)) {
      query.rating = { $gte: parseFloat(minRating) };
      console.log('⭐ Filter by rating:', minRating);
    }

    // 5. Tìm kiếm theo tên hoặc mô tả
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
      console.log('🔍 Search:', searchTerm);
    }

    // 6. Lọc sản phẩm nổi bật
    if (isFeatured === 'true' || isFeatured === true) {
      query.isFeatured = true;
      console.log('⭐ Filter: Featured products');
    }

    // 7. Lọc còn hàng
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
      console.log('📦 Filter: In stock');
    }

    // 8. Sắp xếp - XỬ LÝ ĐÚNG CÁC TRƯỜNG HỢP
    const sortField = sort || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    
    // Map các trường sort
    const sortMap = {
      'newest': 'createdAt',
      'price': 'price',
      'name': 'name',
      'rating': 'rating',
      'sold': 'sold',
      'createdAt': 'createdAt'
    };
    
    // Xử lý sort với format "price-asc" hoặc "price-desc"
    let actualSortField = sortField;
    let actualSortOrder = sortOrder;
    
    if (sortField.includes('-')) {
      const parts = sortField.split('-');
      actualSortField = parts[0];
      actualSortOrder = parts[1] === 'asc' ? 1 : -1;
    }
    
    // Map field name
    actualSortField = sortMap[actualSortField] || actualSortField;
    sortOptions[actualSortField] = actualSortOrder;
    console.log('📊 Sort:', sortOptions);

    // Phân trang
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    console.log('📋 Final Query:', JSON.stringify(query));

    // Thực hiện truy vấn
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .skip(skip)
        .limit(limitNum)
        .sort(sortOptions)
        .lean(),
      Product.countDocuments(query)
    ]);

    console.log(`✅ Found ${products.length} products (filtered)`);
    console.log(`📊 Total count: ${total}`);

    res.json({
      success: true,
      products,
      total,
      page: parseInt(page),
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// LẤY CHI TIẾT SẢN PHẨM
// ============================================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// LẤY SẢN PHẨM NỔI BẬT
// ============================================
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// LẤY SẢN PHẨM BÁN CHẠY
// ============================================
exports.getBestSellers = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.find({})
      .populate('category', 'name slug')
      .sort({ sold: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Get best sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// LẤY SẢN PHẨM THEO DANH MỤC
// ============================================
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// LẤY SẢN PHẨM THEO THƯƠNG HIỆU
// ============================================
exports.getProductsByBrand = async (req, res) => {
  try {
    const products = await Product.find({
      brand: { $regex: req.params.brand, $options: 'i' }
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Get products by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// LẤY SẢN PHẨM THEO SLUG
// ============================================
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Get product by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// TÌM KIẾM SẢN PHẨM
// ============================================
exports.searchProducts = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const products = await Product.find({
      $or: [
        { name: { $regex: q.trim(), $options: 'i' } },
        { description: { $regex: q.trim(), $options: 'i' } }
      ]
    })
      .populate('category', 'name slug')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// LẤY TẤT CẢ THƯƠNG HIỆU
// ============================================
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    brands.sort();
    res.json({ success: true, brands });
  } catch (error) {
    console.error('❌ Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// LẤY SẢN PHẨM TƯƠNG TỰ
// ============================================
exports.getSimilarProducts = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const products = await Product.find({
      category: currentProduct.category,
      _id: { $ne: req.params.id }
    })
      .populate('category', 'name slug')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Get similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// TẠO SẢN PHẨM (ADMIN)
// ============================================
exports.createProduct = async (req, res) => {
  try {
    console.log('🔄 Creating product:', req.body.name);
    const product = new Product(req.body);
    await product.save();
    await product.populate('category', 'name slug');
    res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// CẬP NHẬT SẢN PHẨM (ADMIN)
// ============================================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// XÓA SẢN PHẨM (ADMIN)
// ============================================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// CẬP NHẬT TỒN KHO (ADMIN)
// ============================================
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required'
      });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    ).populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      product,
      message: 'Stock updated successfully'
    });
  } catch (error) {
    console.error('❌ Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// THỐNG KÊ SẢN PHẨM (ADMIN)
// ============================================
exports.getProductStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const featured = await Product.countDocuments({ isFeatured: true });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lt: 5 } });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    
    res.json({
      success: true,
      stats: { total, featured, lowStock, outOfStock }
    });
  } catch (error) {
    console.error('❌ Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
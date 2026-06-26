const Product = require('../models/Product');
const Category = require('../models/Category');

// ============================================
// LẤY DANH SÁCH SẢN PHẨM
// ============================================
exports.getProducts = async (req, res) => {
  try {
    console.log('🔍 Fetching products...');
    
    const { page = 1, limit = 12, category, search } = req.query;
    const query = {};

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .populate('category')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    console.log(`✅ Found ${products.length} products`);

    res.json({
      success: true,
      products,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// LẤY CHI TIẾT SẢN PHẨM
// ============================================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
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
      .populate('category')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
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
      .populate('category')
      .sort({ sold: -1 })
      .limit(parseInt(limit));
    
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
      .populate('category')
      .sort({ createdAt: -1 });
    
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
    }).populate('category');
    
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
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
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
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('category')
      .limit(parseInt(limit));
    
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
      .populate('category')
      .limit(parseInt(limit));
    
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
    
    // Validate required fields
    if (!req.body.name || !req.body.price || !req.body.category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, category'
      });
    }
    
    const product = new Product(req.body);
    await product.save();
    
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
// Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log('🔄 Updating product:', req.params.id);
    console.log('📦 Update data:', req.body);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Product updated:', product._id);
    res.json({
      success: true,
      product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
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
    );
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
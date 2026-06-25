const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// ============================================
// GET ALL PRODUCTS (Public)
// ============================================
exports.getProducts = async (req, res) => {
  try {
    console.log('🔍 Fetching products...');
    console.log('📋 Query params:', req.query);
    
    const { 
      page = 1, 
      limit = 12, 
      category, 
      brand,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      search,
      isFeatured,
      inStock
    } = req.query;

    const query = {};
    const sortOptions = {};

    // Filter by category
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
        console.log('📂 Filter by category:', categoryDoc.name);
      } else {
        console.log('⚠️ Category not found:', category);
      }
    }

    // Filter by brand
    if (brand) {
      const brands = brand.split(',').map(b => b.trim());
      query.brand = { $in: brands };
      console.log('🏷️ Filter by brand:', brands);
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
      console.log('💰 Price range:', query.price);
    }

    // Filter by featured
    if (isFeatured === 'true' || isFeatured === true) {
      query.isFeatured = true;
      console.log('⭐ Filter: Featured products');
    }

    // Filter by stock
    if (inStock === 'true' || inStock === true) {
      query.stock = { $gt: 0 };
      console.log('📦 Filter: In stock');
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      console.log('🔍 Search:', search);
    }

    // Sorting
    const sortField = sort || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    sortOptions[sortField] = sortOrder;
    console.log('📊 Sort:', sortOptions);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    console.log('📋 Final Query:', JSON.stringify(query));

    // Get products
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category')
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
// GET PRODUCT BY ID (Public)
// ============================================
exports.getProductById = async (req, res) => {
  try {
    console.log('🔍 Fetching product by ID:', req.params.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findById(req.params.id)
      .populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Product found:', product.name);
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// GET PRODUCT BY SLUG (Public)
// ============================================
exports.getProductBySlug = async (req, res) => {
  try {
    console.log('🔍 Fetching product by slug:', req.params.slug);
    
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Product found:', product.name);
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Get product by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// GET FEATURED PRODUCTS (Public)
// ============================================
exports.getFeaturedProducts = async (req, res) => {
  try {
    console.log('⭐ Fetching featured products...');
    
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ isFeatured: true })
      .populate('category')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} featured products`);
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('❌ Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET BEST SELLING PRODUCTS (Public)
// ============================================
exports.getBestSellers = async (req, res) => {
  try {
    console.log('🏆 Fetching best selling products...');
    
    const { limit = 8 } = req.query;
    
    const products = await Product.find({})
      .populate('category')
      .sort({ sold: -1 })
      .limit(parseInt(limit));
    
    console.log(`✅ Found ${products.length} best sellers`);
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('❌ Get best sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET PRODUCTS BY CATEGORY (Public)
// ============================================
exports.getProductsByCategory = async (req, res) => {
  try {
    console.log('📂 Fetching products by category:', req.params.categoryId);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    
    const products = await Product.find({ category: req.params.categoryId })
      .populate('category')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} products`);
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('❌ Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// CREATE PRODUCT (Admin only)
// ============================================
exports.createProduct = async (req, res) => {
  try {
    console.log('🔄 Creating product:', req.body.name);
    
    // Validate required fields
    const requiredFields = ['name', 'slug', 'description', 'price', 'category', 'brand', 'images', 'stock'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate category exists
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Validate slug uniqueness
    const existingSlug = await Product.findOne({ slug: req.body.slug });
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }
    
    // Validate price
    if (req.body.price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }
    
    const product = new Product(req.body);
    await product.save();
    
    console.log('✅ Product created:', product._id);
    res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// UPDATE PRODUCT (Admin only)
// ============================================
exports.updateProduct = async (req, res) => {
  try {
    console.log('🔄 Updating product:', req.params.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    // Check product exists
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Validate category if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }
    
    // Validate slug uniqueness if changed
    if (req.body.slug && req.body.slug !== existingProduct.slug) {
      const slugExists = await Product.findOne({ 
        slug: req.body.slug, 
        _id: { $ne: req.params.id } 
      });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        });
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category');
    
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// DELETE PRODUCT (Admin only)
// ============================================
exports.deleteProduct = async (req, res) => {
  try {
    console.log('🗑️ Deleting product:', req.params.id);
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Product deleted:', req.params.id);
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// GET PRODUCT STATISTICS (Admin only)
// ============================================
exports.getProductStats = async (req, res) => {
  try {
    console.log('📊 Fetching product statistics...');
    
    const [
      total,
      featured,
      lowStock,
      outOfStock,
      priceStats
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ isFeatured: true }),
      Product.countDocuments({ stock: { $gt: 0, $lt: 5 } }),
      Product.countDocuments({ stock: 0 }),
      Product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
            avgPrice: { $avg: '$price' }
          }
        }
      ])
    ]);
    
    // Get top selling products
    const topSelling = await Product.find({})
      .sort({ sold: -1 })
      .limit(5)
      .select('name price sold images');
    
    // Get low stock products
    const lowStockProducts = await Product.find({ stock: { $gt: 0, $lt: 5 } })
      .sort({ stock: 1 })
      .limit(5)
      .select('name price stock');
    
    res.json({
      success: true,
      stats: {
        total,
        featured,
        lowStock,
        outOfStock,
        inStock: total - outOfStock,
        price: priceStats.length > 0 ? {
          min: priceStats[0].minPrice,
          max: priceStats[0].maxPrice,
          avg: Math.round(priceStats[0].avgPrice)
        } : {
          min: 0,
          max: 0,
          avg: 0
        }
      },
      topSelling,
      lowStockProducts
    });
  } catch (error) {
    console.error('❌ Get product stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// UPDATE PRODUCT STOCK (Admin only)
// ============================================
exports.updateStock = async (req, res) => {
  try {
    console.log('📦 Updating stock for product:', req.params.id);
    
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
    ).populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    console.log('✅ Stock updated:', product.stock);
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
// GET SIMILAR PRODUCTS (Public)
// ============================================
exports.getSimilarProducts = async (req, res) => {
  try {
    console.log('🔍 Fetching similar products for:', req.params.id);
    
    const { limit = 4 } = req.query;
    
    // Get current product
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find similar products (same category, different id)
    const products = await Product.find({
      category: currentProduct.category,
      _id: { $ne: req.params.id }
    })
      .populate('category')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} similar products`);
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('❌ Get similar products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// SEARCH PRODUCTS (Public)
// ============================================
exports.searchProducts = async (req, res) => {
  try {
    console.log('🔍 Searching products:', req.query.q);
    
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('category')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} results`);
    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('❌ Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET PRODUCTS BY BRAND (Public)
// ============================================
exports.getProductsByBrand = async (req, res) => {
  try {
    console.log('🏷️ Fetching products by brand:', req.params.brand);
    
    const { limit = 20 } = req.query;
    
    const products = await Product.find({ 
      brand: { $regex: req.params.brand, $options: 'i' } 
    })
      .populate('category')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} products`);
    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('❌ Get products by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ============================================
// GET ALL BRANDS (Public)
// ============================================
exports.getAllBrands = async (req, res) => {
  try {
    console.log('🏷️ Fetching all brands...');
    
    const brands = await Product.distinct('brand');
    brands.sort();
    
    console.log(`✅ Found ${brands.length} brands`);
    res.json({
      success: true,
      brands
    });
  } catch (error) {
    console.error('❌ Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
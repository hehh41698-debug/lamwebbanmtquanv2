const Category = require('../models/Category');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const [categories, total] = await Promise.all([
      Category.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Category.countDocuments(query)
    ]);

    res.json({
      success: true,
      categories,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, icon, description } = req.body;

    // Check if category exists
    const existingCategory = await Category.findOne({ 
      $or: [{ slug }, { name: name.trim() }] 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Danh mục đã tồn tại'
      });
    }

    const category = new Category({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      icon: icon || 'bi bi-tag',
      description: description || ''
    });

    await category.save();

    res.status(201).json({
      success: true,
      category,
      message: 'Tạo danh mục thành công'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, slug, icon, description } = req.body;
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    // Check slug conflict
    if (slug && slug !== category.slug) {
      const existingSlug = await Category.findOne({ 
        slug: slug.trim().toLowerCase(),
        _id: { $ne: categoryId }
      });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: 'Slug đã tồn tại'
        });
      }
    }

    category.name = name?.trim() || category.name;
    category.slug = slug?.trim().toLowerCase() || category.slug;
    category.icon = icon || category.icon;
    category.description = description || category.description;

    await category.save();

    res.json({
      success: true,
      category,
      message: 'Cập nhật danh mục thành công'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    // Check if category has products
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ category: categoryId });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục vì có ${productCount} sản phẩm đang thuộc danh mục này`
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
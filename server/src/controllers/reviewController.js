const Review = require('../models/Review');
const Product = require('../models/Product');

// ============================================
// TẠO ĐÁNH GIÁ MỚI
// ============================================
exports.createReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const productId = req.params.productId;

    console.log('📝 Creating review for product:', productId);
    console.log('👤 User:', req.user.id);

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi'
      });
    }

    // Tạo đánh giá mới
    const review = new Review({
      user: req.user.id,
      product: productId,
      rating: Number(rating),
      comment: comment.trim(),
      images: images || [],
      isApproved: true // Tự động duyệt
    });

    await review.save();
    console.log('✅ Review saved:', review._id);

    // Cập nhật rating trung bình của sản phẩm
    await updateProductRating(productId);

    // Populate user info
    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      review,
      message: 'Đánh giá của bạn đã được gửi thành công!'
    });
  } catch (error) {
    console.error('❌ Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi đánh giá: ' + error.message
    });
  }
};

// ============================================
// LẤY ĐÁNH GIÁ CỦA SẢN PHẨM
// ============================================
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find({ 
        product: productId,
        isApproved: true
      })
        .populate('user', 'name avatar')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Review.countDocuments({ 
        product: productId,
        isApproved: true 
      })
    ]);

    res.json({
      success: true,
      reviews,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy đánh giá'
    });
  }
};

// ============================================
// LẤY ĐÁNH GIÁ CỦA USER (Dành cho User Dashboard)
// ============================================
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    console.log('📋 Getting reviews for user:', userId);

    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .populate('product', 'name images price')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Review.countDocuments({ user: userId })
    ]);

    res.json({
      success: true,
      reviews,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy đánh giá của bạn'
    });
  }
};

// ============================================
// XÓA ĐÁNH GIÁ
// ============================================
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    console.log('🗑️ Deleting review:', reviewId);

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    // Kiểm tra quyền
    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa đánh giá này'
      });
    }

    await review.deleteOne();

    // Cập nhật lại rating
    await updateProductRating(review.product);

    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    console.error('❌ Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đánh giá'
    });
  }
};

// ============================================
// DUYỆT ĐÁNH GIÁ (ADMIN)
// ============================================
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('user', 'name avatar');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }

    await updateProductRating(review.product);

    res.json({
      success: true,
      review,
      message: 'Duyệt đánh giá thành công'
    });
  } catch (error) {
    console.error('❌ Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi duyệt đánh giá'
    });
  }
};

// ============================================
// LẤY TẤT CẢ ĐÁNH GIÁ (ADMIN)
// ============================================
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status === 'approved') {
      query.isApproved = true;
    } else if (status === 'pending') {
      query.isApproved = false;
    }

    if (search) {
      query.comment = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name avatar')
        .populate('product', 'name images')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Review.countDocuments(query)
    ]);

    res.json({
      success: true,
      reviews,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đánh giá'
    });
  }
};

// ============================================
// CẬP NHẬT RATING SẢN PHẨM (Helper)
// ============================================
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ 
      product: productId, 
      isApproved: true 
    });
    
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10
    });
    
    console.log('✅ Product rating updated:', productId, avgRating);
  } catch (error) {
    console.error('❌ Update product rating error:', error);
  }
};
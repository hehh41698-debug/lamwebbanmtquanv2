const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// ============================================
// TẠO ĐÁNH GIÁ MỚI
// ============================================
exports.createReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const productId = req.params.productId;

    console.log('📝 Creating review for product:', productId);
    console.log('👤 User:', req.user.id);
    console.log('📦 Data:', { rating, comment, images });

    // Kiểm tra dữ liệu đầu vào
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn số sao từ 1 đến 5'
      });
    }

    if (!comment || comment.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập nội dung đánh giá (ít nhất 3 ký tự)'
      });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    // Kiểm tra user đã mua sản phẩm chưa (tùy chọn)
    // Bỏ qua nếu chưa có order

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

    // Cập nhật rating trung bình
    const reviews = await Review.find({ 
      product: productId, 
      isApproved: true 
    });
    
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : rating;
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10
    });

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

    console.log('📋 Getting reviews for product:', productId);

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

    console.log('✅ Found', reviews.length, 'reviews');

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
    const reviews = await Review.find({ 
      product: review.product, 
      isApproved: true 
    });
    
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avgRating * 10) / 10
    });

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
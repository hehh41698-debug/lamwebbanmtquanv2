const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// ============================================
// LẤY DANH SÁCH YÊU THÍCH
// ============================================
exports.getWishlist = async (req, res) => {
  try {
    console.log('❤️ Get wishlist for user:', req.user.id);
    
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items.product', 'name price discount images stock brand rating');
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
      await wishlist.save();
    }

    res.json({
      success: true,
      items: wishlist.items
    });
  } catch (error) {
    console.error('❌ Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách yêu thích'
    });
  }
};

// ============================================
// THÊM VÀO YÊU THÍCH
// ============================================
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log('❤️ Add to wishlist:', { productId, userId: req.user.id });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
    }

    const existingItem = wishlist.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm đã có trong danh sách yêu thích'
      });
    }

    wishlist.items.push({ product: productId });
    await wishlist.save();
    await wishlist.populate('items.product', 'name price discount images stock brand rating');

    res.json({
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
      items: wishlist.items
    });
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thêm vào danh sách yêu thích'
    });
  }
};

// ============================================
// XÓA KHỎI YÊU THÍCH
// ============================================
exports.removeFromWishlist = async (req, res) => {
  try {
    const itemId = req.params.id;
    console.log('❤️ Remove from wishlist:', { itemId, userId: req.user.id });

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh sách yêu thích'
      });
    }

    wishlist.items = wishlist.items.filter(
      item => item._id.toString() !== itemId
    );
    await wishlist.save();
    await wishlist.populate('items.product', 'name price discount images stock brand rating');

    res.json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích',
      items: wishlist.items
    });
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa khỏi danh sách yêu thích'
    });
  }
};

// ============================================
// KIỂM TRA SẢN PHẨM ĐÃ YÊU THÍCH
// ============================================
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.json({
        success: true,
        isInWishlist: false
      });
    }

    const isInWishlist = wishlist.items.some(
      item => item.product.toString() === productId
    );

    res.json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    console.error('❌ Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra danh sách yêu thích'
    });
  }
};

// ============================================
// XÓA TOÀN BỘ YÊU THÍCH
// ============================================
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }

    res.json({
      success: true,
      message: 'Đã xóa toàn bộ danh sách yêu thích',
      items: []
    });
  } catch (error) {
    console.error('❌ Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa danh sách yêu thích'
    });
  }
};
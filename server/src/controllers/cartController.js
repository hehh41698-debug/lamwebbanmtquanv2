const Cart = require('../models/Cart');
const Product = require('../models/Product');

// ============================================
// LẤY GIỎ HÀNG
// ============================================
exports.getCart = async (req, res) => {
  try {
    console.log('🛒 Get cart for user:', req.user.id);
    
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name price discount images stock brand');
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.product) {
        const price = item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
        subtotal += price * item.quantity;
      }
    });

    res.json({
      success: true,
      cart: {
        items: cart.items,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal,
        shipping: 30000,
        total: subtotal + 30000
      }
    });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy giỏ hàng'
    });
  }
};

// ============================================
// THÊM VÀO GIỎ HÀNG
// ============================================
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    console.log('🛒 Adding to cart:', { productId, quantity, userId: req.user.id });

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng vượt quá tồn kho'
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product', 'name price discount images stock brand');

    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.product) {
        const price = item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
        subtotal += price * item.quantity;
      }
    });

    res.json({
      success: true,
      message: 'Đã thêm vào giỏ hàng',
      cart: {
        items: cart.items,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal,
        shipping: 30000,
        total: subtotal + 30000
      }
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thêm vào giỏ hàng'
    });
  }
};

// ============================================
// CẬP NHẬT SỐ LƯỢNG
// ============================================
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.id;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng phải lớn hơn 0'
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không có trong giỏ hàng'
      });
    }

    const product = await Product.findById(item.product);
    if (product && product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng vượt quá tồn kho'
      });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price discount images stock brand');

    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.product) {
        const price = item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
        subtotal += price * item.quantity;
      }
    });

    res.json({
      success: true,
      message: 'Cập nhật số lượng thành công',
      cart: {
        items: cart.items,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal,
        shipping: 30000,
        total: subtotal + 30000
      }
    });
  } catch (error) {
    console.error('❌ Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật giỏ hàng'
    });
  }
};

// ============================================
// XÓA KHỎI GIỎ HÀNG
// ============================================
exports.removeFromCart = async (req, res) => {
  try {
    const itemId = req.params.id;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    await cart.populate('items.product', 'name price discount images stock brand');

    let subtotal = 0;
    cart.items.forEach(item => {
      if (item.product) {
        const price = item.product.discount 
          ? item.product.price * (1 - item.product.discount / 100)
          : item.product.price;
        subtotal += price * item.quantity;
      }
    });

    res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      cart: {
        items: cart.items,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal,
        shipping: 30000,
        total: subtotal + 30000
      }
    });
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa khỏi giỏ hàng'
    });
  }
};

// ============================================
// XÓA TOÀN BỘ GIỎ HÀNG
// ============================================
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng',
      cart: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        shipping: 0,
        total: 0
      }
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa giỏ hàng'
    });
  }
};
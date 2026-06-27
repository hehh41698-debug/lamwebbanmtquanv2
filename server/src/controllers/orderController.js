const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// ============================================
// TẠO ĐƠN HÀNG MỚI
// ============================================
exports.createOrder = async (req, res) => {
  try {
    console.log('📦 Creating order for user:', req.user.id);
    console.log('📦 Order data:', req.body);
    
    const { shippingAddress, paymentMethod, note, items, total } = req.body;

    // Validate
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng trống'
      });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin giao hàng'
      });
    }

    // Kiểm tra tồn kho
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Sản phẩm ${item.name || 'không xác định'} không tồn tại`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm`
        });
      }
    }

    // Tạo đơn hàng
    const order = new Order({
      user: req.user.id,
      items: items.map(item => ({
        product: item.product,
        name: item.name || 'Sản phẩm',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || ''
      })),
      total: total || 0,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        email: shippingAddress.email || req.user.email,
        address: shippingAddress.address,
        city: shippingAddress.city,
        zipCode: shippingAddress.zipCode || ''
      },
      paymentMethod: paymentMethod || 'cod',
      note: note || '',
      orderStatus: 'pending'
    });

    await order.save();
    console.log('✅ Order saved:', order._id);

    // Cập nhật tồn kho
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          stock: -item.quantity,
          sold: item.quantity 
        }
      });
    }

    // Xóa giỏ hàng
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

    // Populate user info
    await order.populate('user', 'name email');

    res.status(201).json({
      success: true,
      order,
      message: 'Đặt hàng thành công'
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng: ' + error.message
    });
  }
};

// ============================================
// LẤY DANH SÁCH ĐƠN HÀNG
// ============================================
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    // User chỉ xem đơn của mình
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng'
    });
  }
};

// ============================================
// LẤY CHI TIẾT ĐƠN HÀNG
// ============================================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra quyền
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết đơn hàng'
    });
  }
};

// ============================================
// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (ADMIN)
// ============================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      success: true,
      order,
      message: 'Cập nhật trạng thái thành công'
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng'
    });
  }
};

// ============================================
// HỦY ĐƠN HÀNG (USER)
// ============================================
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra quyền
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy đơn hàng này'
      });
    }

    // Kiểm tra trạng thái
    if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng đã giao hoặc đã hủy'
      });
    }

    // Hoàn lại tồn kho
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          stock: item.quantity,
          sold: -item.quantity 
        }
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      success: true,
      order,
      message: 'Hủy đơn hàng thành công'
    });
  } catch (error) {
    console.error('❌ Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy đơn hàng'
    });
  }
};

// ============================================
// THỐNG KÊ ĐƠN HÀNG (ADMIN)
// ============================================
exports.getOrderStats = async (req, res) => {
  try {
    const [
      total,
      pending,
      confirmed,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'confirmed' }),
      Order.countDocuments({ orderStatus: 'processing' }),
      Order.countDocuments({ orderStatus: 'shipped' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { orderStatus: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        processing,
        shipped,
        delivered,
        cancelled,
        revenue: revenue.length > 0 ? revenue[0].total : 0
      }
    });
  } catch (error) {
    console.error('❌ Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê đơn hàng'
    });
  }
};
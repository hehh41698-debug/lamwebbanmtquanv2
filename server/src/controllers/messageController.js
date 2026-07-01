const Message = require('../models/Message');
const User = require('../models/User');

// ============================================
// GỬI TIN NHẮN (User)
// ============================================
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const userId = req.user.id;

    console.log('📝 New message from user:', userId);

    // Validate
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Tạo tin nhắn mới
    const newMessage = new Message({
      user: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      subject: subject,
      message: message.trim(),
      status: 'pending'
    });

    await newMessage.save();
    console.log('✅ Message saved:', newMessage._id);

    res.status(201).json({
      success: true,
      message: 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm.',
      data: newMessage
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi tin nhắn: ' + error.message
    });
  }
};

// ============================================
// LẤY TIN NHẮN CỦA USER
// ============================================
exports.getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      Message.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Message.countDocuments({ user: userId })
    ]);

    res.json({
      success: true,
      messages,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get user messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tin nhắn'
    });
  }
};

// ============================================
// LẤY TẤT CẢ TIN NHẮN (Admin)
// ============================================
exports.getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate('user', 'name email avatar')
        .populate('repliedBy', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Message.countDocuments(query)
    ]);

    res.json({
      success: true,
      messages,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get all messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tin nhắn'
    });
  }
};

// ============================================
// LẤY CHI TIẾT TIN NHẮN
// ============================================
exports.getMessageById = async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const message = await Message.findById(messageId)
      .populate('user', 'name email avatar')
      .populate('repliedBy', 'name email');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn'
      });
    }

    // Nếu là admin hoặc chủ sở hữu
    if (req.user.role !== 'admin' && message.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem tin nhắn này'
      });
    }

    // Đánh dấu đã đọc nếu là admin
    if (req.user.role === 'admin' && message.status === 'pending') {
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('❌ Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết tin nhắn'
    });
  }
};

// ============================================
// TRẢ LỜI TIN NHẮN (Admin)
// ============================================
exports.replyMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { reply } = req.body;
    const adminId = req.user.id;

    console.log('📝 Replying to message:', messageId);
    console.log('👤 Admin:', adminId);

    if (!reply || !reply.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập nội dung trả lời'
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn'
      });
    }

    message.adminReply = reply.trim();
    message.status = 'replied';
    message.repliedAt = new Date();
    message.repliedBy = adminId;

    await message.save();
    await message.populate('repliedBy', 'name email');

    console.log('✅ Reply saved for message:', messageId);

    res.json({
      success: true,
      message: 'Trả lời tin nhắn thành công!',
      data: message
    });
  } catch (error) {
    console.error('❌ Reply message error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi trả lời tin nhắn'
    });
  }
};

// ============================================
// CẬP NHẬT TRẠNG THÁI TIN NHẮN (Admin)
// ============================================
exports.updateMessageStatus = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'read', 'replied', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const message = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: message
    });
  } catch (error) {
    console.error('❌ Update message status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái'
    });
  }
};

// ============================================
// XÓA TIN NHẮN (Admin)
// ============================================
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;

    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn'
      });
    }

    res.json({
      success: true,
      message: 'Xóa tin nhắn thành công'
    });
  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa tin nhắn'
    });
  }
};
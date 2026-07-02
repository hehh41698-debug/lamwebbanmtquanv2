const Message = require('../models/Message');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// ============================================
// CẤU HÌNH GỬI EMAIL
// ============================================
const sendEmail = async (to, subject, html) => {
  try {
    // Kiểm tra cấu hình email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email not configured. Skipping email send.');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Computer Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('✅ Email sent to:', to);
  } catch (error) {
    console.error('❌ Send email error:', error);
  }
};

// ============================================
// HELPER: LẤY TÊN CHỦ ĐỀ
// ============================================
const getSubjectLabel = (subject) => {
  const labels = {
    order: 'Đơn hàng',
    product: 'Sản phẩm',
    return: 'Đổi trả',
    warranty: 'Bảo hành',
    other: 'Khác'
  };
  return labels[subject] || subject;
};

// ============================================
// GỬI TIN NHẮN (User)
// ============================================
exports.sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const userId = req.user.id;

    console.log('📝 New message from user:', userId);
    console.log('📝 Message data:', { name, email, subject });

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

    // Gửi email xác nhận cho user
    const confirmHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">📨 Xác nhận tin nhắn</h2>
          <p>Xin chào <strong>${name}</strong>,</p>
          <p>Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi sớm nhất có thể.</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Chủ đề:</strong> ${getSubjectLabel(subject)}</p>
            <p style="margin: 5px 0;"><strong>Nội dung:</strong> ${message}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Trân trọng,<br>Đội ngũ Computer Store</p>
        </div>
      </div>
    `;

    await sendEmail(email, 'Xác nhận tin nhắn - Computer Store', confirmHtml);

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
    console.log('📋 Admin fetching all messages...');
    
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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate('user', 'name email avatar')
        .populate('repliedBy', 'name email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Message.countDocuments(query)
    ]);

    console.log(`✅ Found ${messages.length} messages`);

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
      message: 'Lỗi khi lấy danh sách tin nhắn: ' + error.message
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

    if (req.user.role !== 'admin' && message.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem tin nhắn này'
      });
    }

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
// TRẢ LỜI TIN NHẮN (Admin) - CÓ GỬI EMAIL
// ============================================
exports.replyMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const { reply } = req.body;
    const adminId = req.user.id;

    console.log('📝 Admin replying to message:', messageId);
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

    // Cập nhật tin nhắn
    message.adminReply = reply.trim();
    message.status = 'replied';
    message.repliedAt = new Date();
    message.repliedBy = adminId;

    await message.save();
    await message.populate('repliedBy', 'name email');

    console.log('✅ Reply saved for message:', messageId);

    // ============================================
    // GỬI EMAIL THÔNG BÁO CHO USER
    // ============================================
    const replyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">📩 Phản hồi từ Computer Store</h2>
          <p>Xin chào <strong>${message.name}</strong>,</p>
          <p>Chúng tôi đã xem xét tin nhắn của bạn và có phản hồi như sau:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Chủ đề:</strong> ${getSubjectLabel(message.subject)}</p>
            <p style="margin: 5px 0;"><strong>Tin nhắn của bạn:</strong> ${message.message}</p>
          </div>
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981;">
            <p style="margin: 5px 0;"><strong>📌 Phản hồi từ Admin:</strong></p>
            <p style="margin: 5px 0; font-style: italic;">${reply}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Trân trọng,<br>Đội ngũ Computer Store</p>
        </div>
      </div>
    `;

    await sendEmail(message.email, 'Phản hồi từ Computer Store', replyHtml);

    res.json({
      success: true,
      message: 'Trả lời tin nhắn thành công! Email đã được gửi đến khách hàng.',
      data: message
    });
  } catch (error) {
    console.error('❌ Reply message error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi trả lời tin nhắn: ' + error.message
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

// ============================================
// ĐÁNH DẤU ĐÃ ĐỌC (User)
// ============================================
exports.markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    const message = await Message.findOne({ _id: messageId, user: userId });
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin nhắn'
      });
    }

    if (message.status === 'replied') {
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      message: 'Đã đánh dấu đã đọc',
      data: message
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu đã đọc'
    });
  }
};
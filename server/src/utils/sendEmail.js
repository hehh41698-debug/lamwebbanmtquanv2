const nodemailer = require('nodemailer');

// Tạo transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Gửi email
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Computer Store" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

// Gửi email xác nhận đăng ký
exports.sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Chào mừng bạn đến với Computer Store!</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại Computer Store.</p>
      <p>Chúng tôi rất vui được phục vụ bạn!</p>
      <hr>
      <p style="color: #666; font-size: 14px;">Trân trọng,<br>Đội ngũ Computer Store</p>
    </div>
  `;
  
  return exports.sendEmail({
    email,
    subject: 'Chào mừng đến với Computer Store',
    html
  });
};

// Gửi email xác nhận đơn hàng
exports.sendOrderConfirmation = async (email, name, orderId, total) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Xác nhận đơn hàng</h2>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Đơn hàng của bạn đã được đặt thành công!</p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Mã đơn hàng:</strong> #${orderId}</p>
        <p><strong>Tổng tiền:</strong> ${total.toLocaleString()}đ</p>
      </div>
      <p>Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.</p>
      <hr>
      <p style="color: #666; font-size: 14px;">Trân trọng,<br>Đội ngũ Computer Store</p>
    </div>
  `;
  
  return exports.sendEmail({
    email,
    subject: `Xác nhận đơn hàng #${orderId}`,
    html
  });
};
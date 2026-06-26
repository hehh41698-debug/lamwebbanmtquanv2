const jwt = require('jsonwebtoken');

// Generate Access Token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'your_secret_key_here_123456';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  console.log('🔑 Generating token for user:', userId);
  
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: expiresIn }
  );
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key_here_123456';
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || '30d';
  
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: expiresIn }
  );
};

module.exports = {
  generateToken,
  generateRefreshToken
};
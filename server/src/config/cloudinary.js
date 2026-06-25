const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image
exports.uploadImage = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'computer-store',
      transformation: options.transformation || [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ],
      ...options
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (filePaths, options = {}) => {
  try {
    const uploadPromises = filePaths.map(filePath => 
      exports.uploadImage(filePath, options)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw error;
  }
};

// Delete image
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Delete multiple images
exports.deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => 
      exports.deleteImage(publicId)
    );
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    console.error('Cloudinary multiple delete error:', error);
    throw error;
  }
};

// Get image URL
exports.getImageUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    width: options.width || 800,
    height: options.height || 600,
    crop: options.crop || 'limit',
    quality: options.quality || 'auto',
    ...options
  });
};
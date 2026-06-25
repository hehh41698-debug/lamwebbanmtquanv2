const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  specs: {
    processor: { type: String, default: '' },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    display: { type: String, default: '' },
    graphics: { type: String, default: '' },
    os: { type: String, default: '' },
    weight: { type: String, default: '' },
    battery: { type: String, default: '' },
    ports: { type: String, default: '' },
    color: { type: String, default: '' }
  },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Product must have at least one image'
    }
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  sold: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field: discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
});

// Virtual field: inStock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
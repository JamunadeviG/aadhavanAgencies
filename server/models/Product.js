import mongoose from 'mongoose';

// Product Schema - stores grocery product information
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    // Examples: kg, liter, piece, box, packet
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);

export default Product;

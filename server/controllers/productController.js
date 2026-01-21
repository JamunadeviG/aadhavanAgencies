import Product from '../models/Product.js';

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, category, unit, price, stock } = req.body;

    // Validate required fields
    if (!name || !category || !unit || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, unit, price, stock'
      });
    }

    // Create product
    const product = await Product.create({
      name,
      category,
      unit,
      price,
      stock
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, unit, price, stock } = req.body;

    // Find product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields (only update provided fields)
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (unit !== undefined) product.unit = unit;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;

    // Save updated product
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

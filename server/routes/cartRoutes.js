const express = require('express');
const Cart = require('../models/Cart.js');
const Product = require('../models/Product.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// GET /api/cart - Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    console.log('📦 Fetching cart from database for user:', req.user.id);
    const cart = await getCart(req.user.id);
    res.json({ success: true, cart });
  } catch (error) {
    console.error('📦 Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
});

// POST /api/cart/add - Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, name, price, unit, stock, quantity = 1 } = req.body;
    
    console.log('📦 Adding to cart:', { productId, name, price, unit, stock, quantity });

    const cart = await getCart(req.user.id);
    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name,
        price,
        unit,
        stock,
        quantity
      });
    }

    await cart.save();
    console.log('📦 Cart updated successfully');
    res.json({ success: true, cart });
  } catch (error) {
    console.error('📦 Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
});

// PUT /api/cart/update - Update cart item quantity
router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    console.log('📦 Updating cart item:', { productId, quantity });

    const cart = await getCart(req.user.id);
    const item = cart.items.find((item) => item.productId === productId);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.productId !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    console.log('📦 Cart item updated successfully');
    res.json({ success: true, cart });
  } catch (error) {
    console.error('📦 Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// DELETE /api/cart/remove/:productId - Remove item from cart
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log('📦 Removing from cart:', productId);

    const cart = await getCart(req.user.id);
    cart.items = cart.items.filter((item) => item.productId !== productId);

    await cart.save();
    console.log('📦 Cart item removed successfully');
    res.json({ success: true, cart });
  } catch (error) {
    console.error('📦 Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from cart' });
  }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', protect, async (req, res) => {
  try {
    console.log('📦 Clearing cart for user:', req.user.id);
    
    const cart = await getCart(req.user.id);
    cart.items = [];
    await cart.save();
    
    console.log('📦 Cart cleared successfully');
    res.json({ success: true, cart });
  } catch (error) {
    console.error('📦 Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

module.exports = router;


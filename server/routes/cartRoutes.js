import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// GET /api/cart
router.get('/', protect, async (req, res) => {
  const cart = await getCart(req.user.id);
  await cart.populate('items.product');
  res.json(cart);
});

// POST /api/cart/add
router.post('/add', protect, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const cart = await getCart(req.user.id);
  const existing = cart.items.find((i) => i.product.toString() === productId);

  if (existing) existing.quantity += quantity;
  else cart.items.push({ product: productId, quantity });

  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// PUT /api/cart/update
router.put('/update', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await getCart(req.user.id);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Item not in cart' });

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', protect, async (req, res) => {
  const cart = await getCart(req.user.id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product');
  res.json(cart);
});

// DELETE /api/cart/clear
router.delete('/clear', protect, async (req, res) => {
  const cart = await getCart(req.user.id);
  cart.items = [];
  await cart.save();
  res.json(cart);
});

export default router;


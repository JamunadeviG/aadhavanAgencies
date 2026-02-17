import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// POST /api/orders/checkout
router.post('/checkout', protect, async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      user: req.user.id,
      items,
      deliveryAddress,
      paymentMethod,
      totalAmount,
      status: 'Pending'
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Checkout error', error: err.message });
  }
});

// GET /api/orders/my
router.get('/my', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

// ADMIN: GET /api/orders
router.get('/', protect, adminOnly, async (req, res) => {
  const orders = await Order.find().populate('user').sort({ createdAt: -1 });
  res.json(orders);
});

// ADMIN: PUT /api/orders/:id/status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.status = status || order.status;
  await order.save();
  res.json(order);
});

export default router;


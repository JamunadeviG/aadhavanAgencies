import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT token with id and role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const generateRetailUserId = async () => {
  const prefix = 'AA';
  let counter = await User.countDocuments({ role: 'user' });
  let candidate;
  let exists = true;

  while (exists) {
    counter += 1;
    candidate = `${prefix}${String(counter).padStart(2, '0')}`;
    // eslint-disable-next-line no-await-in-loop
    exists = await User.exists({ userId: candidate });
  }

  return candidate;
};

// Register new buyer (user)
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      storeName,
      storeType,
      gstNumber,
      contactNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode
    } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    if (!storeName || !storeType || !contactNumber || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ message: 'Please provide complete store information' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const userId = await generateRetailUserId();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'user',
      userId,
      storeInfo: {
        storeName: storeName?.trim(),
        storeType: storeType?.trim() || 'Retail',
        gstNumber: gstNumber?.trim(),
        contactNumber: contactNumber?.trim(),
        addressLine1: addressLine1?.trim(),
        addressLine2: addressLine2?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        pincode: pincode?.trim()
      }
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        storeInfo: user.storeInfo
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Return authenticated user's profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch profile', error: error.message });
  }
};

// Login user or admin
export const login = async (req, res) => {
  try {
    const { email, password, asAdmin } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Please provide password' });
    }

    let user;
    const normalizedEmail = email?.toLowerCase();
    const emailErrorMessage = asAdmin ? 'Please provide admin email' : 'Please provide registered email';
    if (!normalizedEmail) {
      return res.status(400).json({ message: emailErrorMessage });
    }

    user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (asAdmin && user.role !== 'admin') {
      return res.status(403).json({ message: 'Not an admin account' });
    }

    if (!asAdmin && user.role !== 'user') {
      return res.status(403).json({ message: 'User ID belongs to admin' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        storeInfo: user.storeInfo
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

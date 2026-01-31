import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const storeInfoSchema = new mongoose.Schema({
  storeName: {
    type: String,
    trim: true,
    required: [true, 'Store name is required']
  },
  storeType: {
    type: String,
    trim: true,
    default: 'Retail'
  },
  gstNumber: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  },
  addressLine1: {
    type: String,
    trim: true,
    required: [true, 'Address line 1 is required']
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    trim: true,
    required: [true, 'State is required']
  },
  pincode: {
    type: String,
    trim: true,
    required: [true, 'Pincode is required']
  }
}, { _id: false });

// User Schema - stores both buyers and admin information
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  userId: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  storeInfo: {
    type: storeInfoSchema,
    required: function () {
      return this.role === 'user';
    }
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 10
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

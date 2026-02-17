import User from '../models/User.js';

export const DEFAULT_ADMIN = {
  name: 'Aadhavan Admin',
  email: 'aadhavan@gmail.com',
  password: 'aadhavan',
  role: 'admin'
};

export const ensureDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (!existingAdmin) {
      const created = await User.create(DEFAULT_ADMIN);
      console.log('👤 Default admin user created (aadhavan@gmail.com / aadhavan)');
      return created;
    }

    let needsSave = false;

    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      needsSave = true;
    }

    const passwordMatches = await existingAdmin.comparePassword(DEFAULT_ADMIN.password);
    if (!passwordMatches) {
      existingAdmin.password = DEFAULT_ADMIN.password; // pre-save hook will hash
      needsSave = true;
    }

    if (needsSave) {
      await existingAdmin.save();
      console.log('🔐 Default admin credentials refreshed');
    }
    console.log('ℹ️  Default admin account already present');
    return existingAdmin;
  } catch (error) {
    console.error('⚠️  Failed to ensure default admin user:', error.message);
    throw error;
  }
};

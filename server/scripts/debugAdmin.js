import mongoose from 'mongoose';
import User from '../models/User.js';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/erp_db';

const resolveUri = () => {
  const envUri = process.env.MONGODB_URI?.trim();
  if (!envUri) return LOCAL_URI;
  if (envUri.startsWith('mongodb://') || envUri.startsWith('mongodb+srv://')) {
    return envUri;
  }
  return LOCAL_URI;
};

const run = async () => {
  const uri = resolveUri();
  await mongoose.connect(uri);
  const admin = await User.findOne({ email: 'aadhavan@gmail.com' }).lean();
  console.log(admin);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

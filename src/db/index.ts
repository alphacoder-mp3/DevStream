import mongoose from 'mongoose';
import { DB_NAME } from '../constants';

const connectDB = async (): Promise<void> => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_URL}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected|| DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error('MongoDB connection FAILED:', error);
    process.exit(1);
  }
};

export default connectDB;
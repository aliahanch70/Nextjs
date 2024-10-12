// lib/mongodb.ts
import mongoose from 'mongoose';

const connectMongo = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose.connection.asPromise();
    }

    const connection = await mongoose.connect(
      'mongodb+srv://ali:ali1234@cluster0.wxekg4t.mongodb.net/ali?retryWrites=true&w=majority'
    );
    console.log('MongoDB connected');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

export default connectMongo;

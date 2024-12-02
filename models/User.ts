// models/User.ts
import { Schema, model, models } from 'mongoose';

// Define the User schema
const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
}, { collection: 'shop' }); // Specify the collection as 'shop'

const User = models.User || model('User', UserSchema);
export default User;

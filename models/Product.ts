// models/Product.ts
import { Schema, model, models } from 'mongoose';

// Define the Product schema
const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL'],
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
  },
  description: {
    type: String,
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
  },
  views: {
    type: Number,
    default: 0,
  },
  storageOptions: {
    type: [String],
    default: undefined,
  },
  sizesAvailable: {
    type: [String],
    default: undefined,
  },
  colorsAvailable: {
    type: [String],
    default: undefined,
  },
}, { collection: 'products' }); // Specify the collection as 'products'

const Product = models.Product || model('Product', ProductSchema);
export default Product;
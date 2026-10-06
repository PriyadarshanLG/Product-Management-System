import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Product } from '../models/product.model';

const sampleProducts = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    category: 'Electronics',
    price: 4999,
    stockQuantity: 25,
    description: 'High-fidelity Bluetooth wireless headphones with active noise cancellation and 30-hour battery life.',
  },
  {
    name: 'Smart Ultra HD 4K Monitor 27-inch',
    category: 'Electronics',
    price: 24999,
    stockQuantity: 4,
    description: 'Crisp IPS panel monitor with HDR10 support, 144Hz refresh rate, and USB-C connectivity.',
  },
  {
    name: 'Ergonomic Mesh Office Chair',
    category: 'Home',
    price: 8999,
    stockQuantity: 0,
    description: 'Breathable mesh chair with adjustable lumbar support, 3D armrests, and synchro-tilt mechanism.',
  },
  {
    name: 'Cotton Graphic Oversized T-Shirt',
    category: 'Clothing',
    price: 899,
    stockQuantity: 50,
    description: '100% combed cotton heavy-weight t-shirt with premium screen-printed street graphic.',
  },
  {
    name: 'Stainless Steel Insulated Water Bottle',
    category: 'Sports',
    price: 1299,
    stockQuantity: 8,
    description: 'Double-wall vacuum insulated 1-liter bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
  },
  {
    name: 'Clean Code: Handbook of Software Craftsman',
    category: 'Books',
    price: 1850,
    stockQuantity: 15,
    description: 'Essential programming classic by Robert C. Martin detailing best practices, refactoring, and code smell identification.',
  },
  {
    name: 'Mechanical Gaming Keyboard RGB',
    category: 'Electronics',
    price: 3499,
    stockQuantity: 0,
    description: 'Hot-swappable tactile mechanical switches with per-key RGB backlighting and durable PBT keycaps.',
  },
  {
    name: 'Non-Slip Eco-Friendly Yoga Mat',
    category: 'Sports',
    price: 1499,
    stockQuantity: 12,
    description: '6mm high-density TPE yoga mat with alignment lines for optimal cushioning and joint protection.',
  },
  {
    name: 'Smart WiFi LED Desk Lamp',
    category: 'Home',
    price: 2199,
    stockQuantity: 3,
    description: 'Dimmable desk lamp featuring color temperature adjustment, eye-care technology, and Google Assistant integration.',
  },
  {
    name: 'Designing Data-Intensive Applications',
    category: 'Books',
    price: 2200,
    stockQuantity: 20,
    description: 'Comprehensive guide by Martin Kleppmann on distributed systems, databases, data models, and scalability patterns.',
  },
];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gupio_products';
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB for seeding');

    await Product.deleteMany({});
    console.log('[Seed] Cleared existing products');

    const inserted = await Product.insertMany(sampleProducts);
    console.log(`[Seed] Successfully inserted ${inserted.length} sample products!`);

    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();

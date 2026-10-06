import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect to database
  await connectDatabase();

  // 2. Start Express HTTP Server
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` GUPIO PRODUCT MANAGEMENT BACKEND RUNNING`);
    console.log(` Port: http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(` Products API: http://localhost:${PORT}/api/products`);
    console.log(`==================================================`);
  });
};

startServer();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import productRoutes from './routes/product.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:4200';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Express JSON body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Gupio Product Management API',
  });
});

app.use('/api/products', productRoutes);

// Handle 404 routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;

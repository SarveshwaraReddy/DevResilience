import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import authRoutes from './routes/authRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/insights', insightRoutes);
app.use('/api/v1/stories', storyRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../../dist')));

  // Any route that is not API will be redirected to index.html
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
  });
} else {
  // Base route for development
  app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'DevResilience API is running (Development)' });
  });
}

export default app;

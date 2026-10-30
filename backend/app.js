import express from 'express';
import studentRoutes from './routes/studentRoutes.js';
import {
  errorHandler,
  jsonSyntaxErrorHandler,
  notFoundHandler,
} from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use(jsonSyntaxErrorHandler);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/students', studentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

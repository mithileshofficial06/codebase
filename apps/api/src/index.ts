import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze';
import chatRouter from './routes/chat';
import healthRouter from './routes/health';

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.PORT || 4000;

// CORS — allow frontend origins
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/analyze', analyzeRouter);
app.use('/chat', chatRouter);
app.use('/health', healthRouter);

// Root
app.get('/', (_req, res) => {
  res.json({ service: 'codemap-api', status: 'running' });
});

app.listen(PORT, () => {
  console.log(`🚀 CodeMap API running on http://localhost:${PORT}`);
});

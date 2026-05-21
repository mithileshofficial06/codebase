import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env FIRST before importing other modules (dev only)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

// Verify GitHub token is loaded
if (!process.env.GITHUB_TOKEN) {
  console.error('⚠️  WARNING: GITHUB_TOKEN not found in environment variables!');
  console.error('   Make sure .env file exists at project root with GITHUB_TOKEN set.');
} else {
  console.log('✓ GitHub token loaded successfully');
  console.log('  Token preview:', process.env.GITHUB_TOKEN.substring(0, 25) + '...');
}

import analyzeRouter from './routes/analyze';
import chatRouter from './routes/chat';
import healthRouter from './routes/health';

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

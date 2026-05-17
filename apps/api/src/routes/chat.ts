import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

const SYSTEM_PROMPT = `You are CodeMap AI, a code analysis assistant. You help developers understand their codebase structure, dependencies, and code health.

When discussing files, always format file paths in backticks like \`src/index.ts\`.
Be concise but thorough. Use bullet points for lists.
If you reference metrics, explain what they mean in practical terms.`;

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build context prompt
    let contextPrompt = '';
    if (context) {
      contextPrompt = `\n\nRepository context:
- Repo: ${context.owner}/${context.repo}
- Files: ${context.fileCount} files
- Health Score: ${context.healthScore}/100
- Top dependencies: ${context.topDependencies?.join(', ') || 'N/A'}
`;
    }

    const fullPrompt = `${SYSTEM_PROMPT}${contextPrompt}\n\nUser: ${message}`;

    // Stream response via SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: fullPrompt,
    });

    for await (const chunk of response) {
      const text = chunk.text || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Chat failed' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

export default router;

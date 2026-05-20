import { Router, Request, Response } from 'express';

const router = Router();

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

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

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'NVIDIA API key not configured' });
    }

    const modelName = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';

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

    const userMessage = `${contextPrompt}\n\nUser: ${message}`;

    // Stream response via SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 500,
        temperature: 0.4,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('NVIDIA NIM API error:', response.status, errorBody);
      throw new Error(`NVIDIA NIM API returned ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No stream from NVIDIA NIM');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
          }
        } catch {
          // Skip malformed JSON chunks
        }
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

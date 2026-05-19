import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ONBOARDING_PROMPT = `You are CodeMap, a codebase analysis tool. Given the following repository architecture data, generate a brief onboarding summary.

Format your response EXACTLY like this (use these exact headers):

**Project Type:** [one line description]

**Tech Stack:** [comma-separated technologies]

**Main Systems:**
• [System 1] — [1-sentence description]
• [System 2] — [1-sentence description]
• [System 3] — [1-sentence description]
(list 3-6 main systems)

**Start Exploring:**
1. [most important module/file to look at first]
2. [second most important]
3. [third most important]

Rules:
- Keep it concise — max 150 words total
- Use the actual module names from the data
- Be specific to THIS project, not generic`;

export async function POST(req: NextRequest) {
  try {
    const { clusters } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build compact context from clusters
    const context = clusters.map((c: any) =>
      `${c.humanLabel} (${c.fileCount} files, ${(c.totalSize / 1024).toFixed(1)}KB)${c.isEntryPoint ? ' [ENTRY POINT]' : ''}${c.hotspotCount > 0 ? ` [${c.hotspotCount} hotspots]` : ''}`
    ).join('\n');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${ONBOARDING_PROMPT}\n\nRepository modules:\n${context}` }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.2 },
    });

    const text = result.response.text();

    return new Response(
      JSON.stringify({ summary: text }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Onboarding API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate onboarding' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

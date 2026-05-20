import { NextRequest } from 'next/server';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

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

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.error('[Onboarding] NVIDIA_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'NVIDIA_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const modelName = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';

    // Build compact context from clusters
    const context = clusters.map((c: any) =>
      `${c.humanLabel} (${c.fileCount} files, ${(c.totalSize / 1024).toFixed(1)}KB)${c.isEntryPoint ? ' [ENTRY POINT]' : ''}${c.hotspotCount > 0 ? ` [${c.hotspotCount} hotspots]` : ''}`
    ).join('\n');

    console.log('[Onboarding] Calling NVIDIA NIM API...');

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: ONBOARDING_PROMPT },
          { role: 'user', content: `Repository modules:\n${context}` },
        ],
        max_tokens: 300,
        temperature: 0.2,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Onboarding] NVIDIA NIM API error:', response.status, errorBody);
      throw new Error(`NVIDIA NIM API returned ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || 'No summary generated.';
    console.log('[Onboarding] Success');

    return new Response(
      JSON.stringify({ summary: text }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Onboarding] Error:', error.message);
    console.error('[Onboarding] Stack:', error.stack);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate onboarding' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

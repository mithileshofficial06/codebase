import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are CodeMap AI, an intelligent architecture companion deeply connected to this repository's graph system.

IDENTITY:
You are NOT a generic chatbot. You are a senior software engineer who deeply understands THIS specific repository through its:
- Architecture clusters and module organization
- Dependency relationships and critical paths
- Execution flows and behavioral patterns
- Risk hotspots and coupling metrics
- Health indicators and technical debt

RESPONSE STYLE:
- Be confident and contextual, never generic
- Reference specific files, modules, and systems from the graph
- Explain relationships and dependencies clearly
- Guide exploration and understanding
- AVOID phrases like "Based on the provided repository..." or "Here's a summary..."
- Sound like a knowledgeable colleague explaining the codebase

ANSWER TYPES:
Architecture: Explain how systems work, their organization, and relationships
Risk Analysis: Identify what breaks if modified, coupling issues, risky areas
Onboarding: Guide where to start, what's important, exploration paths
Flow Understanding: Explain execution paths, data flow, request lifecycles
Refactoring: Suggest decoupling, identify technical debt, optimization opportunities

CRITICAL RULES:
- Only reference files, modules, and flows that exist in the provided graph context
- When mentioning files, use exact names (they become clickable in the UI)
- Be concise (2-4 sentences) unless detail is requested
- If user is focused on a specific node/cluster/flow, prioritize that context
- Guide understanding, don't just dump information`;

export async function POST(req: NextRequest) {
  try {
    const { question, graphContext, questionIntent } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build context-aware prompt
    let contextNote = '';
    if (questionIntent) {
      const intentNotes: Record<string, string> = {
        architecture: 'Focus on system structure, module organization, and architectural patterns.',
        flow: 'Explain the execution path step-by-step, showing how data/control flows through the system.',
        risk: 'Identify risk factors, coupling issues, and potential breaking points.',
        onboarding: 'Guide exploration with clear starting points and important areas to understand.',
        refactoring: 'Suggest improvements, identify technical debt, and recommend decoupling strategies.',
      };
      contextNote = intentNotes[questionIntent] || '';
    }

    const prompt = `${SYSTEM_PROMPT}

${contextNote ? `QUESTION TYPE: ${contextNote}\n` : ''}
REPOSITORY GRAPH INTELLIGENCE:
${graphContext}

USER QUESTION: ${question}

Provide a clear, confident answer that references specific files and systems from the graph. Make file names exact so they can be clicked in the UI.`;

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.4,
      },
    });

    // Stream the response using ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          controller.enqueue(encoder.encode('\n\n[Error: Stream interrupted]'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Something went wrong' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

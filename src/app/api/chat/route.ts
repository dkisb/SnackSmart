import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { loadMarkdownData } from '@/library/loadMarkdown';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages received.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastMessage = messages.pop();
    const userPrompt = (lastMessage?.content ?? '').trim();

    const mdData = await loadMarkdownData();

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: `
Always answer in hungarian.

You are a professional nutrition assistant.

Use the following nutrition data to answer all user questions precisely:

${mdData}

If the user asks about nutrient amounts, meal planning, or supplements,
always base your response on this data.
        `.trim(),
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system:
        'You are a professional nutrition assistant. Use the provided nutrition data to answer all user questions precisely. Always answer in hungarian.',
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

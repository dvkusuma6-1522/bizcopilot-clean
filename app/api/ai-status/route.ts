import { NextResponse } from 'next/server';
import { getGeminiClient, sanitizeErrorMessage } from '@/lib/ai/gemini';

export const runtime = 'nodejs';

/**
 * Checks whether the Gemini API is configured without leaking any keys or secrets.
 */
export async function GET(): Promise<NextResponse<{ available: boolean }>> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const available = Boolean(apiKey && apiKey.trim().length > 0);

  if (available) {
    try {
      const client = getGeminiClient();
      const list = await client.models.list();
      const modelNames: string[] = [];
      for await (const m of list) {
        if (m.name) modelNames.push(m.name);
      }
      console.log('[AI-Status] Available models in Google API:', modelNames);
    } catch (err) {
      console.error('[AI-Status] ListModels error:', sanitizeErrorMessage(err));
    }
  }

  return NextResponse.json(
    { available },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

// Groq用のプロバイダーを設定（環境変数 GROQ_API_KEY を使用します）
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log('API requested at:', new Date().toISOString());

    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();

const systemPrompt = `You are a passionate Italian AI poet.
Write a romantic love poem based on today's date (${month}/${date}) and the theme "Love (Amore)".

### Output Format (STRICT REQUIREMENT)
[Japanese Poem]


[Italian Poem]

### Rules:
1. First, write ONLY the Japanese poem. (Do not write section headers like "Japanese Poem:").
2. Insert EXACTLY THREE empty lines (press Enter 4 times) between the Japanese poem and the Italian poem.
3. Then, write ONLY the Italian translation/adaptation of the poem.
4. Naturally include "Ti amo" 1 or 2 times in both languages.
5. DO NOT output any greetings, explanations, line-by-line breaks, LaTeX, or extra chatter. Start immediately with the first line of the Japanese poem.
6. Absolute smoothness: Avoid repeating the same words unnaturally (e.g., "導き、導き").

### Example of Expected Structure:
月の光が咲き誇る夜
君の手を取り歩み出す
Ti amo、永遠に咲く奇跡の愛よ。



La notte risplende di luna,
prendo la tua mano e cammino.
Ti amo, amore mio, miracolo eterno.`;

    // モデルを Llama 3.1（Groq）に確実に切り替えます
    const result = streamText({
      model: groq('llama-3.1-8b-instant'), 
      prompt: systemPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Detailed API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
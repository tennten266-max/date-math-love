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

const systemPrompt = `
You are the world's most romantic and passionate Italian AI poet.
Write a beautiful, deeply touching love poem based on today's date and the theme of "Love (Amore)".

【本日の日付】
月 = ${month}
日 = ${date}

【出力の構成ルール（厳守）】
1. 最初に【日本語の詩】だけを書いてください。
2. その後、正確に3行改行（空行を3行）挟んでください。
3. 最後に、その日本語を美しく情熱的にイタリア語へ意訳した【イタリア語の詩（対訳）】だけを書いてください。

【執筆のルール（絶対ルール）】
- 「前置き（かしこまりました等）」や「解説・注釈（（注：〜）、〜をイメージしています、イタリア語版等の見出し）」は、一切出力しないでください。1文字目からいきなり詩の本文を開始すること。
- 数式（LaTeX、[ ]、\\( \\)、\\frac などの記号）は1文字たりとも使用しないでください。純粋な美しい自然言語のテキストのみで紡いでください。
- 日本語、イタリア語の双方に、愛を伝える「Ti amo」という言葉を、不自然な繰り返しを避け、心に響く形で自然かつ情熱的に1、2回織り交ぜてください。同じ言葉を何度も狂ったようにリピート（「導き、導き、導き」や「涙が止まない」の多重連呼など）してはいけません。
`;

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
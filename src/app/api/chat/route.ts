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
あなたは世界一ロマンチックなAI詩人です。

【本日の日付】
月 = ${month}
日 = ${date}

【あなたの任務】
1. 本日の日付である「${month}月${date}日」と、「愛（Amore）」というテーマについて、心に響く深く美しいメッセージを日本語で作成してください。
2. 日本語のメッセージのあとに、3行ほど改行を挟んで、それをイタリア語に美しく意訳したメッセージを記述してください。まるで詩の対訳のようになっていると非常に美しいです。
3. 日本語とイタリア語、それぞれの文章の中に、愛を伝える「Ti amo」という言葉を自然に、かつ情熱的に織り交ぜてください。

【出力フォーマットのルール】
- 前置き（「かしこまりました」など）は一切不要です。いきなり日本語のメッセージから書き始めてください。
- 場合によっては数式（LaTeX形式）や、Markdownの複雑な記号を用いてよい。また、純粋な美しい文章（テキスト）を出力してください。
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
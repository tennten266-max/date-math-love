'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [completion, setCompletion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasTriggered = useRef(false);

  useEffect(() => {
    // 開発環境での2回実行（React StrictMode）を防ぐためのガード
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    async function generateLoveMessage() {
      setIsLoading(true);
      setError(null);
      setCompletion('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // 空のオブジェクトを送信
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // レスポンスのストリームを読み込むためのリーダーを作成
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) {
          throw new Error('Stream reader を取得できませんでした。');
        }

        // ストリームからデータを順次読み込むループ
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 届いたバイナリデータをテキストにデコードして、ステートに追加
          const chunk = decoder.decode(value, { stream: true });
          setCompletion((prev) => prev + chunk);
        }
      } catch (err: any) {
        console.error('Streaming error:', err);
        setError(err.message || 'エラーが発生しました。');
      } finally {
        setIsLoading(false);
      }
    }

    generateLoveMessage();
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <main className="min-h-screen bg-rose-50 text-rose-950 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-rose-200/60 selection:text-rose-900">
      
      {/* ヘッダー */}
      <header className="max-w-3xl mx-auto w-full pt-4">
        <div className="flex items-center space-x-3 opacity-80">
          <span className="h-[1px] w-8 bg-rose-300"></span>
          <p className="text-xs tracking-[0.2em] uppercase text-rose-800 font-semibold">
            Amore e Tempo
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <article className="max-w-2xl mx-auto w-full my-auto py-12 flex flex-col space-y-8">
        
        {/* 日付表示 */}
        <header className="space-y-1">
          <time className="text-sm tracking-wide text-rose-700/80 block font-medium">
            {formattedDate}
          </time>
          <h1 className="text-2xl md:text-3xl font-serif tracking-wider text-rose-900 font-bold">
            今日という日と、愛の美しさ
          </h1>
        </header>

        {/* 生成テキスト表示エリア */}
        <div className="min-h-[350px] leading-relaxed font-normal text-rose-900 space-y-6 text-base md:text-lg whitespace-pre-wrap">
          {completion ? (
            <p className="transition-all duration-300">{completion}</p>
          ) : isLoading ? (
            <div className="flex flex-col items-start space-y-3 pt-12 animate-pulse">
              <p className="text-sm text-rose-700 tracking-widest font-medium">
                言葉を紡いでいます...
              </p>
              <div className="h-[2px] w-24 bg-rose-400"></div>
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 pt-12 font-medium">
              メッセージの取得に失敗しました。再読み込みをお試しください。
            </p>
          ) : (
            <div className="h-[1px] w-12 bg-rose-200 pt-12"></div>
          )}
        </div>

      </article>

      {/* フッター */}
      <footer className="max-w-3xl mx-auto w-full pb-4 text-center">
        <p className="text-xs tracking-[0.4em] text-rose-400 uppercase font-semibold">
          Ti amo per sempre
        </p>
      </footer>

    </main>
  );
}
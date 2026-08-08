'use client';

import { useEffect, useRef, useState } from 'react';

// 年・月・日から 1〜5 の数値を決定論的に（同じ日は常に同じ値）出力する関数
function getDailyFortune(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 年月日から一意なシード値を生成
  const seed = year * 10000 + month * 100 + day;
  
  // 簡易的な決定論的ハッシュ計算 (sin関数の小数点以下を利用)
  const x = Math.sin(seed) * 10000;
  const random0to1 = x - Math.floor(x);

  // 1〜5 の整数にマッピング
  const score = Math.floor(random0to1 * 5) + 1;

  // スコアに応じた運勢ラベル
  const fortuneLabels: Record<number, string> = {
    1: '穏やかな愛が芽生える日',
    2: 'ささやかな幸せを感じる日',
    3: '心がじんわり温まる日',
    4: '情熱と愛が深まる日',
    5: '最高の愛と奇跡に満ちた日',
  };

  return {
    score,
    label: fortuneLabels[score],
  };
}

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

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) {
          throw new Error('Stream reader を取得できませんでした。');
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

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

  // 本日の運勢（ハートの数 1〜5）を取得
  const fortune = getDailyFortune(today);

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
        
        {/* 日付と占いセクション */}
        <header className="space-y-4">
          <div className="space-y-1">
            <time className="text-sm tracking-wide text-rose-700/80 block font-medium">
              {formattedDate}
            </time>
            <h1 className="text-2xl md:text-3xl font-serif tracking-wider text-rose-900 font-bold">
              今日という日と、愛の美しさ
            </h1>
          </div>

          {/* ハート占い表示エリア */}
          <div className="bg-rose-100/60 border border-rose-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((index) => {
                const isFilled = index <= fortune.score;
                return (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className={`w-7 h-7 transition-colors duration-500 ${
                      isFilled
                        ? 'fill-rose-500 text-rose-500 drop-shadow-sm'
                        : 'fill-rose-200/50 text-rose-300'
                    }`}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                );
              })}
            </div>
            <p className="text-sm text-rose-900 font-medium tracking-wide">
              <span className="text-xs text-rose-600 block sm:inline sm:mr-2 font-bold">本日の愛運：</span>
              {fortune.label}
            </p>
          </div>
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
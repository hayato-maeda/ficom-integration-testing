import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * ウィンドウサイズを取得するカスタムフック
 * リサイズ時に自動的に更新される
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 初期値を設定
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // マウント時に実行
    handleResize();

    // リサイズイベントをリッスン
    window.addEventListener('resize', handleResize);

    // クリーンアップ
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

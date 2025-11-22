import { useState, useCallback, useEffect } from "react";

export interface ClickPoint {
  id: string;
  x: number; // パーセンテージ (0-100)
  y: number; // パーセンテージ (0-100)
  label: string;
  shortcutKey: string; // 例: "1", "2", "a", "b"
}

export function useClickPoints() {
  const [clickPoints, setClickPoints] = useState<ClickPoint[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // クリックポイントを追加
  const addClickPoint = useCallback((x: number, y: number) => {
    const newPoint: ClickPoint = {
      id: `point-${Date.now()}`,
      x,
      y,
      label: `Point ${clickPoints.length + 1}`,
      shortcutKey: String(clickPoints.length + 1),
    };
    setClickPoints((prev) => [...prev, newPoint]);
    return newPoint;
  }, [clickPoints.length]);

  // クリックポイントを削除
  const removeClickPoint = useCallback((id: string) => {
    setClickPoints((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // クリックポイントを更新
  const updateClickPoint = useCallback((id: string, updates: Partial<ClickPoint>) => {
    setClickPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  // すべてクリア
  const clearAllPoints = useCallback(() => {
    setClickPoints([]);
  }, []);

  // キーボードショートカットでクリック実行
  const executeClickByKey = useCallback((key: string) => {
    const point = clickPoints.find((p) => p.shortcutKey === key);
    if (point) {
      return point;
    }
    return null;
  }, [clickPoints]);

  // キーボードイベントリスナー
  useEffect(() => {
    if (isEditMode) return; // 編集モード中は無効

    const handleKeyPress = (e: KeyboardEvent) => {
      // 入力フォームでは無効化
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const point = executeClickByKey(e.key);
      if (point) {
        // カスタムイベントを発火
        window.dispatchEvent(
          new CustomEvent("clickpoint-triggered", {
            detail: { point },
          })
        );
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [isEditMode, executeClickByKey]);

  return {
    clickPoints,
    isEditMode,
    setIsEditMode,
    addClickPoint,
    removeClickPoint,
    updateClickPoint,
    clearAllPoints,
    executeClickByKey,
  };
}

import { useEffect, useRef, useState } from "react";

interface CursorPosition {
  x: number;
  y: number;
}

export default function OverlayCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cursor, setCursor] = useState<CursorPosition>({ x: 100, y: 100 });
  const [isVisible, setIsVisible] = useState(true);
  const [speed, setSpeed] = useState(10); // ピクセル単位の移動速度

  // カーソル描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // キャンバスサイズを画面サイズに合わせる
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isVisible) return;

    // カーソルを描画（円形）
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 0, 0, 1)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 十字線
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cursor.x - 15, cursor.y);
    ctx.lineTo(cursor.x + 15, cursor.y);
    ctx.moveTo(cursor.x, cursor.y - 15);
    ctx.lineTo(cursor.x, cursor.y + 15);
    ctx.stroke();

    // 座標表示
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(cursor.x + 25, cursor.y - 30, 120, 30);
    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.fillText(`x: ${cursor.x}, y: ${cursor.y}`, cursor.x + 30, cursor.y - 10);
  }, [cursor, isVisible]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フォームでは無効化
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      let moved = false;
      const newCursor = { ...cursor };

      // WASD または 方向キー
      if (e.key === "w" || e.key === "ArrowUp") {
        newCursor.y = Math.max(0, cursor.y - speed);
        moved = true;
      }
      if (e.key === "s" || e.key === "ArrowDown") {
        newCursor.y = Math.min(window.innerHeight, cursor.y + speed);
        moved = true;
      }
      if (e.key === "a" || e.key === "ArrowLeft") {
        newCursor.x = Math.max(0, cursor.x - speed);
        moved = true;
      }
      if (e.key === "d" || e.key === "ArrowRight") {
        newCursor.x = Math.min(window.innerWidth, cursor.x + speed);
        moved = true;
      }

      // スピード調整
      if (e.key === "+") {
        setSpeed((prev) => Math.min(50, prev + 5));
        moved = true;
      }
      if (e.key === "-") {
        setSpeed((prev) => Math.max(5, prev - 5));
        moved = true;
      }

      // 表示/非表示
      if (e.key === "h") {
        setIsVisible((prev) => !prev);
        moved = true;
      }

      // クリック（スペースキーまたはEnter）
      if (e.key === " " || e.key === "Enter") {
        console.log(`[Virtual Click] at (${cursor.x}, ${cursor.y})`);
        // ここでiPhoneへの送信処理を追加
        showClickAnimation();
        moved = true;
        e.preventDefault();
      }

      if (moved) {
        setCursor(newCursor);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cursor, speed]);

  // クリックアニメーション
  const showClickAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 一時的に緑色に変更
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 30, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 255, 0, 1)";
    ctx.lineWidth = 3;
    ctx.stroke();

    setTimeout(() => {
      setCursor({ ...cursor }); // 再描画
    }, 200);
  };

  // ウィンドウリサイズ対応
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        setCursor({ ...cursor }); // 再描画
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cursor]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          pointerEvents: "none",
        }}
      />

      {/* コントロール情報 */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "rgba(0, 0, 0, 0.8)",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: "8px",
          fontSize: "12px",
          fontFamily: "monospace",
          pointerEvents: "none",
          opacity: isVisible ? 1 : 0.3,
        }}
      >
        <div>WASD / 方向キー: 移動</div>
        <div>Space / Enter: クリック</div>
        <div>H: 表示/非表示</div>
        <div>+/- : 速度調整 (現在: {speed}px)</div>
        <div>Cmd+Shift+O: オーバーレイ切替</div>
      </div>
    </div>
  );
}

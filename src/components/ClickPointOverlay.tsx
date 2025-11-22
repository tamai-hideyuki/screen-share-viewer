import { useEffect, useRef } from "react";
import { ClickPoint } from "../hooks/useClickPoints";

interface ClickPointOverlayProps {
  clickPoints: ClickPoint[];
  isEditMode: boolean;
  onAddPoint?: (x: number, y: number) => void;
  onRemovePoint?: (id: string) => void;
  onUpdatePoint?: (id: string, updates: Partial<ClickPoint>) => void;
}

export default function ClickPointOverlay({
  clickPoints,
  isEditMode,
  onAddPoint,
  onRemovePoint,
  onUpdatePoint,
}: ClickPointOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // 画面上のクリックでポイント追加
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !onAddPoint) return;
    if (e.target !== overlayRef.current) return; // ポイント自体をクリックした場合は無視

    const rect = overlayRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddPoint(x, y);
  };

  // クリックポイントが実行されたときのアニメーション
  useEffect(() => {
    const handleClickPointTriggered = (e: CustomEvent) => {
      const point = e.detail.point as ClickPoint;
      const element = document.getElementById(`click-point-${point.id}`);
      if (element) {
        element.classList.add("triggered");
        setTimeout(() => {
          element.classList.remove("triggered");
        }, 300);
      }
    };

    window.addEventListener("clickpoint-triggered", handleClickPointTriggered as EventListener);
    return () => {
      window.removeEventListener("clickpoint-triggered", handleClickPointTriggered as EventListener);
    };
  }, []);

  return (
    <>
      <style>{`
        .click-point {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 0, 0, 0.3);
          border: 2px solid rgba(255, 0, 0, 0.8);
          transform: translate(-50%, -50%);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
          transition: all 0.2s ease;
          z-index: 100;
        }

        .click-point:hover {
          background: rgba(255, 0, 0, 0.5);
          border-color: rgba(255, 0, 0, 1);
          transform: translate(-50%, -50%) scale(1.1);
        }

        .click-point.triggered {
          animation: pulse 0.3s ease-out;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            background: rgba(0, 255, 0, 0.6);
            border-color: rgba(0, 255, 0, 1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            background: rgba(0, 255, 0, 0.8);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            background: rgba(255, 0, 0, 0.3);
            border-color: rgba(255, 0, 0, 0.8);
          }
        }

        .click-point-label {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          pointer-events: none;
        }

        .click-point-delete {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 0, 0, 0.9);
          color: white;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .click-point:hover .click-point-delete {
          opacity: 1;
        }
      `}</style>

      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: isEditMode ? "auto" : "none",
          zIndex: 50,
        }}
      >
        {clickPoints.map((point) => (
          <div
            key={point.id}
            id={`click-point-${point.id}`}
            className="click-point"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              pointerEvents: "auto",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEditMode) {
                // 編集モードでない場合はクリックイベントを発火
                window.dispatchEvent(
                  new CustomEvent("clickpoint-triggered", {
                    detail: { point },
                  })
                );
              }
            }}
          >
            {point.shortcutKey}
            <div className="click-point-label">{point.label}</div>
            {isEditMode && onRemovePoint && (
              <div
                className="click-point-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePoint(point.id);
                }}
              >
                ×
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

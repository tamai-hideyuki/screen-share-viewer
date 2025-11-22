import { useEffect } from "react";
import { useRemoteClick } from "../hooks/useRemoteClick";

export default function ElectronControlPanel() {
  // WebSocketクライアントを起動（受信専用）
  useRemoteClick();

  // electronAPIが利用可能かチェック
  useEffect(() => {
    console.log("[ElectronControlPanel] window.electronAPI:", window.electronAPI);
    console.log("[ElectronControlPanel] executeRemoteClick available:", !!window.electronAPI?.executeRemoteClick);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "40px",
        boxSizing: "border-box",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h1 style={{ margin: "0 0 20px 0", fontSize: "32px", fontWeight: "bold" }}>
          iPhone Mirror Controller
        </h1>

        <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "30px", opacity: 0.9 }}>
          QuickTimeの上に透明オーバーレイを表示し、<br />
          キーボードで操作可能な仮想カーソルを提供します。
        </p>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>
            📝 使い方
          </h2>

          <ol style={{ margin: 0, paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>QuickTime PlayerでiPhoneをミラーリング</li>
            <li><code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>Cmd+Shift+O</code> でオーバーレイを表示</li>
            <li>WASD/方向キーで仮想カーソルを操作</li>
          </ol>
        </div>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600" }}>
            ⌨️ キーボードショートカット
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>Cmd+Shift+O</code>
                </td>
                <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "right" }}>
                  オーバーレイ表示/非表示
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>W/A/S/D</code> または <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>方向キー</code>
                </td>
                <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "right" }}>
                  カーソル移動
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>Space</code> / <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>Enter</code>
                </td>
                <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "right" }}>
                  クリック
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>H</code>
                </td>
                <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "right" }}>
                  カーソル表示/非表示
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0" }}>
                  <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>+</code> / <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>-</code>
                </td>
                <td style={{ padding: "8px 0", textAlign: "right" }}>
                  移動速度調整
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: "30px",
            padding: "16px",
            background: "rgba(255, 200, 0, 0.2)",
            borderLeft: "4px solid #ffc107",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <strong>💡 ヒント:</strong> 画面共有プレビュー機能を使いたい場合は、Web版（ブラウザ）で <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 4px", borderRadius: "4px" }}>npm run dev</code> を実行してください。
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: "rgba(0, 200, 255, 0.2)",
            borderLeft: "4px solid #00bcd4",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <strong>🔗 リモートクリック機能:</strong> このアプリはWebSocketサーバー（ポート8080）を起動しています。ブラウザからリモートクリックを送信すると、このデバイスのマウスが自動的に操作されます。
        </div>
      </div>

      <div style={{ marginTop: "20px", opacity: 0.7, fontSize: "12px" }}>
        iPhone Mirror Controller v1.0.0
      </div>
    </div>
  );
}

# リモートクリック機能の使い方

## 概要
画面共有中のブラウザから共有先のデバイスをリモート操作できる機能です。
Electron + WebSocketを使用して、クリック座標を中継します。

## アーキテクチャ

```
[送信側ブラウザ]
    ↓ クリック
    ↓ WebSocket送信
[WebSocketサーバー] (Electron main.tsで起動)
    ↓ ブロードキャスト
[受信側Electron]
    ↓ IPC通信
[robotjs]
    ↓ マウス操作
[実際のデバイス]
```

## セットアップ手順

### 1. パッケージのインストール
```bash
npm install ws @types/ws robotjs
```

### 2. Electronアプリのビルド
```bash
npm run build:electron
```

### 3. アプリの起動

#### 受信側（操作される側）のデバイス
Electronアプリを起動します：
```bash
npm run electron
```
WebSocketサーバーが `ws://localhost:8080` で自動的に起動します。

#### 送信側（操作する側）のブラウザ
Web版を起動します：
```bash
npm run dev
```
ブラウザで http://localhost:5173 を開きます。

## 使用方法

### 送信側の操作
1. ブラウザで画面を開く
2. 「🔗 リモートクリック OFF」ボタンをクリックして **ON** に変更
3. 画面上をクリックすると、相対座標がWebSocket経由で送信される

### 受信側の動作
1. WebSocketサーバーがクリックイベントを受信
2. IPCを通じてElectron mainプロセスに通知
3. robotjsがマウスを移動してクリックを実行

## 主要ファイル

- `electron/websocket-server.ts` - WebSocketサーバー実装
- `electron/main.ts` - Electronメインプロセス（robotjs統合）
- `electron/preload.ts` - IPCブリッジ
- `src/hooks/useRemoteClick.ts` - WebSocketクライアントHook
- `src/components/IphoneMirrorSurface.tsx` - UI実装

## 座標システム

- ブラウザでクリックした座標を **相対座標（0-1の範囲）** に変換
- 受信側でスクリーンサイズに基づいて **絶対座標** に変換
- 画面解像度が異なるデバイス間でも正確に位置を再現

## トラブルシューティング

### WebSocketに接続できない
- 送信側と受信側が同じネットワークにいることを確認
- ファイアウォールでポート8080が開いていることを確認
- `ws://localhost:8080` ではなく、受信側のIPアドレスを使用する場合は `useRemoteClick` の引数を変更

### クリックが実行されない
- Electronアプリが起動していることを確認
- robotjsがシステムのアクセシビリティ権限を持っていることを確認（macOSの場合）
- コンソールログで `[Remote Click] Moving to (x, y)` が表示されているか確認

### macOSでアクセシビリティ権限が必要
macOSでは、robotjsがマウスを操作するために「アクセシビリティ」権限が必要です：
1. システム環境設定 > セキュリティとプライバシー > プライバシー > アクセシビリティ
2. Electronアプリを追加して許可

## カスタマイズ

### WebSocketサーバーのポートを変更
`electron/main.ts`:
```typescript
wsServer = new RemoteClickServer(8080); // ← ポート番号を変更
```

`src/hooks/useRemoteClick.ts`:
```typescript
export function useRemoteClick(serverUrl: string = "ws://localhost:8080") // ← デフォルトURLを変更
```

### 異なるネットワーク上のデバイスと接続
送信側のブラウザで：
```typescript
const { sendClickEvent } = useRemoteClick("ws://192.168.1.100:8080");
```
（192.168.1.100 は受信側のIPアドレス）

## セキュリティに関する注意

- この機能はローカルネットワーク内での使用を想定しています
- 本番環境で使用する場合は、認証機能の追加を推奨します
- WebSocketをWSSにアップグレードして暗号化を追加することも検討してください

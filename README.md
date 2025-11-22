# iPhone Mirror Controller

QuickTimeのiPhoneミラーリング画面の上に透明オーバーレイウィンドウを表示し、キーボードで操作可能な仮想カーソルを提供するElectronアプリケーションです。

Web版としても動作し、画面共有した映像を様々なアスペクト比やサイズでプレビューできます。

## 🎯 コンセプト

```
┌────────────────────────────┐
│   iPhone ミラー映像（QuickTime） │
│   └─（AirPlay/USB 経由）        │
│
│    ┌──────────────────────┐
│    │ 透明オーバーレイ（最前面） │
│    │  └─ Canvasで第2カーソル。│ ← WASDで動く
│    └──────────────────────┘
│
└──────────────┬─────────┘
                 │
                 ▼
        iPhone実機に操作送信
（SwitchControl か Bluetooth HID）
```

## 機能

### Electronアプリ版
- ✅ **透明オーバーレイウィンドウ**: QuickTimeの上に重ねて表示
- ✅ **仮想カーソル**: WASDキーまたは方向キーで自由に移動
- ✅ **クリック透過**: QuickTimeの操作を妨げない
- ✅ **グローバルショートカット**: どのアプリからでもオーバーレイを操作
- ⏳ **QuickTimeウィンドウ追従**: 自動でウィンドウ位置を検出（予定）
- ⏳ **iPhone実機操作**: SwitchControlまたはBluetooth HID経由（予定）

### Web版
- **画面共有**: ブラウザの `getDisplayMedia` API を使用
- **アスペクト比選択**: iPhone 16 Pro Max (9:19.5) をデフォルト設定
  - 9:19.5 (iPhone 16 Pro Max)
  - 9:16 (iPhone標準)
  - 16:9 (iPhone横)
  - 4:3 / 3:4 (iPad)
  - その他
- **クリックポイント**: 画面上の任意の位置にショートカットキーを設定
- **向き切り替え**: 縦向き・横向きの切り替え
- **サイズ調整**: 50%〜200%のスケール調整

## 📦 セットアップ

```bash
# 依存関係のインストール
npm install

# Web版開発サーバーの起動
npm run dev

# Electronアプリとして起動
npm run dev:electron

# ビルド
npm run build              # Web版
npm run build:electron     # Electronアプリ
```

## 🎮 使い方

### Electronアプリ版

#### 1. QuickTimeでiPhoneをミラーリング

1. iPhoneをMacにUSBケーブルで接続
2. QuickTime Playerを開く
3. メニューバー > ファイル > 新規ムービー収録
4. 録画ボタン横の▼から、iPhoneを選択

#### 2. オーバーレイを起動

```bash
npm run dev:electron
```

#### 3. オーバーレイの操作

| キー | 動作 |
|------|------|
| Cmd+Shift+O | オーバーレイ表示/非表示 |
| W / ↑ | カーソルを上に移動 |
| S / ↓ | カーソルを下に移動 |
| A / ← | カーソルを左に移動 |
| D / → | カーソルを右に移動 |
| Space / Enter | クリック |
| H | カーソル表示/非表示 |
| + / - | 移動速度調整 |

### Web版

1. `npm run dev` でサーバー起動
2. ブラウザで `http://localhost:5173/` を開く
3. 「📹 画面共有を開始」ボタンをクリック
4. 共有したい画面/ウィンドウ/タブを選択
5. アスペクト比、向き、サイズを調整

## 🔧 技術スタック

- **Electron** - デスクトップアプリケーション
- **React 18** - UI
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **Canvas API** - カーソル描画
- **Screen Capture API** - 画面共有 (Web版)

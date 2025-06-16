# PDF Watcher

PDFファイルの更新を監視するシステム

## 概要

PDF Watcherは、Webページ上のPDFファイルの追加・更新を自動的に検出し、履歴を管理するシステムです。

### 主な機能

- Chrome拡張機能によるページ情報とPDF URLの抽出
- バッチ処理による大量URLの並列処理
- 3世代の更新履歴管理
- 中央集約型のデータ管理

## システム構成

```
├── extension/        # Chrome拡張機能（esbuildビルドシステム採用）
├── client-gas/      # クライアント側Google Apps Script
├── server-gas/      # サーバー側Google Apps Script（ライブラリ）
├── master-gas/      # マスタースプレッドシート用Google Apps Script（clasp管理）
└── core/           # 共通インターフェース・モデル
```

### 技術スタック

- **Chrome拡張機能**: TypeScript, esbuild, Manifest V3
- **Google Apps Script**: TypeScript, clasp
- **ビルドツール**: npm workspaces, esbuild（拡張機能）, TypeScript compiler（GAS）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. ビルド

```bash
npm run build
```

### 3. Google Apps Scriptのデプロイ

#### マスタースプレッドシートの初期設定
1. `cd master-gas && clasp push`
2. GASエディタで`setupMasterSpreadsheet`関数を実行

#### サーバーライブラリ
1. `cd server-gas && npm run build && clasp push`
2. GASエディタでライブラリとして公開
3. デプロイIDを取得

#### クライアントスクリプト
1. `client-gas/src/config.ts`のSERVER_LIBRARY_IDを確認・更新
2. `cd client-gas && npm run build && clasp push`

### 4. Chrome拡張機能のインストール

#### 開発環境
1. `cd extension && npm install && npm run build`
2. Chromeの拡張機能管理ページ（chrome://extensions/）を開く
3. デベロッパーモードを有効化
4. 「パッケージ化されていない拡張機能を読み込む」で`extension`フォルダを選択

#### 本番環境
1. `cd extension && npm run build && npm run package`
2. `extension.zip`ファイルが生成される
3. Chrome Web Storeへの公開、または内部配布用に使用

## 使用方法

1. **データ収集**
   - 監視対象のWebページを開く
   - Chrome拡張機能のアイコンをクリック
   - 「Extract & Copy」ボタンをクリック

2. **データ貼り付け**
   - クライアントスプレッドシートを開く
   - Currentシートに貼り付け

3. **判定実行**
   - メニューから「PDF Watcher」→「Run Judge」を選択
   - 処理完了後、Changesシートで更新内容を確認

## 開発

開発に参加する際は、[CONTRIBUTING.md](./CONTRIBUTING.md)を必ず確認してください。
ブランチ戦略、コーディング規約、プルリクエストの作成方法などが記載されています。

### テスト実行

```bash
npm test
```

### Linting

```bash
npm run lint
```

## ライセンス

MIT
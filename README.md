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
├── extension/        # Chrome拡張機能
├── client-gas/      # クライアント側Google Apps Script
├── server-gas/      # サーバー側Google Apps Script（ライブラリ）
└── core/           # 共通インターフェース・モデル
```

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

#### サーバーライブラリ
1. `server-gas/.clasp.json`のscriptIdを設定
2. `cd server-gas && npm run deploy`
3. GASエディタでライブラリとして公開

#### クライアントスクリプト
1. `client-gas/.clasp.json`のscriptIdを設定
2. `client-gas/src/config.ts`の設定を更新
3. `cd client-gas && npm run deploy`

### 4. Chrome拡張機能のインストール

1. `cd extension && npm run package`
2. Chromeの拡張機能管理ページでデベロッパーモードを有効化
3. 「パッケージ化されていない拡張機能を読み込む」で`extension/dist`を選択

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
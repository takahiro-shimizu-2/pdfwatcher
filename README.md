# PDF Watcher 🎉

PDFファイルの更新を監視するシステム

**プロジェクトステータス**: 完成（2025/06/25 全機能実装・全テスト完了）

## 概要

PDF Watcherは、Webページ上のPDFファイルの追加・更新を自動的に検出し、履歴を管理するシステムです。

### 主な機能

- Chrome拡張機能によるページ情報とPDF URLの抽出
- バッチ処理による大量URLの並列処理（50URL/バッチ、最大10並列）
- 3世代の更新履歴管理
- 中央集約型のデータ管理
- 新規追加PDFのURL一覧表示（1行1URL形式でコピペ容易）
- 定期実行対応（GASトリガー設定可能）
- **ページハッシュ値による高速化**（2025/06/20実装）
  - ページ内容が変更されていない場合は差分検出をスキップ
  - 大量URL処理時のパフォーマンスを大幅改善
- **PDFステータス管理**（2025/06/21実装）
  - 削除されたPDFの追跡機能
  - 「ページ内に存在」/「ページから削除」ステータス
- **6分実行時間制限対策**（2025/06/22実装）
  - 大規模データの自動分割処理（30ページ/グループ、5ページ/ミニバッチ）
  - 自動中断・再開機構
  - 1000ページ（約50,000 PDF）の処理に成功

## システム構成

```
├── extension/        # Chrome拡張機能（esbuildビルドシステム採用）
├── client-gas/      # クライアント側Google Apps Script（c-プレフィックス）
├── server-gas/      # サーバー側Google Apps Script（s-プレフィックス、ライブラリ）
├── master-gas/      # マスタースプレッドシート用Google Apps Script（m-プレフィックス、clasp管理）
└── core/           # 共通インターフェース・モデル
```

### 技術スタック

- **Chrome拡張機能**: TypeScript, esbuild, Manifest V3
- **Google Apps Script**: TypeScript (ES5ターゲット), clasp
- **ビルドツール**: npm workspaces, esbuild（拡張機能）, TypeScript compiler（GAS）
- **コード構造**: GAS互換のグローバル変数形式（import/export不使用）

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
1. `cd client-gas && npm run build && clasp push`
2. サーバー側を更新した場合は、GASエディタでライブラリを「更新」

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
   - 処理完了後、以下のシートで結果を確認：
     - **Changesシート**: 新規追加されたPDFのURL一覧（1行1URL）
     - **UserLogシート**: 実行履歴（処理時間、追加PDF数など）
     - **Summaryシート**: 直近3回の実行結果サマリー

## パフォーマンス

- **処理速度**: 1.8-2秒/ページ
- **最大処理能力**: 150-180ページ/6分
- **テストカバレッジ**: 100%（200件のテスト項目完了）

## 開発

詳細な開発情報は[開発ガイド.md](./%E9%96%8B%E7%99%BA%E3%82%AC%E3%82%A4%E3%83%89.md)を参照してください。

### GASプロジェクトのコーディング規約

- **import/export文は使用不可**（GAS制約）
- ファイル名にプレフィックスを付ける：
  - クライアント: `c-`
  - サーバー: `s-`
  - マスター: `m-`
- TypeScriptはtarget: ES5でコンパイル

### 実装上の特徴

- **URLチェックなし**: Chrome拡張で取得したデータを信頼し、URLの有効性確認は行わない
- **認証ページ対応**: ユーザーがログイン済みのページでも動作可能
- **高速処理**: URLアクセスのオーバーヘッドがなく、差分計算に特化
- **ハッシュ値による最適化**: ページ内容のハッシュ値を比較し、変更がない場合は処理をスキップ
  - PageSummaryシートにLastHashフィールドを追加
  - 定期監視での無駄な処理を削減

## ドキュメント

- [要件定義書](./%E8%A6%81%E4%BB%B6%E5%AE%9A%E7%BE%A9%E6%9B%B8.md) - システム要件の詳細
- [開発ガイド](./%E9%96%8B%E7%99%BA%E3%82%AC%E3%82%A4%E3%83%89.md) - 開発セットアップと手順
- [pdfwatcher_design.md](./pdfwatcher_design.md) - システム設計書
- [docs/](./docs/) - 各種仕様書・テスト関連ドキュメント

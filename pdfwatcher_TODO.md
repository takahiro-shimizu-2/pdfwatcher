# PDF Watcher 開発TODOリスト

## 🔄 現在の状況（2025-06-17更新）

### 完了済みタスク
- ✅ プロジェクト基盤構築
- ✅ 全コード実装（core, server-gas, client-gas, extension）
- ✅ Google環境作成（スプレッドシート、GASプロジェクト）
- ✅ 初期設定スクリプト作成
- ✅ サーバーライブラリのデプロイ完了
- ✅ クライアントGASのデプロイ完了
- ✅ Chrome拡張機能のビルド完了

### 現在のタスク
- 🚀 **動作確認テスト実施中** ← 今ここ

---

## フェーズ1: 基盤構築（優先度：高）

### 1.1 プロジェクト初期設定
- [x] GitHubリポジトリ作成（pdf-watcher）
- [x] プロジェクト構造作成
  - [x] extension/
  - [x] client-gas/
  - [x] server-gas/
  - [x] core/
- [x] 各ディレクトリにpackage.json作成
- [x] TypeScript設定（tsconfig.json）
- [x] ESLint/Prettier設定
- [x] Jest設定
- [x] .gitignore作成

### 1.2 共通コア開発（core/）
- [x] インターフェース定義（/interfaces）
  - [x] IArchiveRepository
  - [x] IHistoryRepository
  - [x] ISummaryRepository
  - [x] IRunLogRepository
- [x] モデル定義（/models）
  - [x] Page
  - [x] PDF
  - [x] DiffResult
  - [x] BatchResult
  - [x] PageHistoryEntry
  - [x] RunLogEntry
- [x] 定数定義（constants.ts）
- [x] 型定義（types.ts）

## フェーズ2: サーバーライブラリ開発（優先度：高）

### 2.1 Infrastructure層
- [x] DocumentLock実装（/infrastructure/lock）
- [x] SheetArchiveRepo実装（/infrastructure/repositories）
  - [x] getPdfsByPage()
  - [x] upsertPdfs()
  - [x] getAllPdfs()
- [x] SheetHistoryRepo実装
  - [x] addPageHistory()
  - [x] getPageHistory()
- [x] SheetSummaryRepo実装
  - [x] updatePageSummary()
  - [x] getPageSummary()
- [x] SheetRunLogRepo実装
  - [x] addRunLog()
  - [x] getRunLogs()

### 2.2 Domain層
- [x] DiffService実装（/domain/services）
  - [x] calculateDiff()
  - [x] mergeDiffResults()
- [x] SummaryService実装
  - [x] updateSummary()
  - [x] rotateSummary()

### 2.3 DI設定
- [x] DIコンテナ実装（config.ts）
- [x] configure()関数実装
- [x] リポジトリファクトリ

### 2.4 ライブラリエントリポイント
- [x] index.ts作成
- [x] runBatch()実装
- [x] エラーハンドリング
- [x] ロギング機能

## フェーズ3: クライアントGAS開発（優先度：高）

### 3.1 基本機能
- [x] main.ts（runJudge()実装）
- [x] batch.ts（バッチ分割ロジック）
  - [x] splitIntoBatches()
  - [x] executeBatchesInParallel()
- [x] ui.ts（UI更新）
  - [x] updateChangesSheet()
  - [x] updateUserLog()
  - [x] clearCurrentSheet()

### 3.2 エラーハンドリング
- [x] タイムアウト処理
- [x] 部分成功の処理
- [x] ユーザー通知

### 3.3 スプレッドシート連携
- [x] ServerLib呼び出し設定
- [x] IMPORTRANGE設定（Summary）
- [x] シート操作ユーティリティ

## フェーズ4: Chrome拡張開発（優先度：中）

### 4.1 基本構造
- [x] manifest.json（V3対応）
- [x] background.ts（サービスワーカー）
- [x] content.ts（ページ解析）
- [x] popup.ts（UI）

### 4.2 機能実装
- [x] ページURL取得
- [x] ページHash計算
- [x] PDF URL抽出（リンク解析）
- [x] TSVフォーマット生成
- [x] クリップボードコピー

### 4.3 UI開発
- [x] popup.html作成
- [x] スタイル設定
- [x] アイコン作成

## フェーズ5: スプレッドシート作成（優先度：中）

### 5.1 中央ブック（PDF_Watcher_Master）
- [x] ArchivePDFシート作成
- [x] PageHistoryシート作成
- [x] PageSummaryシート作成
- [x] RunLogシート作成
- [x] アクセス権限設定

### 5.2 クライアントテンプレート（PDF_Watcher_Client_Template）
- [x] Currentシート作成
- [x] Changesシート作成
- [x] Summaryシート作成（IMPORTRANGE）
- [x] UserLogシート作成
- [x] runJudge()ボタン設置

## フェーズ6: テスト実装（優先度：中）

### 6.1 単体テスト
- [ ] Coreモジュールテスト
- [ ] DiffServiceテスト
- [ ] SummaryServiceテスト
- [ ] 各Repositoryテスト
- [ ] Chrome拡張テスト

### 6.2 結合テスト
- [ ] バッチ処理テスト
- [ ] 並列実行テスト
- [ ] ロック競合テスト
- [ ] エラー処理テスト

### 6.3 受入テスト
- [ ] T-01: PDF無変更テスト ← 次はここから
- [ ] T-02: 3PDF追加テスト
- [ ] T-03: 2人同時実行テスト
- [ ] T-04: ロック競合テスト
- [ ] T-05: DriveRepo切替テスト

## フェーズ7: CI/CD設定（優先度：低）

### 7.1 GitHub Actions
- [x] build.ymlワークフロー作成
- [x] TypeScriptビルド
- [x] テスト実行
- [x] Linting
- [x] clasp push設定

### 7.2 デプロイ設定
- [x] GAS認証設定（clasp login完了）
- [x] 環境変数設定（スプレッドシートID設定済み）
- [x] デプロイスクリプト（clasp push実行済み）

## フェーズ8: ドキュメント作成（優先度：低）

### 8.1 開発ドキュメント
- [x] README.md（プロジェクト概要）
- [ ] CONTRIBUTING.md（開発ガイド）
- [ ] API仕様書
- [ ] アーキテクチャ図

### 8.2 ユーザードキュメント
- [ ] インストールガイド
- [ ] 使用方法マニュアル
- [ ] トラブルシューティング
- [ ] FAQ

## フェーズ9: 性能最適化（優先度：低）

### 9.1 パフォーマンス測定
- [ ] 処理時間計測
- [ ] メモリ使用量監視
- [ ] ボトルネック特定

### 9.2 最適化実施
- [ ] バッチサイズ調整
- [ ] 並列数最適化
- [ ] キャッシュ実装
- [ ] インデックス追加

## フェーズ10: 将来拡張準備（優先度：低）

### 10.1 DriveArchiveRepo
- [ ] インターフェース実装
- [ ] JSON.gzip形式設計
- [ ] 3世代管理ロジック

### 10.2 Cloud Functions連携
- [ ] CloudRunner実装
- [ ] Scheduler設定
- [ ] 認証設定

### 10.3 BigQuery連携
- [ ] BigQueryHistoryRepo設計
- [ ] スキーマ定義
- [ ] データ移行ツール

### 10.4 通知機能
- [ ] INotificationインターフェース
- [ ] Slack通知実装
- [ ] メール通知実装

## 進捗管理

### 完了基準
- 各タスクは以下の基準で完了とする：
  1. コード実装完了
  2. 単体テスト作成・合格
  3. コードレビュー完了
  4. ドキュメント更新

### 優先度説明
- **高**: MVP（最小限の製品）に必要
- **中**: 本番運用に必要
- **低**: 改善・拡張機能

### 見積もり工数（1ファイル400行制限考慮）
- フェーズ1-3: 各ファイル2-3時間
- フェーズ4-5: 各機能1-2時間
- フェーズ6: テスト込みで各2時間
- フェーズ7-10: 各タスク1時間

合計見積もり: 約120-150時間
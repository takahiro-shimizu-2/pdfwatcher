# PDF Watcher 開発設計書

**最終更新**: 2025-06-30
**ステータス**: 完成（全機能実装・テスト完了・PDFリンク件名取得機能追加）

## 1. システムアーキテクチャ概要

### 1.1 システム構成
```
┌─────────────────────────────────────────────────┐
│                 Chrome Extension                 │
│              (TypeScript, Manifest V3)           │
└─────────────────────┬───────────────────────────┘
                      │ TSV形式でコピー
┌─────────────────────▼───────────────────────────┐
│              Client Spreadsheet                  │
│  ├─ Current Sheet (TSV貼り付け)                  │
│  ├─ Changes Sheet (差分表示)                     │
│  ├─ ChangesHistory Sheet (5日間履歴)             │
│  ├─ Summary Sheet (3世代履歴)                    │
│  └─ UserLog Sheet (個人ログ)                     │
└─────────────────────┬───────────────────────────┘
                      │ google.script.run
┌─────────────────────▼───────────────────────────┐
│               Client GAS                         │
│  └─ runJudge() エントリポイント                  │
└─────────────────────┬───────────────────────────┘
                      │ ServerLib.runBatch()
┌─────────────────────▼───────────────────────────┐
│         Server Library (Standalone GAS)          │
│  ├─ Domain Layer                                 │
│  │  ├─ DiffService                               │
│  │  └─ SummaryService                            │
│  └─ Infrastructure Layer (DI)                    │
│     ├─ SheetArchiveRepo                          │
│     ├─ SheetHistoryRepo                          │
│     └─ SheetRunLogRepo                           │
└─────────────────────┬───────────────────────────┘
                      │ DocumentLock制御
┌─────────────────────▼───────────────────────────┐
│           Master Spreadsheet (中央)              │
│  ├─ ArchivePDF (PDFマスタ + ステータス管理)        │
│  ├─ PageHistory (実行履歴)                       │
│  ├─ PageSummary (7世代サマリ + 最新ハッシュ)      │
│  └─ RunLog (実行ログ)                            │
└─────────────────────────────────────────────────┘
```

### 1.2 レイヤー設計

#### Presentation層
- Chrome拡張機能：ページ情報抽出とTSV生成
- Client GAS：UIロジックとサーバー呼び出し
- スプレッドシートUI：データ表示

#### Domain層
- DiffService：差分計算ロジック
- SummaryService：サマリー生成ロジック
- ドメインモデル：Page, PDF, DiffResult等

#### Infrastructure層
- Repository実装（Sheet/Drive/BigQuery）
- Lock制御
- エラーハンドリング

## 2. データモデル設計

### 2.1 ドメインモデル

```typescript
// Page情報
interface Page {
  url: string;
  hash: string;
  pdfs: PDF[];  // PDFリンク件名対応のため変更
}

// PDF情報
interface PDF {
  pageUrl: string;
  subject: string;           // リンク件名（2025-06-30追加）
  pdfUrl: string;
  firstSeen: Date;
  lastSeen: Date;
  status?: string;           // ステータス（「ページ内に存在」/「ページから削除」）
  deleteConfirmed?: Date;    // 削除確認日時
}

// 差分結果
interface DiffResult {
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedPdfUrls: string[];
  removedPdfUrls: string[];
  removedPdfs?: PDF[];      // 削除されたPDFの詳細情報（2025-06-30追加）
  addedCount: number;
  pageHash?: string;  // ページハッシュ値
}

// バッチ実行結果
interface BatchResult {
  execId: string;
  processedPages: number;
  updatedPages: number;
  addedPdfs: number;
  duration: number;
  errors: Error[];
  diffResults?: DiffResult[];  // 詳細情報を含む
}

// Changes履歴エントリ
interface ChangesHistoryEntry {
  savedAt: Date;           // 保存日時
  runId: string;           // 実行ID
  pageUrl: string;         // ページURL
  pdfUrl: string;          // PDFのURL
  expiresAt: Date;         // 削除予定日時
}
```

### 2.2 リポジトリインターフェース

```typescript
// アーカイブリポジトリ
interface IArchiveRepository {
  getPdfsByPage(pageUrl: string): Promise<PDF[]>;
  upsertPdfs(pdfs: PDF[]): Promise<void>;
  getAllPdfs(): Promise<PDF[]>;
}

// 履歴リポジトリ
interface IHistoryRepository {
  addPageHistory(entries: PageHistoryEntry[]): Promise<void>;
  getPageHistory(pageUrl: string, limit: number): Promise<PageHistoryEntry[]>;
}

// サマリーリポジトリ
interface ISummaryRepository {
  updatePageSummary(pageUrl: string, result: DiffResult): Promise<void>;
  getPageSummary(pageUrl: string): Promise<PageSummary | null>;
}

// 実行ログリポジトリ
interface IRunLogRepository {
  addRunLog(log: RunLogEntry): Promise<void>;
  getRunLogs(limit: number): Promise<RunLogEntry[]>;
}
```

## 3. 処理フロー詳細

### 3.1 メイン処理フロー

1. **データ入力**
   - ユーザーがChrome拡張でページを開く
   - 拡張機能がPage URL、Hash、PDF件名、PDF URLsを抽出
   - 複数行TSV形式でクリップボードにコピー（1PDF1行）

2. **バッチ処理起動**
   - CurrentシートにTSVを貼り付け
   - runJudge()ボタンクリック
   - 50件ずつバッチに分割
   - 並列実行（最大10バッチ同時）

3. **差分計算**（ロック外）
   - 前回のページハッシュと比較
   - ハッシュが同一の場合はスキップ（高速化）
   - 変更がある場合のみ：
     - 現在のPDFリストを取得
     - 新旧比較で追加・削除を検出
     - DiffResultを生成

4. **データ更新**（DocumentLock内）
   - ArchivePDF更新（80ms/URL）
   - PageSummary更新（7世代管理 + 最新ハッシュ保存）
   - PageHistory追記
   - RunLog追記

5. **結果反映**
   - Changesシート再生成（1行1URLの縦並び形式）
   - UserLog追記
   - Currentシートクリア

6. **処理完了時の履歴保存**（6分制限対策の完了時のみ）
   - 前回のChangesデータをChangesHistoryへ転写
   - 保存日時、実行ID、削除予定日時を付与
   - 5日経過したデータを自動削除

### 3.2 エラーハンドリング

- ロックタイムアウト：10秒待機、3回リトライ
- バッチエラー：部分成功を許可
- ネットワークエラー：指数バックオフでリトライ
- データ不整合：トランザクション的に処理

## 4. モジュール構成

### 4.1 Chrome拡張機能
```
extension/
├── manifest.json
├── src/
│   ├── background.ts
│   ├── content.ts
│   ├── popup.ts
│   └── utils/
│       ├── extractor.ts
│       └── formatter.ts
├── assets/
└── tests/
```

### 4.2 Client GAS
```
client-gas/
├── src/
│   ├── c-00-globals.ts    # グローバル型定義
│   ├── c-01-parser.ts     # データパース処理
│   ├── c-02-ui.ts         # UI更新ロジック
│   ├── c-03-batch.ts      # バッチ分割ロジック
│   ├── c-04-setup.ts      # 初期設定関数
│   ├── c-05-main.ts       # runJudge()エントリ
│   ├── c-09-types.ts      # ProcessingState型定義
│   ├── c-10-state-manager.ts   # 状態管理
│   ├── c-11-trigger-manager.ts # トリガー管理
│   ├── c-12-group-processor.ts # グループ処理
│   ├── c-13-history-manager.ts # 履歴管理
│   └── c-99-gas-entry.ts  # GASエントリポイント
├── clasp.json
├── tsconfig.json    # target: ES5, module: none
└── tests/
```

### 4.3 Server Library
```
server-gas/
├── src/
│   ├── s-00-globals.ts     # グローバル型定義
│   ├── s-01-config.ts      # DI設定
│   ├── s-02-index.ts       # ライブラリエントリ
│   ├── s-03-setup.ts       # 初期設定関数
│   ├── domain/
│   │   ├── services/
│   │   │   ├── s-DiffService.ts
│   │   │   └── s-SummaryService.ts
│   │   └── models/
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── s-SheetArchiveRepository.ts
│   │   │   ├── s-SheetHistoryRepository.ts
│   │   │   ├── s-SheetRunLogRepository.ts
│   │   │   └── s-SheetSummaryRepository.ts
│   │   ├── lock/
│   │   │   └── s-DocumentLock.ts
│   │   └── utils/
│   │       └── s-uuid.ts
│   └── interfaces/
├── clasp.json
├── tsconfig.json    # target: ES5, module: none
└── tests/
```

### 4.4 Master GAS
```
master-gas/
├── src/
│   ├── m-setup.js      # スプレッドシート初期設定
│   └── appsscript.json
└── clasp.json
```

### 4.5 共通コア
```
core/
├── src/
│   ├── interfaces/      # 共通インターフェース
│   ├── models/          # 共通モデル
│   └── constants.ts     # 定数定義
└── tests/
```

## 5. 性能設計

### 5.1 並列処理設計
- バッチサイズ：50 URL/バッチ
- 並列数：最大10バッチ同時実行
- タイムアウト：30秒/バッチ
- リトライ：3回（指数バックオフ）

### 5.2 ロック戦略
- DocumentLock使用（GAS標準）
- ロック粒度：ArchivePDF + PageSummary
- ロック時間：80ms/URL
- 待機時間：最大10秒
- AppendRowはロック不要

### 5.3 実装最適化
- BatchResultにdiffResultsフィールドを追加
- 1回のAPI呼び出しで詳細情報を取得
- URLの有効性チェックは行わない（認証ページ対応）
- **ページハッシュ値による高速化（2025-06-20実装）**
  - ページ内容が変更されていない場合は差分検出をスキップ
  - PageSummaryシートにLastHashフィールドを追加
  - DiffServiceで前回ハッシュと比較して早期リターン
- **6分実行時間制限対策（2025-06-22実装）**
  - 30ページごとのグループ分割
  - 5ページごとのミニバッチ処理
  - ProcessingStateによる状態管理
  - トリガーによる自動継続

### 5.4 メモリ管理
- 1ファイル400行制限
- 大量データは分割処理
- ストリーミング処理優先
- 不要オブジェクトの即時解放

## 6. セキュリティ設計

### 6.1 アクセス制御
- 中央シート：管理者のみ編集可
- クライアントシート：個人所有
- ライブラリ：読み取り専用公開

### 6.2 データ保護
- 個人情報非保持
- URLのみ記録
- ユーザーメールはログのみ

## 7. テスト戦略

### 7.1 単体テスト
- Jest使用
- カバレッジ目標：80%以上
- モック活用でGAS依存を排除

### 7.2 結合テスト
- 実際のスプレッドシートで検証
- 並列実行シナリオ
- エラー注入テスト

### 7.3 受入テスト
- 要件定義書のT-01〜T-05実施 ✅ 完了
- 性能目標の検証 ✅ 完了
- ユーザビリティ確認 ✅ 完了
- 6分制限対策テスト（TC-001〜TC-019） ✅ 完了

## 8. デプロイ戦略

### 8.1 CI/CD
- GitHub Actions使用
- mainブランチで自動デプロイ
- clasp pushでGASアップロード

### 8.2 バージョニング
- セマンティックバージョニング
- GASライブラリバージョン管理
- 後方互換性の維持

## 9. 拡張性考慮

### 9.1 リポジトリ切り替え
- DI（Dependency Injection）採用
- configure()で実装切り替え
- インターフェース準拠で追加可能

### 9.2 将来拡張
- Drive保存（JSON.gzip）
- BigQuery連携
- Cloud Functions実行
- 通知機能（Slack/Mail）

## 10. GAS互換性設計

### 10.1 コード構造
- **import/export文の不使用**
  - すべてのクラス・関数はグローバルスコープで定義
  - 型定義は専用のglobalsファイルに集約
- **ファイル命名規則**
  - プレフィックスで読み込み順序を制御
  - 数字で依存関係を明示（00が最初に読み込まれる）
- **TypeScript設定**
  - target: ES5（GAS実行環境に合わせる）
  - module: none（モジュールシステム無効化）

### 10.2 ライブラリ管理
- サーバー側はライブラリとして公開
- クライアント側はversion: "HEAD"で最新版を参照
- 更新時は手動でライブラリ更新が必要（キャッシュ対策）

## 11. 運用考慮事項

### 11.1 監視
- RunLogで実行状況把握
- エラー率の監視
- 性能劣化の検知

### 11.2 メンテナンス
- 定期的なアーカイブ
- 不要データの削除
- インデックス最適化

### 11.3 障害対応
- エラーログから原因特定
- 部分再実行可能な設計
- データ整合性の検証ツール

## 12. 実装結果とパフォーマンス

### 12.1 実装完了機能
- **基本機能** (2025-06-18)
  - Chrome拡張によるPDF抽出
  - バッチ処理による差分検出
  - 中央データベースへの記録

- **PDFステータス管理** (2025-06-21)
  - 削除されたPDFの状態追跡
  - 「ページ内に存在」/「ページから削除」ステータス

- **6分実行時間制限対策** (2025-06-22)
  - 30ページ/グループ、5ページ/ミニバッチ
  - 自動中断・再開機構
  - トリガーによる継続処理

- **Changes履歴保存機能** (2025-06-26)
  - 処理完了時の自動履歴転写
  - 5日間の履歴保持（古いデータ自動削除）
  - 日本語URLサポート
  - 実行IDによる一意性管理

- **PageSummary 7世代拡張** (2025-06-28)
  - 3世代から7世代への拡張
  - 自動世代シフト機能
  - より長期間の変更傾向把握

- **PDFリンク件名取得機能** (2025-06-30、2025-07-02改善)
  - Chrome拡張でリンクテキスト抽出
  - textContentプロパティで全テキスト取得（ネストされた要素も含む）
  - 文字数制限なし（100文字制限撤廃）
  - 複数行TSV形式（1PDF1行）
  - 全シートで件名表示

### 12.2 パフォーマンス実績
- **処理速度**: 1.8-2秒/ページ
- **最大処理能力**: 150-180ページ/6分
- **大規模テスト**: 1000ページ（約50,000 PDF）成功
- **テストカバレッジ**: 100%（210件のテスト項目）
- **履歴保存性能**: 10,000件を4.3秒で転写

### 12.3 既知の制限事項
- **エラー時のページスキップ**: TC-009で確認されたグループ内ページスキップ（発生率<1%）
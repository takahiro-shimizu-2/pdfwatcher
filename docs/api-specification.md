# PDF Watcher API仕様書

## 概要

PDF Watcherは、Webページ内のPDFリンクを監視・追跡するシステムです。本ドキュメントでは、システム内の各コンポーネント間のAPI仕様について説明します。

## アーキテクチャ概要

```
Chrome拡張機能 → クライアントGAS → サーバーGASライブラリ → マスタースプレッドシート
```

## 1. コアデータモデル

### 1.1 基本モデル

#### ChangesHistoryEntry
変更履歴エントリ
```typescript
interface ChangesHistoryEntry {
  savedAt: Date;     // 保存日時
  runId: string;     // 実行ID
  pageUrl: string;   // ページURL
  subject: string;   // 件名（2025-06-30追加）
  pdfUrl: string;    // PDFのURL
  expiresAt: Date;   // 削除予定日時
}
```

#### Page
ページ情報を表すモデル
```typescript
interface Page {
  url: string;        // ページURL
  hash: string;       // ページコンテンツのハッシュ値
  pdfs: PDF[];        // ページ内のPDF情報リスト（2025-06-30変更）
}
```

#### PDF
PDF追跡情報を表すモデル
```typescript
interface PDF {
  pageUrl: string;                              // ページURL
  subject: string;                              // 件名（2025-06-30追加）
  pdfUrl: string;                               // PDF URL
  firstSeen: Date;                              // 初回検出日時
  deletedAt: Date | null;                       // 削除確認日時
  status: 'ページ内に存在' | 'ページから削除';  // ステータス
}
```

#### DiffResult
差分計算結果を表すモデル
```typescript
interface DiffResult {
  pageUrl: string;       // ページURL
  pageUpdated: boolean;  // ページ更新フラグ
  pdfUpdated: boolean;   // PDF更新フラグ
  addedPdfUrls: string[]; // 追加されたPDF URLリスト
  removedPdfUrls: string[]; // 削除されたPDF URLリスト
  removedPdfs?: PDF[];   // 削除されたPDFの詳細情報（2025-06-30追加）
  addedCount: number;    // 追加されたPDF数
  pageHash?: string;     // ページハッシュ値
}
```

**注意**: `removedPdfs`フィールドは削除されたPDFの件名を保持するために追加されました。これにより、ArchivePDFシートで削除済みPDFの件名が表示され続けます。

#### BatchResult
バッチ実行結果を表すモデル
```typescript
interface BatchResult {
  execId: string;         // 実行ID
  processedPages: number; // 処理ページ数
  updatedPages: number;   // 更新ページ数
  addedPdfs: number;      // 追加PDF数
  duration: number;       // 処理時間（ミリ秒）
  errors: Error[];        // エラーリスト
  diffResults?: DiffResult[]; // 差分結果詳細
}
```

### 1.2 履歴・サマリモデル

#### PageHistoryEntry
ページ履歴エントリ
```typescript
interface PageHistoryEntry {
  pageUrl: string;        // ページURL
  checkedAt: Date;        // チェック日時
  pageHash: string;       // ページハッシュ値
  pdfCount: number;       // PDF数
  event: 'PDF_ADDED' | 'PDF_REMOVED' | 'NO_CHANGE'; // イベント種別
  details: string;        // 詳細情報
}
```

#### PageSummary
ページサマリ情報（２０２５年６月拡張：７世代履歴管理）
```typescript
interface RunSummary {
  date: string;         // 実行日時
  pageUpdated: boolean; // ページ更新フラグ
  pdfUpdated: boolean;  // PDF更新フラグ
  addedCount: number;   // 追加PDF数
}

interface PageSummary {
  pageUrl: string;      // ページURL
  lastHash?: string;    // 最終ハッシュ値
  run1?: RunSummary;    // 最新実行
  run2?: RunSummary;    // 1つ前の実行
  run3?: RunSummary;    // 2つ前の実行
  run4?: RunSummary;    // 3つ前の実行
  run5?: RunSummary;    // 4つ前の実行
  run6?: RunSummary;    // 5つ前の実行
  run7?: RunSummary;    // 6つ前の実行（最古）
}
```

**注意**: 8回目の実行で最古のデータ（run7）は自動的に削除され、新しいデータがrun1に入ります。

#### RunLogEntry
実行ログエントリ
```typescript
interface RunLogEntry {
  runId: string;          // 実行ID
  startTime: Date;        // 開始時刻
  endTime: Date;          // 終了時刻
  user: string;           // 実行ユーザー
  pagesProcessed: number; // 処理ページ数
  pagesUpdated: number;   // 更新ページ数
  pdfsAdded: number;      // 追加PDF数
  pdfsRemoved: number;    // 削除PDF数
  errors: number;         // エラー数
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR'; // ステータス
}
```

## 2. リポジトリインターフェース

### 2.1 IArchiveRepository
PDFアーカイブ管理インターフェース
```typescript
interface IArchiveRepository {
  // ページURLに関連するPDFを取得
  getPdfsByPage(pageUrl: string): Promise<PDF[]>;
  
  // PDFを更新または挿入
  upsertPdfs(pdfs: PDF[]): Promise<void>;
  
  // 全PDFを取得
  getAllPdfs(): Promise<PDF[]>;
}
```

### 2.2 IHistoryRepository
履歴管理インターフェース
```typescript
interface IHistoryRepository {
  // ページ履歴を追加
  addPageHistory(entries: PageHistoryEntry[]): Promise<void>;
  
  // ページ履歴を取得
  getPageHistory(pageUrl: string, limit: number): Promise<PageHistoryEntry[]>;
}
```

### 2.3 ISummaryRepository
サマリ管理インターフェース
```typescript
interface ISummaryRepository {
  // ページサマリを更新
  updatePageSummary(pageUrl: string, result: DiffResult): Promise<void>;
  
  // ページサマリを取得
  getPageSummary(pageUrl: string): Promise<PageSummary | null>;
}
```

### 2.4 IRunLogRepository
実行ログ管理インターフェース
```typescript
interface IRunLogRepository {
  // 実行ログを追加
  addRunLog(log: RunLogEntry): Promise<void>;
  
  // 実行ログを取得
  getRunLogs(limit: number): Promise<RunLogEntry[]>;
}
```

## 3. サーバーAPI（server-gas）

### 3.1 メインAPI

#### ServerLibrary
サーバーライブラリのメインインターフェース
```typescript
interface ServerLibrary {
  // バッチ処理を実行
  runBatch(options: RunBatchOptions): Promise<BatchResult>;
  
  // 設定を初期化
  configure(configType: string, masterSpreadsheetId: string): void;
}
```

#### RunBatchOptions
バッチ実行オプション
```typescript
interface RunBatchOptions {
  pages: Page[];              // 処理対象ページリスト
  user: string;               // 実行ユーザー
  masterSpreadsheetId: string; // マスタースプレッドシートID
  execId?: string;            // 実行ID（リトライ時に同一IDを使用）
  isRetry?: boolean;          // リトライフラグ
}
```

### 3.2 サービスクラス

#### DiffService
差分計算サービス
```typescript
class DiffService {
  // ページの差分を計算
  async calculateDiff(
    currentPage: Page,
    archivedPdfs: PDF[],
    summaryRepo: ISummaryRepository
  ): Promise<DiffResult>;
  
  // 差分結果をマージ
  mergeDiffResults(results: DiffResult[]): DiffResult;
}
```

#### SummaryService
サマリ更新サービス
```typescript
class SummaryService {
  // バッチサマリを更新
  async updateSummary(
    batchResult: BatchResult,
    summaryRepo: ISummaryRepository
  ): Promise<void>;
}
```

#### DocumentLock
ドキュメントロック管理
```typescript
class DocumentLock {
  // ロックを取得
  acquire(lockKey: string, timeout?: number): boolean;
  
  // ロックを解放
  release(lockKey: string): void;
  
  // ロック付きで処理を実行
  withLock<T>(
    lockKey: string,
    callback: () => T,
    timeout?: number
  ): T;
}
```

## 4. クライアントAPI（client-gas）

### 4.1 メインエントリポイント

```typescript
// PDF判定処理を実行
async function runJudge(): Promise<void>;
```

### 4.2 状態管理

#### ProcessingState
処理状態を表すインターフェース
```typescript
interface ProcessingState {
  version: string;              // バージョン
  status: ProcessingStatus;     // ステータス
  startTime: number;           // 開始時刻
  lastUpdateTime: number;      // 最終更新時刻
  currentGroupIndex: number;   // 現在のグループインデックス
  totalGroups: number;         // 総グループ数
  processedPages: number;      // 処理済ページ数
  totalPages: number;          // 総ページ数
  triggerId?: string;          // トリガーID
  user: string;                // ユーザー
  errorCount: number;          // エラー数
  lastError?: string;          // 最終エラー
  sessionId: string;           // セッションID
  execId?: string;             // 実行ID
  completedMiniBatches?: {     // 完了済ミニバッチ
    [groupIndex: number]: number[];
  };
}
```

#### ProcessingStatus
処理ステータス
```typescript
type ProcessingStatus = 
  | 'idle'       // アイドル
  | 'processing' // 処理中
  | 'paused'     // 一時停止
  | 'completed'  // 完了
  | 'error'      // エラー
  | 'cancelled'; // キャンセル
```

### 4.3 マネージャークラス

#### StateManager
状態管理マネージャー
```typescript
class StateManager {
  // 状態を読み込み
  loadState(): ProcessingState | null;
  
  // 状態を保存
  saveState(state: ProcessingState): void;
  
  // 状態をクリア
  clearState(): void;
  
  // 状態を初期化
  initializeState(totalPages: number, user: string): ProcessingState;
}
```

#### TriggerManager
トリガー管理マネージャー
```typescript
class TriggerManager {
  // 継続トリガーを作成
  createContinuationTrigger(delayMinutes: number): string | null;
  
  // 既存トリガーを削除
  deleteExistingTriggers(): void;
}
```

#### GroupProcessor
グループ処理マネージャー
```typescript
class GroupProcessor {
  // ページをグループに分割
  splitIntoGroups(pages: Page[], pagesPerGroup: number): Page[][];
  
  // グループを処理
  async processGroup(
    group: Page[],
    groupIndex: number,
    state: ProcessingState,
    stateManager: StateManager
  ): Promise<ProcessGroupResult>;
}
```

#### HistoryManager
履歴管理マネージャー
```typescript
class HistoryManager {
  // 変更履歴を転写
  transferChangesToHistory(): void;
  
  // 期限切れ履歴を削除
  deleteExpiredHistory(): void;
  
  // 履歴管理を実行
  executeHistoryManagement(): void;
}
```

## 5. Chrome拡張機能API（extension）

### 5.1 メッセージング

#### Message
メッセージインターフェース
```typescript
interface Message {
  action: 'extractPageInfo' | 'copyToClipboard';
  data?: string;
}
```

#### PageInfo
ページ情報
```typescript
interface PageInfo {
  url: string;        // ページURL
  hash: string;       // ハッシュ値
  pdfLinks: PdfLink[]; // PDFリンク情報リスト（2025-06-30変更）
}

interface PdfLink {
  url: string;        // PDF URL
  subject: string;    // リンク件名（2025-06-30追加）
}
```

#### ExtractResult
抽出結果
```typescript
interface ExtractResult {
  success: boolean;    // 成功フラグ
  pageInfo?: PageInfo; // ページ情報
  error?: string;      // エラーメッセージ
}
```

### 5.2 ユーティリティ関数

#### PDFExtractor
PDF URL抽出ユーティリティ
```typescript
class PDFExtractor {
  // ページからPDFリンク情報を抽出（2025-06-30変更）
  extractPdfUrls(): PdfLink[];
  
  // リンク件名を抽出（2025-06-30追加）
  extractLinkSubject(element: HTMLElement): string;
  
  // URLを正規化
  normalizeUrl(url: string, baseUrl: string): string;
  
  // PDFリンクかどうか判定
  isPdfLink(url: string): boolean;
}
```

#### Formatter
フォーマットユーティリティ
```typescript
class Formatter {
  // TSV形式にフォーマット（2025-06-30変更）
  formatAsTsv(pageInfo: PageInfo): string;
  
  // ページ情報を解析（2025-06-30変更）
  parsePageInfo(tsvData: string): PageInfo;
  
  // タブと改行をエスケープ（2025-06-30追加）
  escapeForTsv(text: string): string;
}
```

## 6. 定数定義

```typescript
const CONSTANTS = {
  // バッチ処理設定
  BATCH_SIZE: 50,                          // バッチサイズ
  MAX_EXECUTION_TIME_MS: 5 * 60 * 1000,    // 最大実行時間（5分）
  PAGES_PER_GROUP: 30,                     // グループあたりページ数
  PAGES_PER_MINI_BATCH: 5,                 // ミニバッチあたりページ数
  
  // トリガー設定
  TRIGGER_DELAY_MS: 7 * 60 * 1000,         // トリガー遅延（7分）
  
  // 状態管理
  STATE_EXPIRY_MS: 24 * 60 * 60 * 1000,    // 状態有効期限（24時間）
  
  // スプレッドシート
  SHEET_NAMES: {
    ARCHIVE_PDF: 'ArchivePDF',
    PAGE_HISTORY: 'PageHistory',
    PAGE_SUMMARY: 'PageSummary',
    RUN_LOG: 'RunLog',
    CURRENT: 'Current',
    CHANGES: 'Changes',
    CHANGES_HISTORY: 'ChangesHistory',
    SUMMARY: 'Summary',
    USER_LOG: 'UserLog'
  },
  
  // 履歴保存設定
  HISTORY_RETENTION_DAYS: 5,               // 履歴保持日数
  
  // ロック設定
  LOCK_TIMEOUT_MS: 10000,                  // ロックタイムアウト（10秒）
  LOCK_RETRY_MS: 100                       // ロックリトライ間隔
};
```

## 7. エラーハンドリング

### 7.1 エラー型

```typescript
// 基本エラー型
class PDFWatcherError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// ロックエラー
class LockError extends PDFWatcherError {
  constructor(message: string) {
    super(message, 'LOCK_ERROR');
  }
}

// タイムアウトエラー
class TimeoutError extends PDFWatcherError {
  constructor(message: string) {
    super(message, 'TIMEOUT_ERROR');
  }
}
```

### 7.2 エラーハンドリングパターン

```typescript
// Result型パターン
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 使用例
async function safeOperation<T>(
  operation: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

## 8. API利用パターン

### 8.1 Chrome拡張機能フロー

1. コンテンツスクリプトがページ情報を抽出
2. ポップアップがTSV形式にフォーマット
3. クリップボードにコピー
4. ユーザーがスプレッドシートに貼り付け

### 8.2 クライアント・サーバー通信フロー

1. クライアントが`runJudge()`を実行
2. ページ情報を収集してバッチに分割
3. `ServerLib.runBatch()`を呼び出し
4. サーバーが差分計算と更新処理を実行
5. 結果をクライアントに返却
6. クライアントがUIを更新

### 8.3 6分制限対策フロー

1. 処理開始時に状態を初期化
2. ページをグループに分割（30ページ/グループ）
3. 各グループをミニバッチで処理（5ページ/バッチ）
4. 5分経過で処理を中断、状態を保存
5. 7分後にトリガーで処理を再開
6. すべてのグループ処理完了まで繰り返し

## 9. セキュリティ考慮事項

### 9.1 認証・認可

- Google Apps Scriptの組み込み認証を使用
- スプレッドシートのアクセス権限で制御
- ユーザー情報は`Session.getActiveUser().getEmail()`で取得

### 9.2 データ保護

- センシティブ情報（PDF URL等）はスプレッドシート内に保存
- Chrome拡張機能は最小限の権限で動作
- 本番用manifestでは不要な権限を削除

### 9.3 並行制御

- DocumentLockによる排他制御
- トランザクション的な更新処理
- 楽観的ロックによる競合回避

## 10. パフォーマンス最適化

### 10.1 ハッシュ値による高速化

- ページ内容が変更されていない場合は処理をスキップ
- ハッシュ値の比較で早期リターン

### 10.2 バッチ処理

- 複数ページを一括処理
- 並列実行による高速化
- 適切なバッチサイズの設定

### 10.3 キャッシュ戦略

- 頻繁にアクセスされるデータのメモリキャッシュ
- スプレッドシートAPIコールの最小化

## 11. 拡張ポイント

### 11.1 ストレージバックエンド

リポジトリインターフェースにより、以下への拡張が可能：
- Google Drive (JSON/GZIP形式)
- BigQuery
- Cloud Firestore

### 11.2 通知機能

INotificationインターフェースの実装により：
- Slack通知
- メール通知
- Webhook通知

### 11.3 スケジューリング

- Cloud Schedulerとの連携
- 定期実行の自動化
- レポート生成

## 12. 使用例

### 12.1 基本的な使用例

```typescript
// サーバー側：バッチ処理の実行（2025-06-30変更）
const result = await ServerLib.runBatch({
  pages: [
    {
      url: 'https://example.com/page1',
      hash: 'abc123',
      pdfs: [
        {
          pageUrl: 'https://example.com/page1',
          subject: '重要なお知らせ',
          pdfUrl: 'https://example.com/doc1.pdf',
          firstSeen: new Date(),
          lastSeen: new Date()
        }
      ]
    }
  ],
  user: 'user@example.com',
  masterSpreadsheetId: 'spreadsheet-id'
});

// クライアント側：処理結果の確認
if (result.errors.length === 0) {
  console.log(`成功: ${result.processedPages}ページ処理完了`);
} else {
  console.error(`エラー: ${result.errors.length}件`);
}
```

### 12.2 エラーハンドリングの例

```typescript
try {
  await runJudge();
} catch (error) {
  if (error instanceof TimeoutError) {
    // タイムアウト時の処理
    console.log('処理がタイムアウトしました。自動的に再開されます。');
  } else {
    // その他のエラー
    console.error('予期しないエラー:', error);
  }
}
```

## 更新履歴

- 2025-06-30: PDFリンク件名取得機能を追加
  - PdfLinkインターフェースに`subject`フィールド追加
  - PageInfoを`pdfUrls`から`pdfLinks`へ変更
  - PDF、ChangesHistoryEntryに`subject`フィールド追加
  - PDFExtractorに`extractLinkSubject`メソッド追加
  - Formatterに`escapeForTsv`メソッド追加
- 2025-06-28: PageSummaryを7世代履歴管理に拡張
- 2025-06-25: 初版作成
- 2025-06-22: 6分実行時間制限対策を追加
- 2025-06-21: PDFステータスフィールドを追加
- 2025-06-20: ハッシュ値による高速化を追加
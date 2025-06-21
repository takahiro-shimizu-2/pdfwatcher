# GAS 6分実行時間制限対策 開発仕様書

## 1. 概要

### 1.1 背景
PDFWatcherシステムは、Google Apps Script（GAS）上で動作するため、6分間の実行時間制限があります。
現在の処理速度では、1ページあたり約10秒かかるため、36ページ以上の処理で制限に達する可能性があります。

### 1.2 目的
- 大量のページ（100ページ以上）を安定して処理できるようにする
- 6分制限で強制終了されてもデータの整合性を保つ
- 処理が自動的に継続され、最終的に全ページが処理される仕組みを実装する

### 1.3 対応方針
- 処理を30ページごとのグループに分割
- 処理開始時に次回実行トリガーを先行設定
- 処理状態をPropertiesServiceで管理
- 5分経過で自動的に処理を中断し、次回実行で継続

## 2. 機能要件

### 2.1 処理分割機能
- Currentシートのデータを30ページごとのグループに分割
- 各グループを順次処理
- 処理済みグループの管理

### 2.2 トリガー管理機能
- 処理開始時に5分後の実行トリガーを設定
- 正常完了時はトリガーを削除
- 異常終了時はトリガーが残り、自動継続

### 2.3 状態管理機能
- 処理状態をPropertiesServiceに保存
- 以下の情報を管理：
  - 現在のグループインデックス
  - 総グループ数
  - 処理済みページ数
  - 最終更新時刻
  - トリガーID
  - 処理ステータス

### 2.4 進捗表示機能
- ~~カスタムメニューから処理状況を確認~~（実装見送り）
- 処理開始/中断/再開/完了の通知（toast通知で実装）
- ~~残り処理時間の表示~~（実装見送り）

## 3. 技術仕様

### 3.1 定数定義の追加
```typescript
// core/src/constants.ts
export const CONSTANTS = {
  // 既存の定数...
  
  // 6分制限対策用の定数
  MAX_EXECUTION_TIME_MS: 5 * 60 * 1000,      // 5分（安全マージン1分）
  PAGES_PER_GROUP: 30,                       // 1グループあたりのページ数
  TRIGGER_DELAY_MS: 5 * 60 * 1000,          // トリガー実行までの遅延（5分）
  STATE_EXPIRY_MS: 24 * 60 * 60 * 1000,     // 状態の有効期限（24時間）
};
```

### 3.2 処理状態の型定義
```typescript
// client-gas/src/c-09-types.ts（新規ファイル）
interface ProcessingState {
  version: string;                    // 状態管理のバージョン
  status: ProcessingStatus;           // 処理ステータス
  startTime: number;                  // 処理開始時刻
  lastUpdateTime: number;             // 最終更新時刻
  currentGroupIndex: number;          // 現在処理中のグループインデックス
  totalGroups: number;                // 総グループ数
  processedPages: number;             // 処理済みページ数
  totalPages: number;                 // 総ページ数
  triggerId?: string;                 // 設定されたトリガーのID
  user: string;                       // 実行ユーザー
  errorCount: number;                 // エラー発生回数
  lastError?: string;                 // 最後のエラーメッセージ
}

type ProcessingStatus = 
  | 'idle'              // 待機中
  | 'processing'        // 処理中
  | 'paused'           // 一時停止（次回実行待ち）
  | 'completed'        // 完了
  | 'error'            // エラー
  | 'cancelled';       // キャンセル

interface PageGroup {
  groupIndex: number;
  pages: Page[];
  startIndex: number;
  endIndex: number;
}
```

### 3.3 状態管理モジュール
```typescript
// client-gas/src/c-10-state-manager.ts（新規ファイル）
class StateManager {
  private static readonly STATE_KEY = 'PDF_WATCHER_PROCESSING_STATE';
  private static readonly VERSION = '1.0.0';
  
  static saveState(state: ProcessingState): void;
  static loadState(): ProcessingState | null;
  static clearState(): void;
  static isStateValid(state: ProcessingState): boolean;
  static updateProgress(processedCount: number): void;
}
```

### 3.4 トリガー管理モジュール
```typescript
// client-gas/src/c-11-trigger-manager.ts（新規ファイル）
class TriggerManager {
  static scheduleNextExecution(delayMinutes: number): string;
  static cancelTrigger(triggerId: string): void;
  static cleanupDuplicateTriggers(): void;
  static getActiveTriggers(): GoogleAppsScript.Script.Trigger[];
}
```

### 3.5 グループ処理モジュール
```typescript
// client-gas/src/c-12-group-processor.ts（新規ファイル）
class GroupProcessor {
  static splitIntoGroups(pages: Page[], groupSize: number): PageGroup[];
  static processGroup(group: PageGroup, serverLib: ServerLibrary): Promise<BatchResult>;
  static canProcessMoreGroups(startTime: number): boolean;
}
```

### 3.6 メイン処理の改修
```typescript
// client-gas/src/c-05-main.ts（既存ファイルの改修）
async function runJudge(): Promise<void>;
async function runJudgeContinuation(): Promise<void>;
function initializeProcessing(pages: Page[]): void;
function processNextGroup(): Promise<boolean>;
```

### 3.7 UIの拡張（実装見送り）
カスタムメニューは不要と判断し、既存の「判定を実行」メニューのみを使用。
処理状況は画面右下のtoast通知で表示するため、追加UIは実装しない。

```typescript
// 以下の関数は実装せず
// function showProcessingStatus(): void;
// function cancelProcessing(): void;
// function showHelp(): void;
```

## 4. 実装の流れ

### 4.1 初回実行時（新規処理開始）
1. 処理状態を確認（前回の処理が完了していることを確認）
2. Changesシートをクリア（新規処理のため）
3. Currentシートからデータを読み込み
4. 30ページごとのグループに分割
5. 処理状態を初期化して保存
6. 5分後の実行トリガーを設定
7. 最初のグループの処理を開始
8. 5分経過前に処理を中断し、状態を保存

### 4.2 継続実行時（6分制限による分割実行）
1. 保存された処理状態を読み込み
2. Changesシートはクリアしない（追記のみ）
3. 次のグループから処理を再開
4. 5分後の実行トリガーを再設定
5. 処理を継続
6. 全グループ完了時はトリガーを削除

### 4.3 エラー処理
1. エラー発生時は状態を保存
2. エラー回数をカウント
3. 3回連続エラーの場合は処理を停止
4. トリガーは残し、手動介入を待つ

## 5. データフロー

### 5.1 状態遷移
```
idle → processing → paused → processing → ... → completed
         ↓           ↓           ↓
        error      error       error → cancelled
```

### 5.2 データ保存先
- 処理状態：PropertiesService（Script Properties）
- グループ情報：メモリ内（処理状態から再構築可能）
- 処理結果：既存のシート（Changes、UserLog等）

### 5.3 重要：シートデータの追記仕様
**分割実行時のシート更新は必ず「追記」で行う**

#### 実行パターンと動作
1. **新規処理開始時**（前回処理が完了済み、新しいCurrentデータ）
   - Changesシートをクリアして開始
   - 処理状態を新規作成

2. **継続実行時**（6分制限による自動分割）
   - Changesシートはクリアせず追記のみ
   - 前回の処理状態を引き継ぐ

3. **別日の実行時**（全処理完了後、新たなCurrentデータ）
   - 前回処理の完了を確認
   - Changesシートをクリアして新規処理として開始
   - 通常の初回実行と同じ動作

#### シート更新ルール
- Changesシート：初回実行時のみクリア、継続時は追記
- UserLogシート：各実行ごとに1行追記（分割実行の記録）
- 全グループ完了時に、必要に応じて重複除去等の整理

## 6. 制限事項と考慮事項

### 6.1 制限事項
- 1日あたりのトリガー実行時間は6時間まで
- PropertiesServiceの容量制限（9KB/プロパティ）
- 同時実行の防止が必要

### 6.2 考慮事項
- 複数ユーザーの同時実行への対応
- 24時間以上経過した処理状態の自動クリア
- ネットワークエラー時のリトライ処理

## 7. 移行計画

### 7.1 既存機能への影響
- runJudge関数の内部実装を変更
- 外部インターフェースは維持
- 既存のシート構造は変更なし

### 7.2 段階的リリース
1. 第1段階：基本的な分割処理とトリガー管理
2. 第2段階：詳細な進捗表示とUI改善
3. 第3段階：エラー処理の強化と最適化

## 8. セキュリティ考慮事項

### 8.1 アクセス制御
- トリガーは実行ユーザーの権限で動作
- 処理状態へのアクセスはスクリプト内のみ

### 8.2 データ保護
- 処理状態に機密情報を含めない
- エラーメッセージは最小限の情報のみ

## 9. パフォーマンス目標

### 9.1 処理効率
- 1グループ（30ページ）を5分以内に処理
- トリガー設定/削除のオーバーヘッドを最小化

### 9.2 ユーザビリティ
- 処理状況の可視化
- 中断/再開がユーザーに透過的

## 10. 今後の拡張性

### 10.1 将来的な改善案
- 動的なグループサイズ調整
- 並列処理の最適化
- より詳細な進捗レポート

### 10.2 他機能との連携
- エラー通知機能
- 処理完了時の自動レポート生成
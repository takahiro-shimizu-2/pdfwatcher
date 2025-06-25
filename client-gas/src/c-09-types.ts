/**
 * 6分制限対策用の型定義
 * グローバルスコープで利用可能
 */

/**
 * 処理ステータスの型定義
 */
type ProcessingStatus = 
  | 'idle'              // 待機中
  | 'processing'        // 処理中
  | 'paused'           // 一時停止（次回実行待ち）
  | 'completed'        // 完了
  | 'error'            // エラー
  | 'cancelled';       // キャンセル

/**
 * 処理状態を管理するインターフェース
 */
interface ProcessingState {
  version: string;                    // 状態管理のバージョン
  status: ProcessingStatus;           // 処理ステータス
  startTime: number;                  // 処理開始時刻（ミリ秒）
  lastUpdateTime: number;             // 最終更新時刻（ミリ秒）
  currentGroupIndex: number;          // 現在処理中のグループインデックス（0始まり）
  totalGroups: number;                // 総グループ数
  processedPages: number;             // 処理済みページ数
  totalPages: number;                 // 総ページ数
  triggerId?: string;                 // 設定されたトリガーのID
  user: string;                       // 実行ユーザーのメールアドレス
  errorCount: number;                 // エラー発生回数
  lastError?: string;                 // 最後のエラーメッセージ
  sessionId: string;                  // 処理セッションID（新規処理の判定用）
  execId?: string;                    // サーバー側の実行ID（再実行時も同じIDを使用）
  completedMiniBatches?: {[groupIndex: number]: number[]};  // 各グループの完了済みミニバッチ
}

/**
 * ページグループの定義
 */
interface PageGroup {
  groupIndex: number;                 // グループインデックス（0始まり）
  pages: Page[];                      // このグループに含まれるページ
  startIndex: number;                 // 全体での開始インデックス
  endIndex: number;                   // 全体での終了インデックス
}

/**
 * 処理セッション情報
 * 初回実行と継続実行を区別するための情報
 */
interface ProcessingSession {
  sessionId: string;                  // セッションID
  isFirstRun: boolean;                // 初回実行フラグ
  isContinuation: boolean;            // 継続実行フラグ
  startedAt: number;                  // セッション開始時刻
}
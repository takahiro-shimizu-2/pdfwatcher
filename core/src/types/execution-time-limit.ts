/**
 * 6分制限対策用の型定義
 */

import { Page } from '../models/Page';

/**
 * 処理ステータスの型定義
 */
export type ProcessingStatus = 
  | 'idle'              // 待機中
  | 'processing'        // 処理中
  | 'paused'           // 一時停止（次回実行待ち）
  | 'completed'        // 完了
  | 'error'            // エラー
  | 'cancelled';       // キャンセル

/**
 * 処理状態を管理するインターフェース
 */
export interface ProcessingState {
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
  sessionId: string;                  // セッションID
  completedMiniBatches: number[];     // 完了済みミニバッチID
}

/**
 * ページグループの定義
 */
export interface PageGroup {
  groupIndex: number;    // グループインデックス（0始まり）
  startIndex: number;    // 開始インデックス（ページ配列内）
  endIndex: number;      // 終了インデックス（ページ配列内）
  pages: Page[];         // グループ内のページ
}

/**
 * 処理セッション情報
 */
export interface ProcessingSession {
  sessionId: string;     // セッションID
  startTime: Date;       // セッション開始時刻
  endTime?: Date;        // セッション終了時刻
  totalPages: number;    // 総ページ数
  processedPages: number; // 処理済みページ数
  status: ProcessingStatus; // セッションステータス
}

/**
 * ミニバッチ処理結果
 */
export interface MiniBatchResult {
  miniBatchIndex: number;  // ミニバッチインデックス
  success: boolean;        // 処理成功フラグ
  processedPages: number;  // 処理したページ数
  error?: string;          // エラーメッセージ
}
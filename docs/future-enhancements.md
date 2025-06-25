# 将来の機能拡張アイデア

このドキュメントでは、PDFWatcherシステムの将来的な機能拡張アイデアを記録しています。

**注意**: これらの機能は現在保留中です。6分制限対策の核心機能は既に完了しており、システムは十分に動作します。以下は「あったら便利」程度の改善案として記録しています。

## 目次

1. [パフォーマンス最適化](#1-パフォーマンス最適化)
   - 1.1 [動的グループサイズ調整機能](#11-動的グループサイズ調整機能)
   - 1.2 [処理時間の計測と統計情報の収集](#12-処理時間の計測と統計情報の収集)
   - 1.3 [ボトルネックの特定と改善](#13-ボトルネックの特定と改善)
2. [エラー処理の高度化](#2-エラー処理の高度化)
3. [コード品質改善](#3-コード品質改善)
4. [その他の拡張アイデア](#4-その他の拡張アイデア)

---

## 1. パフォーマンス最適化

### 1.1 動的グループサイズ調整機能

#### 概要
現在は固定30ページ/グループで処理していますが、処理速度に応じて自動的にグループサイズを調整する機能です。

#### 背景・課題
- サーバー負荷やネットワーク状況により処理速度が変動する
- 固定サイズだと、調子の悪い日は制限オーバー、調子の良い日は時間が余る
- より効率的な時間利用が可能

#### 実装アイデア

**基本的な仕組み**
1. 各グループの処理時間を記録
2. ページあたりの平均処理時間を算出
3. 目標処理時間（4.5分）から最適ページ数を計算
4. 段階的に調整（±5ページ以内）

**データ構造**
```typescript
interface ProcessingStatistics {
  averagePageProcessingTime: number;  // ページあたり平均処理時間（秒）
  totalProcessedPages: number;        // 累計処理ページ数
  totalProcessingTime: number;        // 累計処理時間（秒）
  lastGroupSize: number;              // 前回のグループサイズ
  lastGroupProcessingTime: number;    // 前回のグループ処理時間
}
```

**計算ロジック**
```typescript
static calculateOptimalGroupSize(statistics?: ProcessingStatistics): number {
  const MIN_GROUP_SIZE = 20;
  const MAX_GROUP_SIZE = 50;
  const TARGET_PROCESSING_TIME = 4.5 * 60; // 4.5分
  
  if (!statistics || statistics.averagePageProcessingTime === 0) {
    return 30; // デフォルト値
  }
  
  const optimalSize = Math.floor(TARGET_PROCESSING_TIME / statistics.averagePageProcessingTime);
  return Math.max(MIN_GROUP_SIZE, Math.min(MAX_GROUP_SIZE, optimalSize));
}
```

#### 期待される効果
- 処理効率の向上（平均10-15%の処理時間短縮）
- 制限オーバーによる失敗の減少
- システムの自動最適化によるメンテナンス負荷軽減

#### 実装の優先度
**低**: 現在の固定30ページ/グループで十分に機能しているため

---

### 1.2 処理時間の計測と統計情報の収集

#### 概要
各グループの処理時間を記録し、統計情報を蓄積することで、処理時間の予測精度を向上させる機能です。

#### 実装アイデア

**統計データ構造**
```typescript
interface ProcessingStatistics {
  // 基本統計
  totalExecutions: number;           // 実行回数
  totalPages: number;               // 累計処理ページ数
  totalProcessingTime: number;      // 累計処理時間（秒）
  averagePageTime: number;          // ページあたり平均時間（秒）
  
  // 最近の傾向
  recentExecutions: ExecutionRecord[]; // 直近10回の記録
  
  // 予測精度
  predictionAccuracy: number;       // 予測精度（%）
}
```

**活用例**
- 処理開始時：「予測時間8分30秒（85%の精度）」
- 処理中：「現在のペース6.2秒/ページ、残り4分15秒」
- 完了時：予測vs実際の比較、統計更新

#### 期待される効果
- ユーザーの時間管理能力向上
- システムパフォーマンスの可視化
- 最適な実行タイミングの特定

#### 実装の優先度
**中**: ユーザー体験を向上させる価値がある

---

### 1.3 ボトルネックの特定と改善

#### 概要
各処理段階の時間を詳細に計測し、パフォーマンスのボトルネックを特定・改善する機能です。

#### 実装アイデア

**処理段階の計測**
```typescript
interface ProcessingBreakdown {
  pdfFetch: number;         // PDF読み込み時間
  contentExtraction: number; // 内容抽出時間
  comparison: number;       // 比較処理時間
  resultWriting: number;    // 結果書き込み時間
  overhead: number;         // その他のオーバーヘッド
}
```

**可視化例**
```
📊 処理時間の詳細分析 (30ページのグループ)
PDF読み込み    ████████████░░░░░░░░░░ 40% (2分24秒) ← ボトルネック
内容抽出      ████████░░░░░░░░░░░░░░ 30% (1分48秒)
比較処理      █████░░░░░░░░░░░░░░░░░ 20% (1分12秒)
結果書き込み   ███░░░░░░░░░░░░░░░░░░░ 15% (54秒)
```

#### 期待される効果
- 改善箇所の明確化
- 最適化効果の定量評価
- パフォーマンス回帰の早期発見

#### 実装の優先度
**中**: パフォーマンスの最適化に役立つ

---

## 2. エラー処理の高度化

### 概要
エラーの詳細な記録、種類別のリトライ戦略、および効果的な通知機能を実装する機能です。

### 実装アイデア

#### エラー情報の詳細化
```typescript
interface DetailedErrorInfo {
  // 基本情報
  timestamp: string;
  errorId: string;
  
  // 処理状況
  currentPage: number;
  totalPages: number;
  processingStage: string;
  
  // エラー詳細
  errorType: ErrorType;
  errorMessage: string;
  stackTrace?: string;
  
  // コンテキスト
  url?: string;
  lastSuccessfulAction?: string;
}

enum ErrorType {
  NETWORK_TIMEOUT = 'network_timeout',
  NETWORK_ERROR = 'network_error',
  PERMISSION_DENIED = 'permission_denied',
  QUOTA_EXCEEDED = 'quota_exceeded',
  INVALID_DATA = 'invalid_data',
  UNKNOWN = 'unknown'
}
```

#### エラー種類別リトライ戦略
- **ネットワークタイムアウト**: 3回リトライ（5秒、10秒、20秒間隔）
- **ネットワークエラー**: 5回リトライ（指数バックオフ）
- **権限エラー**: リトライなし（即座に停止）
- **クォータ超過**: 5分待機後に1回リトライ

#### 通知機能
- レベル別通知（INFO、WARNING、ERROR、CRITICAL）
- チャネル別配信（メール、Slack、Webhook）
- 通知頻度の制御（同じエラーの繰り返し通知を防止）

### 期待される効果
- エラー原因の迅速な特定
- 適切なリトライによる自動復旧率向上
- 重要度に応じた効率的な通知

### 実装の優先度
**高**: エラー時のページスキップ問題（TC-009で発見）の解決に関連

---

## 3. コード品質改善

### 3.1 コード重複の削減

#### 発見された主要な重複箇所

1. **型定義と定数の重複**
   - 場所: core、server-gas、client-gasの3箇所
   - 影響: 手動コピーによる不整合リスク
   - 改善案: ビルドプロセスでの自動同期

2. **シート初期化パターン**
   - 場所: 全リポジトリクラス
   - 改善案: 基底クラスまたはユーティリティ関数化

3. **データ変換パターン**
   - 場所: 各リポジトリのデータ読み込み処理
   - 改善案: RowMapperユーティリティの作成

4. **共通処理のユーティリティ化**
   - エラーメッセージの切り詰め
   - 日付フォーマット（Asia/Tokyo）
   - バッチ分割ロジック

### 3.2 型定義の厳密化

#### 改善可能な箇所

1. **unknown[]型の使用**
   - 問題: 型安全性の欠如
   - 改善案: ジェネリック型や具体的な型定義

2. **string型の過度な使用**
   - 問題: 特定の値のみ許可すべき箇所
   - 改善案: Union型やEnum型の活用

3. **any型の残存**
   - 改善案: unknown型への置き換えと型ガード

### 3.3 未使用コードの削除

#### 削除候補
- デバッグ用のconsole.log文
- コメントアウトされた古い実装
- 未使用のインポート宣言
- 重複した型定義

### 推奨される改善優先順位

1. **高優先度**
   - 型定義と定数の自動同期システム構築
   - 基底リポジトリクラスの作成

2. **中優先度**
   - ユーティリティクラスの整備
   - 型定義の厳密化

3. **低優先度**
   - デバッグコードの整理
   - コメントアウトコードの削除

---

## 4. その他の拡張アイデア

### ユーザビリティ向上
- リアルタイム進捗表示
- 処理予定時刻の予測
- カスタムダッシュボード

### インフラ拡張
- Google Driveストレージバックエンド
- BigQueryとの連携
- Cloud Functionsでの定期実行

### 通知・連携
- Slack/Teams通知
- メール通知
- Webhook連携

---

*このドキュメントは将来の参考用です。実装優先度や技術的な実現可能性については別途検討が必要です。*

**参照元**: 
- `docs/TODOリスト/execution_time_limit_TODO.md` のTask 15-16
- 2025-06-25のコード分析結果
# 将来の機能拡張アイデア

このドキュメントでは、PDFWatcherシステムの将来的な機能拡張アイデアを記録しています。

**注意**: これらの機能は現在保留中です。6分制限対策の核心機能は既に完了しており、システムは十分に動作します。以下は「あったら便利」程度の改善案として記録しています。

**参照元**: `docs/TODOリスト/execution_time_limit_TODO.md` のTask 15-16および一部Task 8.5, 14から移動

## 1. 動的グループサイズ調整機能

### 概要
現在は固定30ページ/グループで処理していますが、処理速度に応じて自動的にグループサイズを調整する機能です。

### 背景・課題
- サーバー負荷やネットワーク状況により処理速度が変動する
- 固定サイズだと、調子の悪い日は制限オーバー、調子の良い日は時間が余る
- より効率的な時間利用が可能

### 実装アイデア

#### 基本的な仕組み
1. **処理時間の計測と記録**
   - 各グループの処理時間を記録
   - ページあたりの平均処理時間を算出
   - PropertiesServiceに統計情報を保存

2. **動的サイズ計算**
   ```
   目標処理時間（4.5分） ÷ ページあたり処理時間 = 最適ページ数
   ```

3. **段階的な調整**
   - 急激な変更を避け、±5ページ以内で調整
   - 最小20ページ、最大50ページの範囲で制限

#### 具体的な動作例

**学習プロセス**
- 1回目：30ページ/4分30秒 → 1ページ9秒と記録
- 2回目：28ページに調整 → 4分12秒で完了
- 3回目：29ページに増加 → 4分35秒で完了
- 4回目：サーバー重い日 → 5分5秒（オーバー）→ 次回26ページに減少

**効果**
- 環境に応じた最適化により、常に制限内で最大限の処理が可能
- システムが自動学習するため、手動調整不要

#### 実装詳細

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

**移動平均による安定化**
```typescript
static updateAverageProcessingTime(
  currentAverage: number, 
  newProcessingTime: number, 
  pageCount: number
): number {
  const weight = 0.3; // 新しいデータの重み
  const newPageTime = newProcessingTime / pageCount;
  return currentAverage * (1 - weight) + newPageTime * weight;
}
```

#### 実装上の考慮事項
- **保守的な調整**: 急激な変更は避け、段階的に最適化
- **異常値の除外**: ネットワーク遅延等による異常な処理時間は統計から除外
- **フォールバック**: 計算エラー時はデフォルト値（30ページ）に戻す
- **最小・最大制限**: 極端に小さい/大きいグループサイズは避ける

#### 期待される効果
- 処理効率の向上（平均10-15%の処理時間短縮）
- 制限オーバーによる失敗の減少
- システムの自動最適化によるメンテナンス負荷軽減

---

## 2. 処理時間の計測と統計情報の収集機能

### 概要
各グループの処理時間を記録し、統計情報を蓄積することで、処理時間の予測精度を向上させる機能です。

### 背景・課題
- 現在はユーザーが処理時間を予測できない
- パフォーマンスの変動要因が分からない
- 最適な実行タイミングが不明

### 実装アイデア

#### 基本的な仕組み
1. **リアルタイム計測**
   - 各グループの開始・終了時刻を記録
   - ページあたりの処理時間を算出
   - PropertiesServiceに統計データを保存

2. **統計情報の蓄積**
   - 直近10回の実行履歴を保持
   - 累計統計（総実行回数、総ページ数、平均時間）
   - 予測精度の追跡

3. **インテリジェントな予測**
   - 最近の傾向を重視した時間予測
   - 信頼度付きの予測結果
   - 実績との差分による精度向上

#### 具体的な動作例

**学習プロセス**
```
1回目：80ページ/12分5秒 → 9.06秒/ページと記録
2回目：60ページ予測9分 → 実際10分30秒 → 精度向上
3回目：45ページ予測7分30秒 → 実際7分45秒 → 高精度達成
```

**ユーザー体験の改善**
- 処理開始時：「予測時間8分30秒（85%の精度）」
- 処理中：「現在のペース6.2秒/ページ、残り4分15秒」
- 完了時：「予測vs実際の比較、統計更新完了」

#### データ構造

**統計データ**
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
  lastPrediction: number;           // 前回の予測時間
  lastActual: number;               // 前回の実際時間
}

interface ExecutionRecord {
  date: string;                     // 実行日時
  pages: number;                    // 処理ページ数
  processingTime: number;           // 処理時間（秒）
  pageTime: number;                 // ページあたり時間
  groups: GroupRecord[];            // グループ別詳細
}

interface GroupRecord {
  groupIndex: number;
  pages: number;
  processingTime: number;
  startTime: string;
  endTime: string;
}
```

**計測実装**
```typescript
class GroupProcessor {
  static async processGroup(group: PageGroup): Promise<BatchResult> {
    const startTime = Date.now();
    
    // 既存の処理
    const result = await this.executeGroupProcessing(group);
    
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    // 統計に記録
    StatisticsManager.recordGroupProcessing({
      groupIndex: group.groupIndex,
      pages: group.pages.length,
      processingTime: processingTime,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString()
    });
    
    return result;
  }
}
```

**予測機能**
```typescript
class StatisticsManager {
  static predictProcessingTime(pageCount: number): {
    estimatedTime: number;
    confidence: number;
    basedOn: string;
  } {
    const stats = this.loadStatistics();
    
    if (stats.totalExecutions === 0) {
      return {
        estimatedTime: pageCount * 10, // デフォルト10秒/ページ
        confidence: 0,
        basedOn: "デフォルト値"
      };
    }
    
    // 最近の傾向を重視した予測
    const recentAverage = this.calculateRecentAverage();
    const estimatedTime = pageCount * recentAverage;
    
    return {
      estimatedTime: Math.ceil(estimatedTime),
      confidence: stats.predictionAccuracy,
      basedOn: `過去${stats.recentExecutions.length}回の実績`
    };
  }
}
```

#### 活用例

**パフォーマンス分析**
```
過去の実行履歴：
2024/01/15: 60ページ 5.2秒/ページ ⚡ (高速)
2024/01/16: 45ページ 8.1秒/ページ 🐌 (低速)
2024/01/17: 80ページ 6.5秒/ページ 📊 (平均的)

平均: 6.6秒/ページ
トレンド: 最近やや高速化傾向
```

**最適タイミングの提案**
```
📊 統計分析結果
🌅 午前中の実行: 平均5.8秒/ページ (推奨)
🌆 午後の実行: 平均7.2秒/ページ
🌙 夜間の実行: 平均6.1秒/ページ
```

**予測精度の向上**
```
予測精度の変化：
実行1-3回目: 予測精度 45%
実行4-7回目: 予測精度 72%
実行8回目以降: 予測精度 88%

→ 使えば使うほど精度が向上！
```

#### 期待される効果
- ユーザーの時間管理能力向上
- システムパフォーマンスの可視化
- 最適な実行タイミングの特定
- 予測精度向上によるユーザビリティ向上

---

## 3. ボトルネックの特定と改善機能

### 概要
各処理段階の時間を詳細に計測し、パフォーマンスのボトルネックを特定・改善する機能です。

### 背景・課題
- 処理全体の時間は分かるが、どの段階で時間がかかっているか不明
- 改善すべき箇所の優先順位が分からない
- パフォーマンス低下の原因特定に時間がかかる

### 実装アイデア

#### 処理段階の詳細計測
```typescript
interface ProcessingBreakdown {
  pdfFetch: number;        // PDF読み込み時間
  contentExtraction: number; // 内容抽出時間
  comparison: number;      // 比較処理時間
  resultWriting: number;   // 結果書き込み時間
  overhead: number;        // その他のオーバーヘッド
}

class PerformanceProfiler {
  private timings: Map<string, number> = new Map();
  
  startTimer(stage: string): void {
    this.timings.set(`${stage}_start`, Date.now());
  }
  
  endTimer(stage: string): number {
    const startTime = this.timings.get(`${stage}_start`);
    const duration = Date.now() - startTime;
    this.timings.set(stage, duration);
    return duration;
  }
  
  getBreakdown(): ProcessingBreakdown {
    return {
      pdfFetch: this.timings.get('pdfFetch') || 0,
      contentExtraction: this.timings.get('contentExtraction') || 0,
      comparison: this.timings.get('comparison') || 0,
      resultWriting: this.timings.get('resultWriting') || 0,
      overhead: this.calculateOverhead()
    };
  }
}
```

#### 具体的な動作例

**処理時間の詳細分析**
```
📊 処理時間の詳細分析 (30ページのグループ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PDF読み込み    ████████████░░░░░░░░░░ 40% (2分24秒) ← ボトルネック
内容抽出      ████████░░░░░░░░░░░░░░ 30% (1分48秒)
比較処理      █████░░░░░░░░░░░░░░░░░ 20% (1分12秒)
結果書き込み   ███░░░░░░░░░░░░░░░░░░░ 15% (54秒)
その他       ██░░░░░░░░░░░░░░░░░░░░  5% (18秒)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
合計: 6分00秒

🔍 主要ボトルネック:
1. PDF読み込み (4.8秒/ページ) - ネットワーク遅延が主因
2. 内容抽出 (3.6秒/ページ) - 大きなPDFファイルで顕著

💡 改善提案:
- PDFの並列読み込み実装 → 推定25%高速化
- キャッシュ機能追加 → 推定15%高速化
- バッチ書き込み最適化 → 推定10%高速化
```

**トレンド分析**
```
📈 パフォーマンストレンド (過去7日間)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
日付        PDF読込  比較処理  書込み  合計   傾向
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
01/15(月)   4.2秒   3.1秒   1.8秒   9.1秒   📊
01/16(火)   5.1秒   3.2秒   1.9秒  10.2秒   📉 (12%低下)
01/17(水)   4.8秒   3.0秒   1.7秒   9.5秒   📈 (7%改善)
01/18(木)   3.9秒   2.9秒   1.6秒   8.4秒   📈 (12%改善)
01/19(金)   4.1秒   3.0秒   1.8秒   8.9秒   📊
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 最適化の効果: 木曜日の設定変更により12%高速化を達成
```

#### 期待される効果
- 改善箇所の明確化
- 最適化効果の定量評価
- パフォーマンス回帰の早期発見

---

## 4. 高度なエラー処理機能

### 概要
エラーの詳細な記録、種類別のリトライ戦略、および効果的な通知機能を実装する機能です。

### 背景・課題
- 現在は簡素なエラー情報のみで原因特定が困難
- 全てのエラーに対して同じリトライ戦略
- エラー発生時の適切な通知が不足

### 実装アイデア

#### 1. 詳細なエラー情報の記録

**エラー情報の構造**
```typescript
interface DetailedErrorInfo {
  // 基本情報
  timestamp: string;              // エラー発生時刻
  errorId: string;               // 一意のエラーID
  
  // 処理状況
  currentPage: number;           // 処理中のページ番号
  totalPages: number;            // 総ページ数
  currentGroup: number;          // 処理中のグループ
  processingStage: string;       // 処理段階
  
  // エラー詳細
  errorType: ErrorType;          // エラー種類
  errorMessage: string;          // エラーメッセージ
  stackTrace?: string;           // スタックトレース
  httpStatus?: number;           // HTTPステータス
  
  // 環境情報
  userAgent: string;             // 実行環境
  executionTime: number;         // エラー発生までの経過時間
  memoryUsage?: number;          // メモリ使用量
  
  // コンテキスト
  url?: string;                  // 処理中のURL
  fileName?: string;             // 処理中のファイル名
  lastSuccessfulAction?: string; // 最後に成功した処理
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

**具体的なエラー記録例**
```
🚨 エラー詳細レポート
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
エラーID: ERR-2024-0115-001
発生時刻: 2024-01-15 14:23:45.123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
処理状況:
  現在のページ: 45/120 (グループ2の15ページ目)
  処理段階: PDF読み込み中
  経過時間: 2分34秒

エラー詳細:
  種類: ネットワークタイムアウト
  メッセージ: PDFサーバーへの接続が30秒でタイムアウト
  対象URL: https://example.com/large-document.pdf
  HTTPステータス: 408

環境情報:
  実行時間: 154秒
  メモリ使用量: 45MB/64MB
  前回成功処理: ページ44の比較完了
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 2. エラー種類別リトライ戦略

**戦略の実装**
```typescript
class SmartRetryManager {
  private static readonly RETRY_STRATEGIES: Map<ErrorType, RetryStrategy> = new Map([
    [ErrorType.NETWORK_TIMEOUT, {
      maxRetries: 3,
      delays: [5000, 10000, 20000], // 5秒、10秒、20秒
      backoffType: 'fixed'
    }],
    [ErrorType.NETWORK_ERROR, {
      maxRetries: 5,
      delays: [1000, 2000, 4000, 8000, 16000], // 指数バックオフ
      backoffType: 'exponential'
    }],
    [ErrorType.PERMISSION_DENIED, {
      maxRetries: 0, // 即座に停止
      delays: [],
      backoffType: 'none'
    }],
    [ErrorType.QUOTA_EXCEEDED, {
      maxRetries: 1,
      delays: [300000], // 5分待機
      backoffType: 'fixed'
    }]
  ]);
  
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    errorType: ErrorType
  ): Promise<T> {
    const strategy = this.RETRY_STRATEGIES.get(errorType);
    
    for (let attempt = 0; attempt <= strategy.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === strategy.maxRetries) {
          throw error; // 最後の試行で失敗
        }
        
        const delay = strategy.delays[attempt];
        Logger.info(`リトライ ${attempt + 1}/${strategy.maxRetries} を ${delay}ms後に実行`);
        await this.sleep(delay);
      }
    }
  }
}
```

**具体的な動作例**
```
🔄 ネットワークタイムアウトを検出
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
試行1: 失敗 → 5秒後に再試行
試行2: 失敗 → 10秒後に再試行  
試行3: 成功！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
結果: 2回の再試行で復旧 (合計15秒の遅延)

🛑 権限エラーを検出
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
再試行不可能なエラーのため、即座に処理を停止
管理者に緊急通知を送信
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 3. エラー通知機能

**通知レベルの定義**
```typescript
enum NotificationLevel {
  INFO = 'info',       // 情報: 軽微なエラーからの自動復旧
  WARNING = 'warning', // 警告: 複数回の再試行発生
  ERROR = 'error',     // エラー: 処理停止
  CRITICAL = 'critical' // 緊急: システム全体に影響
}

interface NotificationConfig {
  level: NotificationLevel;
  channels: NotificationChannel[];
  frequency: NotificationFrequency;
  template: string;
}

enum NotificationChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  SMS = 'sms',
  WEBHOOK = 'webhook'
}
```

**通知内容の例**
```
📧 【PDFWatcher】エラー通知 (レベル: ERROR)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 発生時刻: 2024-01-15 14:25:30
🚨 エラー種類: 権限不足
📄 影響範囲: 残り35ページが未処理
⚠️ 重要度: 手動対応が必要

📋 詳細情報:
- エラーID: ERR-2024-0115-003
- 処理中のページ: 85/120
- 最後の成功処理: ページ84の結果書き込み

🔧 推奨対策:
1. GASの実行権限を確認してください
2. スプレッドシートの共有設定を確認してください
3. 問題が解決したら手動で処理を再開してください

🔗 詳細ログ: https://console.example.com/logs/ERR-2024-0115-003
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Slack通知:
🚨 [PDFWatcher] 処理が停止しました
権限エラーにより残り35ページが未処理です。
管理者による確認が必要です。
詳細: https://console.example.com/logs/ERR-2024-0115-003
```

**通知頻度の制御**
```typescript
class NotificationThrottler {
  private static lastNotifications: Map<string, number> = new Map();
  
  static shouldSendNotification(
    errorType: string, 
    level: NotificationLevel
  ): boolean {
    const key = `${errorType}_${level}`;
    const lastSent = this.lastNotifications.get(key) || 0;
    const now = Date.now();
    
    // レベル別の送信間隔
    const intervals = {
      [NotificationLevel.INFO]: 0,        // 送信しない
      [NotificationLevel.WARNING]: 30 * 60 * 1000,  // 30分間隔
      [NotificationLevel.ERROR]: 5 * 60 * 1000,     // 5分間隔
      [NotificationLevel.CRITICAL]: 0     // 即座に送信
    };
    
    const interval = intervals[level];
    if (now - lastSent >= interval) {
      this.lastNotifications.set(key, now);
      return true;
    }
    return false;
  }
}
```

#### 期待される効果
- エラー原因の迅速な特定
- 適切なリトライによる自動復旧率向上
- 重要度に応じた効率的な通知
- システム安定性の向上

---

## 5. その他の将来拡張アイデア

### ユーザビリティ向上
- リアルタイム進捗表示
- 処理予定時刻の予測
- カスタムダッシュボード

---

*このドキュメントは将来の参考用です。実装優先度や技術的な実現可能性については別途検討が必要です。*
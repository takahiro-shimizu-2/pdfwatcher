# PageSummary履歴管理拡張設計書

## 概要
PageSummary（クライアントのSummaryシート）の履歴管理を現在の3世代から7日分へ拡張する設計書です。

**関連ドキュメント:**
- TODO: `summary_history_extension_TODO.md`
- テスト仕様書: `test/summary_history_extension/summary_history_extension_test.md`
- テストTODO: `test/summary_history_extension/summary_history_extension_test_TODO.md`

## 背景と目的
### 現状
- PageSummaryシートは各ページURLの直近3回分の実行結果を横持ちで管理
- run1（最新）、run2（1つ前）、run3（2つ前）の3世代のみ保持
- 古いデータは自動的に破棄される

### 課題
- 3回分の履歴では短期的な変更傾向の把握が困難
- 週単位での変更パターンを確認できない

### 目的
- 7日分の履歴を保持し、より長期的な変更傾向を把握可能にする
- 日次での変更パターンを確認できるようにする

## システム仕様

### 1. データ構造の変更

#### 1.1 PageSummaryインターフェースの変更
```typescript
// 変更前
export interface PageSummary {
  pageUrl: string;
  lastHash?: string;
  run1?: RunSummary;
  run2?: RunSummary;
  run3?: RunSummary;
}

// 変更後
export interface PageSummary {
  pageUrl: string;
  lastHash?: string;
  dailyRuns: RunSummary[];  // 最大7日分の履歴を配列で管理
}
```

#### 1.2 スプレッドシートの列構成変更
**変更前（3世代）:**
| 列 | 内容 |
|---|---|
| A | PageURL |
| B | LastHash |
| C-F | Run-1（Date, PageUpdated, PDFUpdated, AddedCount） |
| G-J | Run-2 |
| K-N | Run-3 |

**変更後（7日分）:**
| 列 | 内容 |
|---|---|
| A | PageURL |
| B | LastHash |
| C-F | Day-1（Date, PageUpdated, PDFUpdated, AddedCount） |
| G-J | Day-2 |
| K-N | Day-3 |
| O-R | Day-4 |
| S-V | Day-5 |
| W-Z | Day-6 |
| AA-AD | Day-7 |

### 2. 実装方針

#### 2.1 履歴管理の変更点
1. **保持期間**: 3世代 → 7日分
2. **削除条件**: 古い世代の削除 → 7日以上経過したデータの削除
3. **並び順**: 新しい順（Day-1が最新、Day-7が最古）

#### 2.2 日付ベースの管理
- 各履歴エントリの日付を確認し、7日以内のデータのみを保持
- 同一日に複数回実行された場合は、その日の最新データのみを保持

### 3. 影響範囲

#### 3.1 修正が必要なファイル
1. **コアモデル**
   - `/core/src/models/PageSummary.ts`
   - `/core/src/interfaces/ISummaryRepository.ts`

2. **サーバー側実装**
   - `/server-gas/src/infrastructure/repositories/s-SheetSummaryRepository.ts`
   - `/server-gas/src/domain/services/s-SummaryService.ts`

3. **クライアント側**
   - Summaryシートの列数増加に対応（IMPORTRANGEの範囲調整は自動）

#### 3.2 修正が不要な機能
- PageHistoryシート（全履歴保存）
- ChangesHistoryシート（5日間履歴）
- RunLogシート
- その他の既存機能

### 4. データ移行

#### 4.1 既存データの扱い
- 既存の3世代データ（run1, run2, run3）は新形式に移行
- run1 → Day-1、run2 → Day-2、run3 → Day-3として保持
- Day-4からDay-7は空欄とする

#### 4.2 移行処理
- 初回実行時に自動的に既存データを新形式に変換
- 列の追加は自動的に行われる

### 5. パフォーマンスへの影響

#### 5.1 データ量の増加
- 1行あたりのデータ量: 14列 → 30列（約2.1倍）
- 読み書き時間の増加は限定的（Google Sheets APIの制限内）

#### 5.2 処理時間
- 履歴のシフト処理が増加するが、実行時間への影響は軽微
- 6分制限内での処理に影響なし

### 6. エラーハンドリング

#### 6.1 データ整合性
- 日付の重複チェック（同一日の複数データは最新のみ保持）
- 7日以上経過したデータの自動削除

#### 6.2 互換性
- 旧形式のデータを読み込んだ場合の自動変換
- 列数不足の場合の自動拡張

### 7. 実装上の注意点

1. **日付の扱い**
   - すべてJSTで統一
   - 日付の比較は日単位で実施

2. **既存機能との互換性**
   - IMPORTRANGEの自動調整により、クライアント側の変更は最小限
   - APIインターフェースの後方互換性を維持

3. **テスト**
   - 単体テスト、統合テスト、E2Eテストの実施
   - 既存機能への影響確認

## 実装スケジュール

1. **Phase 1**: コアモデルとインターフェースの変更
2. **Phase 2**: サーバー側リポジトリの実装
3. **Phase 3**: データ移行ロジックの実装
4. **Phase 4**: テストの実施
5. **Phase 5**: ドキュメントの更新

## リスクと対策

### リスク1: データ量増加によるパフォーマンス低下
**対策**: 
- 事前のパフォーマンステストを実施
- 必要に応じて処理の最適化

### リスク2: 既存データの移行失敗
**対策**:
- 移行前のバックアップ取得
- 段階的な移行とロールバック機能

### リスク3: クライアント側の互換性問題
**対策**:
- IMPORTRANGEの自動調整機能を活用
- 影響を受けるクライアントへの事前通知

## 成功基準

1. 7日分の履歴が正しく保存・表示される
2. 既存の3世代データが正しく移行される
3. 7日以上経過したデータが自動削除される
4. 既存機能への影響がない
5. パフォーマンスの大幅な低下がない
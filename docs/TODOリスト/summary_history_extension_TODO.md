# PageSummary履歴管理拡張 TODOリスト

## 概要
PageSummaryの履歴管理を3世代から7世代へ拡張するための実装TODOリストです。

**関連ドキュメント:**
- 設計書: `../summary_history_extension_design.md`
- テスト仕様書: `../test/summary_history_extension/summary_history_extension_test.md`
- テストTODO: `../test/summary_history_extension/summary_history_extension_test_TODO.md`

## Phase 1: コアモデルとインターフェースの変更

### TODO-001: PageSummaryモデルの更新
- [ ] `/core/src/models/PageSummary.ts`を開く
- [ ] `PageSummary`インターフェースに`run4`, `run5`, `run6`, `run7`プロパティを追加
- [ ] JSDocコメントを更新して7世代の履歴管理について説明を追加
- [ ] 型定義のエクスポートを確認

### TODO-002: ISummaryRepositoryインターフェースの更新
- [ ] `/core/src/interfaces/ISummaryRepository.ts`を開く
- [ ] 必要に応じてメソッドシグネチャを更新
- [ ] 新しいPageSummary型に対応していることを確認
- [ ] JSDocコメントを更新

## Phase 2: サーバー側リポジトリの実装

### TODO-003: SheetSummaryRepositoryの列定義更新
- [ ] `/server-gas/src/infrastructure/repositories/s-SheetSummaryRepository.ts`を開く
- [ ] 列定義の定数を7世代（30列）に拡張
- [ ] `COLUMN_INDICES`を更新:
  - PageURL: 0 (A列)
  - LastHash: 1 (B列)
  - Run1: 2-5 (C-F列)
  - Run2: 6-9 (G-J列)
  - Run3: 10-13 (K-N列)
  - Run4: 14-17 (O-R列)
  - Run5: 18-21 (S-V列)
  - Run6: 22-25 (W-Z列)
  - Run7: 26-29 (AA-AD列)

### TODO-004: getPageSummaryメソッドの更新
- [ ] 行データから7世代の履歴を読み取るロジックを実装
- [ ] run1からrun7までのデータをパース
- [ ] 空のセルはundefinedとして処理
- [ ] データの妥当性チェックを追加

### TODO-005: updatePageSummaryメソッドの更新
- [ ] 新しい実行結果をrun1に設定
- [ ] 既存のrun1→run2、run2→run3...とシフト
- [ ] run7の古いデータを破棄
- [ ] 7世代分のデータをスプレッドシートの行形式に変換
- [ ] 30列分のデータを準備（空のデータは空文字列）

### TODO-006: データ移行ロジックの実装
- [ ] 既存の3世代形式のデータを検出する関数を作成
- [ ] 3世代形式から7世代形式への変換関数を実装
- [ ] 初回実行時の自動移行処理を追加
- [ ] 移行ログの出力

### TODO-007: ヘルパー関数の実装
- [ ] 世代データのシフト処理関数
- [ ] 7世代形式のデータと行データの相互変換関数
- [ ] 空の世代データの処理関数

## Phase 3: SummaryServiceの更新

### TODO-008: updateSummaryメソッドの調整
- [ ] `/server-gas/src/domain/services/s-SummaryService.ts`を開く
- [ ] 新しいリポジトリメソッドに対応
- [ ] エラーハンドリングの更新
- [ ] ログ出力の調整

### TODO-009: updateBatchSummariesメソッドの調整
- [ ] バッチ処理での7世代履歴管理に対応
- [ ] パフォーマンスの最適化
- [ ] エラーハンドリングの強化

## Phase 4: クライアント側の確認と調整

### TODO-010: Summaryシートの列数確認
- [ ] IMPORTRANGEの範囲が自動調整されることを確認
- [ ] 必要に応じてドキュメントを更新
- [ ] 列ヘッダーの表示を確認

## Phase 5: テストの実装

### TODO-011: 単体テストの作成
- [ ] PageSummaryモデルのテスト
- [ ] SheetSummaryRepositoryのテスト
- [ ] データ移行ロジックのテスト
- [ ] ヘルパー関数のテスト

### TODO-012: 統合テストの作成
- [ ] 7世代のデータ保存・取得テスト
- [ ] 8回目の実行で最古データ削除テスト
- [ ] データ移行の統合テスト

### TODO-013: E2Eテストの実施
- [ ] 実際のスプレッドシートでの動作確認
- [ ] パフォーマンステスト
- [ ] 既存機能への影響確認

## Phase 6: ドキュメントの更新

### TODO-014: API仕様書の更新
- [ ] `/docs/api-specification.md`の更新
- [ ] PageSummaryの新しい構造を記載

### TODO-015: README.mdの更新
- [ ] 履歴管理機能の説明を更新
- [ ] 7世代の履歴保持について記載

### TODO-016: トラブルシューティングガイドの更新
- [ ] `/docs/troubleshooting.md`に移行関連の項目を追加
- [ ] よくある質問を追加

## 実装上の注意事項

1. **後方互換性の維持**
   - 既存の3世代データを正しく読み込めること
   - APIの互換性を保つこと

2. **エラーハンドリング**
   - データ移行失敗時の処理
   - 不正なデータ形式への対応

3. **パフォーマンス**
   - 大量のページURLがある場合の処理時間
   - メモリ使用量の監視

4. **テスト**
   - すべての変更に対してテストを作成
   - 既存のテストが失敗しないことを確認

## 完了条件

- [ ] すべてのTODOが完了
- [ ] すべてのテストが合格
- [ ] コードレビューの完了
- [ ] ドキュメントの更新完了
- [ ] 本番環境でのテスト完了
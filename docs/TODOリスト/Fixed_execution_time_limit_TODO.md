# This List Fixed

# GAS 6分実行時間制限対策 実装TODOリスト

## 概要
このTODOリストは、PDFWatcherシステムにGAS 6分制限対策を実装するためのタスクリストです。
各タスクは400行程度を目安に分割されており、AI駆動開発での実装を前提としています。

## 前提条件
- 開発仕様書（execution-time-limit-spec.md）を参照すること
- feature/execution-time-limitブランチで作業すること
- 既存の機能を壊さないよう注意すること

## Phase 1: 基盤構築（必須機能）

### Task 1: 定数定義とビルド設定の更新
- [x] core/src/constants.tsに6分制限対策用の定数を追加
  - MAX_EXECUTION_TIME_MS: 5 * 60 * 1000
  - PAGES_PER_GROUP: 30
  - TRIGGER_DELAY_MS: 5 * 60 * 1000
  - STATE_EXPIRY_MS: 24 * 60 * 60 * 1000
- [x] 各GASプロジェクトのビルドスクリプトを確認し、新定数が含まれることを確認
- [x] client-gas/src/c-00-globals.tsに定数が反映されることを確認

### Task 2: 型定義の作成
- [x] client-gas/src/c-09-types.tsを新規作成
- [x] ProcessingState interfaceを定義
- [x] ProcessingStatus type（idle, processing, paused, completed, error, cancelled）を定義
- [x] PageGroup interfaceを定義
- [x] 型定義をグローバルスコープで利用可能にする

### Task 3: 状態管理モジュールの実装
- [x] client-gas/src/c-10-state-manager.tsを新規作成
- [x] StateManagerクラスを実装
  - saveState: 処理状態をPropertiesServiceに保存
  - loadState: 処理状態を読み込み（有効期限チェック付き）
  - clearState: 処理状態をクリア
  - isStateValid: 状態の有効性を検証
  - updateProgress: 進捗のみを更新
- [x] エラーハンドリングを実装（PropertiesService利用不可時の対応）

### Task 4: トリガー管理モジュールの実装
- [x] client-gas/src/c-11-trigger-manager.tsを新規作成
- [x] TriggerManagerクラスを実装
  - scheduleNextExecution: 次回実行トリガーを設定
  - cancelTrigger: 指定IDのトリガーを削除
  - cleanupDuplicateTriggers: 重複トリガーを削除
  - getActiveTriggers: アクティブなトリガー一覧を取得
- [x] トリガー設定失敗時のエラーハンドリング

### Task 5: グループ処理モジュールの実装
- [x] client-gas/src/c-12-group-processor.tsを新規作成
- [x] GroupProcessorクラスを実装
  - splitIntoGroups: ページをグループに分割
  - processGroup: 1グループを処理（既存のbatch処理を活用）
  - canProcessMoreGroups: 残り時間で処理可能か判定
- [x] 既存のバッチ処理関数との連携を実装

## Phase 2: メイン処理の改修

### Task 6: メイン処理関数の改修（前半）
- [x] client-gas/src/c-05-main.tsのバックアップを作成
- [x] runJudge関数を改修
  - 処理状態のチェックと初期化
  - トリガーの先行設定
  - グループ分割処理の追加
- [x] initializeProcessing関数を新規追加
  - ページのグループ分割
  - 初期状態の保存

### Task 7: メイン処理関数の改修（後半）
- [x] processNextGroup関数を新規追加
  - 次のグループを取得して処理
  - 時間チェックと中断処理
  - 進捗の更新
- [x] runJudgeContinuation関数を新規追加
  - 継続実行のエントリーポイント
  - 状態の復元と検証
  - runJudgeの呼び出し

### Task 8: エラー処理とクリーンアップ
- [x] エラー時の状態保存処理を実装
- [x] 3回連続エラー時の処理停止ロジック
- [x] 処理完了時のクリーンアップ処理
  - トリガーの削除
  - 状態のクリア
  - 完了通知

### Task 8.5: シートデータの追記処理実装
- [x] 処理状態から初回実行/継続実行/新規処理を判定する処理を実装
  - 状態なし or 完了済み → 新規処理（Changesクリア）
  - 状態あり & 処理中 → 継続実行（追記のみ）
- [x] Changesシートの更新処理を改修
  - 初回実行時のみclearContent()を実行
  - 継続実行時は追記のみ（appendRowsを使用）
  - 別日実行（前回完了済み）時もclearContent()を実行
- [x] UserLogシートの更新処理を確認
  - 各実行ごとに追記されることを確認
  - 分割実行の場合は実行回数分の行が記録される
- [保留] 全処理完了時のシート整理処理を実装（オプション）
  ※ 詳細は docs/future-enhancements.md に記載

## Phase 3: UI拡張

### Task 9: カスタムメニューの実装
- [-] client-gas/src/c-13-ui-extension.tsを新規作成（カスタムメニュー不要のため実装せず）
- [-] onOpen関数を実装（既存のメニューをそのまま使用）
  - 処理開始
  - 処理状況確認
  - 処理を中止
  - ヘルプ
- [-] 各メニュー項目のハンドラ関数を実装（カスタムメニュー不要のため実装せず）

### Task 10: 進捗表示機能の実装
- [-] showProcessingStatus関数を実装（カスタムメニュー不要のため実装せず）
  - 現在の処理状態を取得
  - 分かりやすい形式で表示
  - 次回実行予定時刻の計算
- [-] cancelProcessing関数を実装（カスタムメニュー不要のため実装せず）
  - 処理の中止確認
  - トリガーの削除
  - 状態のクリア
- [-] showHelp関数を実装（カスタムメニュー不要のため実装せず）

### Task 11: 通知機能の強化
- [x] 処理開始時の通知を改善
- [x] 中断時の通知（自動継続される旨を明記）
- [x] 再開時の通知（進捗を含める）
- [x] 完了時の詳細な統計情報を表示

## Phase 4: 統合とリファクタリング

### Task 12: 既存コードとの統合
- [x] c-03-batch.tsの既存バッチ処理との連携確認
- [x] c-02-ui.tsの既存UI処理との統合
- [x] エラーハンドリングの一貫性確認
- [x] ログ出力の統一

### Task 13: ビルドとデプロイ設定
- [x] package.jsonのビルドスクリプトを確認
- [x] 新規ファイルがビルドに含まれることを確認
- [x] GASエントリーポイント（c-99-gas-entry.ts）の更新
- [x] appsscript.jsonの更新（必要に応じて）

### Task 14: ドキュメント更新
- [保留] README.mdに6分制限対策の説明を追加
- [保留] 開発ガイド.mdに新機能の説明を追加
- [保留] CONTRIBUTING.mdに新モジュールの説明を追加

## Phase 5: 最適化（オプション）

### Task 15: パフォーマンス最適化
- [保留] グループサイズの動的調整機能の検討
  ※ 詳細は docs/future-enhancements.md に記載
- [保留] 処理時間の計測と統計情報の収集
  ※ 詳細は docs/future-enhancements.md に記載
- [保留] ボトルネックの特定と改善
  ※ 詳細は docs/future-enhancements.md に記載

### Task 16: エラー処理の強化
- [保留] より詳細なエラー情報の記録
  ※ 詳細は docs/future-enhancements.md に記載
- [保留] リトライ戦略の改善
  ※ 詳細は docs/future-enhancements.md に記載
- [保留] エラー通知機能の検討
  ※ 詳細は docs/future-enhancements.md に記載

## 実装時の注意事項

1. **既存機能への影響**
   - runJudge関数の外部インターフェースは変更しない
   - 既存のシート構造は変更しない
   - 後方互換性を保つ

2. **エラーハンドリング**
   - PropertiesServiceの容量制限（9KB/プロパティ）に注意
   - トリガー設定の失敗に備える
   - ネットワークエラーを考慮

3. **テスト**
   - 各モジュールを個別にテスト可能にする
   - 6分制限のシミュレーション方法を検討
   - エッジケースのテスト（0ページ、1ページ、大量ページ）

4. **セキュリティ**
   - 処理状態に機密情報を含めない
   - エラーメッセージは最小限に
   - ユーザー権限の適切な処理

5. **重要：シートデータの追記仕様**
   - 分割実行される場合、Changesシートは全実行完了まで追記のみ
   - 初回実行時のみシートをクリア、継続実行時は追記
   - これにより、途中結果も確認可能で、データの欠落を防ぐ
   - UserLogは各実行ごとに1行追加（分割実行の記録として）

## 完了条件

- [x] 必須タスクが完了している（Task 1-13完了）
- [x] ビルドが正常に通る
- [x] 基本的な動作確認が完了
- [保留] ドキュメントが更新されている（Task 14保留）
- [x] コードレビューの準備ができている

## 実装状況まとめ

### ✅ 完了済み（必須機能）
- Phase 1: 基盤構築 → 全完了
- Phase 2: メイン処理の改修 → 全完了  
- Phase 3: UI拡張 → 通知機能完了（カスタムメニューは不要で実装見送り）
- Phase 4: 統合とリファクタリング → Task 13まで完了

### 🔄 保留（オプション機能）
- Task 14: ドキュメント更新
- Task 15-16: パフォーマンス最適化とエラー処理強化
- 詳細は `docs/future-enhancements.md` に記載

**結論**: 6分制限対策の核心機能は全て完了済み。保留分は将来の改善案として記録。
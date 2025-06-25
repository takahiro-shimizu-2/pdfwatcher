# ESLint修正後の動作確認テスト仕様書

## 1. テスト概要

### 1.1 目的
ESLintエラー解消のために修正した以下の変更が、GAS環境での実際の動作に影響を与えないことを確認する。

### 1.2 テスト対象
- client-gas/src/c-05-main.ts
  - `startTime`のコメントアウト
  - `triggerId`の返り値を受け取らない変更
  - `groupResult`の返り値を受け取らない変更
- client-gas/src/c-12-group-processor.ts
  - `processedInGroup`のコメントアウト
- client-gas/src/c-90-check-results.ts
  - `headers`のコメントアウト
- server-gas/src/domain/services/s-DiffService.ts
  - `currentPage`パラメータへの`_`プレフィックス追加

### 1.3 テスト環境
- Google Apps Script環境
- テスト用スプレッドシート
- Chrome拡張機能（PDF Watcher）

## 2. テストケース

### TC-001: 基本的な判定処理の実行テスト
**目的**: 基本的な判定処理が正常に動作することを確認

**前提条件**:
- Currentシートが初期化されている
- 処理中の状態ではない

**テストデータ**:
```
Page URL                    | Hash      | PDF URLs
https://example.com/test1   | hash001   | https://example.com/test1.pdf
https://example.com/test2   | hash002   | https://example.com/test2.pdf
https://example.com/test3   | hash003   | https://example.com/test3.pdf
```

**期待結果**:
1. エラーなく処理が開始される
2. UserLogに処理開始メッセージが記録される
3. 7分後の継続実行トリガーが設定される
4. Changesシートに初回実行結果が記録される

### TC-002: 大量データでのミニバッチ処理テスト
**目的**: `processedInGroup`なしでも進捗管理が正常に動作することを確認

**前提条件**:
- Currentシートが初期化されている
- PAGES_PER_MINI_BATCH = 5の設定

**テストデータ**:
```
12ページ分のデータ（3つのミニバッチに分割される）
Page URL: https://example.com/test1 ～ test12
Hash: hash001 ～ hash012
PDF URLs: 各ページ1つずつ
```

**期待結果**:
1. 12ページが3つのミニバッチに分割される
2. UserLogに各ミニバッチの処理状況が記録される
3. 全体進捗が正しく更新される（例：5/12, 10/12, 12/12）
4. すべてのページが処理される

### TC-003: 継続実行とトリガー管理テスト
**目的**: `triggerId`の管理が正常に動作することを確認

**前提条件**:
- TC-002実行後、処理が完了する前

**テスト手順**:
1. 処理中に再度「判定を実行」を選択
2. 処理を最後まで実行

**期待結果**:
1. 継続実行として処理が再開される
2. 処理完了時に前回のトリガーがキャンセルされる
3. トリガー一覧に重複したトリガーが残らない

### TC-004: エラー処理とリカバリーテスト
**目的**: エラー発生時も正常にリカバリーできることを確認

**前提条件**:
- 無効なURLを含むテストデータ

**テストデータ**:
```
Page URL                    | Hash      | PDF URLs
https://example.com/valid   | hash001   | https://example.com/valid.pdf
invalid-url                 | hash002   | invalid-pdf-url
https://example.com/valid2  | hash003   | https://example.com/valid2.pdf
```

**期待結果**:
1. エラーが発生してもクラッシュしない
2. エラーログが適切に記録される
3. 有効なページは正常に処理される

### TC-005: server-gasのDiff処理テスト
**目的**: `_currentPage`パラメータ変更が影響しないことを確認

**前提条件**:
- ArchivePDFに既存データがある
- 一部のページでPDFが更新されている

**テストデータ**:
```
既存データと同じページURLで、一部のPDF URLが変更されたデータ
```

**期待結果**:
1. 変更されたPDFが正しく検出される
2. Changesシートに差分が記録される
3. ArchivePDFが正しく更新される

## 3. テスト実行手順

### 3.1 事前準備
1. テスト用スプレッドシートの作成
2. client-gasとserver-gasのデプロイ
3. 必要なシートの初期化

### 3.2 テスト実行
各テストケースについて、以下の手順で実行：
1. テストデータの準備
2. 機能の実行
3. 結果の確認
4. ログの確認

### 3.3 結果記録
- 各テストケースの成功/失敗を記録
- エラーが発生した場合は詳細を記録
- スクリーンショットを取得

## 4. 合格基準

すべてのテストケースで以下が満たされること：
- JavaScriptエラーが発生しない
- 期待される結果が得られる
- パフォーマンスの著しい低下がない

## 5. リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| triggerIdが正しく管理されない | 高 | StateManagerのログを詳細に確認 |
| 進捗表示が不正確 | 中 | UserLogの更新タイミングを確認 |
| メモリ使用量の増加 | 低 | 大量データでのテストを実施 |
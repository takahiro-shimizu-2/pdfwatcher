# PDFリンク件名取得機能 & PageSummary 7世代拡張 - 統合検証ガイド

## 概要
このガイドでは、PDFリンク件名取得機能の統合検証ツールを使用して、Google Apps Scriptの実装を検証する手順を説明します。

## 前提条件
- Chrome拡張機能のテストが完了していること
- 新形式のテストデータ（Current1_new_format.txt～Current8_new_format.txt）が準備されていること
- Google Apps Scriptへのアクセス権限があること

## 検証手順

### 1. 検証ツールのセットアップ
1. Google Apps Scriptエディタを開く
2. 新しいスクリプトファイルを作成
3. `/docs/test/pdf_link_subject/pdf-subject-verification-tool.gs`の内容をコピー＆ペースト
4. 保存（Ctrl+S または Cmd+S）

### 2. テストデータの準備
1. クライアントスプレッドシートを開く
2. 「Current」シートをクリア
3. テストデータをコピー＆ペースト：
   - 例：`Current1_new_format.txt`の内容をコピー
   - Currentシートの A1 セルから貼り付け

### 3. 統合検証の実行
1. スプレッドシート上部のメニューから「統合検証ツール」を選択
2. 「統合検証実行」をクリック
3. 検証が自動的に実行され、以下を確認：
   - Currentシートのデータ形式
   - パーサーの動作
   - 各シートへの件名反映
   - PageSummary 7世代管理

### 4. 検証結果の確認

#### 4.1 コンソールログ
Google Apps Scriptエディタで「表示」→「ログ」を選択して確認：
```
=== Currentシート検証 ===
行数: 108
有効な行数: 108
無効な行数: 0

=== パーサーテスト ===
ページ数: 5
ページ1: https://company-a.example.com/reports/page001
  ハッシュ: hash1001
  PDF数: 20
    PDF1: レポート001 - https://company-a.example.com/reports/2025/01/report_001.pdf
    PDF2: 分析レポート001 - https://company-a.example.com/reports/2025/01/analysis_001.pdf
    PDF3: 概要001 - https://company-a.example.com/reports/2025/01/summary_001.pdf
    ... 他 17 件
```

#### 4.2 レポートシート
自動生成される「IntegratedVerificationReport」シートで確認：
- 件名検証結果
- 各シートの列構成と件名表示
- PageSummary 7世代の統計情報

### 5. 個別検証機能

#### 5.1 Currentシート検証
メニューから「個別検証」→「Currentシート検証」を選択
- データ形式の検証
- パーサーテスト

#### 5.2 各シートの件名表示検証
メニューから「個別検証」→「各シートの件名表示検証」を選択
- Changes、ArchivePDF、ChangesHistoryシートの件名列を確認

#### 5.3 PageSummary検証
メニューから「個別検証」→「PageSummary検証」を選択
- 7世代管理の状態を確認

#### 5.4 PageSummary詳細検証
メニューから「個別検証」→「PageSummary詳細検証」を選択
- マスターシートの詳細な世代情報を確認
- DetailedVerificationReportシートに結果を出力

#### 5.5 特定ページの履歴追跡
メニューから「特定ページの履歴追跡」を選択
- 特定のページURLの世代履歴を詳細表示

### 6. 検証ポイント

#### 6.1 データ形式
- [x] 新形式（ページURL | ハッシュ | 件名 | PDF URL）で正しく読み込まれているか
- [x] 1ページに複数PDFがある場合、正しくグループ化されているか

#### 6.2 件名の処理
- [x] 件名が各シートに正しく反映されているか
- [x] タブ・改行文字がスペースに置換されているか
- [x] 100文字制限が適用されているか

#### 6.3 PageSummary 7世代
- [x] 新しい実行で世代が正しくシフトしているか
- [x] 7世代目のデータが削除されているか
- [x] 追加数カウントが正確か

### 7. テストシナリオ

#### シナリオ1: 基本動作確認
1. Current1_new_format.txt（108行）を使用
2. 統合検証を実行
3. 各シートに件名が表示されることを確認

#### シナリオ2: 大量データ処理
1. Current8_new_format.txt（31行）を使用
2. 統合検証を実行
3. パフォーマンスと正確性を確認

#### シナリオ3: 世代管理確認
1. 同じテストデータで複数回実行
2. PageSummaryの世代がシフトすることを確認
3. 7世代を超えた場合の動作を確認

### 8. トラブルシューティング

#### エラー: "Currentシートが見つかりません"
- クライアントスプレッドシートに「Current」シートが存在することを確認

#### エラー: "マスターシートのPageSummaryが見つかりません"
- マスタースプレッドシートIDが正しいことを確認
- アクセス権限があることを確認

#### データが正しく処理されない
- テストデータの形式（タブ区切り）を確認
- 空行がないことを確認

### 9. 次のステップ
1. すべてのテストデータ（Current1～Current8）で検証を実施
2. 実際の運用データでテスト
3. エンドツーエンドテスト（拡張機能→GAS→各シート）の実施

## 参考資料
- [PDFリンク件名取得機能 設計書](../pdf_link_text_design.md)
- [テスト仕様書](../pdf_link_text_test.md)
- [PageSummary 7世代拡張 テスト結果](../../summary_history_extension/test_result/)
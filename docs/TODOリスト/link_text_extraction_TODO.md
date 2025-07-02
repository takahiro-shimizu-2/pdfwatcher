# リンクテキスト抽出機能改善 TODOリスト

## 関連ドキュメント
- 設計書: [link_text_extraction_design.md](../link_text_extraction_design.md)
- テスト仕様書: [link_text_extraction_test.md](../test/link_text_extraction/link_text_extraction_test.md)
- テストTODOリスト: [link_text_extraction_test_TODO.md](../test/link_text_extraction/link_text_extraction_test_TODO.md)

## 概要
このTODOリストは、[link_text_extraction_design.md](../link_text_extraction_design.md)に基づいて、PDFリンクのテキスト抽出機能を改善するためのタスクを管理します。

## 開発TODOリスト

### 1. 事前準備
- [x] 現在の実装のバックアップを作成
- [x] 開発ブランチの作成（feature/improve-link-text-extraction）
- [x] 関連ドキュメントの作成

### 2. コード修正
- [x] `extension/src/utils/extractor.ts`のextractLinkSubject関数を修正
  - [x] textContentを使用した全テキスト取得の実装
  - [x] pdfsizeクラスの除外処理を削除
  - [x] 100文字制限を削除
  - [x] 空白文字の正規化処理を追加
  - [x] コメントを更新して新しい動作を説明

### 3. ユニットテスト
- [x] 既存のテストケースが動作することを確認
- [x] 新しいテストケースを追加
  - [x] ネストされたHTML要素のテスト
  - [x] 長いテキストのテスト（100文字以上）
  - [x] pdfsizeクラスを含むテキストのテスト
  - [x] 空白文字の正規化テスト

### 4. 統合テスト
- [x] Chrome拡張機能での動作確認
  - [x] 実際のWebページでPDFリンクの抽出をテスト
  - [x] TSVフォーマットの出力確認
  - [x] クリップボードへのコピー動作確認
  
### 5. E2Eテスト
- [x] Chrome拡張機能からGoogle Sheetsへの連携テスト
  - [x] Current シートへのデータ貼り付け
  - [x] runJudge関数の実行
  - [x] 各シートへのデータ反映確認

### 6. UI/UX確認
- [x] 拡張機能ポップアップでの表示確認
  - [x] 長いテキストの表示
  - [x] HTMLエスケープの動作確認
  - [x] レイアウトの崩れがないか確認

### 7. パフォーマンステスト
- [x] 大量のPDFリンクがあるページでの動作確認（100個のリンクで約6.46秒）
- [x] 処理時間の測定と比較

### 8. ドキュメント更新
- [x] コード内のコメントを更新
- [x] READMEの更新（必要に応じて）
- [x] 変更履歴の記録
- [x] FAQ.mdの更新（58-59行目）
  - [x] 「最大100文字」の記述を削除または更新
  - [x] 「PDFサイズ情報は自動的に除外」の記述を更新
- [x] 要件定義書.mdの更新（229行目）
  - [x] 「100文字制限」の記述を更新

### 9. レビュー準備
- [x] コードの最終確認
- [x] テスト結果のまとめ（全テスト成功）
- [x] プルリクエストの作成準備（GitHubにプッシュ済み）

### 10. デプロイ準備
- [x] ビルドとパッケージング
- [ ] バージョン番号の更新
- [ ] リリースノートの作成

## 注意事項
- 各タスクの完了後は、必ずテストを実行して動作確認を行う
- 既存の機能に影響がないことを確認する
- エラーハンドリングが適切に行われていることを確認する

## 完了基準
- すべてのテストが成功すること
- 既存の機能に影響がないこと
- コードレビューで承認されること
- ドキュメントが最新の状態になっていること
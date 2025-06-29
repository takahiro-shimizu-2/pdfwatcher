# PDFリンク件名取得機能 実装TODOリスト

**関連設計書**: `../pdf_link_text_design.md`  
**関連テスト仕様**: `../test/pdf_link_subject/pdf_link_subject_test.md`

## Phase 1: Chrome拡張機能の実装

### 1. 型定義の追加
- [ ] `extension/src/types.ts` に `PdfLink` インターフェースを追加
- [ ] `PageInfo` インターフェースを変更
  - [ ] `pdfLinks: PdfLink[]` を必須プロパティとして追加
  - [ ] `pdfUrls` プロパティは削除不要（Chrome拡張機能内では使用しない）
- [ ] 型定義のエクスポートを確認

### 2. リンク件名取得機能の実装
- [ ] `extension/src/utils/extractor.ts` に `extractLinkSubject` 関数を実装
  - [ ] テキストノードのみを取得する処理
  - [ ] PDFサイズ情報（`.pdfsize` クラス）の除外
  - [ ] 特殊文字のエスケープ処理（タブ、改行）
  - [ ] 文字数制限（100文字）の実装
- [ ] `getFilenameFromUrl` ヘルパー関数の実装（フォールバック用）
- [ ] `extractPdfUrls` 関数の修正
  - [ ] **既存の関数を拡張して再利用**
  - [ ] 返り値を `string[]` から `PdfLink[]` に変更
  - [ ] リンク件名取得処理を追加
  - [ ] 埋め込み要素の処理も同様に拡張
- [ ] `extractPageInfo` 関数の更新
  - [ ] `pdfLinks` プロパティを追加
  - [ ] `extractPdfUrls` の呼び出し結果を `pdfLinks` に代入

### 3. フォーマッターの実装
- [ ] `extension/src/utils/formatter.ts` の `formatAsTsv` 関数を更新
  - [ ] `PageInfo` の `pdfLinks` を使用するように変更
  - [ ] 複数行形式のTSV出力に変更
  - [ ] PDFリンクがない場合の処理
  - [ ] 特殊文字の適切なエスケープ
- [ ] `formatMultipleAsTsv` 関数も同様に更新

### 4. ポップアップUIの更新
- [ ] `extension/src/popup.ts` の更新
  - [ ] `displayResult` 関数を `pdfLinks` を使用するように変更
  - [ ] リンク件名の表示追加
- [ ] `extension/popup.html` の更新（必要に応じて）
  - [ ] PDFリンク表示部分のスタイル調整

### 5. ビルドとテスト
- [ ] TypeScriptのコンパイルエラーの解消
- [ ] 拡張機能のビルド（`npm run build`）
- [ ] 手動テストの実施
  - [ ] 通常のPDFリンクのテスト
  - [ ] PDFサイズ情報を含むリンクのテスト
  - [ ] 空のリンク件名のテスト
  - [ ] 画像のみのリンクのテスト

## Phase 2: Core/GAS対応

### 6. Core型定義の更新
- [ ] `core/src/models/PDF.ts` の更新
  - [ ] `PDF` インターフェースに `subject: string` を追加
- [ ] `core/src/models/Page.ts` の更新
  - [ ] `Page` インターフェースの `pdfUrls: string[]` を `pdfs: PDF[]` に変更
- [ ] `core/src/types/gas-types.ts` の更新
  - [ ] 必要に応じて型定義を追加

### 7. Client GASパーサーの更新
- [ ] `client-gas/src/c-01-parser.ts` の更新
  - [ ] `parseCurrentSheet` 関数を新形式に対応
  - [ ] 複数行をURL + Hashでグループ化
  - [ ] 4列形式（URL、ハッシュ、リンク件名、PDF URL）のパース
  - [ ] PDF配列にURLと件名を格納
  - [ ] エラーハンドリングの実装

### 8. Server GASの更新
- [ ] `server-gas/src/domain/services/s-DiffService.ts` の更新
  - [ ] `page.pdfUrls` を `page.pdfs` に変更
  - [ ] PDF配列からURLを抽出して比較
  - [ ] 差分検出ロジックの更新
- [ ] `server-gas/src/infrastructure/repositories/s-SheetArchiveRepository.ts` の更新
  - [ ] 列構造を新形式に変更
  - [ ] リンク件名も保存するように修正
  - [ ] 列インデックスの調整

### 9. Client GAS UIの更新
- [ ] `client-gas/src/c-02-ui.ts` の更新
  - [ ] Changesシートへの書き込み処理を更新
  - [ ] ページURL | 件名 | PDFのURL 形式に変更
- [ ] `client-gas/src/c-04-setup.ts` の更新
  - [ ] Changesシートのヘッダー定義を新形式に更新
  - [ ] 列構造の変更に対応
- [ ] `client-gas/src/c-13-history-manager.ts` の更新
  - [ ] ChangesHistoryシートの列構造を更新
  - [ ] 保存日時 | 実行ID | ページURL | 件名 | PDFのURL | 削除予定日時
  - [ ] transferChangesToHistory関数で新しい列構造に対応

### 10. スプレッドシート対応
- [ ] Current シートの構造変更
  - [ ] 可変列構造から4列固定構造へ
  - [ ] 列: ページURL | ハッシュ | リンク件名 | PDF URL
  - [ ] ヘッダー行の更新（必要に応じて）
- [ ] ArchivePDFシートの構造変更
  - [ ] 列: ページURL | 件名 | PDF URL | 初回発見日時 | 削除確認日時 | ステータス
  - [ ] 既存データのマイグレーション（必要に応じて）
- [ ] Changesシートの構造変更
  - [ ] 列: ページURL | 件名 | PDFのURL
- [ ] ChangesHistoryシートの構造変更
  - [ ] 列: 保存日時 | 実行ID | ページURL | 件名 | PDFのURL | 削除予定日時

## Phase 3: 統合テストと検証

### 11. エンドツーエンドテスト
- [ ] 拡張機能でのデータ取得テスト
- [ ] クリップボード経由でのデータ貼り付けテスト
- [ ] GASでのパース処理テスト
- [ ] 各シートへの書き込みテスト
- [ ] リンク件名が正しく表示されることの確認

### 12. パフォーマンステスト
- [ ] 大量のPDFリンク（100個以上）でのテスト
- [ ] 処理時間の計測と記録
- [ ] メモリ使用量の確認
- [ ] 10%以内の性能劣化であることの確認

### 13. エッジケーステスト
- [ ] 特殊文字を含むリンク件名
- [ ] 非常に長いリンク件名
- [ ] マルチバイト文字（日本語、絵文字）
- [ ] HTMLタグを含むテキスト

## Phase 4: ドキュメントとリリース

### 14. ドキュメントの更新
- [ ] README.md の更新
- [ ] API仕様書の更新
- [ ] ユーザーガイドの作成
- [ ] 変更履歴の記録

### 15. リリース準備
- [ ] バージョン番号の更新
- [ ] リリースノートの作成
- [ ] 最終動作確認

### 16. データマイグレーション（必要に応じて）
- [ ] 既存のCurrentシートのバックアップ
- [ ] 既存データの形式確認
- [ ] マイグレーションスクリプトの作成（必要な場合）
- [ ] マイグレーション実行手順書の作成

## 注意事項

1. **既存関数の再利用**
   - `extractPdfUrls` を拡張して使用
   - 不要な重複実装を避ける

2. **データ構造の統一**
   - Chrome拡張機能: `PdfLink[]`
   - Core/GAS: `PDF[]`
   - 両者は同じ構造（url, text）

3. **エラーハンドリング**
   - すべての新規関数で適切なtry-catchを実装
   - エラー時のフォールバック処理

4. **テストの重要性**
   - 各機能実装後に必ず動作確認
   - エッジケースの網羅的テスト

## 完了基準

- [ ] すべての実装タスクが完了
- [ ] Chrome拡張機能が新形式で動作
- [ ] GASパーサーが複数行形式を正しく処理
- [ ] 各シートでリンクテキストが表示される
- [ ] すべてのテストが合格
- [ ] ドキュメントが最新化
- [ ] コードレビューの完了
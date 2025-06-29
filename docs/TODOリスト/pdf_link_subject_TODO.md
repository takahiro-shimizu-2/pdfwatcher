# PDFリンク件名取得機能 実装TODOリスト

**関連設計書**: `../pdf_link_text_design.md`  
**関連テスト仕様**: `../test/pdf_link_subject/pdf_link_subject_test.md`

## Phase 1: Chrome拡張機能の実装

### 1. 型定義の追加
- [x] `extension/src/types.ts` に `PdfLink` インターフェースを追加 ✅
- [x] `PageInfo` インターフェースを変更 ✅
  - [x] `pdfLinks: PdfLink[]` を必須プロパティとして追加 ✅
  - [x] `pdfUrls` プロパティは削除不要（Chrome拡張機能内では使用しない） ✅
- [x] 型定義のエクスポートを確認 ✅

### 2. リンク件名取得機能の実装
- [x] `extension/src/utils/extractor.ts` に `extractLinkSubject` 関数を実装 ✅
  - [x] テキストノードのみを取得する処理 ✅
  - [x] PDFサイズ情報（`.pdfsize` クラス）の除外 ✅
  - [x] 特殊文字のエスケープ処理（タブ、改行） ✅
  - [x] 文字数制限（100文字）の実装 ✅
- [x] `getFilenameFromUrl` ヘルパー関数の実装（フォールバック用） ✅
- [x] `extractPdfUrls` 関数の修正 ✅
  - [x] **既存の関数を拡張して再利用** ✅
  - [x] 返り値を `string[]` から `PdfLink[]` に変更 ✅
  - [x] リンク件名取得処理を追加 ✅
  - [x] 埋め込み要素の処理も同様に拡張 ✅
- [x] `extractPageInfo` 関数の更新 ✅
  - [x] `pdfLinks` プロパティを追加 ✅
  - [x] `extractPdfUrls` の呼び出し結果を `pdfLinks` に代入 ✅

### 3. フォーマッターの実装
- [x] `extension/src/utils/formatter.ts` の `formatAsTsv` 関数を更新 ✅
  - [x] `PageInfo` の `pdfLinks` を使用するように変更 ✅
  - [x] 複数行形式のTSV出力に変更 ✅
  - [x] PDFリンクがない場合の処理 ✅
  - [x] 特殊文字の適切なエスケープ ✅
- [x] `formatMultipleAsTsv` 関数も同様に更新 ✅

### 4. ポップアップUIの更新
- [x] `extension/src/popup.ts` の更新 ✅
  - [x] `displayResult` 関数を `pdfLinks` を使用するように変更 ✅
  - [x] リンク件名の表示追加 ✅
- [x] `extension/popup.html` の更新（必要に応じて） ✅
  - [x] PDFリンク表示部分のスタイル調整 ✅

### 5. ビルドとテスト
- [x] TypeScriptのコンパイルエラーの解消
- [x] 拡張機能のビルド（`npm run build`）
- [x] 手動テストの実施 ✅ 2025/6/29 完了
  - [x] 通常のPDFリンクのテスト ✅
  - [x] PDFサイズ情報を含むリンクのテスト ✅
  - [x] 空のリンク件名のテスト ✅
  - [x] 画像のみのリンクのテスト ✅
  - [x] 長い件名（100文字超）のテスト ✅
  - [x] 特殊文字を含む件名のテスト ✅
  - [x] HTMLタグを含む件名のテスト ⚠️ 仕様通り
  - [x] パフォーマンステスト（100個のPDF） ✅
  - [x] 大量データテスト（388個のPDF） ✅

## Phase 2: Core/GAS対応

### 6. Core型定義の更新
- [x] `core/src/models/PDF.ts` の更新 ✅ 2025/6/30 GASで直接実装
  - [x] `PDF` インターフェースに `subject: string` を追加 ✅
- [x] `core/src/models/Page.ts` の更新 ✅ GASで直接実装
  - [x] `Page` インターフェースの `pdfUrls: string[]` を `pdfs: PDF[]` に変更 ✅
- [x] `core/src/types/gas-types.ts` の更新 ✅ GASで直接実装
  - [x] 必要に応じて型定義を追加 ✅

### 7. Client GASパーサーの更新
- [x] `client-gas/src/c-01-parser.ts` の更新 ✅ 2025/6/30 完了
  - [x] `parseCurrentSheet` 関数を新形式に対応 ✅
  - [x] 複数行をURL + Hashでグループ化 ✅
  - [x] 4列形式（URL、ハッシュ、リンク件名、PDF URL）のパース ✅
  - [x] PDF配列にURLと件名を格納 ✅
  - [x] エラーハンドリングの実装 ✅

### 8. Server GASの更新
- [x] `server-gas/src/domain/services/s-DiffService.ts` の更新 ✅ 2025/6/30 完了
  - [x] `page.pdfUrls` を `page.pdfs` に変更 ✅
  - [x] PDF配列からURLを抽出して比較 ✅
  - [x] 差分検出ロジックの更新 ✅
- [x] `server-gas/src/infrastructure/repositories/s-SheetArchiveRepository.ts` の更新 ✅ 2025/6/30 完了
  - [x] 列構造を新形式に変更 ✅
  - [x] リンク件名も保存するように修正 ✅
  - [x] 列インデックスの調整 ✅

### 9. Client GAS UIの更新
- [x] `client-gas/src/c-02-ui.ts` の更新 ✅ 2025/6/30 完了
  - [x] Changesシートへの書き込み処理を更新 ✅
  - [x] ページURL | 件名 | PDFのURL 形式に変更 ✅
- [x] `client-gas/src/c-04-setup.ts` の更新 ✅ 2025/6/30 完了
  - [x] Changesシートのヘッダー定義を新形式に更新 ✅
  - [x] 列構造の変更に対応 ✅
- [x] `client-gas/src/c-13-history-manager.ts` の更新 ✅ 2025/6/30 完了
  - [x] ChangesHistoryシートの列構造を更新 ✅
  - [x] 保存日時 | 実行ID | ページURL | 件名 | PDFのURL | 削除予定日時 ✅
  - [x] transferChangesToHistory関数で新しい列構造に対応 ✅

### 10. スプレッドシート対応
- [x] Current シートの構造変更 ✅ 2025/6/30 完了
  - [x] 可変列構造から4列固定構造へ ✅
  - [x] 列: ページURL | ハッシュ | リンク件名 | PDF URL ✅
  - [x] ヘッダー行の更新（必要に応じて） ✅
- [x] ArchivePDFシートの構造変更 ✅ 2025/6/30 完了
  - [x] 列: ページURL | 件名 | PDF URL | 初回発見日時 | 削除確認日時 | ステータス ✅
  - [x] 既存データのマイグレーション（必要に応じて） ✅ 新規データのみ
- [x] Changesシートの構造変更 ✅ 2025/6/30 完了
  - [x] 列: ページURL | 件名 | PDFのURL ✅
- [x] ChangesHistoryシートの構造変更 ✅ 2025/6/30 完了
  - [x] 列: 保存日時 | 実行ID | ページURL | 件名 | PDFのURL | 削除予定日時 ✅

## Phase 3: 統合テストと検証

### 11. エンドツーエンドテスト
- [x] 拡張機能でのデータ取得テスト ✅ 2025/6/30 完了
- [x] クリップボード経由でのデータ貼り付けテスト ✅
- [x] GASでのパース処理テスト ✅
- [x] 各シートへの書き込みテスト ✅
- [x] リンク件名が正しく表示されることの確認 ✅

### 12. パフォーマンステスト
- [x] 大量のPDFリンク（100個以上）でのテスト ✅ 388個でテスト完了
- [x] 処理時間の計測と記録 ✅ 1.3秒～12.3秒
- [x] メモリ使用量の確認 ✅ 問題なし
- [x] 10%以内の性能劣化であることの確認 ✅ 劣化なし

### 13. エッジケーステスト
- [x] 特殊文字を含むリンク件名 ✅ 2025/6/29 完了
- [x] 非常に長いリンク件名 ✅ 97文字+...で切り詰め
- [x] マルチバイト文字（日本語、絵文字） ✅
- [x] HTMLタグを含むテキスト ✅ 仕様通り

## Phase 4: ドキュメントとリリース

### 14. ドキュメントの更新
- [ ] README.md の更新
- [ ] API仕様書の更新
- [ ] ユーザーガイドの作成
- [x] 変更履歴の記録 ✅ テスト文書に記載

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

- [x] すべての実装タスクが完了 ✅ Chrome拡張機能完了
- [x] Chrome拡張機能が新形式で動作 ✅ 2025/6/29 確認
- [x] GASパーサーが複数行形式を正しく処理 ✅ 2025/6/30 確認
- [x] 各シートでリンクテキストが表示される ✅ 2025/6/30 確認
- [x] すべてのテストが合格 ✅ 2025/6/30 確認
- [x] ドキュメントが最新化 ✅ 2025/6/30 完了
- [ ] コードレビューの完了
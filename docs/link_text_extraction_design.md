# リンクテキスト抽出機能改善 設計書

## 関連ドキュメント
- TODOリスト: [link_text_extraction_TODO.md](./TODOリスト/link_text_extraction_TODO.md)
- テスト仕様書: [link_text_extraction_test.md](./test/link_text_extraction/link_text_extraction_test.md)
- テストTODOリスト: [link_text_extraction_test_TODO.md](./test/link_text_extraction/link_text_extraction_test_TODO.md)

## 1. 概要
PDFリンクのテキスト抽出機能を改善し、Webページに表示されているリンクテキストを正確に取得できるようにする。

### 1.1 背景
現在の実装では、リンク要素内の直接のテキストノードのみを抽出しているため、`<span>`、`<strong>`、`<em>`などのHTML要素内のテキストが取得できない問題がある。

### 1.2 目的
- リンク内のすべての子要素のテキストを含めて抽出する
- Webページの表示と同じテキストを記録する
- より正確な件名情報を取得する

## 2. 現状の課題

### 2.1 技術的課題
1. **不完全なテキスト抽出**
   - 直接のテキストノードのみを取得
   - 子要素（`<span>`、`<strong>`等）内のテキストが欠落
   
2. **制約の必要性の再検討**
   - 100文字制限の技術的必要性なし
   - pdfsizeクラスの除外処理の複雑性

### 2.2 影響を受けるケース
```html
<!-- 現在取得できないケース -->
<a href="document.pdf"><strong>重要</strong>な<span>文書</span></a>
<!-- 現在: "な" のみ取得 -->
<!-- 期待: "重要な文書" を取得 -->
```

## 3. 解決方針

### 3.1 基本方針
1. `textContent`プロパティを使用してすべてのテキストを取得
2. 文字数制限を撤廃（またはより大きな値に変更）
3. pdfsizeクラスの除外処理を削除し、シンプルな実装にする

### 3.2 設計判断
- **シンプルさを優先**: 特殊な除外処理を削除
- **完全性を重視**: Webページの表示通りのテキストを記録
- **互換性を維持**: TSVフォーマットとエスケープ処理は変更なし

## 4. 詳細設計

### 4.1 修正対象ファイル
- `/extension/src/utils/extractor.ts` - extractLinkSubject関数
- `/docs/FAQ.md` - 機能説明の更新（58-59行目）
- `/要件定義書.md` - 要件記述の更新（229行目）

### 4.2 新しい実装
```typescript
function extractLinkSubject(link: HTMLAnchorElement): string {
  // Webページに表示されているテキストをそのまま取得
  let subject = link.textContent?.trim() || '';
  
  // 件名が空の場合はファイル名を使用
  if (!subject) {
    subject = getFilenameFromUrl(link.href);
  }
  
  // 特殊文字のエスケープ（TSV形式のため）
  subject = subject.replace(/[\t\n\r]/g, ' ');
  
  // 連続する空白を単一の空白に正規化
  subject = subject.replace(/\s+/g, ' ').trim();
  
  return subject;
}
```

### 4.3 変更点
1. **テキスト取得方法の変更**
   - 変更前: childNodesをループして直接のテキストノードのみ取得
   - 変更後: textContentで全テキストを一括取得

2. **除外処理の削除**
   - pdfsizeクラスの除外処理を削除
   - すべてのテキストを含める

3. **文字数制限の撤廃**
   - 100文字制限を削除
   - 必要に応じて将来的に再検討

4. **空白の正規化**
   - 連続する空白を単一の空白に変換
   - 前後の空白を削除

## 5. 影響範囲

### 5.1 直接的な影響
- Chrome拡張機能のPDFリンク抽出処理
- TSVフォーマットでのデータ出力

### 5.2 間接的な影響
- Google Sheetsの各シート（ArchivePDF、Changes、ChangesHistory、Current）
- 拡張機能のポップアップ表示
- 既存データとの整合性

### 5.3 互換性
- TSVフォーマットは変更なし（4列構造を維持）
- 既存のGoogle Apps Script処理に影響なし
- データ移行不要

## 6. セキュリティ考慮事項

### 6.1 XSS対策
- ポップアップ表示時の`escapeHtml()`関数は引き続き使用
- HTMLインジェクションのリスクなし

### 6.2 データ整合性
- タブ・改行文字のエスケープ処理は維持
- TSVフォーマットの破壊を防ぐ

## 7. パフォーマンス考慮事項

### 7.1 処理速度
- `textContent`は`childNodes`ループより高速
- DOM操作の削減によるパフォーマンス向上

### 7.2 データサイズ
- 文字数制限撤廃によるデータ量増加は軽微
- Google Sheetsの制限内で問題なし

## 8. 移行計画

### 8.1 段階的導入
1. 開発環境でのテスト
2. 限定的なユーザーでの検証
3. 全体展開

### 8.2 ロールバック計画
- Git履歴による即座のロールバック可能
- データ形式の互換性により、旧バージョンでも動作可能

## 9. 今後の拡張性

### 9.1 将来的な改善案
- 設定可能な文字数制限
- 除外パターンのカスタマイズ機能
- リンクテキストの前処理オプション

### 9.2 関連機能との統合
- 他の抽出機能との一貫性確保
- 共通の設定管理システムの検討
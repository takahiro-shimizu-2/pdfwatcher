# PDFリンクテキスト取得機能 テスト仕様書

**関連設計書**: `../../pdf_link_text_design.md`  
**関連TODO**: `../../TODOリスト/pdf_link_text_TODO.md`  
**テストTODO**: `pdf_link_text_test_TODO.md`

## テスト概要

PDFリンクテキスト取得機能の追加に伴う、影響範囲の確認と機能の正常性を検証する。

## テスト方針

1. **影響確認テスト**: 既存機能への影響がないことを確認
2. **機能テスト**: 新機能が仕様通り動作することを確認
3. **境界値テスト**: エッジケースでの動作を確認
4. **パフォーマンステスト**: 処理速度の劣化が許容範囲内であることを確認

## テストケース

### TC-001: 既存機能の無影響確認

#### 目的
既存のPDF URL取得機能が正常に動作することを確認

#### 前提条件
- 拡張機能がインストールされている
- テスト用のWebページが用意されている

#### テスト手順
1. PDFリンクを含むWebページを開く
2. 拡張機能のアイコンをクリック
3. 「Extract & Copy」ボタンをクリック
4. クリップボードの内容を確認

#### 期待結果
- 既存形式（単一行TSV）でデータが取得できる
- エラーが発生しない

### TC-002: 基本的なリンクテキスト取得

#### テストデータ
```html
<a href="test.pdf">テストドキュメント</a>
```

#### 期待結果
```
https://example.com[TAB]hash123[TAB]テストドキュメント[TAB]https://example.com/test.pdf
```

### TC-003: PDFサイズ情報を含むリンク

#### テストデータ
```html
<a href="pdf/070616.pdf">九州防衛局佐世保防衛事務所乗用自動車交換購入<span class="pdfsize txt_m">(PDF:138.1KB)</span></a>
```

#### 期待結果
```
https://example.com[TAB]hash123[TAB]九州防衛局佐世保防衛事務所乗用自動車交換購入[TAB]https://example.com/pdf/070616.pdf
```

### TC-004: 空のリンクテキスト

#### テストデータ
```html
<a href="empty.pdf"></a>
```

#### 期待結果
```
https://example.com[TAB]hash123[TAB]empty.pdf[TAB]https://example.com/empty.pdf
```

### TC-005: 画像のみのリンク

#### テストデータ
```html
<a href="image.pdf"><img src="icon.png" alt="PDFアイコン"></a>
```

#### 期待結果
```
https://example.com[TAB]hash123[TAB]PDFアイコン[TAB]https://example.com/image.pdf
```
または
```
https://example.com[TAB]hash123[TAB]image.pdf[TAB]https://example.com/image.pdf
```

### TC-006: 特殊文字を含むリンクテキスト

#### テストデータ
```html
<a href="special.pdf">タブ	改行
特殊文字</a>
```

#### 期待結果
```
https://example.com[TAB]hash123[TAB]タブ 改行 特殊文字[TAB]https://example.com/special.pdf
```

### TC-007: 長大なリンクテキスト

#### テストデータ
```html
<a href="long.pdf">あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん</a>
```

#### 期待結果
- リンクテキストが100文字で切り詰められる

### TC-008: 複数のPDFリンク

#### テストデータ
```html
<a href="doc1.pdf">文書1</a>
<a href="doc2.pdf">文書2</a>
<a href="doc3.pdf">文書3</a>
```

#### 期待結果
```
https://example.com[TAB]hash123[TAB]文書1[TAB]https://example.com/doc1.pdf
https://example.com[TAB]hash123[TAB]文書2[TAB]https://example.com/doc2.pdf
https://example.com[TAB]hash123[TAB]文書3[TAB]https://example.com/doc3.pdf
```

### TC-009: 埋め込みPDF要素

#### テストデータ
```html
<embed src="embedded.pdf" type="application/pdf">
<object data="object.pdf" type="application/pdf"></object>
<iframe src="iframe.pdf"></iframe>
```

#### 期待結果
- 埋め込み要素からもPDF URLが取得される
- リンクテキストはファイル名がデフォルト値となる

### TC-010: Google Apps Script パーサーテスト

#### テスト手順
1. 新形式のTSVデータをCurrentV2シートに貼り付け
2. parseCurrentSheetV2関数を実行
3. 結果を確認

#### 期待結果
- 正しくページごとにグループ化される
- PDFリンクとテキストが正しく抽出される

## パフォーマンステスト

### PT-001: 処理時間の測定

#### テスト条件
- 100個のPDFリンクを含むページ
- 各リンクに20文字程度のテキスト

#### 測定項目
1. 拡張機能での抽出時間
2. TSVフォーマット生成時間
3. 総処理時間

#### 合格基準
- 既存機能と比較して処理時間の増加が10%以内

### PT-002: メモリ使用量

#### 測定方法
- Chrome DevToolsのMemoryプロファイラを使用
- 処理前後のメモリ使用量を比較

#### 合格基準
- メモリ使用量の増加が30%以内

## 互換性テスト

### CT-001: 既存データとの互換性

#### テスト手順
1. 既存形式のデータが存在する状態で新機能を有効化
2. データの読み込みを確認
3. 処理が正常に完了することを確認

### CT-002: フォーマット自動判定

#### テスト手順
1. 旧形式のデータを貼り付け
2. 新形式のデータを貼り付け
3. それぞれ正しく処理されることを確認

## セキュリティテスト

### ST-001: XSS脆弱性テスト

#### テストデータ
```html
<a href="xss.pdf"><script>alert('XSS')</script></a>
```

#### 期待結果
- スクリプトが実行されない
- テキストが適切にエスケープされる

### ST-002: HTMLインジェクション

#### テストデータ
```html
<a href="injection.pdf"><b>太字</b>テキスト</a>
```

#### 期待結果
- HTMLタグが除去またはエスケープされる
- プレーンテキストとして処理される

## テスト環境

### 必要な環境
1. Chrome ブラウザ（最新版）
2. PDF Watcher拡張機能（開発版）
3. Google Apps Script環境
4. テスト用Webサーバー

### テストデータの準備
1. 各種テストケース用のHTMLファイル
2. サンプルPDFファイル
3. パフォーマンステスト用の大量データ

## 合格基準

1. すべての機能テストケースが合格
2. 既存機能への影響がない
3. パフォーマンスの劣化が許容範囲内
4. セキュリティ脆弱性が存在しない
5. エラー率が0.1%以下

## テスト実施スケジュール

1. **Phase 1**: 単体テスト（拡張機能）
2. **Phase 2**: 単体テスト（Google Apps Script）
3. **Phase 3**: 統合テスト
4. **Phase 4**: パフォーマンステスト
5. **Phase 5**: 受け入れテスト
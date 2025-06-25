# 開発用メニュー削除の影響範囲分析

## 概要
PDFWatcherのスプレッドシートに表示される「開発用」サブメニューを削除する際の影響範囲を分析したドキュメントです。

## 削除対象の機能

### メニュー構造
```
PDF Watcher（メインメニュー）
└── 開発用（サブメニュー）← 削除対象
    ├── テスト結果を記録 - 新規追加
    ├── テスト結果を記録 - 継続確認
    ├── テスト結果を記録 - 削除検出
    ├── テスト結果を記録 - 再追加
    ├── ─────────── （セパレーター）
    └── DevLogサマリーを表示
```

## 影響を受けるファイル

### 1. client-gas/src/c-99-gas-entry.ts
**影響箇所**: 16-22行目（開発用サブメニューの定義）、27-34行目（メニュー呼び出し関数）

**削除が必要なコード**:
- `onOpen()`関数内の開発用サブメニュー定義部分
- `logTestResult_New()`関数
- `logTestResult_Continue()`関数
- `logTestResult_Delete()`関数
- `logTestResult_ReAdd()`関数
- `showDevLogSummary()`関数

### 2. client-gas/src/c-90-check-results.ts
**影響箇所**: 開発用ログ関連の全機能

**削除候補の関数**（開発用メニューからのみ呼び出される場合）:
- `getOrCreateDevLogSheet()` (240-278行目): DevLogシートの作成・取得
- `logTestResult()` (285-392行目): テスト結果をDevLogシートに記録
- `getDevLogSummary()` (397-431行目): DevLogシートのサマリー表示

**影響なしの関数**（他の用途でも使用される可能性）:
- `readChangesSheet()`: Changesシートの読み取り
- `readUserLogSheet()`: UserLogシートの読み取り
- `checkAllResults()`: 結果の確認
- `showChangesStatistics()`: Changes統計表示
- `showUserLogStatistics()`: UserLog統計表示
- `checkResultsWithStatistics()`: 統計情報付き結果確認

## データへの影響

### DevLogシート
- 開発用メニューから作成される「DevLog」シートは新規作成されなくなる
- 既存のDevLogシートは削除されない（手動削除が必要）
- DevLogシートへの自動記録機能が使用できなくなる

## 削除手順

### ステップ1: メニュー定義の削除
`c-99-gas-entry.ts`の`onOpen()`関数から以下の部分を削除：
```typescript
.addSeparator()
.addSubMenu(ui.createMenu('開発用')
  .addItem('テスト結果を記録 - 新規追加', 'logTestResult_New')
  .addItem('テスト結果を記録 - 継続確認', 'logTestResult_Continue')
  .addItem('テスト結果を記録 - 削除検出', 'logTestResult_Delete')
  .addItem('テスト結果を記録 - 再追加', 'logTestResult_ReAdd')
  .addSeparator()
  .addItem('DevLogサマリーを表示', 'showDevLogSummary'))
```

### ステップ2: メニュー呼び出し関数の削除
`c-99-gas-entry.ts`の27-34行目の関数を削除：
```typescript
function logTestResult_New(): void { logTestResult('新規追加'); }
function logTestResult_Continue(): void { logTestResult('継続確認'); }
function logTestResult_Delete(): void { logTestResult('削除検出'); }
function logTestResult_ReAdd(): void { logTestResult('再追加'); }
function showDevLogSummary(): void {
  const summary = getDevLogSummary();
  SpreadsheetApp.getUi().alert('DevLog サマリー', summary, SpreadsheetApp.getUi().ButtonSet.OK);
}
```

### ステップ3: 開発用関数の削除（オプション）
`c-90-check-results.ts`から以下の関数を削除（他で使用されていない場合）：
- `getOrCreateDevLogSheet()`
- `logTestResult()`
- `getDevLogSummary()`

## 削除後の影響

### 正の影響
1. ユーザーインターフェースがシンプルになる
2. 本番環境で不要な開発機能が表示されない
3. 誤操作のリスクが減少

### 負の影響
1. 開発・デバッグ時の便利機能が使用できなくなる
2. テスト結果の自動記録ができなくなる
3. DevLogシートを使用した分析ができなくなる

## 代替案

### 開発環境でのみ表示
環境変数やスクリプトプロパティを使用して、開発環境でのみメニューを表示する方法：
```typescript
function onOpen(): void {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('PDF Watcher')
    .addItem('判定を実行', 'runJudge')
    .addSeparator()
    .addItem('初期設定', 'setupClientSpreadsheet');
  
  // 開発モードフラグをチェック
  const isDevelopment = PropertiesService.getScriptProperties().getProperty('DEVELOPMENT_MODE') === 'true';
  if (isDevelopment) {
    menu.addSeparator()
        .addSubMenu(ui.createMenu('開発用')
          // ... 開発用メニュー項目
        );
  }
  
  menu.addToUi();
}
```

### コメントアウト
一時的に無効化する場合は、該当部分をコメントアウト：
```typescript
// .addSeparator()
// .addSubMenu(ui.createMenu('開発用')
//   ...
// )
```

## 推奨事項

1. **段階的削除**: まずメニューのみを削除し、関数は残しておく
2. **バックアップ**: 削除前にコードのバックアップを作成
3. **テスト**: 削除後、通常機能（判定実行、初期設定）が正常に動作することを確認
4. **ドキュメント化**: 削除した機能の詳細を別途ドキュメント化して保存

## まとめ

開発用メニューの削除は、主に2つのファイルに影響します：
- `c-99-gas-entry.ts`: メニュー定義と呼び出し関数
- `c-90-check-results.ts`: 開発用ログ機能（オプション削除）

削除は比較的単純で、他の主要機能への影響は最小限です。ただし、開発・デバッグ時の利便性は低下するため、代替案の検討も推奨されます。
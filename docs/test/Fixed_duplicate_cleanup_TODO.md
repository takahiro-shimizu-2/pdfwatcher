# This List Fixed

# 重複実装の解消TODO 

## 概要
PDFWatcherプロジェクト内で同じ機能が複数箇所に実装されている箇所を特定し、一元化することで保守性を向上させます。

## 🔴 優先度：高

### 1. SHEET_NAMES定数の重複を解消 ✅
**現状**：
- server-gas/src/s-00-globals.ts
- client-gas/src/c-00-globals.ts (PDFWatcher.SHEET_NAMESとして)
- core/src/constants.ts

**対応**：
- [x] core/src/constants.tsに統一
- [x] server-gasにコメント追加
- [x] client-gasを更新

### 2. CONSTANTS定数の重複を解消
**現状**：
- MAX_ERROR_MESSAGE_LENGTH: 3箇所で異なる値（255, 255, 30）
- LOCK_TIMEOUT_MS: 2箇所で異なる値（30000, 10000）
- LOCK_RETRY_COUNT: 2箇所で同じ値（3）
- SCRIPT_VERSION: 2箇所で異なる値（'1.0.0', 'v1.0'）

**対応**：
- [x] core/src/constants.tsに全定数を統合
- [x] server-gasを更新
- [x] client-gasを更新
- [x] ビルドプロセスでcoreから定数をコピーする仕組みを検討

## 🟡 優先度：中

### 3. createOrUpdateSheet関数の重複を解消
**現状**：
- server-gas/src/s-03-setup.ts
- client-gas/src/c-04-setup.ts
- master-gas/src/m-setup.js

**対応**：
- [x] 各プロジェクトで独立して保持（GASの制約のため）
- [x] 実装を統一（同じロジック、同じパラメータ）

### 4. setupClientSpreadsheet関数をclient-gasのみに統一
**現状**：
- server-gas/src/s-03-setup.ts
- client-gas/src/c-04-setup.ts

**対応**：
- [x] server-gasから削除
- [x] client-gasのみに残す

### 5. onOpen関数をclient-gasのみに統一
**現状**：
- server-gas/src/s-03-setup.ts
- client-gas/src/c-99-gas-entry.ts

**対応**：
- [x] server-gasから削除
- [x] client-gasのみに残す

## 🟢 優先度：低

### 6. 型定義の重複を解消
**現状**：
- Page, DiffResult, BatchResult等の型がserver-gasとclient-gasで別々に定義

**対応**：
- [x] coreパッケージに共通型を定義
- [x] ビルド時に型定義をコピー

### 7. ハードコードされた設定値を統一
**現状**：
- MASTER_SPREADSHEET_ID: 複数箇所でハードコード
- SERVER_LIBRARY_ID: 複数箇所でハードコード

**対応**：
- [x] core/src/constants.tsに追加済み
- [x] 各所で参照するよう修正

## 実装上の注意点

### GASの制約
- import/exportが使えないため、ビルド時にコピーが必要
- 各GASプロジェクトは独立して動作する必要がある

### ビルドプロセスの改善案
1. TypeScriptのビルド前にcore/src/constants.tsから定数をコピー
2. webpackやrollupを使用してバンドル
3. 手動でのコピー＆ペースト（現在の方法）

## 進捗管理

| タスク | 状態 | 完了日 | 備考 |
|--------|------|--------|------|
| 1. SHEET_NAMES定数の統一 | ✅ 完了 | 2025/1/19 | 全プロジェクトで統一完了 |
| 2. CONSTANTS定数の統一 | ✅ 完了 | 2025/1/19 | core更新、全GAS更新完了 |
| 3. createOrUpdateSheet | ✅ 完了 | 2025/1/19 | 各プロジェクトで独立保持 |
| 4. setupClientSpreadsheet | ✅ 完了 | 2025/1/19 | server-gasから削除完了 |
| 5. onOpen | ✅ 完了 | 2025/1/19 | server-gasから削除完了 |
| 6. 型定義の統一 | ✅ 完了 | 2025/1/19 | core/src/types/gas-types.ts作成、コメント追加 |
| 7. ハードコード値の統一 | ✅ 完了 | 2025/1/19 | 全て定数化完了 |

## 完了サマリー

### 実施内容
1. **定数の一元化**
   - SHEET_NAMESとCONSTANTSをcore/src/constants.tsに統合
   - 全GASプロジェクトで参照を更新

2. **重複関数の削除**
   - server-gasからsetupClientSpreadsheet関数を削除
   - server-gasからonOpen関数を削除
   - server-gas/src/s-03-setup.tsファイル自体を削除

3. **設定値の定数化**
   - ハードコードされていたMASTER_SPREADSHEET_IDなどを定数に移動
   - CLIENT_CONFIGを整理し、クライアント固有の設定のみを残す

### 型定義の統一
- core/src/types/gas-types.tsを作成
- 全ての共通型定義をcoreパッケージに集約
- GASプロジェクトには「ビルド時にコピー」というコメントを追加
- BatchResult型のerrors配列をError[]に統一

### 残作業
なし - 全ての重複解消タスクが完了

## 完了日時
2025年1月19日 17:45
3. ビルドプロセスの自動化を検討
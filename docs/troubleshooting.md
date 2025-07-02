# PDF Watcher トラブルシューティングガイド

このガイドでは、PDF Watcherを使用する際に発生する可能性のある問題と、その解決方法について説明します。

## 目次

1. [インストール・セットアップの問題](#1-インストールセットアップの問題)
2. [Chrome拡張機能の問題](#2-chrome拡張機能の問題)
3. [Google Apps Script（GAS）の問題](#3-google-apps-scriptgasの問題)
4. [実行時エラー](#4-実行時エラー)
5. [パフォーマンスの問題](#5-パフォーマンスの問題)
6. [データの問題](#6-データの問題)
7. [権限・認証の問題](#7-権限認証の問題)
8. [6分実行時間制限の問題](#8-6分実行時間制限の問題)

## 1. インストール・セットアップの問題

### 問題: claspログインができない

**症状:**
```bash
$ npm run clasp:login
Error: Cannot read property 'access_token' of undefined
```

**解決方法:**
1. ブラウザでGoogleアカウントにログインしているか確認
2. 以下のコマンドを実行してキャッシュをクリア:
   ```bash
   rm -rf ~/.clasprc.json
   npm run clasp:login
   ```
3. ブラウザが自動的に開かない場合は、表示されたURLを手動でコピーしてアクセス

### 問題: npm installでエラーが発生

**症状:**
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解決方法:**
1. Node.jsのバージョンを確認（v16以上が必要）:
   ```bash
   node --version
   ```
2. package-lock.jsonを削除して再インストール:
   ```bash
   rm package-lock.json
   npm install
   ```
3. それでも解決しない場合は、`--legacy-peer-deps`フラグを使用:
   ```bash
   npm install --legacy-peer-deps
   ```

## 2. Chrome拡張機能の問題

### 問題: 拡張機能がPDFを検出できない

**症状:**
- 「PDFが見つかりません」と表示される
- 実際にはページにPDFリンクが存在する
- PDFリンクの件名が表示されない（2025年6月30日以降の機能）

**解決方法:**
1. ページが完全に読み込まれているか確認
2. PDFリンクが動的に生成されている場合は、少し待ってから再試行
3. コンソールでエラーを確認:
   - Chrome DevToolsを開く（F12）
   - Consoleタブでエラーメッセージを確認
4. 拡張機能を再読み込み:
   - chrome://extensions/にアクセス
   - PDF Watcherの「更新」ボタンをクリック

### 問題: クリップボードにコピーできない

**症状:**
- 「コピー」ボタンを押しても反応がない
- エラーメッセージが表示される

**解決方法:**
1. Chrome拡張機能の権限を確認:
   - chrome://extensions/でPDF Watcherの詳細を開く
   - 「サイトへのアクセス」が適切に設定されているか確認
2. 手動でテキストを選択してコピー
3. 別のブラウザタブで試す

### 問題: PDFリンクの件名が取得できない

**症状:**
- TSVデータに件名が含まれない
- 件名の代わりに空文字またはURLが表示される

**解決方法:**
1. 拡張機能のバージョンを確認（2025年6月30日以降が必要）
2. リンクの種類を確認:
   - テキストリンク: 件名取得可能
   - 画像リンク: 件名なし
   - JavaScriptで動的生成: 取得できない場合あり
3. Chrome拡張機能がtextContentプロパティを使用して全テキストを取得

### 問題: 拡張機能のアイコンが表示されない

**症状:**
- インストール後、ツールバーにアイコンが表示されない

**解決方法:**
1. 拡張機能メニューから固定:
   - ツールバーの拡張機能アイコン（パズルピース）をクリック
   - PDF Watcherの横のピンアイコンをクリック
2. Chrome再起動
3. 拡張機能の再インストール

## 3. Google Apps Script（GAS）の問題

### 問題: "TypeError: Cannot read property 'xxx' of undefined"

**症状:**
- GAS実行時にundefinedエラーが発生

**解決方法:**
1. スプレッドシートIDが正しく設定されているか確認
2. 必要なシートが存在するか確認:
   - ArchivePDF
   - PageHistory
   - PageSummary
   - RunLog
3. グローバル変数の初期化を確認:
   ```javascript
   // スクリプトエディタで以下を実行
   function testSetup() {
     console.log('MasterSpreadsheetId:', PropertiesService.getScriptProperties().getProperty('MasterSpreadsheetId'));
   }
   ```

### 問題: "Exception: Service invoked too many times"

**症状:**
- API制限エラーが発生

**解決方法:**
1. バッチサイズを小さくする:
   - client-gas/src/c-01-parser.tsのBATCH_SIZEを調整
2. 処理間隔を調整:
   ```javascript
   Utilities.sleep(1000); // 1秒待機を追加
   ```
3. 実行を複数回に分割

### 問題: clasp pushでエラー

**症状:**
```bash
Push failed. Errors:
GaxiosError: User has not enabled the Apps Script API
```

**解決方法:**
1. Google Cloud ConsoleでApps Script APIを有効化:
   - https://console.cloud.google.com/apis/library
   - "Google Apps Script API"を検索して有効化
2. .clasp.jsonのrootDirを確認
3. appsscript.jsonが存在することを確認

## 4. 実行時エラー

### 問題: "Lock acquisition failed"

**症状:**
- 並行実行時にロックエラーが発生

**解決方法:**
1. 他のユーザーが実行中でないか確認
2. しばらく待ってから再実行
3. ロックタイムアウトを調整:
   ```typescript
   // server-gas/src/infrastructure/lock/s-DocumentLock.ts
   const LOCK_TIMEOUT_MS = 30000; // 30秒に延長
   ```

### 問題: "Exceeded maximum execution time"

**症状:**
- 6分を超えて実行が中断される

**解決方法:**
1. 処理は自動的に再開されるので待つ
2. 手動で続行する場合は「runJudge」を再実行
3. ページ数が多い場合は、複数回に分けて実行

### 問題: メモリ不足エラー

**症状:**
- "Exceeded maximum memory"エラー

**解決方法:**
1. バッチサイズを小さくする
2. 不要な変数をnullに設定してメモリを解放:
   ```javascript
   largeArray = null; // メモリ解放
   ```
3. 処理を分割して実行

## 5. パフォーマンスの問題

### 問題: 処理が遅い

**症状:**
- 1ページの処理に10秒以上かかる

**解決方法:**
1. ネットワーク接続を確認
2. スプレッドシートのサイズを確認:
   - 不要な古いデータを別シートに移動
   - インデックス列でソート
3. バッチサイズを最適化:
   - 小さすぎると遅い（API呼び出しが増える）
   - 大きすぎても遅い（メモリ使用量が増える）

### 問題: スプレッドシートの読み込みが遅い

**症状:**
- スプレッドシートを開くのに時間がかかる

**解決方法:**
1. データ量を確認（100万行を超えていないか）
2. 不要な書式設定を削除
3. 条件付き書式を最小限に
4. IMPORTRANGE関数の使用を最適化

## 6. データの問題

### 問題: PDFが重複して記録される

**症状:**
- 同じPDFが複数回記録される

**解決方法:**
1. Chrome拡張機能で重複を除去しているか確認
2. URLの正規化を確認:
   - httpとhttpsの違い
   - 末尾のスラッシュの有無
   - クエリパラメータの有無
3. データベースの重複を手動で削除

### 問題: ChangesHistoryシートが作成されない

**症状:**
- runJudge実行後もChangesHistoryシートが存在しない

**解決方法:**
1. 初期設定を再実行:
   ```javascript
   setupChangesHistorySheet();
   ```
2. 手動でシートを作成（ヘッダーは「保存日時,実行ID,ページURL,件名,PDFのURL,削除予定日時」）
3. 権限を確認（シート作成権限が必要）

### 問題: 履歴データが保存されない

**症状:**
- 処理完了してもChangesHistoryに転写されない

**解決方法:**
1. 6分制限で中断されていないか確認（中断時は保存されない）
2. エラーログを確認:
   ```javascript
   console.log(PropertiesService.getUserProperties().getProperty('LastError'));
   ```
3. Changesシートにデータが存在するか確認

### 問題: 削除されたPDFが「存在」と表示される

**症状:**
- 実際には削除されたPDFのステータスが更新されない

**解決方法:**
1. ページの完全な再チェックを実行
2. キャッシュをクリア:
   - ブラウザのキャッシュ
   - CDNのキャッシュ
3. 手動でステータスを更新

### 問題: 文字化けが発生

**症状:**
- 日本語のファイル名が文字化けする

**解決方法:**
1. スプレッドシートの文字エンコーディングを確認
2. Chrome拡張機能のエンコーディング処理を確認
3. URL エンコーディングを適切に処理:
   ```javascript
   const decodedUrl = decodeURIComponent(encodedUrl);
   ```

## 7. 権限・認証の問題

### 問題: "認証が必要です"エラー

**症状:**
- GAS実行時に認証エラーが発生

**解決方法:**
1. 初回実行時の承認:
   - 「runJudge」を実行
   - 「承認が必要です」ダイアログで承認
2. スプレッドシートの共有設定を確認
3. GASプロジェクトの共有設定を確認

### 問題: "アクセス権限がありません"

**症状:**
- マスタースプレッドシートにアクセスできない

**解決方法:**
1. スプレッドシートの共有設定を確認:
   - 編集権限が必要
   - リンクを知っている人が編集可能に設定
2. 正しいGoogleアカウントでログインしているか確認
3. 組織のセキュリティポリシーを確認

## 8. 6分実行時間制限の問題

### 問題: 処理が途中で停止する

**症状:**
- 「実行時間制限により処理を中断しました」と表示

**解決方法:**
1. これは正常な動作 - 7分後に自動的に再開される
2. 手動で続行する場合:
   - 「runJudge」を再度実行
   - 前回の続きから処理が再開される
3. トリガーを確認:
   - スクリプトエディタ → トリガー
   - 「resumeProcessing」トリガーが設定されているか確認

### 問題: トリガーが作成されない

**症状:**
- 自動再開されない

**解決方法:**
1. トリガーの権限を確認
2. 手動でトリガーを作成:
   ```javascript
   function createManualTrigger() {
     ScriptApp.newTrigger('runJudge')
       .timeBased()
       .after(7 * 60 * 1000)
       .create();
   }
   ```
3. トリガーの上限（20個）に達していないか確認

### 問題: 状態が保持されない

**症状:**
- 再開時に最初からやり直しになる

**解決方法:**
1. PropertiesServiceの容量制限を確認（9KB/プロパティ）
2. 状態データのサイズを確認:
   ```javascript
   function checkStateSize() {
     const state = PropertiesService.getUserProperties().getProperty('ProcessingState');
     console.log('State size:', state ? state.length : 0);
   }
   ```
3. 不要なデータを削除して状態を軽量化

## デバッグのヒント

### ログの確認方法

1. **GASのログ**:
   - スクリプトエディタ → 実行数 → ログを表示
   - `console.log()`の出力を確認

2. **Chrome拡張機能のログ**:
   - 拡張機能の背景ページを検査
   - DevToolsのConsoleタブを確認

3. **スプレッドシートのログ**:
   - UserLogシートで実行履歴を確認
   - RunLogシートで詳細なログを確認

### よくある確認事項

1. **環境変数の確認**:
   ```javascript
   function checkEnvironment() {
     console.log('Spreadsheet ID:', SpreadsheetApp.getActiveSpreadsheet().getId());
     console.log('User:', Session.getActiveUser().getEmail());
     console.log('Properties:', PropertiesService.getScriptProperties().getKeys());
   }
   ```

2. **データ整合性の確認**:
   ```javascript
   function validateData() {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ArchivePDF');
     const data = sheet.getDataRange().getValues();
     // データの検証ロジック
   }
   ```

## サポート

上記で解決しない場合は、以下の情報を含めてGitHub Issuesに報告してください：

1. **環境情報**:
   - OS
   - Chromeバージョン
   - Node.jsバージョン
   - エラーメッセージの全文

2. **再現手順**:
   - 実行した操作
   - 期待される結果
   - 実際の結果

3. **ログ情報**:
   - GASのログ
   - ブラウザのコンソールログ
   - スクリーンショット（可能であれば）

---

このガイドは継続的に更新されます。新しい問題や解決方法がある場合は、プルリクエストでの貢献をお願いします。
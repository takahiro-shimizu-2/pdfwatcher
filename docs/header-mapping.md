# スプレッドシートヘッダーマッピング

このドキュメントは、日本語版と英語版のヘッダー対応表です。
将来的な国際化対応時に使用してください。

## Master Spreadsheet (中央ブック)

### ArchivePDF シート
| 日本語 | 英語 | 説明 |
|--------|------|------|
| ページURL | PageURL | 監視対象のWebページURL |
| PDF URL | PDFURL | PDFファイルのURL |
| 初回発見日時 | FirstSeen | PDFを最初に発見した日時 |
| 最終確認日時 | LastSeen | PDFを最後に確認した日時 |

### PageHistory シート
| 日本語 | 英語 | 説明 |
|--------|------|------|
| 実行日時 | RunDate | バッチ実行日時 |
| ページURL | PageURL | 監視対象のWebページURL |
| ページ更新 | PageUpd? | ページが更新されたか (TRUE/FALSE) |
| PDF更新 | PDFUpd? | PDFが更新されたか (TRUE/FALSE) |
| 追加数 | AddedCnt | 追加されたPDFの数 |
| ユーザー | User | 実行したユーザーのメールアドレス |

### PageSummary シート
| 日本語 | 英語 | 説明 |
|--------|------|------|
| ページURL | PageURL | 監視対象のWebページURL |
| 最新ハッシュ | LastHash | ページの最新ハッシュ値 |
| 実行1-日時 | Run-1 Date | 直近1回目の実行日時 |
| 実行1-ページ | Run-1 PU | 直近1回目のページ更新有無 |
| 実行1-PDF | Run-1 PFU | 直近1回目のPDF更新有無 |
| 実行1-追加数 | Run-1 Cnt | 直近1回目の追加PDF数 |
| 実行2-日時 | Run-2 Date | 直近2回目の実行日時 |
| 実行2-ページ | Run-2 PU | 直近2回目のページ更新有無 |
| 実行2-PDF | Run-2 PFU | 直近2回目のPDF更新有無 |
| 実行2-追加数 | Run-2 Cnt | 直近2回目の追加PDF数 |
| 実行3-日時 | Run-3 Date | 直近3回目の実行日時 |
| 実行3-ページ | Run-3 PU | 直近3回目のページ更新有無 |
| 実行3-PDF | Run-3 PFU | 直近3回目のPDF更新有無 |
| 実行3-追加数 | Run-3 Cnt | 直近3回目の追加PDF数 |

### RunLog シート
| 日本語 | 英語 | 説明 |
|--------|------|------|
| 実行ID | ExecID | 一意の実行識別子 |
| タイムスタンプ | Timestamp | 実行開始時刻 |
| ユーザー | User | 実行したユーザー |
| 実行時間(秒) | Dur s | 処理にかかった時間（秒） |
| 処理ページ数 | PagesProc | 処理したページ数 |
| 更新ページ数 | PagesUpd | 更新があったページ数 |
| 追加PDF数 | PDFsAdd | 追加されたPDF数 |
| 結果 | Result | SUCCESS/ERROR |
| エラーメッセージ | ErrorMsg | エラーの詳細（エラー時のみ） |
| スクリプトVer | ScriptVer | 実行時のスクリプトバージョン |

## Client Spreadsheet (クライアントブック)

### Current シート
ヘッダーなし（Chrome拡張からのTSVデータを貼り付ける）

### Changes シート
| 日本語 | 英語 | 説明 |
|--------|------|------|
| ページURL | PageURL | 変更があったページのURL |
| 追加数 | AddedCnt | 追加されたPDFの数 |
| 新規PDF | NewPDFs | 新規追加されたPDFのURL（カンマ区切り） |

### Summary シート
中央ブックのPageSummaryシートをIMPORTRANGEで参照（ヘッダーも含めて同じ）

### UserLog シート
| 日本語 | 英語 | 説明 |
|--------|------|------|
| タイムスタンプ | Timestamp | 実行開始時刻 |
| 実行時間(秒) | Duration s | 処理にかかった時間（秒） |
| 処理ページ数 | PagesProc | 処理したページ数 |
| 更新ページ数 | PagesUpd | 更新があったページ数 |
| 追加PDF数 | PDFsAdd | 追加されたPDF数 |
| 結果 | Result | SUCCESS/ERROR |
| エラーメッセージ | ErrorMsg | エラーの詳細（エラー時のみ） |

## 国際化対応時の注意事項

1. **列の順序は変更しない**
   - プログラムは列番号でアクセスしているため、順序変更は影響大

2. **データ型は維持する**
   - 日付、数値、真偽値の型は言語に関わらず同じ

3. **IMPORTRANGEの考慮**
   - Summaryシートは中央ブックの言語設定に従う

4. **スクリプト側の対応**
   - ヘッダー文字列を定数化して言語切り替え可能にする
   - 例: `const HEADERS = LANG === 'ja' ? HEADERS_JA : HEADERS_EN`
# PDF Watcher テスト仕様書

## 1. テストケース一覧

### 1.1 Core パッケージ単体テスト

#### TC-CORE-001: Page モデルテスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-CORE-001-01 | URL正規化 - 末尾スラッシュ削除 | `https://example.com/` | `https://example.com` | High |
| TC-CORE-001-02 | URL正規化 - クエリパラメータソート | `?b=2&a=1` | `?a=1&b=2` | High |
| TC-CORE-001-03 | URL正規化 - フラグメント保持 | `#section1` | `#section1` | Medium |
| TC-CORE-001-04 | ハッシュ計算 - 同一URL | 同じURL2回 | 同じハッシュ値 | High |
| TC-CORE-001-05 | ハッシュ計算 - 異なるURL | 異なるURL | 異なるハッシュ値 | High |
| TC-CORE-001-06 | equals() - 同一インスタンス | 同じオブジェクト | true | High |
| TC-CORE-001-07 | equals() - 同じURL | 同じURL別インスタンス | true | High |
| TC-CORE-001-08 | equals() - 異なるURL | 異なるURL | false | High |

#### TC-CORE-002: PDF モデルテスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-CORE-002-01 | コンストラクタ - 正常系 | 有効なURL | 正常生成、found=true | High |
| TC-CORE-002-02 | コンストラクタ - 削除状態 | found=false | deleted=true | High |
| TC-CORE-002-03 | URL検証 - HTTPプロトコル | `http://example.com` | 正常 | High |
| TC-CORE-002-04 | URL検証 - HTTPSプロトコル | `https://example.com` | 正常 | High |
| TC-CORE-002-05 | URL検証 - 無効プロトコル | `ftp://example.com` | エラー | High |
| TC-CORE-002-06 | URL検証 - 空文字 | `""` | エラー | High |
| TC-CORE-002-07 | toJSON() - 全フィールド | PDFインスタンス | 正しいJSON形式 | Medium |
| TC-CORE-002-08 | fromJSON() - ラウンドトリップ | JSON→PDF→JSON | 元のJSONと一致 | Medium |

#### TC-CORE-003: DiffResult モデルテスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-CORE-003-01 | 空の差分 | 変更なし | added=0, deleted=0, unchanged=全て | High |
| TC-CORE-003-02 | PDF追加 | 新規PDF3個 | added=3, addedPdfs配列に3個 | High |
| TC-CORE-003-03 | PDF削除 | 削除PDF2個 | deleted=2, deletedPdfs配列に2個 | High |
| TC-CORE-003-04 | 混在差分 | 追加2、削除1、変更なし5 | 正しいカウント | High |
| TC-CORE-003-05 | hasChanges() - 変更あり | added>0 | true | High |
| TC-CORE-003-06 | hasChanges() - 変更なし | added=0,deleted=0 | false | High |
| TC-CORE-003-07 | getSummary() - フォーマット | 差分あり | 正しい文字列形式 | Medium |

#### TC-CORE-004: BatchResult モデルテスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-CORE-004-01 | 成功結果 | success=true | エラーなし、結果正常 | High |
| TC-CORE-004-02 | 失敗結果 | success=false | エラーメッセージあり | High |
| TC-CORE-004-03 | 部分成功 | 一部エラー | partialSuccess=true | High |
| TC-CORE-004-04 | 統計情報 | 処理PDF100個 | processedCount=100 | Medium |
| TC-CORE-004-05 | 実行時間 | 開始・終了時刻 | duration計算正確 | Low |
| TC-CORE-004-06 | diffResults統合 | 複数ページ結果 | 正しくマージ | High |

### 1.2 Server GAS 単体テスト

#### TC-SERVER-001: SheetArchiveRepository テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-SERVER-001-01 | getPdfsByPage - 存在するページ | pageUrl | PDF配列 | High |
| TC-SERVER-001-02 | getPdfsByPage - 存在しないページ | 未登録URL | 空配列 | High |
| TC-SERVER-001-03 | getPdfsByPage - null入力 | null | エラー | High |
| TC-SERVER-001-04 | upsertPdfs - 新規追加 | 新規PDF3個 | 3行追加 | High |
| TC-SERVER-001-05 | upsertPdfs - 更新 | 既存PDF更新 | 該当行更新 | High |
| TC-SERVER-001-06 | upsertPdfs - 混在 | 新規2個、更新1個 | 正しく処理 | High |
| TC-SERVER-001-07 | upsertPdfs - 大量データ | 1000個 | タイムアウトなし | Medium |
| TC-SERVER-001-08 | getAllPdfs - 全取得 | なし | 全PDF取得 | Medium |
| TC-SERVER-001-09 | getAllPdfs - ページネーション | limit=100 | 100件取得 | Low |

#### TC-SERVER-002: SheetHistoryRepository テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-SERVER-002-01 | addPageHistory - 正常追加 | 履歴エントリ | 1行追加 | High |
| TC-SERVER-002-02 | addPageHistory - 複数追加 | 10エントリ | 10行追加、順序保持 | High |
| TC-SERVER-002-03 | addPageHistory - null値 | null | エラー | High |
| TC-SERVER-002-04 | getPageHistory - 期間指定 | 開始・終了日時 | 期間内データ | High |
| TC-SERVER-002-05 | getPageHistory - ページ指定 | pageUrl | 該当ページのみ | High |
| TC-SERVER-002-06 | getPageHistory - ソート | なし | 日時降順 | Medium |
| TC-SERVER-002-07 | getPageHistory - 制限 | limit=50 | 最新50件 | Medium |

#### TC-SERVER-003: SheetSummaryRepository テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-SERVER-003-01 | updatePageSummary - 新規 | 新規サマリ | 1行追加 | High |
| TC-SERVER-003-02 | updatePageSummary - 更新 | 既存ページ | 該当行更新 | High |
| TC-SERVER-003-03 | updatePageSummary - 統計値 | カウント情報 | 正確な計算 | High |
| TC-SERVER-003-04 | getPageSummary - 存在 | pageUrl | サマリ取得 | High |
| TC-SERVER-003-05 | getPageSummary - 非存在 | 未登録URL | null | High |
| TC-SERVER-003-06 | 一括更新 | 10ページ | 全て更新 | Medium |

#### TC-SERVER-004: SheetRunLogRepository テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-SERVER-004-01 | addRunLog - 正常ログ | 実行ログ | 1行追加 | High |
| TC-SERVER-004-02 | addRunLog - エラーログ | エラー情報 | エラー詳細保存 | High |
| TC-SERVER-004-03 | getRunLogs - 最新取得 | limit=10 | 最新10件 | High |
| TC-SERVER-004-04 | getRunLogs - 期間指定 | 日付範囲 | 期間内ログ | Medium |
| TC-SERVER-004-05 | ログローテーション | 10000件超 | 古いログ削除 | Low |

#### TC-SERVER-005: DocumentLock テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-SERVER-005-01 | acquire - 取得成功 | lockId | ロック取得 | High |
| TC-SERVER-005-02 | acquire - 競合 | 既存ロック中 | 待機後取得 | High |
| TC-SERVER-005-03 | acquire - タイムアウト | timeout=1秒 | TimeoutError | High |
| TC-SERVER-005-04 | release - 正常解放 | lockId | ロック解放 | High |
| TC-SERVER-005-05 | release - 二重解放 | 解放済みID | エラーなし | Medium |
| TC-SERVER-005-06 | 自動解放 | エラー発生 | finally実行 | High |

#### TC-SERVER-006: DiffService テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-SERVER-006-01 | calculateDiff - 変更なし | 同一PDF配列 | unchanged=全て | High |
| TC-SERVER-006-02 | calculateDiff - 追加のみ | 新規PDF | added=新規分 | High |
| TC-SERVER-006-03 | calculateDiff - 削除のみ | 一部削除 | deleted=削除分 | High |
| TC-SERVER-006-04 | calculateDiff - 混在 | 追加・削除混在 | 正確なカウント | High |
| TC-SERVER-006-05 | mergeDiffResults - 2結果 | 2つのDiff | 合計値正確 | High |
| TC-SERVER-006-06 | mergeDiffResults - 空配列 | [] | 空のDiff | Medium |

#### TC-SERVER-007: SummaryService テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-SERVER-007-01 | updateSummary - 初回 | 新規ページ | 初期値設定 | High |
| TC-SERVER-007-02 | updateSummary - 累積 | 既存ページ | カウント加算 | High |
| TC-SERVER-007-03 | rotateSummary - 期限切れ | 30日以前 | 削除 | Medium |
| TC-SERVER-007-04 | rotateSummary - 期限内 | 29日以内 | 保持 | Medium |

### 1.3 Client GAS 単体テスト

#### TC-CLIENT-001: TSVパーサーテスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-CLIENT-001-01 | 正常TSV | 3列×10行 | Page配列10個 | High |
| TC-CLIENT-001-02 | 空行スキップ | 空行含む | 空行除外 | High |
| TC-CLIENT-001-03 | 列数不足 | 2列のみ | エラー | High |
| TC-CLIENT-001-04 | 無効URL | 不正なURL | エラー | High |
| TC-CLIENT-001-05 | タブ文字 | タブ区切り | 正常解析 | High |
| TC-CLIENT-001-06 | 改行コード | CRLF/LF混在 | 正常処理 | Medium |
| TC-CLIENT-001-07 | 大量データ | 1000行 | メモリエラーなし | Medium |

#### TC-CLIENT-002: バッチ処理テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-CLIENT-002-01 | splitIntoBatches - 均等分割 | 100個、size=25 | 4バッチ | High |
| TC-CLIENT-002-02 | splitIntoBatches - 端数 | 103個、size=25 | 5バッチ(最後3個) | High |
| TC-CLIENT-002-03 | splitIntoBatches - 単一 | 10個、size=50 | 1バッチ | High |
| TC-CLIENT-002-04 | executeBatches - 全成功 | 3バッチ | 全て成功 | High |
| TC-CLIENT-002-05 | executeBatches - 部分失敗 | 1バッチエラー | 他は継続 | High |
| TC-CLIENT-002-06 | executeBatches - タイムアウト | 長時間処理 | 適切な中断 | Medium |

#### TC-CLIENT-003: UI更新テスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-CLIENT-003-01 | updateChangesSheet - 追加 | added=3 | 3行追加、緑色 | High |
| TC-CLIENT-003-02 | updateChangesSheet - 削除 | deleted=2 | 2行追加、赤色 | High |
| TC-CLIENT-003-03 | updateChangesSheet - クリア | 既存データあり | 全削除後追加 | High |
| TC-CLIENT-003-04 | updateUserLog - 成功 | 成功メッセージ | 緑色ログ | High |
| TC-CLIENT-003-05 | updateUserLog - エラー | エラーメッセージ | 赤色ログ | High |
| TC-CLIENT-003-06 | updateUserLog - ローテート | 1000行超 | 古いログ削除 | Low |
| TC-CLIENT-003-07 | clearCurrentSheet - 全削除 | データあり | 空シート | High |

### 1.4 Chrome Extension 単体テスト

#### TC-EXT-001: コンテンツスクリプトテスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-EXT-001-01 | PDF抽出 - aタグ | `<a href="*.pdf">` | PDF URL検出 | High |
| TC-EXT-001-02 | PDF抽出 - 相対パス | `href="./doc.pdf"` | 絶対URL変換 | High |
| TC-EXT-001-03 | PDF抽出 - 重複 | 同じURL複数 | 重複除去 | High |
| TC-EXT-001-04 | PDF抽出 - 大文字 | `.PDF` | 検出成功 | Medium |
| TC-EXT-001-05 | ハッシュ計算 | ページHTML | 一貫性あり | High |
| TC-EXT-001-06 | 動的コンテンツ | Ajax後のDOM | 再スキャン | Medium |

#### TC-EXT-002: バックグラウンドテスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-EXT-002-01 | メッセージ受信 | content→bg | 正常処理 | High |
| TC-EXT-002-02 | メッセージ応答 | bg→content | 応答返却 | High |
| TC-EXT-002-03 | ストレージ保存 | PDFデータ | 永続化 | High |
| TC-EXT-002-04 | ストレージ読込 | key指定 | データ取得 | High |
| TC-EXT-002-05 | エラーハンドリング | 無効メッセージ | エラー応答 | Medium |

#### TC-EXT-003: ポップアップUIテスト
| ID | テスト項目 | 入力 | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-EXT-003-01 | 初期表示 | ポップアップ開く | UI表示 | High |
| TC-EXT-003-02 | スキャンボタン | クリック | スキャン実行 | High |
| TC-EXT-003-03 | 結果表示 | PDF3個検出 | リスト表示 | High |
| TC-EXT-003-04 | コピーボタン | クリック | TSVコピー | High |
| TC-EXT-003-05 | エラー表示 | スキャン失敗 | エラーメッセージ | High |
| TC-EXT-003-06 | ローディング | 処理中 | スピナー表示 | Medium |

### 1.5 統合テスト

#### TC-INT-001: Server-Client連携テスト
| ID | テスト項目 | シナリオ | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-INT-001-01 | 正常バッチ実行 | Client→Server呼出 | 結果返却 | High |
| TC-INT-001-02 | ロック競合 | 2クライアント同時 | 順次処理 | High |
| TC-INT-001-03 | 大量データ処理 | 500PDF×3ページ | 完走 | High |
| TC-INT-001-04 | エラー伝播 | Server側エラー | Client側で捕捉 | High |
| TC-INT-001-05 | トランザクション | 部分失敗 | ロールバック | Medium |

#### TC-INT-002: Extension-Client連携テスト
| ID | テスト項目 | シナリオ | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-INT-002-01 | TSV受渡し | Extension→Sheet | 正常貼付け | High |
| TC-INT-002-02 | フォーマット互換 | 各列データ | 正確な解析 | High |
| TC-INT-002-03 | 文字エンコード | 日本語URL | 文字化けなし | Medium |
| TC-INT-002-04 | 特殊文字 | タブ、改行含む | エスケープ | Medium |

### 1.6 システムテスト（E2E）

#### TC-E2E-001: 基本シナリオ
| ID | テスト項目 | シナリオ | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-E2E-001-01 | 初回実行 | 新規環境セットアップ→実行 | 正常完了 | High |
| TC-E2E-001-02 | PDF追加検出 | 10個追加→実行 | Changes表示 | High |
| TC-E2E-001-03 | PDF削除検出 | 5個削除→実行 | Changes表示 | High |
| TC-E2E-001-04 | 変更なし | 同じ状態で再実行 | "変更なし" | High |
| TC-E2E-001-05 | 混在変更 | 追加3、削除2 | 両方検出 | High |

#### TC-E2E-002: 異常系シナリオ
| ID | テスト項目 | シナリオ | 期待結果 | 優先度 |
|---|---|---|---|---|
| TC-E2E-002-01 | ネットワークエラー | 通信遮断中 | エラー通知 | High |
| TC-E2E-002-02 | 権限エラー | 読取専用Sheet | エラー通知 | High |
| TC-E2E-002-03 | タイムアウト | 6分超処理 | 部分結果保存 | Medium |
| TC-E2E-002-04 | 不正データ | 壊れたTSV | エラー処理 | Medium |

#### TC-E2E-003: パフォーマンステスト
| ID | テスト項目 | 条件 | 基準値 | 優先度 |
|---|---|---|---|---|
| TC-E2E-003-01 | 小規模実行 | 50PDF | 30秒以内 | High |
| TC-E2E-003-02 | 中規模実行 | 500PDF | 3分以内 | High |
| TC-E2E-003-03 | 大規模実行 | 2000PDF | 6分以内 | Medium |
| TC-E2E-003-04 | 同時実行 | 3クライアント | 干渉なし | Medium |

### 1.7 受入テスト

#### TC-UAT-001: ユーザーシナリオ
| ID | テスト項目 | ユーザー | シナリオ | 優先度 |
|---|---|---|---|---|
| TC-UAT-001-01 | 研究者利用 | 研究者A | 論文PDF監視 | High |
| TC-UAT-001-02 | 管理者利用 | 管理者B | 複数サイト監視 | High |
| TC-UAT-001-03 | 初心者利用 | 新規ユーザー | 初期設定→実行 | High |
| TC-UAT-001-04 | 定期実行 | 日次ユーザー | 毎日実行 | Medium |

#### TC-UAT-002: ユーザビリティ
| ID | テスト項目 | 評価項目 | 基準 | 優先度 |
|---|---|---|---|---|
| TC-UAT-002-01 | 拡張機能UI | 直感性 | 5段階評価4以上 | High |
| TC-UAT-002-02 | エラーメッセージ | 理解度 | 改善提案なし | High |
| TC-UAT-002-03 | 実行時間 | 待機許容度 | クレームなし | Medium |
| TC-UAT-002-04 | 結果表示 | 視認性 | 見やすさ確認 | Medium |

## 2. テストデータ仕様

### 2.1 PDFデータセット
```
test-data/
├── small/          # 小規模（10-50 PDF）
│   ├── academic/   # 学術サイト想定
│   ├── corporate/  # 企業サイト想定
│   └── mixed/      # 混在
├── medium/         # 中規模（100-500 PDF）
│   ├── stable/     # 変更少ない
│   ├── dynamic/    # 変更多い
│   └── growing/    # 増加傾向
├── large/          # 大規模（1000+ PDF）
│   ├── archived/   # アーカイブ型
│   └── active/     # アクティブ型
└── edge-cases/     # エッジケース
    ├── invalid-urls/
    ├── timeout-urls/
    ├── special-chars/
    └── encodings/
```

### 2.2 テストURL仕様
| カテゴリ | URL例 | 用途 |
|---|---|---|
| 正常URL | https://example.com/doc.pdf | 基本テスト |
| 日本語URL | https://example.com/文書.pdf | エンコードテスト |
| 長いURL | 2000文字のURL | 境界値テスト |
| 特殊文字 | ?、&、#を含むURL | パースエラーテスト |
| 無効URL | https://404.example.com | エラー処理テスト |
| タイムアウト | https://slow.example.com | タイムアウトテスト |

### 2.3 スプレッドシートテストデータ
| シート名 | 行数 | 内容 |
|---|---|---|
| ArchivePDF_small | 100 | 基本テスト用 |
| ArchivePDF_medium | 5,000 | パフォーマンステスト |
| ArchivePDF_large | 50,000 | ストレステスト |
| History_rotation | 100,000 | ローテーションテスト |

## 3. テスト環境仕様

### 3.1 開発環境
```json
{
  "node": "18.x",
  "typescript": "5.x",
  "jest": "29.x",
  "testing-library": "latest",
  "mock-packages": {
    "jest-mock-gas": "latest",
    "chrome-mock": "latest",
    "msw": "latest"
  }
}
```

### 3.2 GAS環境
```javascript
// テスト用プロパティ
{
  "SPREADSHEET_ID": "test-sheet-id",
  "SERVER_LIBRARY_ID": "test-lib-id",
  "EXECUTION_TIMEOUT": 300000,
  "BATCH_SIZE": 50,
  "MAX_RETRIES": 3
}
```

### 3.3 Chrome拡張環境
```json
{
  "manifest_version": 3,
  "permissions": ["activeTab", "storage", "clipboardWrite"],
  "host_permissions": ["https://*/*", "http://*/*"],
  "test_mode": true
}
```

## 4. 合格基準

### 4.1 単体テスト
- カバレッジ: 80%以上（行、分岐）
- 全テストケース: PASS
- 実行時間: 各テスト1秒以内

### 4.2 統合テスト
- 主要シナリオ: 100% PASS
- データ整合性: エラー0件
- 同時実行: 競合0件

### 4.3 システムテスト
- E2Eシナリオ: 95%以上PASS
- パフォーマンス: 全基準達成
- 安定性: 10回連続成功

### 4.4 受入テスト
- ユーザー満足度: 4/5以上
- 重大な問題: 0件
- 改善要望: 対応計画作成

## 5. 不具合管理

### 5.1 優先度定義
| 優先度 | 定義 | 対応期限 |
|---|---|---|
| Critical | システム停止、データ損失 | 即日 |
| High | 主要機能不可、回避困難 | 3日以内 |
| Medium | 機能制限、回避可能 | 1週間以内 |
| Low | 軽微な問題、改善要望 | 次リリース |

### 5.2 不具合報告フォーマット
```markdown
## 不具合ID: BUG-XXXX
**発見日**: YYYY-MM-DD
**発見者**: 名前
**テストケースID**: TC-XXX-XXX
**環境**: 開発/本番
**再現手順**:
1. 手順1
2. 手順2
**期待結果**: 
**実際の結果**: 
**スクリーンショット**: 
**優先度**: Critical/High/Medium/Low
**担当者**: 
**ステータス**: Open/In Progress/Resolved/Closed
```

## 6. リスクと軽減策

### 6.1 技術的リスク
| リスク | 影響 | 軽減策 |
|---|---|---|
| GAS実行時間制限 | テスト中断 | バッチ分割、並列実行 |
| API制限 | テスト失敗 | レート制限、リトライ |
| メモリ不足 | クラッシュ | データ分割、ストリーミング |

### 6.2 環境リスク
| リスク | 影響 | 軽減策 |
|---|---|---|
| Google API変更 | 互換性問題 | バージョン固定、定期確認 |
| ネットワーク不安定 | テスト失敗 | ローカルモック使用 |
| 権限問題 | アクセス不可 | テスト用アカウント準備 |

## 7. テスト実行手順

### 7.1 単体テスト実行
```bash
# 全単体テスト
npm test

# カバレッジ付き
npm test -- --coverage

# 特定モジュール
npm test -- core
npm test -- server
npm test -- client
npm test -- extension
```

### 7.2 統合テスト実行
```bash
# 統合テスト
npm run test:integration

# E2Eテスト
npm run test:e2e

# パフォーマンステスト
npm run test:performance
```

### 7.3 GASテスト実行
```javascript
// テストランナー
function runAllTests() {
  const results = {
    unit: runUnitTests(),
    integration: runIntegrationTests(),
    performance: runPerformanceTests()
  };
  
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}
```

## 8. レポート仕様

### 8.1 テスト実行レポート
```
===========================================
PDF Watcher テスト実行レポート
実行日時: YYYY-MM-DD HH:MM:SS
===========================================

【サマリ】
総テストケース数: XXX
成功: XXX (XX%)
失敗: XXX
スキップ: XXX
実行時間: XX秒

【詳細結果】
[単体テスト]
- Core: XX/XX PASS
- Server: XX/XX PASS
- Client: XX/XX PASS
- Extension: XX/XX PASS

[統合テスト]
- Server-Client: XX/XX PASS
- Extension-Client: XX/XX PASS

[システムテスト]
- E2E: XX/XX PASS
- Performance: 基準達成

【カバレッジ】
全体: XX%
- Core: XX%
- Server: XX%
- Client: XX%
- Extension: XX%

【不具合】
Critical: X件
High: X件
Medium: X件
Low: X件
```

### 8.2 品質メトリクス
| メトリクス | 目標値 | 実績値 | 評価 |
|---|---|---|---|
| テストカバレッジ | 80% | XX% | ✓/✗ |
| 欠陥密度 | <5/KLOC | XX | ✓/✗ |
| テスト成功率 | >95% | XX% | ✓/✗ |
| 平均修正時間 | <3日 | XX日 | ✓/✗ |
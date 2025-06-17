# PDF Watcher 開発設計書

## 1. システムアーキテクチャ概要

### 1.1 システム構成
```
┌─────────────────────────────────────────────────┐
│                 Chrome Extension                 │
│              (TypeScript, Manifest V3)           │
└─────────────────────┬───────────────────────────┘
                      │ TSV形式でコピー
┌─────────────────────▼───────────────────────────┐
│              Client Spreadsheet                  │
│  ├─ Current Sheet (TSV貼り付け)                  │
│  ├─ Changes Sheet (差分表示)                     │
│  ├─ Summary Sheet (3世代履歴)                    │
│  └─ UserLog Sheet (個人ログ)                     │
└─────────────────────┬───────────────────────────┘
                      │ google.script.run
┌─────────────────────▼───────────────────────────┐
│               Client GAS                         │
│  └─ runJudge() エントリポイント                  │
└─────────────────────┬───────────────────────────┘
                      │ ServerLib.runBatch()
┌─────────────────────▼───────────────────────────┐
│         Server Library (Standalone GAS)          │
│  ├─ Domain Layer                                 │
│  │  ├─ DiffService                               │
│  │  └─ SummaryService                            │
│  └─ Infrastructure Layer (DI)                    │
│     ├─ SheetArchiveRepo                          │
│     ├─ SheetHistoryRepo                          │
│     └─ SheetRunLogRepo                           │
└─────────────────────┬───────────────────────────┘
                      │ DocumentLock制御
┌─────────────────────▼───────────────────────────┐
│           Master Spreadsheet (中央)              │
│  ├─ ArchivePDF (PDFマスタ)                       │
│  ├─ PageHistory (実行履歴)                       │
│  ├─ PageSummary (3世代サマリ)                    │
│  └─ RunLog (実行ログ)                            │
└─────────────────────────────────────────────────┘
```

### 1.2 レイヤー設計

#### Presentation層
- Chrome拡張機能：ページ情報抽出とTSV生成
- Client GAS：UIロジックとサーバー呼び出し
- スプレッドシートUI：データ表示

#### Domain層
- DiffService：差分計算ロジック
- SummaryService：サマリー生成ロジック
- ドメインモデル：Page, PDF, DiffResult等

#### Infrastructure層
- Repository実装（Sheet/Drive/BigQuery）
- Lock制御
- エラーハンドリング

## 2. データモデル設計

### 2.1 ドメインモデル

```typescript
// Page情報
interface Page {
  url: string;
  hash: string;
  pdfUrls: string[];
}

// PDF情報
interface PDF {
  pageUrl: string;
  pdfUrl: string;
  firstSeen: Date;
  lastSeen: Date;
}

// 差分結果
interface DiffResult {
  pageUrl: string;
  pageUpdated: boolean;
  pdfUpdated: boolean;
  addedPdfUrls: string[];
  removedPdfUrls: string[];
  addedCount: number;
}

// バッチ実行結果
interface BatchResult {
  execId: string;
  processedPages: number;
  updatedPages: number;
  addedPdfs: number;
  duration: number;
  errors: Error[];
}
```

### 2.2 リポジトリインターフェース

```typescript
// アーカイブリポジトリ
interface IArchiveRepository {
  getPdfsByPage(pageUrl: string): Promise<PDF[]>;
  upsertPdfs(pdfs: PDF[]): Promise<void>;
  getAllPdfs(): Promise<PDF[]>;
}

// 履歴リポジトリ
interface IHistoryRepository {
  addPageHistory(entries: PageHistoryEntry[]): Promise<void>;
  getPageHistory(pageUrl: string, limit: number): Promise<PageHistoryEntry[]>;
}

// サマリーリポジトリ
interface ISummaryRepository {
  updatePageSummary(pageUrl: string, result: DiffResult): Promise<void>;
  getPageSummary(pageUrl: string): Promise<PageSummary>;
}

// 実行ログリポジトリ
interface IRunLogRepository {
  addRunLog(log: RunLogEntry): Promise<void>;
  getRunLogs(limit: number): Promise<RunLogEntry[]>;
}
```

## 3. 処理フロー詳細

### 3.1 メイン処理フロー

1. **データ入力**
   - ユーザーがChrome拡張でページを開く
   - 拡張機能がPage URL、Hash、PDF URLsを抽出
   - TSV形式でクリップボードにコピー

2. **バッチ処理起動**
   - CurrentシートにTSVを貼り付け
   - runJudge()ボタンクリック
   - 50件ずつバッチに分割
   - 並列実行（最大10バッチ同時）

3. **差分計算**（ロック外）
   - 現在のPDFリストを取得
   - 新旧比較で追加・削除を検出
   - DiffResultを生成

4. **データ更新**（DocumentLock内）
   - ArchivePDF更新（80ms/URL）
   - PageSummary更新（3世代管理）
   - PageHistory追記
   - RunLog追記

5. **結果反映**
   - Changesシート再生成
   - UserLog追記
   - Currentシートクリア

### 3.2 エラーハンドリング

- ロックタイムアウト：10秒待機、3回リトライ
- バッチエラー：部分成功を許可
- ネットワークエラー：指数バックオフでリトライ
- データ不整合：トランザクション的に処理

## 4. モジュール構成

### 4.1 Chrome拡張機能
```
extension/
├── manifest.json
├── src/
│   ├── background.ts
│   ├── content.ts
│   ├── popup.ts
│   └── utils/
│       ├── extractor.ts
│       └── formatter.ts
├── assets/
└── tests/
```

### 4.2 Client GAS
```
client-gas/
├── src/
│   ├── c-00-globals.ts    # グローバル型定義
│   ├── c-01-parser.ts     # データパース処理
│   ├── c-02-ui.ts         # UI更新ロジック
│   ├── c-03-batch.ts      # バッチ分割ロジック
│   ├── c-04-setup.ts      # 初期設定関数
│   ├── c-05-main.ts       # runJudge()エントリ
│   └── c-99-gas-entry.ts  # GASエントリポイント
├── clasp.json
├── tsconfig.json    # target: ES5, module: none
└── tests/
```

### 4.3 Server Library
```
server-gas/
├── src/
│   ├── s-00-globals.ts     # グローバル型定義
│   ├── s-01-config.ts      # DI設定
│   ├── s-02-index.ts       # ライブラリエントリ
│   ├── s-03-setup.ts       # 初期設定関数
│   ├── domain/
│   │   ├── services/
│   │   │   ├── s-DiffService.ts
│   │   │   └── s-SummaryService.ts
│   │   └── models/
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── s-SheetArchiveRepository.ts
│   │   │   ├── s-SheetHistoryRepository.ts
│   │   │   ├── s-SheetRunLogRepository.ts
│   │   │   └── s-SheetSummaryRepository.ts
│   │   ├── lock/
│   │   │   └── s-DocumentLock.ts
│   │   └── utils/
│   │       └── s-uuid.ts
│   └── interfaces/
├── clasp.json
├── tsconfig.json    # target: ES5, module: none
└── tests/
```

### 4.4 Master GAS
```
master-gas/
├── src/
│   ├── m-setup.js      # スプレッドシート初期設定
│   └── appsscript.json
└── clasp.json
```

### 4.5 共通コア
```
core/
├── src/
│   ├── interfaces/      # 共通インターフェース
│   ├── models/          # 共通モデル
│   └── constants.ts     # 定数定義
└── tests/
```

## 5. 性能設計

### 5.1 並列処理設計
- バッチサイズ：50 URL/バッチ
- 並列数：最大10バッチ同時実行
- タイムアウト：30秒/バッチ
- リトライ：3回（指数バックオフ）

### 5.2 ロック戦略
- DocumentLock使用（GAS標準）
- ロック粒度：ArchivePDF + PageSummary
- ロック時間：80ms/URL
- 待機時間：最大10秒
- AppendRowはロック不要

### 5.3 メモリ管理
- 1ファイル400行制限
- 大量データは分割処理
- ストリーミング処理優先
- 不要オブジェクトの即時解放

## 6. セキュリティ設計

### 6.1 アクセス制御
- 中央シート：管理者のみ編集可
- クライアントシート：個人所有
- ライブラリ：読み取り専用公開

### 6.2 データ保護
- 個人情報非保持
- URLのみ記録
- ユーザーメールはログのみ

## 7. テスト戦略

### 7.1 単体テスト
- Jest使用
- カバレッジ目標：80%以上
- モック活用でGAS依存を排除

### 7.2 結合テスト
- 実際のスプレッドシートで検証
- 並列実行シナリオ
- エラー注入テスト

### 7.3 受入テスト
- 要件定義書のT-01〜T-05実施
- 性能目標の検証
- ユーザビリティ確認

## 8. デプロイ戦略

### 8.1 CI/CD
- GitHub Actions使用
- mainブランチで自動デプロイ
- clasp pushでGASアップロード

### 8.2 バージョニング
- セマンティックバージョニング
- GASライブラリバージョン管理
- 後方互換性の維持

## 9. 拡張性考慮

### 9.1 リポジトリ切り替え
- DI（Dependency Injection）採用
- configure()で実装切り替え
- インターフェース準拠で追加可能

### 9.2 将来拡張
- Drive保存（JSON.gzip）
- BigQuery連携
- Cloud Functions実行
- 通知機能（Slack/Mail）

## 10. GAS互換性設計

### 10.1 コード構造
- **import/export文の不使用**
  - すべてのクラス・関数はグローバルスコープで定義
  - 型定義は専用のglobalsファイルに集約
- **ファイル命名規則**
  - プレフィックスで読み込み順序を制御
  - 数字で依存関係を明示（00が最初に読み込まれる）
- **TypeScript設定**
  - target: ES5（GAS実行環境に合わせる）
  - module: none（モジュールシステム無効化）

### 10.2 ライブラリ管理
- サーバー側はライブラリとして公開
- クライアント側はversion: "HEAD"で最新版を参照
- 更新時は手動でライブラリ更新が必要（キャッシュ対策）

## 11. 運用考慮事項

### 11.1 監視
- RunLogで実行状況把握
- エラー率の監視
- 性能劣化の検知

### 11.2 メンテナンス
- 定期的なアーカイブ
- 不要データの削除
- インデックス最適化

### 11.3 障害対応
- エラーログから原因特定
- 部分再実行可能な設計
- データ整合性の検証ツール
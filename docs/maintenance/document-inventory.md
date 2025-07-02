# PDF Watcher ドキュメント一覧

## 概要
このドキュメントは、PDF Watcherプロジェクトの全ドキュメントを管理するための一覧です。
各ドキュメントのカテゴリ、更新要否、作成目的を記載しています。

**最終更新日**: 2025-07-02  
**管理者**: shimizu

## カテゴリ定義

- **Basic（基本）**: 機能追加・変更時に必ず更新が必要なドキュメント
- **Feature-specific（機能別）**: 特定機能のために作成されたドキュメント
- **Archived（アーカイブ）**: 役目を終えて更新不要なドキュメント

## ルートディレクトリのドキュメント

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| README.md | Basic | /README.md | プロジェクト概要とクイックスタートガイド。プロジェクトのエントリーポイント | 2025-06-28 |
| 要件定義書.md | Basic | /要件定義書.md | システム要件定義書（v6.0）。システムの全要件とゴールを定義 | 2025-06-28 |
| 開発ガイド.md | Basic | /開発ガイド.md | 開発ガイドと現在の進捗状況、実装ガイドライン | 2025-06-28 |
| pdfwatcher_design.md | Basic | /pdfwatcher_design.md | システムアーキテクチャと開発設計書。コア技術仕様 | 2025-06-28 |
| CONTRIBUTING.md | Basic | /CONTRIBUTING.md | 開発者向け貢献ガイド。ブランチ戦略とコーディング規約を説明 | 2025-06-26 |

## 拡張機能ドキュメント（/extension/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| DISTRIBUTION.md | Basic | /extension/DISTRIBUTION.md | Chrome拡張機能の配布ガイド | 2025-06-26 |

## コアドキュメント（/docs/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| api-specification.md | Basic | /docs/api-specification.md | コンポーネント間のAPI仕様。システム統合に必須 | 2025-06-28 |
| FAQ.md | Basic | /docs/FAQ.md | よくある質問集。一般、機能、技術的な質問をカバー | 2025-06-28 |
| troubleshooting.md | Basic | /docs/troubleshooting.md | トラブルシューティングガイド。インストール、実行時、GASの問題対応 | 2025-06-26 |
| header-mapping.md | Basic | /docs/header-mapping.md | 日英ヘッダーマッピング。国際化対応用 | 2025-06-27 |

## 機能別ドキュメント

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| execution-time-limit-spec.md | Feature-specific | /docs/execution-time-limit-spec.md | GAS 6分実行時間制限対策の仕様書 | 2025-06-26 |
| execution-time-limit-behavior.md | Feature-specific | /docs/execution-time-limit-behavior.md | 6分制限処理の詳細動作ドキュメント | 2025-06-26 |
| summary_history_extension_design.md | Feature-specific | /docs/summary_history_extension_design.md | PageSummary履歴を3世代から7世代に拡張する設計書 | 2025-06-28 |
| changes-history_design.md | Feature-specific | /docs/TODOリスト/changes-history_design.md | Changes履歴保存機能（5日間保持）の設計書 | 2025-06-26 |
| future-enhancements.md | Feature-specific | /docs/future-enhancements.md | 将来の機能拡張案と最適化提案（現在保留中） | 2025-06-26 |
| dev-menu-removal-impact-analysis.md | Feature-specific | /docs/dev-menu-removal-impact-analysis.md | スプレッドシートから開発メニューを削除する影響分析 | 2025-06-26 |
| pdf_link_text_design.md | Feature-specific | /docs/pdf_link_text_design.md | PDFリンク件名取得機能の設計書 | 2025-06-30 |
| link_text_extraction_design.md | Feature-specific | /docs/link_text_extraction_design.md | リンクテキスト抽出機能改善設計書（テスト完了） | 2025-07-02 |

## TODOリスト（/docs/TODOリスト/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| pdfwatcher_TODO.md | Basic | /docs/TODOリスト/pdfwatcher_TODO.md | メイン開発TODOリスト。プロジェクト全体の進捗管理 | 2025-06-28 |
| summary_history_extension_TODO.md | Feature-specific | /docs/TODOリスト/summary_history_extension_TODO.md | PageSummary 7世代履歴拡張のTODOリスト（完了） | 2025-06-28 |
| changes-history_TODO.md | Feature-specific | /docs/TODOリスト/changes-history_TODO.md | Changes履歴保存機能のTODOリスト | 2025-06-26 |
| Fixed_execution_time_limit_TODO.md | Archived | /docs/TODOリスト/Fixed_execution_time_limit_TODO.md | 6分実行制限機能の完了済みTODO | 2025-06-26 |
| initial-implementation_TODO.md | Archived | /docs/TODOリスト/initial-implementation_TODO.md | 初期実装TODOリスト（完了） | 2025-06-26 |
| pdf_link_subject_TODO.md | Feature-specific | /docs/TODOリスト/pdf_link_subject_TODO.md | PDFリンク件名取得機能のTODOリスト（Chrome拡張機能完了） | 2025-06-30 |
| link_text_extraction_TODO.md | Feature-specific | /docs/TODOリスト/link_text_extraction_TODO.md | リンクテキスト抽出機能改善TODOリスト（完了） | 2025-07-02 |

## テストドキュメント（/docs/test/）

### メインテストドキュメント

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| eslint-fix-test-specification.md | Feature-specific | /docs/test/eslint-fix-test-specification.md | ESLint準拠テスト仕様書 | 2025-06-26 |
| eslint-fix-test-cases.md | Feature-specific | /docs/test/eslint-fix-test-cases.md | ESLint修正テストケース | 2025-06-26 |
| eslint-fix-test_TODO.md | Feature-specific | /docs/test/eslint-fix-test_TODO.md | ESLint修正テストTODO | 2025-06-26 |
| Fixed_test-specification.md | Archived | /docs/test/Fixed_test-specification.md | 完了済み一般テスト仕様書 | 2025-06-26 |
| Fixed_test-design.md | Archived | /docs/test/Fixed_test-design.md | 完了済みテスト設計書 | 2025-06-26 |
| Fixed_test_TODO.md | Archived | /docs/test/Fixed_test_TODO.md | 完了済みテストTODOリスト | 2025-06-26 |
| Fixed_duplicate_cleanup_TODO.md | Archived | /docs/test/Fixed_duplicate_cleanup_TODO.md | 重複クリーンアップテストTODO（完了） | 2025-06-26 |
| Fixed_status_field_test_TODO.md | Archived | /docs/test/Fixed_status_field_test_TODO.md | ステータスフィールドテストTODO（完了） | 2025-06-26 |

### 6分制限対策テスト（/docs/test/execution-time-limit/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| test-results-summary.md | Feature-specific | /docs/test/execution-time-limit/test-results-summary.md | 6分制限対策テスト結果サマリー | 2025-06-26 |
| Fixed_test-specification.md | Archived | /docs/test/execution-time-limit/Fixed_test-specification.md | 6分制限対策テスト仕様書（完了） | 2025-06-26 |
| Fixed_test-specification_TODO.md | Archived | /docs/test/execution-time-limit/Fixed_test-specification_TODO.md | 6分制限対策テストTODO（完了） | 2025-06-26 |

### ステータスフィールドテスト（/docs/test/status-field/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| Fixed_test-instructions.md | Archived | /docs/test/status-field/Fixed_test-instructions.md | ステータスフィールドテスト手順（完了） | 2025-06-26 |
| Fixed_test-results.md | Archived | /docs/test/status-field/Fixed_test-results.md | ステータスフィールドテスト結果（完了） | 2025-06-26 |

### Changes履歴テスト（/docs/test/changes-history/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| changes-history_test.md | Feature-specific | /docs/test/changes-history/changes-history_test.md | Changes履歴機能のテスト仕様書 | 2025-06-26 |
| changes-history_test_TODO.md | Feature-specific | /docs/test/changes-history/changes-history_test_TODO.md | Changes履歴機能テストTODO | 2025-06-26 |
| test-summary.md | Feature-specific | /docs/test/changes-history/test-summary.md | Changes履歴テスト結果のサマリー | 2025-06-26 |
| test-execution-guide.md | Feature-specific | /docs/test/changes-history/test-execution-guide.md | テスト実行ガイド | 2025-06-26 |
| test-execution-log.md | Feature-specific | /docs/test/changes-history/test-execution-log.md | テスト実行ログ | 2025-06-26 |
| TC-005-test-procedure.md | Feature-specific | /docs/test/changes-history/TC-005-test-procedure.md | TC-005テスト手順 | 2025-06-26 |
| TC-005-test-result.md | Feature-specific | /docs/test/changes-history/TC-005-test-result.md | TC-005テスト結果 | 2025-06-26 |
| TC-005-test-result-detail.md | Feature-specific | /docs/test/changes-history/TC-005-test-result-detail.md | TC-005テスト結果詳細 | 2025-06-26 |

### 7世代履歴テスト（/docs/test/summary_history_extension/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| summary_history_extension_test.md | Feature-specific | /docs/test/summary_history_extension/summary_history_extension_test.md | 7世代履歴拡張のテスト仕様書 | 2025-06-28 |
| summary_history_extension_test_TODO.md | Feature-specific | /docs/test/summary_history_extension/summary_history_extension_test_TODO.md | 履歴拡張機能のテストTODOリスト | 2025-06-28 |
| test_scenarios.md | Feature-specific | /docs/test/summary_history_extension/test_result/test_scenarios.md | 7世代拡張テストシナリオ | 2025-06-28 |
| test_scenarios_v2.md | Feature-specific | /docs/test/summary_history_extension/test_result/test_scenarios_v2.md | 7世代拡張テストシナリオ v2 | 2025-06-28 |

### PDFリンク件名取得テスト（/docs/test/pdf_link_subject/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| pdf_link_subject_test.md | Feature-specific | /docs/test/pdf_link_subject/pdf_link_subject_test.md | PDFリンク件名取得機能のテスト仕様書 | 2025-06-30 |
| pdf_link_subject_test_TODO.md | Feature-specific | /docs/test/pdf_link_subject/pdf_link_subject_test_TODO.md | PDFリンク件名取得機能のテストTODOリスト（完了） | 2025-06-30 |
| integrated-verification-guide.md | Feature-specific | /docs/test/pdf_link_subject/integrated-verification-guide.md | 統合検証ガイド | 2025-06-30 |
| pdf-subject-verification-tool.gs | Feature-specific | /docs/test/pdf_link_subject/pdf-subject-verification-tool.gs | Google Apps Script検証ツール | 2025-06-30 |

### リンクテキスト抽出テスト（/docs/test/link_text_extraction/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| link_text_extraction_test.md | Feature-specific | /docs/test/link_text_extraction/link_text_extraction_test.md | リンクテキスト抽出機能改善のテスト仕様書 | 2025-07-02 |
| link_text_extraction_test_TODO.md | Feature-specific | /docs/test/link_text_extraction/link_text_extraction_test_TODO.md | リンクテキスト抽出機能のテストTODOリスト（完了） | 2025-07-02 |
| test_link_extraction.html | Feature-specific | /docs/test/link_text_extraction/test_link_extraction.html | 統合テスト用HTMLファイル | 2025-07-02 |
| test_performance.html | Feature-specific | /docs/test/link_text_extraction/test_performance.html | パフォーマンステスト用HTML（100個のPDFリンク） | 2025-07-02 |

## メンテナンスドキュメント（/docs/maintenance/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| document-update-findings.md | Basic | /docs/maintenance/document-update-findings.md | ドキュメント更新調査結果と発見事項 | 2025-06-26 |
| document-update-check-tasks.md | Basic | /docs/maintenance/document-update-check-tasks.md | ドキュメント更新状況確認タスク | 2025-06-26 |
| document-check-commands.md | Basic | /docs/maintenance/document-check-commands.md | ドキュメント整合性確認コマンド集 | 2025-06-26 |
| document-inventory-verification.md | Basic | /docs/maintenance/document-inventory-verification.md | ドキュメントインベントリの検証レポート | 2025-06-28 |
| document-inventory.md | Basic | /docs/maintenance/document-inventory.md | 本ドキュメント。全ドキュメントの管理一覧 | 2025-06-28 |

## ビジネスドキュメント（/docs/business/）

| ドキュメント名 | カテゴリ | ファイルパス | 役割・説明 | 作成日 |
|--------------|----------|-----------|-----------|--------|
| market-value-analysis.md | Feature-specific | /docs/business/market-value-analysis.md | システムの市場価値分析と価格根拠 | 2025-06-28 |

## 統計サマリー

**総ドキュメント数**: 64

**カテゴリ別内訳**:
- **Basic（基本）**: 16ドキュメント - 主要機能変更時に必ず更新が必要
- **Feature-specific（機能別）**: 37ドキュメント - 特定機能のために作成されたドキュメント
- **Archived（アーカイブ）**: 11ドキュメント - 完了済みまたは更新不要な歴史的ドキュメント

## 更新ガイドライン

### 機能追加・変更時に必ず更新すべきドキュメント（Basic）

1. **README.md** - 新機能の概要を「主な機能」セクションに追加
2. **要件定義書.md** - 新要件を該当セクションに追加
3. **開発ガイド.md** - 実装状況を更新
4. **pdfwatcher_design.md** - アーキテクチャ変更を反映
5. **api-specification.md** - API変更を記載
6. **FAQ.md** - 新機能に関する質問を追加
7. **pdfwatcher_TODO.md** - 全体の進捗を更新
8. **DISTRIBUTION.md** - 拡張機能の配布方法を更新（該当する場合）

### 機能別ドキュメントの扱い

- 新機能開発時は専用の設計書、TODO、テスト仕様書を作成
- 機能完了後、TODOは「完了」ステータスに更新
- 設計書とテスト仕様書は記録として保持

### アーカイブドキュメントの扱い

- "Fixed_"プレフィックスがついたドキュメントは完了済み
- 更新は不要だが、履歴参照のため保持
- 新規開発時の参考資料として活用可能

## メンテナンス手順

1. 新機能開発開始時
   - Feature-specificカテゴリに設計書、TODO、テスト仕様書を作成
   - このドキュメント一覧を更新

2. 機能実装完了時
   - すべてのBasicドキュメントを確認・更新
   - 関連するFeature-specificドキュメントのステータスを更新

3. 定期レビュー（月次推奨）
   - ドキュメント一覧の内容を確認
   - 不要なドキュメントをArchived化
   - 新規作成されたドキュメントを追加
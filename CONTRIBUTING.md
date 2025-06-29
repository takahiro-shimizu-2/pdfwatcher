# PDF Watcher コントリビューションガイド

PDF Watcherプロジェクトへの貢献をご検討いただき、ありがとうございます！このガイドでは、プロジェクトへの貢献方法について説明します。

## 目次

- [開発環境のセットアップ](#開発環境のセットアップ)
- [プロジェクト構造](#プロジェクト構造)
- [ブランチ戦略](#ブランチ戦略)
- [コーディング規約](#コーディング規約)
- [テスト](#テスト)
- [Pull Requestのガイドライン](#pull-requestのガイドライン)
- [イシューの報告](#イシューの報告)

## 開発環境のセットアップ

### 前提条件

- Node.js (v16以上)
- npm または yarn
- Google Cloud Platform アカウント
- Chrome ブラウザ
- clasp (Google Apps Script CLI)

### 初期セットアップ

1. リポジトリをクローン
   ```bash
   git clone https://github.com/takahiro-shimizu-2/pdfwatcher.git
   cd pdfwatcher
   ```

2. 全モジュールの依存関係をインストール
   ```bash
   npm run install:all
   ```

3. GAS認証設定
   ```bash
   npm run clasp:login
   ```

4. ビルド
   ```bash
   npm run build:all
   ```

## プロジェクト構造

```
pdfwatcher/
├── core/               # 共通コアモジュール
├── server-gas/         # サーバー側GASプロジェクト
├── client-gas/         # クライアント側GASプロジェクト
├── extension/          # Chrome拡張機能
├── docs/               # ドキュメント
└── master-gas/         # マスターGAS設定
```

### 各モジュールの役割

- **core**: 型定義、インターフェース、共通ロジック
- **server-gas**: Googleスプレッドシートのデータ管理
- **client-gas**: ユーザー向けUI、バッチ処理、履歴管理
  - `c-13-history-manager.ts`: Changes履歴の保存・削除機能
- **extension**: PDF URLとリンク件名の抽出、TSV生成（複数行形式）

### 主要な機能

- PDF監視・差分検出
- 6分実行時間制限対策
- Changes履歴保存機能（5日間の自動保存・削除）
- PageSummary 7世代履歴管理（2025年6月28日拡張）
- PDFリンク件名取得機能（2025年6月30日実装）

## ブランチ戦略

このプロジェクトでは以下のブランチ戦略を採用しています：

### ブランチの種類

1. **main**
   - 本番環境にデプロイされるブランチ
   - 直接のコミットは禁止
   - developブランチからのマージのみ許可

2. **develop**
   - 開発の統合ブランチ
   - 全ての機能開発はここに統合される
   - mainへのリリース前の最終確認場所

3. **feature/***
   - 機能開発用のブランチ
   - developブランチから作成
   - 開発完了後はdevelopブランチにマージ
   - 命名規則: `feature/機能名` (例: `feature/testing-phase`, `feature/add-notification`)

4. **fix/***
   - バグ修正用のブランチ
   - 命名規則: `fix/バグ内容` (例: `fix/execution-time-limit`)

5. **docs/***
   - ドキュメント更新用のブランチ
   - 命名規則: `docs/ドキュメント名` (例: `docs/api-specification`)

### ワークフロー

```
feature/xxx → develop → main
```

1. developブランチから機能ブランチを作成
   ```bash
   git checkout develop
   git checkout -b feature/新機能名
   ```

2. 機能開発を行い、コミット

3. developブランチへのプルリクエストを作成
   - CIが全て通ることを確認
   - コードレビューを受ける

4. developブランチにマージ

5. リリース時にdevelopからmainへのプルリクエストを作成

## コーディング規約

### TypeScript

- **インデント**: スペース2つ
- **セミコロン**: 必須
- **クォート**: シングルクォート
- **命名規則**:
  - 変数・関数: camelCase
  - クラス・インターフェース: PascalCase
  - 定数: UPPER_SNAKE_CASE

### GAS互換性

Google Apps Script環境での動作に注意してください:

1. **import/export文を使用しない**
   ```typescript
   // ❌ 使用不可
   import { Something } from './module';
   
   // ✅ グローバル変数として定義
   const Something = SomethingModule.Something;
   ```

2. **ファイル名プレフィックス**
   - クライアント: `c-`
   - サーバー: `s-`
   - 共通: `m-`

3. **TypeScriptターゲット**: ES5

### コミットメッセージ

以下の形式に従ってください:

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードスタイルの変更
- `refactor:` リファクタリング
- `test:` テストの追加・修正
- `chore:` ビルドプロセスやツールの変更

例:
```
feat: PDFハッシュ値による高速化を実装
fix: 6分制限エラーの修正
docs: READMEに使用方法を追加
feat: PDFリンク件名取得機能を実装
```

明確で簡潔なコミットメッセージを心がけてください：

- 日本語でのコミットメッセージを推奨
- 何を変更したかではなく、なぜ変更したかを説明
- 例: 「ボタンを追加」ではなく「ユーザーが設定を保存できるようにボタンを追加」

## Chrome拡張機能の開発

Chrome拡張機能の開発では、esbuildを使用した高速ビルドシステムを採用しています：

### 開発時のビルド
```bash
cd extension
npm run build
```

### ファイル監視モード（開発中）
```bash
cd extension
npm run watch  # 未実装の場合は手動でビルド
```

### 本番用パッケージ作成
```bash
cd extension
npm run build
npm run package  # extension.zipを作成
```

**注意事項:**
- 開発時は`manifest.json`を使用（scriptingパーミッション付き）
- 本番ビルドでは`manifest-prod.json`を使用（最小限のパーミッション）
- ビルド成果物は`dist/`ディレクトリに出力される

## テスト

テストを実行する前に必ずlintを実行してください：

```bash
npm run lint
npm test
```

### テストの種類

1. **単体テスト**: 各関数・クラスの動作を検証
2. **統合テスト**: モジュール間の連携を検証
3. **E2Eテスト**: 実際の使用シナリオを検証

テストファイルは `*.test.ts` または `*.spec.ts` の形式で作成してください。

## GitHub Actions

このプロジェクトではGitHub Actionsによる自動テストが設定されています。
プルリクエストを作成すると自動的に以下が実行されます：

- ビルド (`npm run build`)
- リント (`npm run lint`)
- テスト (`npm test`)

全てのチェックが通ることを確認してからマージしてください。

## Pull Requestのガイドライン

### PR作成前のチェックリスト

- [ ] コードがビルドできる
- [ ] すべてのテストが通る
- [ ] ESLintエラーがない
- [ ] 新機能の場合、テストを追加した
- [ ] ドキュメントを更新した（必要な場合）

### PRテンプレート

プルリクエストを作成する際は以下を含めてください：

```markdown
## 概要
変更内容の簡潔な説明

## 変更内容
- 追加した機能
- 修正したバグ
- リファクタリング内容

## テスト計画
- [ ] 単体テスト追加
- [ ] 統合テスト確認
- [ ] 手動テスト完了

## スクリーンショット
（UIの変更がある場合）

## 関連Issue
#123
```

### レビュープロセス

1. PRを作成
2. 自動テストが実行される
3. レビュアーからのフィードバック
4. 必要に応じて修正
5. 承認後マージ

## イシューの報告

### バグ報告

以下の情報を含めてください:

1. **環境情報**
   - OS
   - ブラウザバージョン
   - Node.jsバージョン

2. **再現手順**
   - 具体的な操作手順
   - 期待される動作
   - 実際の動作

3. **エラーログ**
   - コンソールエラー
   - GASログ

### 機能要望

1. **背景**: なぜその機能が必要か
2. **提案**: 具体的な実装案
3. **代替案**: 他の解決方法

## 開発に役立つリソース

### プロジェクトドキュメント

- [設計書](docs/pdfwatcher_design.md)
- [要件定義書](要件定義書.md)
- [開発ガイド](開発ガイド.md)
- [初期実装ログ](docs/TODOリスト/initial-implementation_TODO.md)

### 外部リソース

- [Google Apps Script リファレンス](https://developers.google.com/apps-script/reference)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs/)

## 質問・サポート

- GitHub Issuesで質問
- メンテナーへの直接連絡

## ライセンス

このプロジェクトへの貢献は、プロジェクトのライセンスに従うものとします。

---

プロジェクトへの貢献をお待ちしています！
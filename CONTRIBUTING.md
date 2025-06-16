# コントリビューションガイド

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

### プルリクエストの作成

プルリクエストを作成する際は以下を含めてください：

- 変更内容の概要
- 実装した機能の詳細
- テスト計画
- スクリーンショット（UIの変更がある場合）

### コミットメッセージ

明確で簡潔なコミットメッセージを心がけてください：

- 日本語でのコミットメッセージを推奨
- 何を変更したかではなく、なぜ変更したかを説明
- 例: 「ボタンを追加」ではなく「ユーザーが設定を保存できるようにボタンを追加」

## 開発環境のセットアップ

1. リポジトリをクローン
   ```bash
   git clone https://github.com/takahiro-shimizu-2/pdfwatcher.git
   cd pdfwatcher
   ```

2. 依存関係をインストール
   ```bash
   npm install
   ```

3. ビルド
   ```bash
   npm run build
   ```

### Chrome拡張機能の開発

Chrome拡張機能の開発では、esbuildを使用した高速ビルドシステムを採用しています：

1. 開発時のビルド
   ```bash
   cd extension
   npm run build
   ```

2. ファイル監視モード（開発中）
   ```bash
   cd extension
   npm run watch  # 未実装の場合は手動でビルド
   ```

3. 本番用パッケージ作成
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

## GitHub Actions

このプロジェクトではGitHub Actionsによる自動テストが設定されています。
プルリクエストを作成すると自動的に以下が実行されます：

- ビルド (`npm run build`)
- リント (`npm run lint`)
- テスト (`npm test`)

全てのチェックが通ることを確認してからマージしてください。
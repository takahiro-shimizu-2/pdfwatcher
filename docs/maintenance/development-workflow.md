# 開発環境セットアップガイド

## 概要
本番環境に影響を与えずに新機能開発を行うための環境構築手順。

## 環境構成

### 1. 本番環境
- マスタースプレッドシート（本番データ）
- 本番用GASプロジェクト
- 本番用サーバーライブラリ

### 2. 開発環境
- 開発用スプレッドシート（テストデータ）
- 開発用GASプロジェクト
- 開発用サーバーライブラリ

## セットアップ手順

### 1. 開発用スプレッドシートの作成
```javascript
// 1. マスタースプレッドシートをコピー
// Google Driveで右クリック → 「コピーを作成」

// 2. 名前を変更
// 例: "PDFWatcher Master [開発用]"
```

### 2. 開発用GASプロジェクトの作成
```bash
# 新しいディレクトリで開発用プロジェクトを作成
mkdir pdfwatcher-dev
cd pdfwatcher-dev

# claspプロジェクトを作成
clasp create --type standalone --title "PDFWatcher Client [開発用]"

# .clasp.jsonをコピー（開発用に）
cp ../pdfwatcher/client-gas/.clasp.json.dev .clasp.json
```

### 3. スクリプトプロパティの設定
開発用GASプロジェクトで以下を設定：
```
MASTER_SPREADSHEET_ID: [開発用スプレッドシートのID]
SERVER_LIBRARY_ID: [開発用サーバーライブラリのID]
ENVIRONMENT: development
```

### 4. 環境切り替えスクリプト
```bash
#!/bin/bash
# scripts/switch-env.sh

if [ "$1" = "dev" ]; then
    cp .clasp.json.dev .clasp.json
    echo "Switched to development environment"
elif [ "$1" = "prod" ]; then
    cp .clasp.json.prod .clasp.json
    echo "Switched to production environment"
else
    echo "Usage: ./switch-env.sh [dev|prod]"
fi
```

## 開発フロー

### 1. 機能開発
```bash
# 開発環境に切り替え
./scripts/switch-env.sh dev

# 新機能のブランチを作成
git checkout -b feature/awesome-feature

# コード開発
# ...

# ビルド & デプロイ（開発環境）
npm run build
cd dist && clasp push
```

### 2. テスト
- 開発用スプレッドシートで動作確認
- エラーがあれば修正
- 十分にテスト

### 3. 本番デプロイ
```bash
# PRをマージ後

# 本番環境に切り替え
./scripts/switch-env.sh prod

# 最新のコードを取得
git checkout main
git pull

# ビルド & デプロイ（本番環境）
npm run build
cd dist && clasp push
```

## 環境別の設定管理

### config/environments.ts
```typescript
interface Environment {
  name: string;
  masterSpreadsheetId: string;
  serverLibraryId: string;
  isProduction: boolean;
}

const environments: Record<string, Environment> = {
  development: {
    name: 'development',
    masterSpreadsheetId: 'dev-spreadsheet-id',
    serverLibraryId: 'dev-library-id',
    isProduction: false
  },
  production: {
    name: 'production',
    masterSpreadsheetId: 'prod-spreadsheet-id',
    serverLibraryId: 'prod-library-id',
    isProduction: true
  }
};

function getCurrentEnvironment(): Environment {
  const env = PropertiesService.getScriptProperties()
    .getProperty('ENVIRONMENT') || 'production';
  return environments[env];
}
```

## ベストプラクティス

### 1. データの分離
- 本番データは本番環境のみ
- テストデータは開発環境で作成
- 個人情報を含むデータは開発環境に持ち込まない

### 2. コードの管理
- すべての変更はGitで管理
- 本番デプロイ前に必ずPRレビュー
- mainブランチは常に本番と同期

### 3. デプロイチェックリスト
- [ ] 開発環境でテスト完了
- [ ] コードレビュー済み
- [ ] ドキュメント更新
- [ ] 本番環境のバックアップ
- [ ] デプロイ時刻の調整（利用者が少ない時間帯）

### 4. ロールバック手順
```bash
# 問題が発生した場合
git checkout [前のバージョンのタグ]
npm run build
cd dist && clasp push
```

## トラブルシューティング

### 環境を間違えてデプロイした場合
1. すぐに正しい環境に切り替え
2. 正しいコードを再デプロイ
3. 影響範囲を確認

### スクリプトプロパティが反映されない場合
1. GASエディタで直接確認
2. キャッシュクリア（GASを再読み込み）
3. プロパティの名前を確認（大文字小文字に注意）
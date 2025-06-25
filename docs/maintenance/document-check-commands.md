# ドキュメント更新確認用コマンド集

このファイルは、複数のAIエージェントが同じ確認作業を効率的に実施できるよう、使用するコマンドをまとめたものです。

## 基本情報確認コマンド

```bash
# プロジェクト構造の確認
ls -la
ls -la docs/
ls -la docs/test/
ls -la docs/TODOリスト/

# Git状態の確認
git status
git log --oneline -n 10

# 変更ファイルの統計
git diff --stat
```

## タスク別コマンド集

### タスク1: プロジェクト概要ドキュメント確認用

```bash
# 主要ドキュメントの変更確認
git diff README.md | head -100
git diff CONTRIBUTING.md | head -100
git diff 要件定義書.md | head -100
git diff 開発ガイド.md | head -100

# ステータス記載の確認
grep -n "完成\|完了" README.md
grep -n "2025-06-25" README.md 要件定義書.md 開発ガイド.md

# ライセンス情報の確認
grep -n -i "license\|ライセンス" README.md
ls -la LICENSE*
```

### タスク2: 設計・仕様ドキュメント確認用

```bash
# 設計書の変更確認
git diff pdfwatcher_design.md | head -100
git diff docs/execution-time-limit-spec.md | head -100
git diff docs/execution-time-limit-behavior.md | head -100

# 6分制限対策の実装確認
grep -n "PAGES_PER_GROUP\|PAGES_PER_MINI_BATCH" pdfwatcher_design.md
grep -n "1.8-2秒\|150-180ページ" docs/*.md

# PDFステータス機能の確認
grep -n "ステータス\|削除確認" pdfwatcher_design.md
```

### タスク3: テスト関連ドキュメント確認用

```bash
# テストドキュメントの状態確認
ls -la docs/test/
ls -la docs/test/execution-time-limit/
find docs/test -name "Fixed_*" -type f

# 削除されたファイルの確認
git status | grep deleted
git log --stat -n 5 | grep -E '(delete|remove)'

# TODOリストの確認
ls -la docs/TODOリスト/
grep -n "completed\|完了" docs/TODOリスト/*.md
```

### タスク4: コード整合性確認用

```bash
# 定数の整合性確認
grep -n "TRIGGER_DELAY_MS" core/src/constants.ts client-gas/src/c-00-globals.ts
grep -n "PAGES_PER_MINI_BATCH" core/src/constants.ts client-gas/src/c-00-globals.ts

# バージョン番号の確認
find . -name "package.json" -type f | xargs grep '"version"' | grep -v node_modules
grep '"version"' extension/manifest.json

# TypeScriptファイルの一覧
find client-gas/src -name "*.ts" | sort
find server-gas/src -name "*.ts" | sort
```

### タスク5: 新規ドキュメント品質確認用

```bash
# 新規追加ファイルの確認
git status | grep "??"
ls -la docs/*.md | grep -v "2025-06"

# 新規ドキュメントの内容確認
head -50 docs/FAQ.md
head -50 docs/troubleshooting.md
head -50 docs/api-specification.md

# リンクの確認
grep -n "http\|\.md" docs/FAQ.md docs/troubleshooting.md
```

### タスク6: 削除ファイル影響確認用

```bash
# 削除ファイルの詳細確認
git log --diff-filter=D --summary | grep delete

# 削除ファイルの最終内容確認（例）
git show HEAD~1:実装状況メモ.md | head -50

# 他ファイルからの参照確認
grep -r "test-design.md" docs/
grep -r "実装状況メモ" .
grep -r "test-specification_TODO" docs/
```

## 便利な検索コマンド

```bash
# 特定のキーワードを含むファイルを検索
find . -type f -name "*.md" | xargs grep -l "6分制限"
find . -type f -name "*.md" | xargs grep -l "ステータス管理"

# 最近更新されたファイルの確認
find docs -type f -name "*.md" -mtime -7 | sort

# ファイルサイズの確認（大きなドキュメントの特定）
find docs -type f -name "*.md" -exec ls -lh {} \; | sort -k5 -h -r | head -10
```

## 出力を保存する場合

```bash
# 調査結果をファイルに保存
git diff --stat > /tmp/git_diff_stat.txt
find . -name "*.md" -type f | sort > /tmp/md_files_list.txt
grep -r "TODO\|FIXME" docs/ > /tmp/todo_items.txt
```

## 注意事項

1. これらのコマンドは、プロジェクトルートディレクトリで実行することを前提としています
2. 大量の出力が予想される場合は、`| head -n 50` などでフィルタリングしてください
3. 複数のエージェントが同時に作業する場合、読み取り専用のコマンドのみを使用してください
# タスク管理アプリ

タスクを「日/週/月/年/在学中/人生」というスケールで分けて管理し、直近5週間は習慣トラッカー的なカレンダービューで一覧できるタスク管理アプリです。達成したタスクや日々の出来事を画像付きの「実績ログ」として記録でき、PC・スマホ間でリアルタイムに同期します（PWA対応、ホーム画面への追加も可能）。

## 主な機能

- タスク管理（スケール/分類/ステータス/期限日・重要フラグ）
- 直近5週間のカレンダービュー（土日の色分け、期限つきタスクの視認性強調など）
- 長期タスク（月/年/在学中/人生）の未着手一覧
- タスク達成→実績ログへの昇格フロー、画像付き実績記録
- 背景画像のカスタマイズ
- Googleカレンダーの予定を読み取り専用で重ねて表示（非公開iCal URL方式）
- マジックリンク（メールOTP）認証、PWA対応

## 技術スタック

- [Next.js](https://nextjs.org)（App Router）+ TypeScript + Tailwind CSS
- [Supabase](https://supabase.com)（Postgres / Auth / Storage）
- [node-ical](https://www.npmjs.com/package/node-ical)（Googleカレンダー連携）
- デプロイ: [Vercel](https://vercel.com)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの準備

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. SQL Editorで [`supabase/schema.sql`](supabase/schema.sql) の内容を実行
3. Storage で非公開バケット `achievement-images` と `backgrounds` を作成（バケット作成後のポリシーは`schema.sql`内に含まれています）
4. Authentication → URL Configuration で Site URL / Redirect URLs を設定

### 3. 環境変数の設定

`.env.local.example` を `.env.local` にコピーし、SupabaseプロジェクトのURLとanon keyを入力してください。

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

### 4. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## デプロイ

[Vercel](https://vercel.com) にGitHubリポジトリを連携し、環境変数（上記の2つ）を設定してデプロイしてください。デプロイ後のURLをSupabaseの Site URL / Redirect URLs にも追加する必要があります。

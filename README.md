# INIAD Nexus

INIAD生のための、学内サービス（Toyo-net, Slack, MOOCSなど）を一元管理するポータルPWAアプリです。

## 公開リンク(スマホ対応済)

https://iniad-nexus.vercel.app/

## 開発の始め方

```bash
# 1. 必要なライブラリを入れる（最初に1回だけ）
npm install

# 2. 開発サーバーを起動する
npm run dev
```

## 作業の進め方

### 1. 作業を始める時（最新にする）

まず main ブランチに戻り、最新の状態を取り込む。

```bash
git checkout main
git pull origin main

git checkout 自分のブランチ
git merge main
```

### 2. 機能ごとに作業用ブランチを作る

直接 main をいじらず別ブランチを変更する。

```bash
git branch ブランチ名
git checkout 自分のブランチ
```

### 3. PR作成

```bash
# 変更をステージング
git add .

# メッセージを付けて保存（何をしたか分かりやすく！）
git commit -m "コミット内容"

# GitHubにアップロード
# ブランチ名は自分のいるブランチ名
git push origin 自分のブランチ名
```

### 4. マージ (Pull Request)

GitHubの画面を開き、「Compare & pull request」ボタンを押して、main に取り込んでもらう申請を出す
※PRは誰が通してもOK

### 5. 作業中に main が進んでしまった時

PRを出そうとしたら main が更新されていた時

```bash
# 1. まず自分の今の作業をコミットして保存する
git add .
git commit -m "作業内容"

# 2. mainブランチに移動して、最新の状態に更新する
git checkout main
git pull origin main

# 3. 自分の作業ブランチに戻る
git checkout feat/自分のブランチ名

# 4. 最新の main を自分のブランチに取り込む（合体）
git merge main
```

※ 手順4で コンフリクトと表示された場合 同じファイルの同じ行を、あなたと他の人が同時に編集しています。 VS Code上で「<<<< head」のような記号が出るので、どちらを残すか修正し、再度

```bash
git add .
git commit
```

してください。

コンフリクトがなければ、そのままアップロードする。

```bash
git push origin 自分のブランチ名
```

## 技術スタック

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS（仮）
- **Deployment:** Vercel
- **PWA:** next-pwa (予定)

## **開発フェーズ (Roadmap)**

- **Phase 1: リンク・ランチャー機能**
  - [x] Next.js環境構築 & Vercelデプロイ
  - [x] PWA化（ホーム画面追加）
  - [ ] 主要サービス（Ace, G, Slack, MOOCS）へのリンク実装
  - [ ] 各サービスからiniad-nexusへ戻れるようにする

- **Phase 2: UI/UXの向上**
  - [ ] INIADライクなUIデザインの実装
  - [ ] 各サービスのロゴ画像の配置
  - [ ] アニメーションなどのインタラクション追加
  - [ ] iPhone / Android での表示最適化

- **Phase 3: 機能拡張（検討中）**
  - [ ] スケジュール機能の実装
  - [ ] またはGoogle Calendar API連携（スケジュールの表示）
  - [ ] その他欲しい拡張機能を追加して可

  **以下セキュリティ上の問題を考慮して検討中**
  - [ ] Supabaseでユーザー機能(Googleログイン)
  - [ ] カスタムリンク追加機能（ユーザーが好きなURLを登録できる）
  - [ ]
  - _※課題の自動取得機能については、セキュリティとAPIの兼ね合いで調査中。_

# コミュニティ機能 設計仕様

- **作成日**: 2026-06-16
- **対象リポジトリ**: Ink-Evokution（スプラトゥーン3 アップデートの軌跡）
- **ステータス**: 設計承認済み / 実装計画 未着手

## 1. 目的とゴール

非公式ファンメイドのデータアーカイブサイトを、ユーザーが交流できる**コミュニティ**へ育てる。具体的には以下を可能にする。

- **アカウント所持**（サインアップ／ログイン）
- **コメント投稿**
- **いいね**
- **返信**

読むこと（閲覧）は誰でもできる。投稿系アクション（コメント・いいね・返信・通報）はログイン必須。

## 2. 非ゴール（今回やらないこと）

- フロントエンドのフレームワーク移行（Next.js 等への載せ替えはしない）
- 総合掲示板（コンテンツに紐づかない自由掲示板）
- プロフィールページ
- 返信通知・メール通知
- 人気順ソート
- 画像投稿・Markdown・リッチテキスト
- 深いネスト（多段スレッド）

これらは将来の検討対象（後述 Phase 3）であり、本仕様の範囲外。

## 3. 全体アーキテクチャ

現状は **ビルド不要の静的サイト**（Vanilla HTML/CSS/JS、Chart.js は CDN、Vercel デプロイ、データは `js/*-data.js` に直書き）。この性質を保ったまま、動的部分だけを足す。

- **フロントエンドは今のまま静的**。コミュニティUIは各ページに差し込む「ウィジェット」として追加する。
- **`/api/*` に Vercel サーバーレス関数**を新設し、**Neon（Postgres）** と通信する。
- **認証は Clerk**（後述）。フロントは Clerk JS でログインUI／セッションを扱い、API 側は Clerk のトークンを検証してユーザーIDを得る。
- 「フロントはビルドレス」を維持する。Node 依存（Clerk backend / Neon ドライバ）を持つのは **`/api` 関数だけ**。これは Vercel がビルド・同梱する。コンテンツ閲覧ページはこれまで通りビルド不要。

```
[ブラウザ]
  ├─ 静的ページ (index/weapons/mains/kits/range.html)  … 変更最小
  │    └─ comments ウィジェット (js/comments.js)
  │          ├─ Clerk JS（ログイン状態・トークン取得）
  │          └─ fetch → /api/*
  └─ Clerk（ログインUI / セッション）

[Vercel サーバーレス関数 /api/*]
  ├─ Clerk トークン検証（@clerk/backend）
  └─ Neon（@neondatabase/serverless）へSQL

[Neon / Postgres]  … profiles / comments / comment_likes / reports
```

## 4. 認証（Clerk）

- 認証サービスは **Clerk**。ドロップインの Vanilla JS SDK でサインアップ／ログインUI・セッション・ソーシャルログインを提供する。
- **有効化するログイン手段**（初期）: **Discord** と **Google**。
  - Discord = Splatoon コミュニティの中心。ハンドル名・アイコンをそのままプロフィールに使える。
  - Google = 誰でも持つ汎用の受け皿。
  - 後から管理画面のトグルで増減可能（X 等）。
- フロント: Clerk JS をヘッダに読み込み、未ログイン時は「ログイン」ボタン、ログイン時はユーザーボタン（アバター＋メニュー）を表示。
- API: リクエストの `Authorization: Bearer <session token>` を `@clerk/backend` の `verifyToken` で検証し、Clerk のユーザーID（`sub`）を得る。
- **Neon は認証を持たない**。Neon はコメント・いいね等のアプリデータを保持し、Clerk のユーザーIDと `profiles.id` で紐付ける。

## 5. データモデル（Neon / Postgres）

トピックは**文字列キー方式**で表現する（専用テーブルを作らない）。接頭辞で対象種別を表し、IDは既存データファイルのものをそのまま使う。

- `version:<ver>` 例: `version:11.2.0`
- `kit:<kitId>` 例: `kit:sharpmarker-neo`（`js/kits-data.js` の id）
- `main:<mainId>` 例: `main:sharpmarker`（`js/mains-data.js` の id）
- 将来 `weapon:<type>` や `range:` 等も同方式で追加できる。

### 5.1 テーブル定義（DDL スケッチ）

確定の DDL は実装計画／マイグレーションで詰める。以下は設計意図を示すスケッチ。

```sql
-- Clerk ユーザーのローカル鏡。初回アクション時に upsert（または Clerk webhook で同期）
CREATE TABLE profiles (
  id          TEXT PRIMARY KEY,           -- Clerk user id
  display_name TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  is_banned   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  topic_key   TEXT NOT NULL,              -- 'version:...' | 'kit:...' | 'main:...'
  parent_id   BIGINT REFERENCES comments(id),  -- 返信先（トップレベルは NULL、返信は1段のみ）
  author_id   TEXT NOT NULL REFERENCES profiles(id),
  body        TEXT NOT NULL,              -- プレーンテキスト（最大 ~2000字）
  like_count  INTEGER NOT NULL DEFAULT 0, -- 非正規化（表示高速化）
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ,
  deleted_at  TIMESTAMPTZ                 -- 論理削除（墓標表示）
);
CREATE INDEX idx_comments_topic ON comments(topic_key, created_at);
CREATE INDEX idx_comments_parent ON comments(parent_id);

CREATE TABLE comment_likes (
  comment_id  BIGINT NOT NULL REFERENCES comments(id),
  user_id     TEXT NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE TABLE reports (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comment_id  BIGINT NOT NULL REFERENCES comments(id),
  reporter_id TEXT NOT NULL REFERENCES profiles(id),
  reason      TEXT,
  status      TEXT NOT NULL DEFAULT 'open',  -- 'open' | 'reviewed' | 'dismissed'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, reporter_id)            -- 同一ユーザーの重複通報を防ぐ
);
```

### 5.2 整合性ルール

- **返信は1段のみ**: `parent_id` が指す行は `parent_id IS NULL` のトップレベルでなければならない（アプリ側で検証）。
- **論理削除**: `deleted_at` をセットし、本文は「削除されました」プレースホルダに置換して表示。返信がぶら下がっていても木構造は維持。
- **いいね数**: `comment_likes` を真実とし、`comments.like_count` は表示用の非正規化キャッシュ（トグル時に更新）。

## 6. API（Vercel サーバーレス関数 / `/api`）

すべて JSON。認証が必要なものは `Authorization: Bearer <Clerk session token>` を要求。エラーは `{ error: { code, message } }` 形式、適切な HTTP ステータスを返す。

| メソッド・パス | 認証 | 説明 |
|---|---|---|
| `GET /api/comments?topic=KEY` | 不要 | トップレベル＋返信をネストして返す。各コメントに `like_count` と（ログイン時）`liked_by_me` を含む。 |
| `POST /api/comments` | 必須 | `{ topic, parentId?, body }` で新規投稿。レート制限・本文バリデーション・BANチェック。 |
| `PATCH /api/comments/[id]` | 必須 | `{ body }`。**本人のみ**編集。`updated_at` 更新。 |
| `DELETE /api/comments/[id]` | 必須 | **本人 or 管理者**が論理削除。 |
| `POST /api/comments/[id]/like` | 必須 | いいねトグル（押下で付与/解除）。`like_count` を更新して返す。 |
| `POST /api/comments/[id]/report` | 必須 | `{ reason }` で通報。重複は一意制約で弾く。 |
| `GET /api/admin/reports` | 管理者 | `status='open'` の通報一覧＋対象コメント。 |
| `POST /api/webhooks/clerk` | 署名検証 | （任意）`user.created/updated` で `profiles` を同期。 |

- 各 POST/PATCH/DELETE は処理前に `profiles` を upsert（初回アクションのユーザーを作成）し、`is_banned` を確認する。
- 入力検証: `topic` は既知の接頭辞・形式に一致すること。`body` は空でなく最大長以内。生 HTML はエスケープ（XSS 対策）。

## 7. フロントエンド

- **ヘッダ**: 全ページに Clerk のログイン/ユーザーボタンを設置（共通の小さな初期化スクリプト）。
- **コメントウィジェット**: `js/comments.js`（プレーンESモジュール）＋ `css/comments.css`。
  - ページに `<div data-topic="version:11.2.0"></div>` のようなコンテナを置くと、スクリプトが自動でマウントする。
  - 描画物: スレッド一覧（トップレベル＋1段返信）、各コメントの「いいね／返信／通報」操作、ログイン時のみ現れる投稿フォーム、本人投稿の「編集／削除」、管理者の「削除」。
  - 並び順は**新着順**。
- **設置面（初期）**:
  - **index.html** … 各 Ver.（`version:` トピック）。最新アプデ解説／タイムラインの各バージョンに紐付け。
  - **kits.html** … ブキ詳細表示（`kit:` トピック）。
  - **mains.html** … メインブキ族の詳細表示（`main:` トピック）。
- トピックキーは既存データの id を再利用し、フロントの小さなマッピングで生成する。

## 8. 安全性・モデレーション

方針: **事後型モデレーション + 通報ボタン**（即時公開で会話のテンポを保ち、問題投稿は通報で拾う）。

- 投稿はログイン必須。`is_banned` ユーザーはブロック。
- **本文はプレーンテキストのみ**（最大 ~2000字・改行保持・生HTML禁止）。画像/Markdown は初期なし → XSS・荒らし面を最小化。
- **レート制限**（例: 10秒に1件、1時間にN件）を POST ハンドラで強制。
- **通報ボタン** → 管理者が `reports` を確認し、必要に応じて該当コメントを削除。
- **管理者**: あなた（tora）の `profiles.role='admin'` を一度設定する。管理者は全投稿の削除と通報一覧の閲覧ができる。
- 削除は**論理削除＋「削除されました」墓標表示**。

## 9. 技術スタック・運用

- **追加依存**（`/api` 関数）: `@clerk/backend`、`@neondatabase/serverless`。フロントの Clerk は CDN 読み込み可。
- **スキーマ/マイグレーション**: **Drizzle Kit 推奨**（型付き・バージョン管理）。生SQL運用も可。
- **環境変数**（Vercel + ローカル `.env`）:
  - `DATABASE_URL`（Neon 接続文字列）
  - `CLERK_SECRET_KEY`、`CLERK_PUBLISHABLE_KEY`
  - （任意）`CLERK_WEBHOOK_SIGNING_SECRET`
- **テスト**: 既存の `node --test` を踏襲。API のバリデーション/権限ロジックを **Neon のテストブランチ**で検証する。既存のデータ整合性テストは維持。
- `.gitignore` に `.env` を追加（秘密情報をコミットしない）。

## 10. 段階リリース（YAGNI）

- **Phase 1（MVP）**: Clerk 認証（Discord+Google）＋ Neon スキーマ/マイグレーション ＋ コメント ＋ 返信(1段) ＋ いいね ＋ 3面ウィジェット ＋ 本人編集/削除 ＋ 管理者削除 ＋ プレーンテキスト ＋ レート制限。
- **Phase 2（安全強化）**: 通報ボタン ＋ 管理者の通報一覧 ＋ BANユーザー処理 ＋ 表示名の編集。
- **Phase 3（将来・今はやらない）**: 返信通知／人気順ソート／総合掲示板／プロフィールページ／リアクション拡張。

> 注: 通報の「ボタン設置〜記録（`reports`）」は Phase 1 のスキーマに含めるが、管理UI（一覧確認）の作り込みは Phase 2 とする。

## 11. 確定した既定値

1. **返信は1段階のみ**（深いネストにしない）。
2. **コメントはプレーンテキストのみ**（MVPでは画像/Markdown なし）。
3. **プロフィールは Discord/Google の名前＋アイコンを利用**（独自表示名の編集は Phase 2）。
4. **並び順は新着順**（人気順は将来）。
5. 削除は**論理削除＋墓標表示**。

## 12. 成功条件（MVP の受け入れ基準）

- Discord または Google でログイン／ログアウトできる。
- index の各Ver.・kits のブキ詳細・mains の族詳細で、コメントを投稿・閲覧できる。
- コメントに1段の返信ができる。
- コメント／返信にいいねを付け外しできる。
- 本人は自分のコメントを編集・削除でき、管理者は任意のコメントを削除できる。
- 未ログインでも閲覧はできるが、投稿系は要ログイン。
- コメント本文の HTML はエスケープされ、レート制限が効く。
- 既存の静的ページ・テストは壊れていない。

## 13. 未解決事項・将来検討

- レート制限の具体しきい値（実装時に決定）。
- Clerk webhook によるプロフィール同期を入れるか、初回アクション時 upsert のみで足りるか（MVP は upsert 方式で開始可）。
- 通報の理由を定型選択にするか自由記述にするか。
- 将来の「人気順」導入時の `like_count` 索引設計。

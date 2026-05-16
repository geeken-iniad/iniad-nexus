-- ============================================================
-- iniad-nexas — Database Schema (v3.0)
-- 対象: Supabase (PostgreSQL)
-- 作成日: 2026-05-16
-- 変更履歴:
--   v1.0 - 初版
--   v2.0 - バグ修正3件・仕様反映3件
--   v3.0 - circle_events の繰り返し生成ロジックをアプリ側に移管
--          generate_child_circle_events() 関数を削除
--          DB側の過剰な CHECK 制約・冗長コメントを整理
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE semester_type   AS ENUM ('spring', 'fall');
CREATE TYPE recurrence_type AS ENUM ('none', 'weekly', 'biweekly');
CREATE TYPE friend_status   AS ENUM ('pending', 'accepted', 'blocked');


-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text        NOT NULL UNIQUE,
  display_name text,
  avatar_url   text,
  university   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 新規ユーザー登録時に自動生成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username',
             split_part(NEW.email, '@', 1) || '-' || substr(NEW.id::text, 1, 6)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- 2. TIMETABLE（時間割）
--    semester × day_of_week × period でユニーク（同コマ重複不可）
-- ============================================================
CREATE TABLE timetable (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  semester     semester_type NOT NULL DEFAULT 'spring',
  day_of_week  smallint      NOT NULL CHECK (day_of_week BETWEEN 0 AND 4), -- 0=月〜4=金
  period       smallint      NOT NULL CHECK (period BETWEEN 1 AND 6),
  subject      text          NOT NULL,
  classroom    text,
  teacher      text,
  color        text,
  note         text,
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),

  UNIQUE (user_id, semester, day_of_week, period)
);


-- ============================================================
-- 3. ASSIGNMENTS（課題）
-- ============================================================
CREATE TABLE assignments (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  subject      text,
  due_date     timestamptz NOT NULL,
  memo         text,
  is_done      boolean     NOT NULL DEFAULT false,
  done_at      timestamptz,           -- 完了時に自動セット（トリガー）
  priority     smallint    NOT NULL DEFAULT 2
                           CHECK (priority BETWEEN 1 AND 3), -- 1=高 2=中 3=低
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- is_done 変更時に done_at を自動セット／クリア
CREATE OR REPLACE FUNCTION sync_assignment_done_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_done = true AND OLD.is_done = false THEN
    NEW.done_at := now();
  ELSIF NEW.is_done = false AND OLD.is_done = true THEN
    NEW.done_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assignment_done_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION sync_assignment_done_at();


-- ============================================================
-- 4. SHIFTS（バイト）
--    深夜またぎ（例: 22:00〜翌2:00）を許容するため
--    start_at / end_at を timestamptz で持つ。
--    勤務日は start_at から導出する（shift_date カラムは不要）。
-- ============================================================
CREATE TABLE shifts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workplace    text        NOT NULL,
  start_at     timestamptz NOT NULL,
  end_at       timestamptz NOT NULL,
  hourly_wage  integer     CHECK (hourly_wage >= 0),
  break_min    integer     NOT NULL DEFAULT 0 CHECK (break_min >= 0),
  memo         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT shift_time_valid CHECK (end_at > start_at)
);

-- 月次集計ビュー（Asia/Tokyo 基準）
CREATE OR REPLACE VIEW shift_monthly_summary AS
SELECT
  user_id,
  to_char(start_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM') AS month,
  COUNT(*)                                                 AS shift_count,
  ROUND(SUM(
    EXTRACT(EPOCH FROM (end_at - start_at)) / 3600
    - break_min / 60.0
  )::numeric, 2)                                           AS total_hours,
  ROUND(SUM(
    COALESCE(hourly_wage, 0) * (
      EXTRACT(EPOCH FROM (end_at - start_at)) / 3600
      - break_min / 60.0
    )
  )::numeric, 0)                                           AS estimated_wage
FROM shifts
GROUP BY user_id, month;


-- ============================================================
-- 5. CIRCLE_EVENTS（サークル）
--
--    繰り返し予定は親子レコード方式で管理する。
--      parent_event_id = NULL  → 親レコード（繰り返し設定の起点）
--      parent_event_id = <uuid> → 子レコード（物理コピー）
--
--    子レコードの一括生成・削除はアプリ側（Next.js API）で行う。
--    DBは受け取ったレコードをそのまま保存する。
--
--    is_modified: 子レコードが個別編集済みかを示すフラグ。
--      アプリ側で「全件を再生成するとき、個別編集済みの子はスキップ」等に使用。
-- ============================================================
CREATE TABLE circle_events (
  id                  uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid            NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_event_id     uuid            REFERENCES circle_events(id) ON DELETE CASCADE,
  title               text            NOT NULL,
  event_date          date            NOT NULL,
  start_time          time,
  end_time            time,
  location            text,
  memo                text,
  recurrence          recurrence_type NOT NULL DEFAULT 'none', -- 親レコードのみ weekly/biweekly を持つ
  recurrence_end_date date,                                    -- 親レコードのみ使用
  is_modified         boolean         NOT NULL DEFAULT false,
  created_at          timestamptz     NOT NULL DEFAULT now(),
  updated_at          timestamptz     NOT NULL DEFAULT now()
);


-- ============================================================
-- 6. OTHER_EVENTS（その他予定）
-- ============================================================
CREATE TABLE other_events (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  event_date   date        NOT NULL,
  start_time   time,
  end_time     time,
  memo         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 7. FRIENDS（友達関係）
--    LEAST/GREATEST で (A,B) と (B,A) の重複登録を防ぐ。
-- ============================================================
CREATE TABLE friends (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       friend_status NOT NULL DEFAULT 'pending',
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),

  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id)
);

-- 承認済み友達を双方向で取得するビュー
CREATE OR REPLACE VIEW friend_pairs AS
SELECT requester_id AS user_id, addressee_id AS friend_id FROM friends WHERE status = 'accepted'
UNION ALL
SELECT addressee_id AS user_id, requester_id AS friend_id FROM friends WHERE status = 'accepted';


-- ============================================================
-- INDEXES
-- ============================================================

-- friends: 式を使ったユニーク制約はテーブル定義外で CREATE UNIQUE INDEX で定義する
-- (A,B) と (B,A) の重複ペアを防ぐ
CREATE UNIQUE INDEX idx_friends_unique_pair ON friends (
  LEAST   (requester_id::text, addressee_id::text),
  GREATEST(requester_id::text, addressee_id::text)
);

CREATE INDEX idx_timetable_user    ON timetable    (user_id, semester);
CREATE INDEX idx_assignments_due   ON assignments   (user_id, due_date) WHERE is_done = false;
CREATE INDEX idx_shifts_user_start ON shifts        (user_id, start_at);
CREATE INDEX idx_circle_user_date  ON circle_events (user_id, event_date);
CREATE INDEX idx_circle_parent     ON circle_events (parent_event_id) WHERE parent_event_id IS NOT NULL;
CREATE INDEX idx_other_user_date   ON other_events  (user_id, event_date);
CREATE INDEX idx_friends_requester ON friends       (requester_id, status);
CREATE INDEX idx_friends_addressee ON friends       (addressee_id, status);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- profiles: 本人は全操作可、友達は閲覧のみ
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: 自分は全操作可" ON profiles FOR ALL    USING (auth.uid() = id);
CREATE POLICY "profiles: 友達は閲覧可"   ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM friend_pairs WHERE user_id = auth.uid() AND friend_id = profiles.id)
);

-- timetable: SELECT は本人＋友達、更新系は本人のみ
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timetable: SELECT" ON timetable FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM friend_pairs WHERE user_id = auth.uid() AND friend_id = timetable.user_id)
);
CREATE POLICY "timetable: INSERT" ON timetable FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "timetable: UPDATE" ON timetable FOR UPDATE USING     (auth.uid() = user_id);
CREATE POLICY "timetable: DELETE" ON timetable FOR DELETE USING     (auth.uid() = user_id);

-- 以下は本人のみ
ALTER TABLE assignments   ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments: 本人のみ"   ON assignments   FOR ALL USING (auth.uid() = user_id);

ALTER TABLE shifts         ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shifts: 本人のみ"        ON shifts         FOR ALL USING (auth.uid() = user_id);

ALTER TABLE circle_events  ENABLE ROW LEVEL SECURITY;
CREATE POLICY "circle_events: 本人のみ" ON circle_events  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE other_events   ENABLE ROW LEVEL SECURITY;
CREATE POLICY "other_events: 本人のみ"  ON other_events   FOR ALL USING (auth.uid() = user_id);

ALTER TABLE friends         ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friends: 当事者のみ"     ON friends         FOR ALL USING (
  auth.uid() = requester_id OR auth.uid() = addressee_id
);


-- ============================================================
-- updated_at 自動更新トリガー（全テーブル共通）
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at      BEFORE UPDATE ON profiles      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_timetable_updated_at     BEFORE UPDATE ON timetable     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_assignments_updated_at   BEFORE UPDATE ON assignments   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_shifts_updated_at        BEFORE UPDATE ON shifts        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_circle_events_updated_at BEFORE UPDATE ON circle_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_other_events_updated_at  BEFORE UPDATE ON other_events  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_friends_updated_at       BEFORE UPDATE ON friends       FOR EACH ROW EXECUTE FUNCTION set_updated_at();

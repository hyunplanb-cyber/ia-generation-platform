-- 다운로드 때 오푸스가 본문을 다시 쓴 시각. 화면 단위로 남겨 중복 과금을 막는다.
-- IF NOT EXISTS인 이유: 이 칸은 이미 push로 넣은 뒤라, 장부(__drizzle_migrations)에
-- 기록만 남기려고 migrate를 돌려도 그냥 지나가게 하기 위해서다.
ALTER TABLE "screen" ADD COLUMN IF NOT EXISTS "enriched_at" timestamp;

-- 참고: drizzle-kit이 만든 원본 파일에는 credit_ledger·verify_run·screen_group 등
-- '이미 DB에 있는' 것들을 새로 만드는 문장까지 들어 있었다. 그동안 스키마 변경을
-- 마이그레이션 대신 push로 반영해 온 탓에 스냅샷이 뒤처져 있었기 때문이다.
-- 그대로 돌리면 "이미 존재함" 오류가 나므로 이번 변경만 남겼다.
-- 스냅샷(meta/0011_snapshot.json)은 새로 뜬 것을 그대로 두었으니,
-- 다음 generate부터는 이런 유령 diff가 나오지 않는다.

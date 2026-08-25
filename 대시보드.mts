/**
 * 우리 숫자 한 장 — 회원 · AI팩 생성 · 생성 시도 · 프리셋 · 검수 시나리오 · 다운로드
 *
 *   npx tsx 대시보드.mts            터미널에 찍고 _작업/대시보드.html 을 만든다
 *   npx tsx 대시보드.mts --열기      만든 뒤 브라우저로 연다
 *
 * 왜 있나 — 2026-08-25 사장님 지시.
 *   숫자를 볼 데가 없었다. /admin/qa 는 검수만 보고, Vercel 은 방문만 본다.
 *   「손님이 몇 명이고 무엇을 얼마나 만들었나」는 아무 데도 안 모여 있었다.
 *
 * ⛔ 숫자를 잘못 읽기 쉬운 자리가 셋이다. 아래 주의를 지켜서 센다.
 *
 *   ① memo 가 «두 세대»다. 옛 기록은 「설계도 생성」, 새 기록은 「AI팩 생성」이다.
 *      한쪽만 세면 절반이 사라진다. 둘 다 센다.
 *      («설계도» 는 폐기된 말이지만 옛 기록에 남아 있는 것은 못 고친다.)
 *
 *   ② generation_attempt 는 2026-08-25 부터만 쌓인다. 그 전 「눌렀는데 실패」는
 *      아무 데도 안 남아서 셀 길이 없다. 0 이라고 「실패가 없었다」가 아니다.
 *
 *   ③ 다운로드는 «크레딧이 닫혀 있으면» 원장에 안 남는다(application/preset.ts 의
 *      creditsOpenForMe). 그래서 원장이 아니라 «잠금 해제 표»를 센다 —
 *      download_unlock · verify_download_unlock · project.preset_downloaded_at.
 *
 * ⚠ 이 글은 «구독»으로 돈다. 앤트로픽 API 를 부르지 않는다(AGENTS.md 결제 경로).
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const { db } = await import("@/db/client");
const { sql } = await import("drizzle-orm");

/* ── 우리 계정 — 손님 수에서 뺀다 ────────────────────────────────
   ⚠ 여기에 없는 주소는 «손님»으로 센다. 우리 계정을 새로 만들면 반드시 여기 적는다.
      안 적으면 손님이 한 명 늘어난 것처럼 보인다. */
const 우리계정: Record<string, string> = {
  "hyun.planb@gmail.com": "사장님",
  "caffeinecolor.all@gmail.com": "회사 계정",
  "review@caffeinecolor.com": "크몽 심사용 (make-review-account.mts)",
  "test@test.com": "시험 계정",
};

type 줄 = Record<string, unknown>;
const 물어 = async (q: unknown): Promise<줄[]> => {
  const r = await db.execute(q as never);
  return ((r as { rows?: 줄[] }).rows ?? (r as unknown as 줄[])) ?? [];
};
const 수 = (v: unknown) => Number(v ?? 0);
const 콤마 = (n: number) => n.toLocaleString("ko-KR");

/* 우리 계정을 뺀 «손님»만 고르는 조건 — 쿼리마다 같은 것을 쓴다 */
const 손님만 = sql.raw(
  `id not in (select id from "user" where email in (${Object.keys(우리계정)
    .map((e) => `'${e.replace(/'/g, "''")}'`)
    .join(", ")}))`,
);
const 손님것 = (칸: string) =>
  sql.raw(
    `${칸} in (select id from "user" where email not in (${Object.keys(우리계정)
      .map((e) => `'${e.replace(/'/g, "''")}'`)
      .join(", ")}))`,
  );

/* ── ① 회원 ──────────────────────────────────────────────── */
const [회원] = await 물어(sql`
  select count(*) as 전체,
         count(*) filter (where ${손님만}) as 손님,
         count(*) filter (where ${손님만} and created_at >= now() - interval '7 days')  as 이레,
         count(*) filter (where ${손님만} and created_at >= now() - interval '30 days') as 한달
  from "user"`);

const 계정들 = await 물어(sql`
  select u.email, u.created_at as 가입때,
         (select count(*) from project p where p.owner_id = u.id and p.deleted_at is null) as 프로젝트,
         (select count(*) from menu m join project p on p.id = m.project_id where p.owner_id = u.id) as 메뉴,
         (select coalesce(sum(-l.amount),0) from credit_ledger l where l.user_id = u.id and l.kind = 'spend') as 쓴크레딧
  from "user" u order by u.created_at`);

/* ── ②③ 만든 것 — 크레딧 원장의 memo 로 가른다 ─────────────────
   ⛔ 옛 말(설계도)과 새 말(AI팩)을 «둘 다» 잡는다. 위 주의 ① 참고. */
const 갈래 = {
  "AI팩 생성": `(memo like '설계도 생성%' or memo like 'AI팩 생성%')`,
  "디자인 프리셋 생성": `memo = '디자인 프리셋 생성'`,
  "검수 시나리오 생성": `memo like '검수 시나리오 생성%'`,
  "사이트·문서 검수": `(memo = '사이트 검수' or memo = '문서·설계도 검수')`,
  다운로드: `memo like '%다운로드%'`,
};
const 만든것: Record<string, { 전체: number; 손님: number; 마지막: string | null }> = {};
for (const [이름, 조건] of Object.entries(갈래)) {
  const [r] = await 물어(sql`
    select count(*) as 전체,
           count(*) filter (where ${손님것("user_id")}) as 손님,
           max(created_at) as 마지막
    from credit_ledger where kind = 'spend' and ${sql.raw(조건)}`);
  만든것[이름] = {
    전체: 수(r?.전체),
    손님: 수(r?.손님),
    마지막: r?.마지막 ? new Date(String(r.마지막)).toLocaleString("ko-KR") : null,
  };
}

/* ── ④ 생성 시도 — 성공·실패를 «둘 다» 센다 (2026-08-25 부터) ─── */
const [시도] = await 물어(sql`
  select count(*) as 전체,
         count(*) filter (where ok) as 성공,
         count(*) filter (where not ok) as 실패,
         min(created_at) as 처음
  from generation_attempt`);
const 실패까닭 = await 물어(sql`
  select coalesce(reason,'(까닭 없음)') as 까닭, count(*) as n
  from generation_attempt where not ok group by 1 order by n desc limit 5`);

/* ── ⑤ 실제로 만들어진 알맹이 ─────────────────────────────── */
const [알맹이] = await 물어(sql`
  select (select count(distinct p.id) from project p join menu m on m.project_id = p.id
            where p.deleted_at is null) as 생성된프로젝트,
         (select count(*) from project where deleted_at is null) as 프로젝트,
         (select count(*) from menu) as 메뉴,
         (select count(*) from screen) as 화면,
         (select count(*) from verify_run) as 검수돌린것,
         (select count(*) from verify_run where mode = 'site') as 검수사이트,
         (select count(*) from verify_run where mode = 'document') as 검수문서,
         (select count(*) from project where deleted_at is null and preset_config is not null) as 프리셋만든것`);

/* ── ⑥ 다운로드 — 원장이 아니라 «잠금 해제 표»를 센다 (주의 ③) ── */
const [받은것] = await 물어(sql`
  select (select count(*) from download_unlock) as 산출물,
         (select count(*) from verify_download_unlock) as 검수시나리오,
         (select count(*) from project where preset_downloaded_at is not null) as 프리셋,
         (select count(*) from pack_order where status = 'paid') as 판매팩`);

/* ── ⑦ 최근 30일 하루하루 ─────────────────────────────────── */
const 나날 = await 물어(sql`
  with 날 as (select generate_series((now() - interval '29 days')::date, now()::date, '1 day')::date as d)
  select 날.d as 날짜,
    (select count(*) from "user" u where u.created_at::date = 날.d and ${손님만}) as 가입,
    (select count(*) from credit_ledger l where l.created_at::date = 날.d and l.kind='spend'
       and (l.memo like '설계도 생성%' or l.memo like 'AI팩 생성%')) as 생성,
    (select count(*) from verify_run v where v.created_at::date = 날.d) as 검수,
    (select count(*) from generation_attempt g where g.created_at::date = 날.d and not g.ok) as 실패
  from 날 order by 날.d`);

/* ── ⑧ 요즘 있었던 일 ──────────────────────────────────────
   숫자만 보면 «무슨 일이 있었나»를 모른다. 지금은 하루 몇 건이라 낱낱이 보는 편이 낫다.
   가입 · 크레딧을 쓴 일 · 생성 실패를 한 줄로 섞어 최근 것부터 본다. */
const 있었던일 = await 물어(sql`
  select * from (
    select u.created_at as 때, u.email, '가입했습니다' as 일, 'join' as 갈래
      from "user" u
    union all
    select l.created_at, u.email, l.memo, 'spend'
      from credit_ledger l join "user" u on u.id = l.user_id where l.kind = 'spend'
    union all
    select g.created_at, u.email,
           '생성 실패 — ' || coalesce(g.reason,'까닭 모름'), 'fail'
      from generation_attempt g join "user" u on u.id = g.user_id where not g.ok
  ) t order by 때 desc limit 20`);

/* ── 터미널에 찍기 ─────────────────────────────────────────── */
const 굵게 = (s: string) => `\x1b[1m${s}\x1b[0m`;
console.log(`\n${굵게("우리 숫자")} — ${new Date().toLocaleString("ko-KR")}\n`);
console.log(`  회원              ${굵게(콤마(수(회원?.손님)))} 명  (우리 계정 뺀 것 · 전체 ${수(회원?.전체)})`);
console.log(`                     최근 7일 +${수(회원?.이레)} · 30일 +${수(회원?.한달)}`);
for (const [이름, v] of Object.entries(만든것))
  console.log(`  ${이름.padEnd(16)}  ${굵게(콤마(v.손님))} 건  (전체 ${v.전체})${v.마지막 ? ` · 마지막 ${v.마지막}` : ""}`);
console.log(
  `  생성 시도          성공 ${수(시도?.성공)} · 실패 ${수(시도?.실패)}` +
    (수(시도?.전체) === 0 ? "   ⚠ 2026-08-25 부터 쌓입니다 — 아직 기록 없음" : ""),
);
console.log(
  `\n  실제로 만들어진 것  프로젝트 ${수(알맹이?.프로젝트)} (그중 생성까지 간 것 ${수(알맹이?.생성된프로젝트)}) · ` +
    `메뉴 ${콤마(수(알맹이?.메뉴))} · 화면 ${콤마(수(알맹이?.화면))}`,
);
console.log(
  `  지금 열려 있는 것    산출물 ${수(받은것?.산출물)} · 검수 시나리오 ${수(받은것?.검수시나리오)} · ` +
    `프리셋 ${수(받은것?.프리셋)} · 판매팩 ${수(받은것?.판매팩)}`,
);
/* ⚠ 위 「다운로드」(원장)와 여기 「열려 있는 것」(잠금 표)이 다를 수 있다.
   프로젝트를 지우면 잠금 행은 딸려 지워지고 원장만 남기 때문이다. 둘 다 맞는 수다. */
if (실패까닭.length) {
  console.log(`\n  ⛔ 생성 실패 까닭`);
  for (const r of 실패까닭) console.log(`     ${수(r.n)}건  ${r.까닭}`);
}
console.log();

/* ── HTML 한 장 ────────────────────────────────────────────── */
const 큰칸 = (제목: string, 값: string, 밑: string, 색 = "") =>
  `<div class="card${색}"><div class="lb">${제목}</div><div class="v">${값}</div><div class="d">${밑}</div></div>`;

const 최대 = Math.max(1, ...나날.map((d) => Math.max(수(d.가입), 수(d.생성), 수(d.검수), 수(d.실패))));
const 막대 = 나날
  .map((d) => {
    const 날 = String(d.날짜).slice(5);
    const 칸 = (n: number, c: string) =>
      수(n) ? `<i class="${c}" style="height:${Math.round((수(n) / 최대) * 100)}%" title="${c} ${수(n)}"></i>` : "";
    const 합 = 수(d.가입) + 수(d.생성) + 수(d.검수) + 수(d.실패);
    return `<div class="day${합 ? "" : " zero"}"><div class="bars">${칸(수(d.가입), "j")}${칸(수(d.생성), "g")}${칸(수(d.검수), "v")}${칸(수(d.실패), "f")}</div><span>${날}</span></div>`;
  })
  .join("");

const 계정줄 = 계정들
  .map((u) => {
    const 메일 = String(u.email);
    const 우리 = 우리계정[메일];
    const 가림 = 메일.replace(/^(.{2}).*(@.*)$/, "$1***$2");
    return `<tr class="${우리 ? "ours" : ""}"><td>${가림}</td><td>${우리 ? `<span class="tag">우리 것 · ${우리}</span>` : `<span class="tag cust">손님</span>`}</td><td class="r">${String(u.가입때).slice(0, 10)}</td><td class="r">${수(u.프로젝트)}</td><td class="r">${수(u.메뉴)}</td><td class="r">${콤마(수(u.쓴크레딧))}</td></tr>`;
  })
  .join("");

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>우리 숫자 · 카페인컬러</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#F0EFEB;--sf:#FFFFFF;--ink:#33221E;--muted:#6E5450;--line:#E6DDD8;--pri:#E02A0E;--teal:#0F7A6B;--warn:#B45309}
body{background:var(--bg);color:var(--ink);font-family:Pretendard,-apple-system,"Malgun Gothic",sans-serif;
     line-height:1.6;padding:32px 20px 64px}
.wrap{max-width:1040px;margin:0 auto}
h1{font-size:30px;font-weight:800;letter-spacing:-.02em}
.sub{color:var(--muted);font-size:14px;margin-top:4px}
h2{font-size:17px;font-weight:700;margin:36px 0 12px;padding-top:20px;border-top:2px solid var(--ink)}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}
.card{background:var(--sf);border:1px solid var(--line);border-radius:14px;padding:16px 18px;min-width:0}
.card.hot{border-color:var(--pri)}
.lb{font-size:12.5px;color:var(--muted);font-weight:600}
.v{font-size:34px;font-weight:800;letter-spacing:-.03em;margin:2px 0 2px;line-height:1.15}
.v small{font-size:15px;font-weight:600;color:var(--muted);margin-left:3px}
.d{font-size:12.5px;color:var(--muted)}
.note{background:#FFF8F0;border:1px solid #F3DFC9;border-left:4px solid var(--warn);
      border-radius:10px;padding:12px 14px;font-size:13.5px;color:#5A4433;margin-top:12px}
.note b{color:var(--warn)}
table{width:100%;border-collapse:collapse;background:var(--sf);border:1px solid var(--line);
      border-radius:12px;overflow:hidden;font-size:13.5px}
th,td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--line)}
th{background:#FAF7F4;font-weight:700;font-size:12.5px;color:var(--muted)}
tr:last-child td{border-bottom:none}
tr.ours{color:var(--muted);background:#FBFAF8}
td.r,th.r{text-align:right;font-variant-numeric:tabular-nums}
.nowrap{white-space:nowrap}
.tag{display:inline-block;font-size:11.5px;padding:1px 7px;border-radius:99px;background:#EFE9E5;color:var(--muted)}
.tag.cust{background:#DCF2ED;color:var(--teal);font-weight:700}
.chart{background:var(--sf);border:1px solid var(--line);border-radius:14px;padding:18px 16px 10px;overflow-x:auto}
.days{display:flex;gap:3px;align-items:flex-end;min-width:640px;height:130px}
.day{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.day .bars{flex:1;width:100%;display:flex;gap:1px;align-items:flex-end;justify-content:center}
.day i{width:6px;border-radius:2px 2px 0 0;min-height:10px;display:block}
.day span{font-size:9.5px;color:var(--muted);white-space:nowrap;transform:rotate(-58deg);transform-origin:center;height:22px}
.day.zero span{opacity:.35}
i.j{background:var(--teal)} i.g{background:var(--pri)} i.v{background:#8B6F47} i.f{background:#B91C1C}
.key{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:var(--muted);margin-top:10px}
.key b{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px}
.ft{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted)}
code{background:#EFE9E5;padding:1px 5px;border-radius:4px;font-size:12px}
</style></head><body><div class="wrap">

<h1>우리 숫자</h1>
<div class="sub">카페인컬러 · ${new Date().toLocaleString("ko-KR")} 기준 · <code>npx tsx 대시보드.mts</code> 로 다시 만듭니다</div>

<h2>사장님이 물으신 여섯</h2>
<div class="g">
${큰칸("회원", `${콤마(수(회원?.손님))}<small>명</small>`, `우리 계정 4개를 뺀 수 · 전체 ${수(회원?.전체)}명<br>최근 7일 +${수(회원?.이레)} · 30일 +${수(회원?.한달)}`, " hot")}
${큰칸("AI팩 생성", `${콤마(만든것["AI팩 생성"].손님)}<small>건</small>`, `손님이 만든 것 · 전체 ${만든것["AI팩 생성"].전체}건${만든것["AI팩 생성"].마지막 ? `<br>마지막 ${만든것["AI팩 생성"].마지막}` : ""}`, " hot")}
${큰칸("생성 시도", 수(시도?.전체) === 0 ? `—` : `${콤마(수(시도?.전체))}<small>건</small>`, 수(시도?.전체) === 0 ? "2026-08-25 부터 쌓입니다<br>아직 기록 없음" : `성공 ${수(시도?.성공)} · <b style="color:var(--pri)">실패 ${수(시도?.실패)}</b>`)}
${큰칸("디자인 프리셋 생성", `${콤마(만든것["디자인 프리셋 생성"].손님)}<small>건</small>`, `전체 ${만든것["디자인 프리셋 생성"].전체}건 · 프리셋이 든 프로젝트 ${수(알맹이?.프리셋만든것)}개`)}
${큰칸("검수 시나리오 생성", `${콤마(만든것["검수 시나리오 생성"].손님)}<small>건</small>`, `전체 ${만든것["검수 시나리오 생성"].전체}건`)}
${큰칸("다운로드", `${콤마(만든것["다운로드"].손님)}<small>건</small>`, `손님이 받아 간 것 · 전체 ${만든것["다운로드"].전체}건<br>지금 열려 있는 것 ${수(받은것?.산출물) + 수(받은것?.검수시나리오) + 수(받은것?.프리셋)}건 (산출물 ${수(받은것?.산출물)} · 검수 ${수(받은것?.검수시나리오)} · 프리셋 ${수(받은것?.프리셋)}) · 판매팩 ${수(받은것?.판매팩)}`)}
</div>

<div class="note"><b>⚠ 숫자를 읽을 때</b><br>
① <b>생성 시도</b>는 2026-08-25 부터만 쌓입니다. 그 전에 「눌렀는데 실패한 것」은 아무 데도 안 남아서 셀 길이 없습니다. <b>0 이라고 실패가 없었던 게 아닙니다.</b><br>
② 옛 기록은 <code>설계도 생성</code>, 새 기록은 <code>AI팩 생성</code> 으로 이름이 다릅니다. 이 표는 <b>둘 다</b> 세고 있습니다.<br>
③ <b>다운로드</b>는 두 숫자가 다릅니다. 「받아 간 횟수」는 <b>크레딧 원장</b>에서 세고(지워도 남습니다), 「지금 열려 있는 것」은 <b>잠금 표</b>에서 셉니다. <b>프로젝트를 지우면 잠금은 같이 사라지고 원장만 남아서</b> 원장 쪽이 더 큽니다 — 지금 차이 나는 2건이 그것입니다.</div>

<h2>실제로 만들어진 알맹이</h2>
<div class="g">
${큰칸("프로젝트", `${콤마(수(알맹이?.프로젝트))}<small>개</small>`, `그중 생성까지 간 것 ${수(알맹이?.생성된프로젝트)}개<br>나머지는 컨셉만 적고 멈춘 것입니다`)}
${큰칸("메뉴", `${콤마(수(알맹이?.메뉴))}<small>개</small>`, "AI 가 만든 메뉴 줄 수")}
${큰칸("화면", `${콤마(수(알맹이?.화면))}<small>장</small>`, "AI 가 만든 화면 줄 수")}
${큰칸("검수 돌린 것", `${콤마(수(알맹이?.검수돌린것))}<small>번</small>`, `사이트 ${수(알맹이?.검수사이트)} · 문서 ${수(알맹이?.검수문서)}`)}
</div>

<h2>최근 30일</h2>
<div class="chart"><div class="days">${막대}</div>
<div class="key"><span><b style="background:var(--teal)"></b>가입</span><span><b style="background:var(--pri)"></b>AI팩 생성</span><span><b style="background:#8B6F47"></b>검수</span><span><b style="background:#B91C1C"></b>생성 실패</span></div></div>

<h2>요즘 있었던 일</h2>
<table><thead><tr><th class="r">언제</th><th>누가</th><th>무슨 일</th></tr></thead><tbody>${있었던일
  .map((e) => {
    const 메일 = String(e.email ?? "");
    const 우리 = 우리계정[메일];
    const 가림 = 메일.replace(/^(.{2}).*(@.*)$/, "$1***$2");
    const 색 = e.갈래 === "fail" ? ' style="color:var(--pri);font-weight:700"' : "";
    return `<tr class="${우리 ? "ours" : ""}"><td class="r nowrap">${new Date(String(e.때)).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td><td>${가림} ${우리 ? '<span class="tag">우리</span>' : '<span class="tag cust">손님</span>'}</td><td${색}>${String(e.일)}</td></tr>`;
  })
  .join("")}</tbody></table>
${있었던일.length === 0 ? '<div class="note">아직 아무 일도 없습니다.</div>' : ""}

<h2>계정 — 누가 우리 것이고 누가 손님인가</h2>
<table><thead><tr><th>메일</th><th>누구</th><th class="r">가입</th><th class="r">프로젝트</th><th class="r">메뉴</th><th class="r">쓴 크레딧</th></tr></thead><tbody>${계정줄}</tbody></table>
<div class="note">우리 계정을 새로 만들면 <code>대시보드.mts</code> 의 <code>우리계정</code> 에 <b>반드시 적으세요.</b> 안 적으면 손님이 한 명 늘어난 것처럼 보입니다.</div>

<div class="ft">이 화면은 이 컴퓨터에서만 봅니다 — 어디에도 올라가지 않습니다.<br>
다시 만들기: <code>npx tsx 대시보드.mts</code> · 만들고 바로 열기: <code>npx tsx 대시보드.mts --열기</code></div>
</div></body></html>`;

mkdirSync("_작업", { recursive: true });
const 길 = "_작업/대시보드.html";
writeFileSync(길, html, "utf8");
console.log(`  → ${길}\n`);

if (process.argv.includes("--열기")) {
  try {
    execFileSync("cmd", ["/c", "start", "", 길.split("/").join("\\")], { stdio: "ignore" });
  } catch {
    console.log("  (브라우저를 못 열었습니다 — 파일을 직접 여세요)");
  }
}
process.exit(0);

/* 우리 숫자 — 회원 · AI팩 생성 · 생성 시도 · 프리셋 · 검수 시나리오 · 다운로드.
 *
 * 세는 법을 «한 곳»에만 둔다. `/admin/stats` 화면과 `대시보드.mts` 가 **같은 이 파일**을
 * 본다. 두 곳에서 따로 세면 반드시 갈리고, 갈리면 어느 쪽이 맞는지 아무도 모른다.
 * `lib/sns-caption-rules.ts` 를 끌어낸 것과 같은 까닭이다.
 *
 * ⚠ 내보내는 이름은 «영문»이다. 한글 이름을 export 하면 tsx(esbuild)가 유니코드
 *   escape 로 바꿔 놓아 `대시보드.mts` 쪽에서 「그런 export 가 없다」로 죽는다.
 *   안쪽 이름과 주석은 한글 그대로 둔다. (sns-caption-rules.ts 와 같은 규칙)
 *
 * ⛔ 숫자를 잘못 읽기 쉬운 자리가 셋이다.
 *
 *   ① memo 가 «두 세대»다. 옛 기록은 「설계도 생성」, 새 기록은 「AI팩 생성」이다.
 *      한쪽만 세면 절반이 사라진다 — 실제로 6건 중 5건이 옛 이름이다. 둘 다 센다.
 *
 *   ② generation_attempt 는 2026-08-25 부터만 쌓인다. 그 전 「눌렀는데 실패」는
 *      아무 데도 안 남아서 셀 길이 없다. 0 이라고 「실패가 없었다」가 아니다.
 *
 *   ③-1 ⛔ 「프로젝트」는 «만든 것»이 아니다 — 2026-08-25 사장님 지적.
 *
 *      말이 겹쳐서 숫자를 잘못 읽게 된다. 이 파일에서 쓰는 말은 이렇게 갈라 둔다.
 *
 *        만들기 누름  「AI팩 만들기」를 누르면 그 자리에서 «빈» project 줄이 생긴다.
 *                    컨셉도 안 적혀 있고 크레딧도 안 빠진다. 공짜다.
 *        컨셉 적음    그 프로젝트에 손님이 글을 적었다. 아직 크레딧은 안 빠졌다.
 *        생성 누름    «생성» 버튼을 눌렀다. generation_attempt 에 한 줄 남는다
 *                    (성공이든 실패든). 2026-08-25 부터만 쌓인다.
 *        생성됨      생성이 성공해서 menu·screen 줄이 생겼다. 이때 크레딧이 빠진다.
 *
 *      그래서 「프로젝트 5개」는 «다섯 번 만들었다»가 아니라
 *      «만들기를 다섯 번 눌렀다»는 뜻이다. 화면에서는 깔때기로 보여 준다.
 *
 *   ③ 다운로드는 두 숫자가 다르다. 「받아 간 횟수」는 크레딧 원장에서 세고(프로젝트를
 *      지워도 남는다), 「지금 열려 있는 것」은 잠금 표에서 센다. 프로젝트를 통째로
 *      지우면 잠금 행은 딸려 지워지고 원장만 남아서 원장 쪽이 더 크다. 둘 다 맞는 수다.
 */
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

/* ── 우리 계정 — 손님 수에서 뺀다 ────────────────────────────────
   ⚠ 여기에 없는 주소는 «손님»으로 센다. 우리 계정을 새로 만들면 반드시 여기 적는다.
      안 적으면 손님이 한 명 늘어난 것처럼 보인다.

   ⛔ 2026-08-25 에 review@ 를 「크몽 심사용」이라고 잘못 적었다가 사장님이 짚으셨다.
      **크몽 심사용 계정 같은 것은 없다.** 크몽은 별개 판로라 결제를 크몽이 처리하므로
      우리 쪽에 심사 계정이 필요 없다(lib/packages.ts). review@ 는 **토스(카드사)
      심사용**이다 — 심사관이 다른 회사·다른 지역에서 접속하는데 우리는 소셜 로그인만
      받아서, 2단계 인증에 막혀 「결제창이 확인되지 않는다」로 반려되는 것을 피하려고
      아이디·비밀번호 계정을 따로 만든 것이다(make-review-account.mts · 토스 FAQ 10번).
      ⚠ 그 글에 「심사가 끝나면 이 계정을 지운다」고 적혀 있다. 지우고 나면 여기서도 뺀다.

   ⛔ 2026-08-25 — 사장님 계정이 «넷»이라는 것을 그날에야 알았다. 그 전에는 둘만 빼고
      세어서 **손님이 두 배로 부풀어 있었다.** 메일 주소만 보고는 못 가린다 —
      chlgus123@naver.com 은 「최현」을 영타로 친 것이고, ntop9808@gmail.com 은
      아무 실마리가 없다. 사장님께 여쭤서 확인한 것이다.
      ⭐ 가릴 실마리는 **account 표의 provider_id 와 user.name** 이다. 새 계정이
         손님인지 헷갈리면 그 둘을 보고, 그래도 모르면 **여쭌다. 짐작해서 세지 않는다.**

         select u.email, u.name, a.provider_id
           from "user" u left join account a on a.user_id = u.id order by u.created_at; */
export const OUR_ACCOUNTS: Record<string, string> = {
  "hyun.planb@gmail.com": "사장님",
  "caffeinecolor.all@gmail.com": "사장님 · 회사 대표 메일",
  "chlgus123@naver.com": "사장님 · 초기 시험(아이디·비밀번호)",
  "ntop9808@gmail.com": "사장님 · 열쇠 고친 뒤 확인용",
  "review@caffeinecolor.com": "토스(카드사) 심사용",
  "test@test.com": "시험 계정",
};

export interface Counted {
  전체: number;
  손님: number;
  마지막: Date | null;
}
export interface OurNumbers {
  잰때: Date;
  회원: { 전체: number; 손님: number; 이레: number; 한달: number };
  만든것: Record<string, Counted>;
  시도: { 전체: number; 성공: number; 실패: number };
  실패까닭: { 까닭: string; 건수: number }[];
  /** 손님 것만 센 수. 「전체」는 우리 것까지 포함한 수다. */
  /** 손님이 어디까지 갔나 — 위에서 아래로 줄어든다. 말뜻은 파일 머리 ③-1 참고. */
  깔때기: {
    만들기누름: number;
    컨셉적음: number;
    메뉴초안적음: number;
    생성누름: number;
    생성됨: number;
  };
  알맹이: {
    프로젝트: number;
    생성된프로젝트: number;
    메뉴: number;
    화면: number;
    검수돌린것: number;
    검수사이트: number;
    검수문서: number;
    프리셋만든것: number;
    전체: { 프로젝트: number; 생성된프로젝트: number; 메뉴: number; 화면: number; 검수돌린것: number };
  };
  열린것: { 산출물: number; 검수시나리오: number; 프리셋: number; 판매팩: number };
  나날: { 날짜: string; 가입: number; 생성: number; 검수: number; 실패: number }[];
  있었던일: { 때: Date; 메일: string; 일: string; 갈래: string; 우리: string | null }[];
  계정들: { 메일: string; 우리: string | null; 가입때: Date; 프로젝트: number; 메뉴: number; 쓴크레딧: number }[];
}

/** 생성이 실패한 까닭을 «읽을 수 있는 말»로. 화면에 코드가 그대로 보이면 안 읽힌다.
 *  ⚠ 값은 application/generate-ia.ts 의 reason 과 짝이다. 거기 늘리면 여기도 늘린다. */
export const FAIL_REASONS: Record<string, string> = {
  "key-dead": "⛔ 열쇠가 죽었습니다 (401) — 손님이 다시 눌러도 안 됩니다",
  "no-credit": "⛔ 우리 API 잔액이 바닥났습니다",
  unavailable: "⛔ 열쇠가 아예 없습니다",
  "too-large": "메뉴가 많아 한 번에 안 담겼습니다 (손님이 줄이면 됩니다)",
  "already-has-menus": "이미 메뉴가 있는 프로젝트였습니다",
  failed: "까닭 모를 실패 — 로그를 봐야 합니다",
  "insufficient-credit": "손님 크레딧이 모자랐습니다",
};
/** 코드든 우리말이든 읽히게 — 모르는 코드는 그대로 보여 준다(지어내지 않는다). */
export function failReasonText(code: string | null | undefined): string {
  if (!code) return "까닭 모름";
  return FAIL_REASONS[code] ?? code;
}

/** 크레딧 원장을 무엇으로 가르나. ⛔ ①의 「두 세대」를 여기서 흡수한다. */
export const SPEND_KINDS: Record<string, string> = {
  "AI팩 생성": `(memo like '설계도 생성%' or memo like 'AI팩 생성%')`,
  "디자인 프리셋 생성": `memo = '디자인 프리셋 생성'`,
  "검수 시나리오 생성": `memo like '검수 시나리오 생성%'`,
  "사이트·문서 검수": `(memo = '사이트 검수' or memo = '문서·설계도 검수')`,
  다운로드: `memo like '%다운로드%'`,
};

type 줄 = Record<string, unknown>;
const 물어 = async (q: unknown): Promise<줄[]> => {
  const r = await db.execute(q as never);
  return ((r as { rows?: 줄[] }).rows ?? (r as unknown as 줄[])) ?? [];
};
const 수 = (v: unknown) => Number(v ?? 0);
const 때 = (v: unknown) => (v ? new Date(String(v)) : null);

/** 손님만 고르는 조건 — 쿼리마다 같은 것을 쓴다. */
function 우리메일목록() {
  return Object.keys(OUR_ACCOUNTS)
    .map((e) => `'${e.replace(/'/g, "''")}'`)
    .join(", ");
}

export async function readOurNumbers(): Promise<OurNumbers> {
  const 우리 = 우리메일목록();
  const 손님만 = sql.raw(`id not in (select id from "user" where email in (${우리}))`);
  const 손님것 = (칸: string) =>
    sql.raw(`${칸} in (select id from "user" where email not in (${우리}))`);

  const [회원] = await 물어(sql`
    select count(*) as 전체,
           count(*) filter (where ${손님만}) as 손님,
           count(*) filter (where ${손님만} and created_at >= now() - interval '7 days')  as 이레,
           count(*) filter (where ${손님만} and created_at >= now() - interval '30 days') as 한달
    from "user"`);

  const 만든것: Record<string, Counted> = {};
  for (const [이름, 조건] of Object.entries(SPEND_KINDS)) {
    const [r] = await 물어(sql`
      select count(*) as 전체,
             count(*) filter (where ${손님것("user_id")}) as 손님,
             max(created_at) as 마지막
      from credit_ledger where kind = 'spend' and ${sql.raw(조건)}`);
    만든것[이름] = { 전체: 수(r?.전체), 손님: 수(r?.손님), 마지막: 때(r?.마지막) };
  }

  const [시도] = await 물어(sql`
    select count(*) as 전체, count(*) filter (where ok) as 성공,
           count(*) filter (where not ok) as 실패 from generation_attempt`);
  const 실패까닭 = (
    await 물어(sql`
    select coalesce(reason,'(까닭 없음)') as 까닭, count(*) as n
    from generation_attempt where not ok group by 1 order by n desc limit 5`)
  ).map((r) => ({ 까닭: failReasonText(String(r.까닭)), 건수: 수(r.n) }));

  /* ⭐ 2026-08-25 사장님 지시 — 여기도 «손님 것만» 센다.
     우리가 만든 것까지 섞으면 프로젝트 32·화면 674 처럼 커 보이지만 거의 다 우리 것이다.
     그래도 「전체」를 나란히 남긴다 — 도구가 도는지 보려면 그 수도 있어야 한다. */
  const [알맹이] = await 물어(sql`
    select (select count(distinct p.id) from project p join menu m on m.project_id = p.id
              where p.deleted_at is null and ${손님것("p.owner_id")}) as 생성된프로젝트,
           (select count(*) from project p where p.deleted_at is null and ${손님것("p.owner_id")}) as 프로젝트,
           (select count(*) from menu m join project p on p.id = m.project_id
              where ${손님것("p.owner_id")}) as 메뉴,
           (select count(*) from screen s join project p on p.id = s.project_id
              where ${손님것("p.owner_id")}) as 화면,
           (select count(*) from verify_run v where ${손님것("v.user_id")}) as 검수돌린것,
           (select count(*) from verify_run v where v.mode = 'site' and ${손님것("v.user_id")}) as 검수사이트,
           (select count(*) from verify_run v where v.mode = 'document' and ${손님것("v.user_id")}) as 검수문서,
           (select count(*) from project p where p.deleted_at is null and p.preset_config is not null
              and ${손님것("p.owner_id")}) as 프리셋만든것,
           (select count(distinct p.id) from project p join menu m on m.project_id = p.id
              where p.deleted_at is null) as 전체생성된프로젝트,
           (select count(*) from project where deleted_at is null) as 전체프로젝트,
           (select count(*) from menu) as 전체메뉴,
           (select count(*) from screen) as 전체화면,
           (select count(*) from verify_run) as 전체검수`);

  /* ⭐ 손님이 어디까지 갔나 — 「프로젝트 5개」가 「다섯 번 만들었다」로 읽히는 것을 막는다.
     (2026-08-25 사장님 지적: 「생성을 안 눌렀는데 왜 카운팅되는건데」) */
  const [깔때기] = await 물어(sql`
    select (select count(*) from project p where p.deleted_at is null
              and ${손님것("p.owner_id")}) as 만들기누름,
           (select count(*) from project p where p.deleted_at is null
              and ${손님것("p.owner_id")} and coalesce(p.concept,'') <> '') as 컨셉적음,
           (select count(*) from project p where p.deleted_at is null
              and ${손님것("p.owner_id")} and coalesce(p.concept,'') <> ''
              and coalesce(p.menu_draft,'') <> '') as 메뉴초안적음,
           (select count(*) from generation_attempt g
              where ${손님것("g.user_id")}) as 생성누름,
           (select count(distinct p.id) from project p join menu m on m.project_id = p.id
              where p.deleted_at is null and ${손님것("p.owner_id")}) as 생성됨`);

  const [열린것] = await 물어(sql`
    select (select count(*) from download_unlock) as 산출물,
           (select count(*) from verify_download_unlock) as 검수시나리오,
           (select count(*) from project where preset_downloaded_at is not null) as 프리셋,
           (select count(*) from pack_order where status = 'paid') as 판매팩`);

  const 나날 = (
    await 물어(sql`
    with 날 as (select generate_series((now() - interval '29 days')::date, now()::date, '1 day')::date as d)
    select 날.d as 날짜,
      (select count(*) from "user" u where u.created_at::date = 날.d and ${손님만}) as 가입,
      (select count(*) from credit_ledger l where l.created_at::date = 날.d and l.kind='spend'
         and (l.memo like '설계도 생성%' or l.memo like 'AI팩 생성%')
         and ${손님것("l.user_id")}) as 생성,
      (select count(*) from verify_run v where v.created_at::date = 날.d
         and ${손님것("v.user_id")}) as 검수,
      (select count(*) from generation_attempt g where g.created_at::date = 날.d and not g.ok
         and ${손님것("g.user_id")}) as 실패
    from 날 order by 날.d`)
  ).map((r) => ({
    날짜: String(r.날짜).slice(0, 10),
    가입: 수(r.가입),
    생성: 수(r.생성),
    검수: 수(r.검수),
    실패: 수(r.실패),
  }));

  /* 숫자만 보면 «무슨 일이 있었나»를 모른다. 지금은 하루 몇 건이라 낱낱이 보는 편이 낫다.
     ⭐ 2026-08-25 사장님 지시 — 여기도 손님 것만 본다. 우리가 시험한 줄이 섞이면
        손님이 무엇을 했는지가 그 밑에 묻힌다. */
  const 있었던일 = (
    await 물어(sql`
    select * from (
      select u.created_at as 때, u.email, '가입했습니다' as 일, 'join' as 갈래 from "user" u
       where ${손님것("u.id")}
      union all
      select l.created_at, u.email, l.memo, 'spend'
        from credit_ledger l join "user" u on u.id = l.user_id
       where l.kind = 'spend' and ${손님것("l.user_id")}
      union all
      select g.created_at, u.email, coalesce(g.reason,'?'), 'fail'
        from generation_attempt g join "user" u on u.id = g.user_id
       where not g.ok and ${손님것("g.user_id")}
    ) t order by 때 desc limit 25`)
  ).map((r) => ({
    때: 때(r.때) as Date,
    메일: String(r.email ?? ""),
    /* 실패는 코드(key-dead 같은 것)로 오므로 읽을 수 있는 말로 바꿔 준다 */
    일: String(r.갈래) === "fail" ? "생성 실패 — " + failReasonText(String(r.일)) : String(r.일),
    갈래: String(r.갈래),
    우리: OUR_ACCOUNTS[String(r.email ?? "")] ?? null,
  }));

  const 계정들 = (
    await 물어(sql`
    select u.email, u.created_at as 가입때,
           (select count(*) from project p where p.owner_id = u.id and p.deleted_at is null) as 프로젝트,
           (select count(*) from menu m join project p on p.id = m.project_id where p.owner_id = u.id) as 메뉴,
           (select coalesce(sum(-l.amount),0) from credit_ledger l
              where l.user_id = u.id and l.kind = 'spend') as 쓴크레딧
    from "user" u order by u.created_at`)
  ).map((r) => ({
    메일: String(r.email),
    우리: OUR_ACCOUNTS[String(r.email)] ?? null,
    가입때: 때(r.가입때) as Date,
    프로젝트: 수(r.프로젝트),
    메뉴: 수(r.메뉴),
    쓴크레딧: 수(r.쓴크레딧),
  }));

  return {
    잰때: new Date(),
    회원: { 전체: 수(회원?.전체), 손님: 수(회원?.손님), 이레: 수(회원?.이레), 한달: 수(회원?.한달) },
    만든것,
    시도: { 전체: 수(시도?.전체), 성공: 수(시도?.성공), 실패: 수(시도?.실패) },
    실패까닭,
    깔때기: {
      만들기누름: 수(깔때기?.만들기누름),
      컨셉적음: 수(깔때기?.컨셉적음),
      메뉴초안적음: 수(깔때기?.메뉴초안적음),
      생성누름: 수(깔때기?.생성누름),
      생성됨: 수(깔때기?.생성됨),
    },
    알맹이: {
      프로젝트: 수(알맹이?.프로젝트),
      생성된프로젝트: 수(알맹이?.생성된프로젝트),
      메뉴: 수(알맹이?.메뉴),
      화면: 수(알맹이?.화면),
      검수돌린것: 수(알맹이?.검수돌린것),
      검수사이트: 수(알맹이?.검수사이트),
      검수문서: 수(알맹이?.검수문서),
      프리셋만든것: 수(알맹이?.프리셋만든것),
      전체: {
        프로젝트: 수(알맹이?.전체프로젝트),
        생성된프로젝트: 수(알맹이?.전체생성된프로젝트),
        메뉴: 수(알맹이?.전체메뉴),
        화면: 수(알맹이?.전체화면),
        검수돌린것: 수(알맹이?.전체검수),
      },
    },
    열린것: {
      산출물: 수(열린것?.산출물),
      검수시나리오: 수(열린것?.검수시나리오),
      프리셋: 수(열린것?.프리셋),
      판매팩: 수(열린것?.판매팩),
    },
    나날,
    있었던일,
    계정들,
  };
}

/** 손님 메일을 가린다 — 화면에도 파일에도 통째로 적지 않는다. */
export function maskEmail(email: string): string {
  return email.replace(/^(.{2}).*(@.*)$/, "$1***$2");
}

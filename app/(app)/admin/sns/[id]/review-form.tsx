"use client";

/* 검수 편집기 — 칸마다 «프레임 | 자막» 나란히.
 *
 * 왜 나란히 놓나 (2026-08-17)
 *   유튜브에 올린 뒤에 두 가지로 세 번 돌려보내셨다 — ①화면이 좌우로 잘림
 *   ②자막이 화면과 안 맞음(「결과 없음 화면까지 있어요」라는데 흐름도가 떠 있었다).
 *   둘 다 **프레임을 보면 3초에 보이고, 글만 보면 안 보인다.** 그래서 붙여 놓는다.
 *
 * 지켜야 하는 것(사장님 정리, 2026-08-17)
 *   · 우리 서비스를 홍보한다 — 크리에이터로서
 *   · 화면이 잘리지 않는다 (가로는 100%, 세로는 비율에 맞춰 길어 보일 수 있다)
 *   · AI 티 안 나는 자연스러운 말
 *   · IT 에서 쓰는 말
 *   · 사실을 쓰되 **우리 서비스의 흠은 쓰지 않는다**
 *   → 앞의 넷과 마지막은 `lib/sns-caption-rules.ts` 가 세어서 잡고, «화면과 맞나»는 여기서 눈으로 본다.
 */
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { approveContentAction, reopenContentAction, saveContentAction } from "../actions";

/** 공백과 표시(span)를 뺀 글자 수 — 검사기와 같은 셈법이다. */
const 글자수세기 = (s: string) => s.replace(/<[^>]*>/g, "").replace(/\s/g, "").length;

/* 읽는 속도 눈금 (2026-08-17 실측) — 여행 편이 초당 4.4자였고 유지율 40%였다.
   5.5자를 넘으면 못 읽고 지나간다. 3.0자 아래면 빈 화면처럼 보인다. */
const 속도빛 = (초당: number) =>
  초당 > 6.5 ? "text-rose-700" : 초당 > 5.5 ? "text-amber-700" : 초당 < 3.0 ? "text-amber-700" : "text-muted-foreground";

type 편모양 = {
  id: string;
  batch: string;
  slug: string;
  status: string;
  verticalTitle: string;
  horizontalTitle: string;
  coverTitle: string;
  coverDataUri: string;
  coverSub: string;
  ep: string;
  music: string;
  captionYoutube: string;
  captionInstagram: string;
  hashtags: string;
  slotLabel: string;
  checkResult: string;
  youtubeVerticalId: string | null;
  youtubeHorizontalId: string | null;
};

type 칸모양 = {
  id: string;
  ord: number;
  자막: string[];
  frameDataUri: string;
  pose: string;
  clip: string;
  ss: string;
  zoom: string;
  screenNote: string;
};

export function SnsReviewForm({
  편,
  칸들: 처음칸들,
  요약,
}: {
  편: 편모양;
  칸들: 칸모양[];
  요약: { 글자수: number; 초: string; 칸수: number; 칸초: number };
}) {
  const [세로제목, set세로제목] = useState(편.verticalTitle);
  const [가로제목, set가로제목] = useState(편.horizontalTitle);
  /* 커버는 상단 띠와 «따로» 둔다 (2026-08-17 사장님 지시). 커버는 2초 안에 읽혀야 하고,
     상단 띠는 63초 내내 떠 있다. 같은 값을 쓰라는 법이 없다. 비우면 굽는 쪽이 세로제목을 쓴다. */
  const [커버제목, set커버제목] = useState(편.coverTitle || 편.verticalTitle);
  const [커버부제, set커버부제] = useState(편.coverSub);
  const [편이름, set편이름] = useState(편.ep);
  const [유튜브캡션, set유튜브캡션] = useState(편.captionYoutube);
  const [인스타캡션, set인스타캡션] = useState(편.captionInstagram);
  const [해시태그, set해시태그] = useState(편.hashtags);
  const [올릴때, set올릴때] = useState(편.slotLabel);
  /* ⭐ **칸 번호(ord)** → 여러 줄 텍스트. 줄바꿈이 곧 «자막 줄»이다 — 배열을 그대로 만지게 하면
     화면이 복잡해지고, 사장님이 고치는 것은 결국 «두 줄짜리 글»이다.
     ⚠ 전에는 칸 row id 를 열쇠로 썼다. 로컬이 다시 보내면 id 가 통째로 바뀌어서
     저장이 «아무 줄도 안 고치고 조용히 성공»했다 (8/17에 자막을 통째로 잃었다).
     ord 는 다시 보내도 1..N 그대로다. */
  const [자막들, set자막들] = useState<Record<string, string>>(
    Object.fromEntries(처음칸들.map((c) => [String(c.ord), c.자막.join("\n")])),
  );
  /* ⭐ 한 상자에 모아서 고치기 (2026-08-17 사장님 요청) — 22칸을 하나씩 치는 게 제일 힘들다.
     「N. 글」 꼴로 주고받는다. 번호 없는 줄은 «앞 칸의 둘째 줄»이다. */
  const [모아보기, set모아보기] = useState(false);
  const [모은글, set모은글] = useState("");
  const [모은알림, set모은알림] = useState("");

  const [검사, set검사] = useState(편.checkResult);
  const [상태, set상태] = useState(편.status);
  const [알림, set알림] = useState("");
  const [도는중, 시작] = useTransition();
  const [자동저장, set자동저장] = useState(true);
  const [저장됨, set저장됨] = useState("");

  const 지금글자수 = 글자수세기(Object.values(자막들).join(" "));
  /* 읽는 속도로 본다 — 절대 글자 수는 길이가 바뀌면 뜻이 없다 (2026-08-17). */
  const 초당 = Number(요약.초) ? +(지금글자수 / Number(요약.초)).toFixed(1) : 0;

  const 모아서 = useCallback(
    () => ({
      verticalTitle: 세로제목,
      horizontalTitle: 가로제목,
      coverTitle: 커버제목,
      coverSub: 커버부제,
      ep: 편이름,
      captionYoutube: 유튜브캡션,
      captionInstagram: 인스타캡션,
      hashtags: 해시태그,
      slotLabel: 올릴때,
      자막: Object.fromEntries(Object.entries(자막들).map(([k, v]) => [k, v.split("\n")])),
    }),
    [세로제목, 가로제목, 커버제목, 커버부제, 편이름, 유튜브캡션, 인스타캡션, 해시태그, 올릴때, 자막들],
  );

  const 저장 = () =>
    시작(async () => {
      const r = await saveContentAction(편.id, 모아서());
      if (!r.ok) return set알림(r.왜);
      set검사(r.검사);
      set저장됨(새시각());
      set알림(r.검사 ? "저장했습니다 — 아래 검사에 걸린 것이 있어요." : "저장했습니다. 검사도 다 통과했어요.");
    });

  /* ── 자동 저장 (2026-08-17 사장님 요청) ─────────────────────────────
   * 「저장 눌렀는데 내가 입력한 내용이 다 없어졌어」를 겪으신 뒤라, 손으로 누르기 «전»에
   * 이미 들어가 있게 둔다. 2.5초 동안 타이핑이 멈추면 조용히 저장한다.
   * ⚠ 검토 완료된 것은 건드리지 않는다 — 사장님이 이미 판단을 내리신 것이다.
   * ⚠ 저장이 실패하면 «조용히 다시 시도하지 않는다». 알리고 자동 저장을 끈다 —
   *   조용한 재시도가 8/17 사고의 결이었다. */
  const 첫바퀴 = useRef(true);
  const 저장중 = useRef(false);
  useEffect(() => {
    if (첫바퀴.current) { 첫바퀴.current = false; return; }
    if (!자동저장 || 상태 === "approved" || 상태 === "published") return;
    const 시계 = setTimeout(async () => {
      if (저장중.current) return;
      저장중.current = true;
      try {
        const r = await saveContentAction(편.id, 모아서());
        if (!r.ok) {
          set자동저장(false);
          set알림(`자동 저장이 실패했습니다 — ${r.왜} (자동 저장을 껐습니다. 쓰신 글은 화면에 그대로 있으니 복사해 두세요.)`);
          return;
        }
        set검사(r.검사);
        set저장됨(새시각());
      } finally {
        저장중.current = false;
      }
    }, 2500);
    return () => clearTimeout(시계);
  }, [모아서, 자동저장, 상태, 편.id]);

  /* ── 한 상자 ↔ 칸별 옮기기 ──────────────────────────────────────── */
  const 모아보기켜기 = () => {
    set모은글(처음칸들.map((c) => `${c.ord}. ${(자막들[String(c.ord)] ?? "").split("\n").join("\n   ")}`).join("\n"));
    set모은알림("");
    set모아보기(true);
  };

  /** 「N. 글」 을 칸별로 되돌린다. 번호 없는 줄은 앞 칸에 붙는다. */
  const 모은글적용 = () => {
    const 새것: Record<string, string> = {};
    let 지금: string | null = null;
    for (const 줄 of 모은글.split("\n")) {
      const m = 줄.match(/^\s*(\d+)\s*[.)]\s?(.*)$/);
      if (m) {
        지금 = m[1];
        새것[지금] = m[2].trim();
      } else if (지금 && 줄.trim()) {
        새것[지금] = `${새것[지금]}\n${줄.trim()}`;
      }
    }
    const 있어야할 = 처음칸들.map((c) => String(c.ord));
    const 빠진 = 있어야할.filter((o) => !(o in 새것));
    const 남는 = Object.keys(새것).filter((o) => !있어야할.includes(o));
    if (빠진.length || 남는.length) {
      set모은알림(
        `칸 번호가 안 맞습니다 — ${빠진.length ? `빠진 칸 ${빠진.join("·")}번` : ""}${빠진.length && 남는.length ? " / " : ""}${남는.length ? `없는 칸 ${남는.join("·")}번` : ""}. ` +
          `${있어야할.length}칸이 「1.」부터 「${있어야할.length}.」까지 다 있어야 합니다.`,
      );
      return;
    }
    set자막들(새것);
    set모은알림("");
    set모아보기(false);
  };

  const 검토완료 = () =>
    시작(async () => {
      const s = await saveContentAction(편.id, 모아서());
      if (!s.ok) return set알림(s.왜);
      const r = await approveContentAction(편.id);
      if (!r.ok) return set알림(r.왜);
      set검사(r.검사);
      set상태("approved");
      set알림("검토 완료로 두었습니다. 다음 굽기 때 이 판으로 영상을 만들어 유튜브(비공개)와 드라이브에 올립니다.");
    });

  const 되돌리기 = () =>
    시작(async () => {
      const r = await reopenContentAction(편.id);
      if (!r.ok) return set알림(r.왜);
      set상태("waiting");
      set알림("검토 대기로 되돌렸습니다.");
    });

  const 승인됨 = 상태 === "approved" || 상태 === "published";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/admin/sns" className="text-sm font-semibold text-primary-on-soft hover:underline">
        ← 목록
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{편.batch}</span>
        <span className="font-mono text-xs text-muted-foreground">· {편.slug}</span>
        {편.ep && <span className="text-xs font-semibold text-primary-on-soft">{편.ep}</span>}
        {승인됨 && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
            검토 완료
          </span>
        )}
      </div>

      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground [word-break:keep-all]">
        {세로제목.replaceAll("|", " ")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        자막 {요약.칸수}칸 · {요약.초}초 · 공백 제외 {지금글자수}자 ·{" "}
        <b className={초당 < 3.5 || 초당 > 5.5 ? "text-rose-700" : "text-foreground"}>초당 {초당}자</b>{" "}
        <span className="text-xs">(3.5~5.5가 목표 — 여행 편이 4.4였습니다)</span>
        {편.music && <span> · 음악 {편.music}</span>}
      </p>

      {/* 검사 결과 — 사장님이 고친 문장도 여기서 다시 검사받는다. 막지는 않는다. */}
      {검사 && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-bold text-rose-900">자막 검사에 걸린 것</p>
          <ul className="mt-2 flex flex-col gap-1">
            {검사.split("\n").map((줄, i) => (
              <li key={i} className="text-sm leading-relaxed text-rose-900 [word-break:keep-all]">
                {줄}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-rose-800 [word-break:keep-all]">
            금지어를 피하려고 뜻을 흐리지 마세요 — 화살표 뒤에 적힌 그 말로 바꾸는 쪽이 맞습니다.
            일부러 그렇게 쓰신 것이면 그냥 검토 완료를 누르시면 됩니다.
          </p>
        </div>
      )}

      {/* ── ⭐ 커버와 상단 띠 — 글자만 고치면 어떻게 보이는지 모른다 ──────── */}
      <section className="mt-8 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-bold text-foreground">커버와 상단 띠</h2>
        <p className="mt-1 text-sm text-muted-foreground [word-break:keep-all]">
          <b className="text-foreground">둘은 다른 글입니다.</b> 커버는 맨 앞 2초에만 나오고, 상단 띠는
          영상 내내 화면 위에 떠 있습니다. 커버는 2초에 읽혀야 하니 더 짧고 세게 씁니다.
        </p>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {/* 커버 */}
          <div>
            <p className="mb-2 text-xs font-bold text-primary-on-soft">커버 — 맨 앞 2초</p>
            {편.coverDataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={편.coverDataUri}
                alt="커버"
                className="w-full max-w-[240px] rounded-lg border border-border"
              />
            ) : (
              <div className="grid aspect-[9/16] w-full max-w-[240px] place-items-center rounded-lg border border-dashed border-border px-4 text-center text-xs text-muted-foreground [word-break:keep-all]">
                커버 그림이 없습니다. 로컬에서 영상인트로를 돌린 뒤 다시 보내면 여기에 뜹니다.
              </div>
            )}
            <div className="mt-3">
              <Field 라벨="커버 카피 (큰 글자)" 도움="| 가 줄바꿈입니다. 3줄, 한 줄 여덟 자 안팎. 넘치면 굽다가 멈춥니다">
                <textarea
                  className={`${입력} min-h-20 leading-relaxed`}
                  value={커버제목}
                  onChange={(e) => set커버제목(e.target.value)}
                />
              </Field>
            </div>
            {/* ⭐ 부제 — 큰 카피 아래, 자막과 같은 54px (2026-08-18 사장님 지시) */}
            <div className="mt-3">
              <Field 라벨="커버 부제 (자막 크기)" 도움="「- 펫 유치원 편 -」처럼 이번 회차가 무엇인지. 한 줄로 씁니다">
                <input className={입력} value={커버부제} onChange={(e) => set커버부제(e.target.value)} />
              </Field>
            </div>
          </div>

          {/* 상단 띠 */}
          <div>
            <p className="mb-2 text-xs font-bold text-primary-on-soft">상단 띠 — 영상 내내</p>
            {처음칸들[0]?.frameDataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={처음칸들[0].frameDataUri}
                alt="상단 띠가 보이는 첫 칸"
                className="w-full max-w-[240px] rounded-lg border border-border"
              />
            ) : (
              <div className="grid aspect-[9/16] w-full max-w-[240px] place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                프레임 없음
              </div>
            )}
            <div className="mt-3">
              <Field 라벨="상단 띠 (세로·쇼츠)" 도움="| 가 줄바꿈입니다">
                <textarea
                  className={`${입력} min-h-20 leading-relaxed`}
                  value={세로제목}
                  onChange={(e) => set세로제목(e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-3">
              <Field 라벨="상단 띠 (가로)" 도움="한 줄 7자까지 — 기둥이 좁습니다">
                <textarea
                  className={`${입력} min-h-16 leading-relaxed`}
                  value={가로제목}
                  onChange={(e) => set가로제목(e.target.value)}
                />
              </Field>
            </div>
            {/* ⭐ 오른쪽 위 작은 태그 — 세로·가로·커버 세 곳에 같이 찍힌다 (2026-08-18) */}
            <div className="mt-3">
              <Field 라벨="오른쪽 위 태그" 도움="「반려동물 유치원 편」처럼. 세로·가로·커버 세 곳에 같이 들어갑니다">
                <input className={입력} value={편이름} onChange={(e) => set편이름(e.target.value)} />
              </Field>
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-primary-soft px-3 py-2 text-xs text-primary-on-soft [word-break:keep-all]">
          강조는 {"<span class='o'>말</span>"} 로 감쌉니다 — 숫자·핵심어 한 군데에만. 여기서 글을 고치면{" "}
          <b>다음에 구울 때</b> 커버와 띠에 들어갑니다. 위 그림은 지금 나가 있는 판입니다.
        </p>
      </section>

      {/* ── 캡션 ───────────────────────────────────────────── */}
      <section className="mt-8 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-bold text-foreground">캡션</h2>
        <div className="mt-4">
          <Field 라벨="언제 올릴 것인가" 도움="「3주 목 8/27 09:00」처럼">
            <input className={입력} value={올릴때} onChange={(e) => set올릴때(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field 라벨="유튜브 설명" 도움="맨 아래 링크 세 줄은 고정입니다. 꺽쇠(>) 대신 👉를 씁니다">
            <textarea
              className={`${입력} min-h-40 font-mono text-xs leading-relaxed`}
              value={유튜브캡션}
              onChange={(e) => set유튜브캡션(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field 라벨="인스타 캡션" 도움="주소가 눌리지 않으니 프로필 링크로 보냅니다">
            <textarea
              className={`${입력} min-h-28 leading-relaxed`}
              value={인스타캡션}
              onChange={(e) => set인스타캡션(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field 라벨="해시태그" 도움="기본 여덟 개를 그대로 씁니다 — 매번 다르면 채널 주제가 안 쌓입니다">
            <input className={입력} value={해시태그} onChange={(e) => set해시태그(e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ── 칸별 — 프레임과 자막을 나란히 ────────────────────── */}
      <h2 className="mt-10 font-bold text-foreground">
        칸마다 — 실제로 나갈 화면과 그 칸 자막
      </h2>
      <p className="mt-1 text-sm text-muted-foreground [word-break:keep-all]">
        두 가지를 봐 주세요. <b className="text-foreground">① 화면이 좌우로 잘렸는지</b>(가로는
        100%가 다 보여야 합니다. 세로로 길어 보이는 것은 정상입니다){" "}
        <b className="text-foreground">② 자막이 말하는 것이 그 화면에 실제로 보이는지.</b>{" "}
        ②는 검사기가 못 봅니다.
      </p>

      {/* ⭐ 한 상자에 모아서 — 22칸을 하나씩 치지 않아도 된다 */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {모아보기 ? (
          <>
            <button
              type="button"
              onClick={모은글적용}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              이대로 칸에 넣기
            </button>
            <button
              type="button"
              onClick={() => { set모아보기(false); set모은알림(""); }}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground"
            >
              그만두기
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={모아보기켜기}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground"
          >
            한 상자에 모아서 고치기
          </button>
        )}
      </div>

      {모아보기 && (
        <div className="mt-3 rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted-foreground [word-break:keep-all]">
            <b className="text-foreground">「1.」부터 「{요약.칸수}.」까지</b> 번호를 붙여 씁니다. 번호 없는 줄은
            앞 칸의 둘째 줄이 됩니다. 다른 데서 통째로 붙여넣으셔도 됩니다.
          </p>
          <textarea
            className={`${입력} mt-2 min-h-96 font-mono text-sm leading-relaxed`}
            value={모은글}
            onChange={(e) => set모은글(e.target.value)}
          />
          {모은알림 && (
            <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900 [word-break:keep-all]">
              {모은알림}
            </p>
          )}
        </div>
      )}

      <ol className="mt-6 flex flex-col gap-6">
        {처음칸들.map((c) => (
          <li key={c.id} className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[240px_1fr]">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {c.ord}
                </span>
                {c.pose && <span className="text-xs text-muted-foreground">🐱 {c.pose}</span>}
              </div>
              {c.frameDataUri ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.frameDataUri}
                  alt={`${c.ord}번 칸 화면`}
                  className="w-full rounded-lg border border-border"
                />
              ) : (
                <div className="grid aspect-[9/16] w-full place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  프레임 없음
                </div>
              )}
              {(c.clip || c.ss) && (
                <p className="mt-2 font-mono text-[11px] leading-tight text-muted-foreground">
                  {c.clip.split("/").pop()}
                  {c.ss && ` @${c.ss}초`}
                  {c.zoom && ` zoom ${c.zoom}`}
                </p>
              )}
            </div>
            <div>
              {c.screenNote && (
                <p className="mb-2 rounded-lg bg-primary-soft px-3 py-2 text-xs text-primary-on-soft [word-break:keep-all]">
                  이 화면에 떠 있는 것: {c.screenNote}
                </p>
              )}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  자막 (한 줄에 한 줄씩. 강조는 {"<span class='o'>말</span>"})
                </label>
                {/* ⭐ 칸마다 읽는 속도 — 편 평균이 괜찮아도 «이 칸»이 빠르면 여기서 놓친다 */}
                {(() => {
                  const n = 글자수세기(자막들[String(c.ord)] ?? "");
                  const 초당칸 = 요약.칸초 ? +(n / 요약.칸초).toFixed(1) : 0;
                  return (
                    <span className={`text-xs font-semibold tabular-nums ${속도빛(초당칸)}`}>
                      {n}자 · 초당 {초당칸}자
                      {초당칸 > 5.5 && " — 빠릅니다"}
                      {초당칸 > 0 && 초당칸 < 3.0 && " — 비어 보입니다"}
                    </span>
                  );
                })()}
              </div>
              <textarea
                className={`${입력} mt-1 min-h-24 text-base leading-relaxed`}
                value={자막들[String(c.ord)] ?? ""}
                onChange={(e) => set자막들((p) => ({ ...p, [String(c.ord)]: e.target.value }))}
              />
            </div>
          </li>
        ))}
      </ol>

      {/* ── 단추 ─────────────────────────────────────────── */}
      {알림 && (
        <p className="mt-8 rounded-lg bg-primary-soft px-4 py-3 text-sm font-semibold text-primary-on-soft [word-break:keep-all]">
          {알림}
        </p>
      )}
      <div className="sticky bottom-0 mt-6 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={저장}
          disabled={도는중}
          className="rounded-lg border border-border bg-surface px-5 py-3 font-bold text-foreground disabled:opacity-50"
        >
          {도는중 ? "…" : "저장"}
        </button>
        {/* ⭐ 자동 저장 — 손으로 누르기 «전»에 이미 들어가 있게 둔다 (8/17 사고 뒤) */}
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={자동저장}
            onChange={(e) => set자동저장(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          자동 저장
        </label>
        {저장됨 && (
          <span className="text-sm font-semibold text-emerald-800 tabular-nums">✓ {저장됨}에 저장됨</span>
        )}
        {승인됨 ? (
          <button
            type="button"
            onClick={되돌리기}
            disabled={도는중}
            className="rounded-lg border border-border bg-surface px-5 py-3 font-bold text-foreground disabled:opacity-50"
          >
            검토 대기로 되돌리기
          </button>
        ) : (
          <button
            type="button"
            onClick={검토완료}
            disabled={도는중}
            className="rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50"
          >
            검토 완료 — 이대로 올려 주세요
          </button>
        )}
        {편.youtubeVerticalId && (
          <a
            className="self-center text-sm font-semibold text-primary-on-soft hover:underline"
            href={`https://studio.youtube.com/video/${편.youtubeVerticalId}/edit`}
            target="_blank"
            rel="noreferrer"
          >
            스튜디오에서 열기 →
          </a>
        )}
      </div>
    </div>
  );
}

const 입력 =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

const 새시각 = () =>
  new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function Field({ 라벨, 도움, children }: { 라벨: string; 도움?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground">{라벨}</label>
      {children}
      {도움 && <p className="mt-1 text-[11px] text-muted-foreground [word-break:keep-all]">{도움}</p>}
    </div>
  );
}

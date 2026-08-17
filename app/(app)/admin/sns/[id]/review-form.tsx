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
import { useState, useTransition } from "react";
import Link from "next/link";
import { approveContentAction, reopenContentAction, saveContentAction } from "../actions";

type 편모양 = {
  id: string;
  batch: string;
  slug: string;
  status: string;
  verticalTitle: string;
  horizontalTitle: string;
  coverTitle: string;
  coverDataUri: string;
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
  요약: { 글자수: number; 초: string; 칸수: number };
}) {
  const [세로제목, set세로제목] = useState(편.verticalTitle);
  const [가로제목, set가로제목] = useState(편.horizontalTitle);
  /* 커버는 상단 띠와 «따로» 둔다 (2026-08-17 사장님 지시). 커버는 2초 안에 읽혀야 하고,
     상단 띠는 63초 내내 떠 있다. 같은 값을 쓰라는 법이 없다. 비우면 굽는 쪽이 세로제목을 쓴다. */
  const [커버제목, set커버제목] = useState(편.coverTitle || 편.verticalTitle);
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
  const [검사, set검사] = useState(편.checkResult);
  const [상태, set상태] = useState(편.status);
  const [알림, set알림] = useState("");
  const [도는중, 시작] = useTransition();

  const 지금글자수 = Object.values(자막들)
    .join(" ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s/g, "").length;
  /* 읽는 속도로 본다 — 절대 글자 수는 길이가 바뀌면 뜻이 없다 (2026-08-17). */
  const 초당 = Number(요약.초) ? +(지금글자수 / Number(요약.초)).toFixed(1) : 0;

  const 모아서 = () => ({
    verticalTitle: 세로제목,
    horizontalTitle: 가로제목,
    coverTitle: 커버제목,
    captionYoutube: 유튜브캡션,
    captionInstagram: 인스타캡션,
    hashtags: 해시태그,
    slotLabel: 올릴때,
    자막: Object.fromEntries(Object.entries(자막들).map(([k, v]) => [k, v.split("\n")])),
  });

  const 저장 = () =>
    시작(async () => {
      const r = await saveContentAction(편.id, 모아서());
      if (!r.ok) return set알림(r.왜);
      set검사(r.검사);
      set알림(r.검사 ? "저장했습니다 — 아래 검사에 걸린 것이 있어요." : "저장했습니다. 검사도 다 통과했어요.");
    });

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
              <Field 라벨="커버 카피" 도움="| 가 줄바꿈입니다. 3~4줄, 글자 크기는 고정이라 «글»을 줄여서 맞춥니다">
                <textarea
                  className={`${입력} min-h-20 leading-relaxed`}
                  value={커버제목}
                  onChange={(e) => set커버제목(e.target.value)}
                />
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
              <label className="text-xs font-semibold text-muted-foreground">
                자막 (한 줄에 한 줄씩. 강조는 {"<span class='o'>말</span>"})
              </label>
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
      <div className="sticky bottom-0 mt-6 flex flex-wrap gap-3 border-t border-border bg-background/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={저장}
          disabled={도는중}
          className="rounded-lg border border-border bg-surface px-5 py-3 font-bold text-foreground disabled:opacity-50"
        >
          {도는중 ? "…" : "저장"}
        </button>
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

function Field({ 라벨, 도움, children }: { 라벨: string; 도움?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground">{라벨}</label>
      {children}
      {도움 && <p className="mt-1 text-[11px] text-muted-foreground [word-break:keep-all]">{도움}</p>}
    </div>
  );
}

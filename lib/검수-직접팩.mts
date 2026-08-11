/* 손님이 직접 만든 AI팩을 재는 «알맹이».
 *
 * 명령줄(`검수기-직접팩.mts`)과 화면(`검수기-화면.mts`)이 **이것 하나를 같이 쓴다.**
 * 두 벌로 적으면 화면에서는 통과하고 명령줄에서는 걸리는 일이 생긴다.
 *
 * 파일 «속»을 열어 보는 부분은 다시 `검수-속보기.mts` 를 쓴다 — 판매팩 검사기와 나눠 쓰는 자리다.
 */
import { 파일보기, 화면목록안내보기, 줄수세기, type 급 } from "./검수-속보기.mjs";
import { basename } from "node:path";

export type 흠 = { 급: 급; 무엇: string; 항목: string };

/* ── 있어야 할 것 ──────────────────────────────────────────────
   직접 만든 팩은 이름 뒤에 «프로젝트 이름»이 붙는다(`IA_화면목록_내서비스.xlsx`).
   그래서 통째로 맞추지 않고 앞머리로 찾는다.
   ⚠ 이 목록의 출처는 `app/(app)/dashboard/zip-all-button.tsx` 다.
     거기를 고치면 여기도 같이 고친다 — 안 그러면 멀쩡한 팩을 「빠졌다」고 한다. */
export const 있어야 = [
  { 앞: "메뉴구조_", 끝: ".xlsx", 뭐: "메뉴구조" },
  { 앞: "IA_화면목록_", 끝: ".xlsx", 뭐: "화면목록" },
  { 앞: "기능정의서_", 끝: ".xlsx", 뭐: "기능정의서" },
  { 앞: "WBS_", 끝: ".xlsx", 뭐: "개발 일정표" },
  { 앞: "FLOW_", 끝: ".html", 뭐: "흐름도(html)" },
  { 앞: "FLOW_", 끝: ".drawio", 뭐: "흐름도(drawio)" },
  { 앞: "메뉴구조_", 끝: ".pptx", 뭐: "메뉴구조 장표" },
  { 앞: "스펙팩_", 끝: ".md", 뭐: "AI 빌드 지시서(md)" },
  { 앞: "스펙팩_", 끝: ".json", 뭐: "AI 빌드 지시서(json)" },
  { 앞: "디자인시스템_", 끝: ".md", 뭐: "디자인 규칙" },
];

/** 없어도 흠은 아니지만, 없으면 알려는 준다. */
export const 있으면좋은것 = [
  { 앞: "검수시나리오_", 끝: ".xlsx", 뭐: "검수 시나리오" },
  { 앞: "사이트_내놓는_법", 끝: ".html", 뭐: "사이트 내놓는 법 안내서" },
  { 앞: "앱으로_내놓는_법", 끝: ".html", 뭐: "앱으로 내놓는 법 안내서" },
];

/** 팩 하나를 잰다. 「이름 → 내용」 만 주면 zip 이든 폴더든 상관없다. */
export async function 검수하기(파일들: Map<string, Buffer>): Promise<흠[]> {
  const 흠들: 흠[] = [];
  let 지금항목 = "";
  const 담 = (g: 급, _어디: string, 무엇: string) => 흠들.push({ 급: g, 무엇, 항목: 지금항목 });

  const 이름들 = [...파일들.keys()];
  const 찾기 = (앞: string, 끝: string) =>
    이름들.find((n) => basename(n).startsWith(앞) && n.endsWith(끝));

  지금항목 = "B1";
  for (const { 앞, 끝, 뭐 } of 있어야) {
    if (!찾기(앞, 끝)) 담("FAIL", "", `${뭐} 가 없습니다 (${앞}…${끝})`);
  }
  for (const { 앞, 끝, 뭐 } of 있으면좋은것) {
    if (!찾기(앞, 끝)) 담("WARN", "", `${뭐} 가 없습니다 — 만들 때 안 고르셨을 수 있습니다`);
  }

  지금항목 = "B2";
  for (const [이름, b] of 파일들) {
    if (b.length === 0) { 담("FAIL", "", `${이름} — 0바이트입니다`); continue; }
    await 파일보기("", 이름, b, 담);
    if (이름.includes("화면목록")) {
      지금항목 = "B6";
      화면목록안내보기("", 이름, b, 담);
      지금항목 = "B2";
    }
  }

  /* 스펙팩과 화면목록이 «같은 화면 수»를 말하나.
     다르면 손님은 「목록엔 40개인데 지시서엔 32개」를 보게 된다.
     AI 에 넣는 것은 지시서 쪽이라, 목록만 믿고 세면 화면이 모자라게 나온다. */
  지금항목 = "B7";
  const 스펙이름 = 찾기("스펙팩_", ".json");
  const 목록이름 = 찾기("IA_화면목록_", ".xlsx");
  if (스펙이름 && 목록이름) {
    try {
      const spec = JSON.parse(파일들.get(스펙이름)!.toString("utf8"));
      const 스펙화면 = (spec.menus ?? []).reduce(
        (n: number, m: { screens?: unknown[] }) => n + (m.screens?.length ?? 0), 0);
      const 목록줄 = 줄수세기(파일들.get(목록이름)!);
      if (스펙화면 > 0 && 목록줄 > 0 && 스펙화면 !== 목록줄) {
        담("FAIL", "", `화면 수가 안 맞습니다 — 화면목록 ${목록줄}개 · AI 빌드 지시서 ${스펙화면}개`);
      }
    } catch { /* json 이 깨진 것은 위에서 이미 말했다 */ }
  }

  지금항목 = "B8";
  const 흐름이름 = 찾기("FLOW_", ".html");
  if (흐름이름 && 스펙이름) {
    try {
      const spec = JSON.parse(파일들.get(스펙이름)!.toString("utf8"));
      const 있는화면 = new Set<string>(
        (spec.menus ?? []).flatMap((m: { screens?: { pageId: string }[] }) =>
          (m.screens ?? []).map((s) => String(s.pageId).toUpperCase())));
      const 흐름글 = 파일들.get(흐름이름)!.toString("utf8");
      const 가리킨것 = [...new Set([...흐름글.matchAll(/\b([A-Z]{2}-?\d{2,4})\b/g)].map((m) => m[1].toUpperCase()))];
      const 없는것 = 가리킨것.filter((id) => !있는화면.has(id) && !있는화면.has(id.replace("-", "")));
      if (없는것.length) {
        담("WARN", "", `흐름도가 목록에 없는 화면을 가리킵니다 — ${없는것.slice(0, 6).join(", ")}${없는것.length > 6 ? ` 외 ${없는것.length - 6}` : ""}`);
      }
    } catch { /* 위에서 말했다 */ }
  }

  return 흠들;
}

/* ── 검수항목.md 읽기 ──────────────────────────────────────────
   화면에 「무엇을 재는지」를 그대로 보여 주려고 읽는다.
   **여기서 항목을 다시 적지 않는다.** 두 벌이 되면 화면과 실제가 갈라진다. */
export type 항목 = { 번호: string; 무엇: string; 누가: string; 적용: string; 어디서: string };

export function 항목읽기(md: string): { 기본: 항목[]; 변경: 항목[] } {
  const 줄들 = md.split(/\r?\n/).filter((l) => /^\|\s*[A-E]\d/.test(l));
  const 전부: 항목[] = 줄들.map((l) => {
    const 칸 = l.split("|").slice(1, -1).map((c) => c.trim());
    return { 번호: 칸[0], 무엇: 칸[1], 누가: 칸[2], 적용: 칸[3], 어디서: 칸[4] ?? "" };
  });
  /* 「어디서 왔나」가 «—» 면 처음부터 있던 기본 규칙,
     사연이 적혀 있으면 우리가 대화하다 «바꾼» 규칙이다. */
  const 사연있나 = (a: 항목) => a.어디서 && a.어디서 !== "—";
  return { 기본: 전부.filter((a) => !사연있나(a)), 변경: 전부.filter(사연있나) };
}

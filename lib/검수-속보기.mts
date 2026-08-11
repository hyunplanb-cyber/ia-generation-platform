/* 파일 «속»을 열어 보는 검사 — 두 검사기가 같이 쓴다.
 *
 * 왜 따로 뺐나
 *   `check-zip.mts`(우리가 파는 팩)와 `검수기-직접팩.mts`(손님이 직접 만든 팩)가
 *   같은 것을 본다 — 엑셀이 열리나, pptx 속이 비었나, json 이 깨졌나, html 이 html 인가.
 *   두 벌로 적으면 반드시 갈라진다. 한 팩에서 잡히는 결함이 다른 팩에서 안 잡히게 된다.
 *
 *   ⚠ 여기를 고치면 **두 검사기가 같이 바뀐다.** 그게 이 파일이 있는 까닭이다.
 *
 * 무엇을 안 넣었나
 *   「어느 파일이 반드시 있어야 하나」는 여기 없다. 팩 종류마다 다르기 때문이다
 *   (우리 팩은 `01_메뉴구조.xlsx`, 직접 만든 팩은 `메뉴구조_<이름>.xlsx`).
 *   그건 각 검사기가 자기 목록을 갖는다.
 */
import JSZip from "jszip";
import * as XLSX from "xlsx";

export type 급 = "FAIL" | "WARN";
export type 흠 = { 급: 급; 어디: string; 무엇: string };
/** 흠을 어디에 담을지는 부르는 쪽이 정한다. */
export type 담기 = (급: 급, 어디: string, 무엇: string) => void;

/** 이보다 짧으면 알맹이가 없는 것으로 본다. */
export const 최소길이: Record<string, number> = {
  ".html": 800, ".md": 500, ".txt": 200, ".drawio": 300,
};

/** 엑셀이 «열리고 안에 뭐가 있나». 파일 크기만 보면 깨진 것을 못 잡는다. */
export function 엑셀보기(어디: string, 이름: string, buf: Buffer, 담: 담기) {
  let wb: XLSX.WorkBook;
  try { wb = XLSX.read(buf, { type: "buffer" }); }
  catch (e) { 담("FAIL", 어디, `${이름} — 엑셀이 안 열립니다 (${(e as Error).message.slice(0, 60)})`); return; }
  if (!wb.SheetNames.length) { 담("FAIL", 어디, `${이름} — 시트가 하나도 없습니다`); return; }
  /* 「먼저 읽어 주세요」만 있고 알맹이 시트가 비어 있던 적이 있는지 본다. */
  let 값있는시트 = 0;
  for (const s of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[s], { header: 1 }) as unknown[][];
    if (rows.filter((r) => r.some((c) => String(c ?? "").trim())).length > 1) 값있는시트 += 1;
  }
  if (값있는시트 === 0) 담("FAIL", 어디, `${이름} — 시트 ${wb.SheetNames.length}개가 모두 비었습니다`);
}

/** pptx 도 속은 zip 이다. 열어서 발표 파일이 들어 있는지 본다. */
export async function 피피티보기(어디: string, 이름: string, buf: Buffer, 담: 담기) {
  try {
    const z = await JSZip.loadAsync(buf);
    if (!z.file("ppt/presentation.xml")) 담("FAIL", 어디, `${이름} — 파워포인트 속이 비었습니다`);
  } catch { 담("FAIL", 어디, `${이름} — 파워포인트가 안 열립니다`); }
}

/** 파일 하나를 확장자에 맞게 열어 본다. 0바이트는 부르는 쪽이 먼저 거른다. */
export async function 파일보기(어디: string, 짧게: string, b: Buffer, 담: 담기) {
  if (짧게.endsWith(".xlsx")) { 엑셀보기(어디, 짧게, b, 담); return; }
  if (짧게.endsWith(".pptx")) { await 피피티보기(어디, 짧게, b, 담); return; }
  if (짧게.endsWith(".json")) {
    /* BOM 이 붙어 JSON.parse 가 깨진 적이 있다(여행 두 팩 pageids.json). 그대로 재현되게 둔다. */
    try { JSON.parse(b.toString("utf8")); }
    catch (e) { 담("FAIL", 어디, `${짧게} — json 이 깨졌습니다 (${(e as Error).message.slice(0, 50)})`); }
    return;
  }
  const ext = 짧게.slice(짧게.lastIndexOf("."));
  const 최소 = 최소길이[ext];
  if (최소 && b.length < 최소) 담("FAIL", 어디, `${짧게} — ${b.length}바이트뿐입니다 (${최소} 미만)`);
  if (ext === ".html") {
    const s = b.toString("utf8").slice(0, 400).toLowerCase();
    if (!s.includes("<html") && !s.includes("<!doctype")) 담("FAIL", 어디, `${짧게} — html 이 아닌 것 같습니다`);
  }
}

/** 디자인프리셋 — `.md` 와 `.json` 이 짝이라야 한다. 하나만 있으면 반쪽이다. */
export function 프리셋짝보기(어디: string, 파일이름들: string[], 담: 담기) {
  const 짝 = new Map<string, Set<string>>();
  for (const f of 파일이름들) {
    const i = f.lastIndexOf(".");
    if (i < 0) continue;
    const [뿌, 확] = [f.slice(0, i), f.slice(i)];
    if (확 !== ".md" && 확 !== ".json") continue;
    if (!짝.has(뿌)) 짝.set(뿌, new Set());
    짝.get(뿌)!.add(확);
  }
  for (const [뿌, 확들] of 짝) {
    if (확들.size !== 2) 담("WARN", 어디, `디자인프리셋/${뿌} — ${[...확들].join("")} 만 있습니다`);
  }
}

/** 화면목록 엑셀에 「만든 뒤 확인하세요」 안내가 들어갔나 (검수항목 B6).
 *  2026-08-10 에 사장님이 「화면목록에 다 넣은 거 맞아?」라고 물으셨다. 아니었다. */
export function 화면목록안내보기(어디: string, 이름: string, buf: Buffer, 담: 담기) {
  try {
    const wb = XLSX.read(buf, { type: "buffer" });
    const 통글 = wb.SheetNames
      .map((s) => (XLSX.utils.sheet_to_json(wb.Sheets[s], { header: 1 }) as unknown[][])
        .flat().map((c) => String(c ?? "")).join(" "))
      .join(" ");
    if (!통글.includes("의도한 대로")) {
      담("WARN", 어디, `${이름} — 「의도한 대로 나오지 않을 수 있어요」 안내가 안 보입니다`);
    }
  } catch { /* 엑셀보기가 이미 못 연다고 말했다. 두 번 말하지 않는다. */ }
}

/** 엑셀에서 값이 든 줄 수를 센다 (머리줄 뺀 값). 서로 맞는지 견줄 때 쓴다.
 *
 * ⚠ **첫 시트를 세면 안 된다.** `02_IA_화면목록.xlsx` 는 시트가 둘이다 —
 *   「먼저 읽어 주세요」(안내 14줄)와 「화면목록」(진짜 44줄). 첫 시트를 세면 14가 나온다.
 *   2026-08-11 에 이걸로 만든 검사가 «늘 FAIL» 나게 되어 있었다. 안 걸린 까닭은
 *   이름 규칙이 달라 그 검사가 아예 안 돌았기 때문이다.
 *
 * @param 고를말 시트 이름에 이 말이 들어간 것을 고른다. 없으면 «줄이 가장 많은» 시트.
 */
export function 줄수세기(buf: Buffer, 고를말?: string): number {
  try {
    const wb = XLSX.read(buf, { type: "buffer" });
    const 세기 = (s: string) => {
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[s], { header: 1 }) as unknown[][];
      return Math.max(0, rows.filter((r) => r.some((c) => String(c ?? "").trim())).length - 1);
    };
    if (고를말) {
      const 맞는것 = wb.SheetNames.find((s) => s.replace(/\s/g, "").includes(고를말.replace(/\s/g, "")));
      if (맞는것) return 세기(맞는것);
    }
    /* 못 찾으면 «가장 큰» 시트를 쓴다 — 안내 시트는 언제나 알맹이보다 짧다. */
    return Math.max(0, ...wb.SheetNames.map(세기));
  } catch { return -1; }
}

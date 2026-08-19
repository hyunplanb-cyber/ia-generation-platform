/* 검수 기록 — 루틴 넷이 무엇을 보고 무엇을 고쳤는지 회차별로 읽는다.
 *
 * 왜 파일인가
 *   검수 루틴은 사장님 컴퓨터에서 도는 스크립트라 DB 접속 정보가 없다.
 *   CSV 로 쓰고, 화면은 그것을 읽어 보여 준다. [[qa-decisions]] 와 같은 방식이다.
 *
 * 왜 화면인가 (2026-08-19 사장님이 정하심)
 *   전에는 마무리 회차가 구글 시트로 올리게 되어 있었다. 그런데 드라이브는
 *   「줄 추가」가 안 돼서 매주 새 시트가 쌓인다. 사장님이 판단하러 들어오시는
 *   자리가 이미 /admin/qa 라, 「이번에 뭘 고쳤나」와 「내가 정할 것」을 한 화면에 둔다.
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export const 검수폴더 = join(process.cwd(), "검수");

/** 검수공통.md 5절이 정한 칸 차례. 검사기(_작업/검수표검사.mjs)가 이 순서를 잰다. */
export const 머리줄 = ["날짜", "루틴", "팩", "항목", "무엇", "근거파일", "고침여부"] as const;

export type 고침값 = "고침" | "해당없음" | "마무리에넘김" | "못고침";

export interface 검수줄 {
  날짜: string;
  루틴: string;
  팩: string;
  항목: string;
  무엇: string;
  근거파일: string;
  고침여부: string;
  /** 괄호 앞의 값만 — `고침(마무리가 …)` → `고침` */
  갈래: 고침값 | "알수없음";
}

export interface 검수회차 {
  날짜: string;
  줄: 검수줄[];
  셈: Record<string, number>;
  /** 그날 실제로 손님에게 나간 팩 (검수/나간팩_<날짜>.json) */
  나간팩: string[];
}

/** 따옴표를 아는 CSV 쪼개기 — 칸 안의 쉼표를 지킨다. */
export function 쪼개(줄: string): string[] {
  const 칸: string[] = [];
  let 지금 = "";
  let 따옴 = false;
  for (let i = 0; i < 줄.length; i++) {
    const c = 줄[i];
    if (따옴) {
      if (c === '"' && 줄[i + 1] === '"') {
        지금 += '"';
        i++;
      } else if (c === '"') 따옴 = false;
      else 지금 += c;
    } else if (c === '"') 따옴 = true;
    else if (c === ",") {
      칸.push(지금);
      지금 = "";
    } else 지금 += c;
  }
  칸.push(지금);
  return 칸;
}

function 갈래뽑기(값: string): 검수줄["갈래"] {
  const v = 값.trim();
  for (const g of ["고침", "해당없음", "마무리에넘김", "못고침"] as const) {
    if (v === g || v.startsWith(g + "(")) return g;
  }
  return "알수없음";
}

/** 누적본을 읽어 회차(날짜)별로 묶는다. 최근 회차가 앞이다. */
export async function 검수기록읽기(최근몇회 = 8): Promise<검수회차[]> {
  let 글: string;
  try {
    글 = await readFile(join(검수폴더, "검수기록.csv"), "utf8");
  } catch {
    /* 아직 검수가 한 번도 안 돌았다는 뜻이다. 오류가 아니다. */
    return [];
  }

  const 줄들 = 글.split(/\r?\n/).filter((x) => x.trim());
  const 회차: Map<string, 검수줄[]> = new Map();

  for (const l of 줄들.slice(1)) {
    const c = 쪼개(l);
    if (c.length !== 7) continue; /* 모양이 틀린 줄은 검사기가 잡는다 */
    const 줄: 검수줄 = {
      날짜: c[0].trim(),
      루틴: c[1].trim(),
      팩: c[2].trim(),
      항목: c[3].trim(),
      무엇: c[4].trim(),
      근거파일: c[5].trim(),
      고침여부: c[6].trim(),
      갈래: 갈래뽑기(c[6]),
    };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(줄.날짜)) continue;
    const 담을 = 회차.get(줄.날짜) ?? [];
    담을.push(줄);
    회차.set(줄.날짜, 담을);
  }

  /* 그날 실제로 나간 팩 — 「고쳤다」와 「나갔다」는 다른 일이다 */
  let 나간파일: string[] = [];
  try {
    나간파일 = (await readdir(검수폴더)).filter((x) => /^나간팩_\d{4}-\d{2}-\d{2}\.json$/.test(x));
  } catch {
    나간파일 = [];
  }
  const 나간표 = new Map<string, string[]>();
  for (const f of 나간파일) {
    try {
      const j = JSON.parse(await readFile(join(검수폴더, f), "utf8")) as {
        날짜?: string;
        나간팩?: string[];
      };
      const 날 = j.날짜 ?? f.slice(4, 14);
      나간표.set(날, [...new Set(j.나간팩 ?? [])].sort());
    } catch {
      /* 깨진 기록은 없는 셈 친다 */
    }
  }

  return [...회차.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 최근몇회)
    .map(([날짜, 줄]) => {
      const 셈: Record<string, number> = {};
      줄.forEach((x) => {
        셈[x.갈래] = (셈[x.갈래] ?? 0) + 1;
      });
      return { 날짜, 줄, 셈, 나간팩: 나간표.get(날짜) ?? [] };
    });
}

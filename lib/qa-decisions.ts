/* 검수 판단 목록 — 루틴이 「근거가 없어 못 고친 것」을 남기고, 사장님이 화면에서 처리한다.
 *
 * 왜 DB 가 아니라 파일인가
 *   이 목록은 «검수 루틴»이 쓴다. 루틴은 사장님 컴퓨터에서 도는 스크립트라
 *   DB 접속 정보도 세션도 없다. 파일이면 그냥 쓰면 된다.
 *   화면은 서버에서 이 파일을 읽어 보여 주고, 누르면 다시 쓴다.
 *
 * 흐름 (2026-08-19 사장님이 정하심)
 *   ① 검수 루틴 — 근거가 없어 못 고치면 여기 한 칸 더한다 (상태: 기다림)
 *   ② 사장님   — 화면에서 보고, 다른 채팅에서 고친 뒤 「수정완료」 또는 「패스」를 누른다
 *   ③ 다음 루틴 — **「수정완료」인 것을 검수 항목에 넣어 «제대로 고쳐졌는지» 본다.**
 *                 검수 항목에 넣었으면 그 칸은 지운다
 *
 *   ⭐ 루틴은 사장님 답을 «기다렸다 고치는» 것이 아니다.
 *     사장님이 이미 고치셨고, 루틴은 그것을 **검수**한다.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

export type 판단상태 = "기다림" | "수정완료" | "패스";

export interface 판단건 {
  /** 루틴이 만든 고유 이름 — `2026-08-19_뷰티샵_프리미엄_필터칩` 처럼 */
  id: string;
  /** 언제 올라왔나 (ISO) */
  올린때: string;
  /** 어느 루틴이 */
  루틴: string;
  /** 어느 팩 — 여러 칸이면 쉼표로 */
  팩: string;
  /** 한 줄 제목 */
  제목: string;
  /** 무엇이 문제인가 */
  무엇: string;
  /** 왜 루틴이 못 고쳤나 */
  왜못고쳤나: string;
  /** 사장님께 여쭙는 것 — 무엇을 정해 주셔야 하나 */
  여쭙는것: string;
  /** 근거 파일 */
  근거파일?: string;
  상태: 판단상태;
  /** 사장님이 처리한 때 */
  처리때?: string;
  /** 사장님이 남긴 메모 (없어도 된다) */
  메모?: string;
}

export interface 판단목록 {
  갱신: string;
  건: 판단건[];
}

/** 저장 자리 — 루틴도 같은 경로를 쓴다. */
export const 판단파일 = join(process.cwd(), "검수", "판단대기.json");

const 빈목록 = (): 판단목록 => ({ 갱신: new Date().toISOString(), 건: [] });

export async function 판단읽기(): Promise<판단목록> {
  try {
    const s = await readFile(판단파일, "utf8");
    const j = JSON.parse(s) as 판단목록;
    if (!j || !Array.isArray(j.건)) return 빈목록();
    return j;
  } catch {
    /* 파일이 없으면 «아직 올라온 것이 없다»는 뜻이다. 오류가 아니다. */
    return 빈목록();
  }
}

export async function 판단쓰기(목록: 판단목록): Promise<void> {
  목록.갱신 = new Date().toISOString();
  await mkdir(dirname(판단파일), { recursive: true });
  await writeFile(판단파일, JSON.stringify(목록, null, 2) + "\n", "utf8");
}

/** 한 건의 상태를 바꾼다. 없는 id 면 아무 일도 안 한다. */
export async function 상태바꾸기(id: string, 상태: 판단상태, 메모?: string): Promise<판단목록> {
  const 목록 = await 판단읽기();
  const 것 = 목록.건.find((x) => x.id === id);
  if (것) {
    것.상태 = 상태;
    것.처리때 = new Date().toISOString();
    if (메모 !== undefined) 것.메모 = 메모 || undefined;
  }
  await 판단쓰기(목록);
  return 목록;
}

/** 화면에서 보기 좋게 — 기다리는 것 먼저, 그다음 최근 처리한 것. */
export function 차례대로(건: 판단건[]): 판단건[] {
  const 값 = (s: 판단상태) => (s === "기다림" ? 0 : 1);
  return [...건].sort((a, b) => {
    const d = 값(a.상태) - 값(b.상태);
    if (d !== 0) return d;
    return (b.처리때 ?? b.올린때).localeCompare(a.처리때 ?? a.올린때);
  });
}

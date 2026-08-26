/* 녹화본에서 «어느 초가 움직이나» 를 재서, 대본의 ss 값에 더 나은 이웃을 알려준다.
 *
 *   npx tsx "판매용_템플릿/_마케팅/_작업/움직임표.mts" <대본.json>
 *
 * 왜 (2026-08-17 사장님 지시)
 *   「컷편집을 너무 뚝뚝 끊어지게 하는데… 화면을 속도감있게 돌리면서」
 *
 *   기준(`여행_컷편집_마스터.mp4`)은 브라우저를 계속 스크롤하며 녹화한 것이라
 *   움직이는 프레임이 67% 다. 우리는 43% 였다 — 자막에 맞는 초를 찾다 보니
 *   «사장님이 스크롤을 멈추고 보고 있는 순간»을 집게 된다.
 *
 *   `영상굽기.mjs` 가 컷 안에서 화면을 흘려 주긴 하지만(세로만), 녹화본 자체가
 *   움직이는 초를 쓰면 훨씬 낫다. 그래서 «고른 초 ±4초» 를 재서 더 움직이는 쪽을 알려준다.
 *
 * ⚠ 초를 옮기면 «그 초에 무엇이 떠 있는지»가 달라진다. 이 표가 시키는 대로 바꾸지 말고,
 *   옮긴 초의 프레임을 반드시 다시 보고 자막과 맞는지 확인한다. 그게 더 중요한 규칙이다.
 */
import { readFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const 여기 = dirname(fileURLToPath(import.meta.url));
const 릴스방 = resolve(여기, "../릴스영상");

const 대본길 = process.argv[2];
if (!대본길) {
  console.error("쓰는 법: npx tsx 움직임표.mts <대본.json>");
  process.exit(2);
}

/** 그 초에서 «1초 동안» 화면이 얼마나 바뀌나 (0~100). 잿빛으로 줄여 프레임끼리 견준다. */
const 잰것 = new Map<string, number>();
function 움직임(길: string, ss: number, 임시: string): number {
  const 키 = `${길}@${ss}`;
  if (잰것.has(키)) return 잰것.get(키)!;
  const w = 160, h = 90;
  const buf = execFileSync(
    "ffmpeg",
    ["-v", "error", "-ss", String(ss), "-t", "1", "-i", 길, "-r", "6",
      "-vf", `scale=${w}:${h}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"],
    { maxBuffer: 1 << 26 },
  );
  const 장 = w * h;
  const 수 = Math.floor(buf.length / 장);
  let 합 = 0, 셈 = 0;
  for (let f = 1; f < 수; f += 1) {
    let 차 = 0;
    for (let i = 0; i < 장; i += 7) 차 += Math.abs(buf[f * 장 + i] - buf[(f - 1) * 장 + i]);
    합 += 차 / Math.ceil(장 / 7);
    셈 += 1;
  }
  const 값 = 셈 ? +(합 / 셈).toFixed(1) : 0;
  잰것.set(키, 값);
  return 값;
}

const 대본들 = JSON.parse(readFileSync(대본길, "utf8"));
const 임시 = mkdtempSync(join(tmpdir(), "cc-move-"));
try {
  for (const 편 of 대본들) {
    console.log(`\n== ${편.이름}`);
    console.log("칸  고른초  움직임   ±4초 안에서 제일 움직이는 초");
    let 낮은칸 = 0;
    (편.칸들 ?? []).forEach((k: { shots?: { clip?: string; ss?: number }[] }, i: number) => {
      const s = (k.shots ?? [])[0];
      if (!s?.clip) return;
      const 길 = join(릴스방, s.clip);
      if (!existsSync(길)) return;
      const 고른 = s.ss ?? 0;
      const 지금 = 움직임(길, 고른, 임시);
      let 최고 = { ss: 고른, v: 지금 };
      for (const d of [-4, -3, -2, -1, 1, 2, 3, 4]) {
        const t = 고른 + d;
        if (t < 0) continue;
        const v = 움직임(길, t, 임시);
        if (v > 최고.v) 최고 = { ss: t, v };
      }
      const 낮나 = 지금 < 1.5;
      if (낮나) 낮은칸 += 1;
      const 추천 = 최고.ss === 고른 ? "— (여기가 제일 낫다)" : `${최고.ss}초 (${최고.v})`;
      console.log(
        `${String(i + 1).padStart(2)}  ${String(고른).padStart(5)}  ${String(지금).padStart(6)}${낮나 ? " ⚠" : "  "}  ${추천}`,
      );
    });
    console.log(
      `\n«거의 안 움직이는» 칸 ${낮은칸}개. 굽는 쪽이 컷 안에서 흘려 주니 이대로도 돌아가지만,\n` +
      "옮길 수 있는 칸은 옮기는 쪽이 낫다. ⚠ 옮긴 뒤에는 그 초 프레임을 다시 보고 자막과 맞는지 확인한다.",
    );
  }
} finally {
  rmSync(임시, { recursive: true, force: true });
}
process.exit(0);

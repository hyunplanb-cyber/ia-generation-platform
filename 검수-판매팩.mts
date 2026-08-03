// 판매팩 16칸을 한 번에 훑어 "이대로 팔 수 있나"를 본다.
//
// 눈으로 열어 보는 건 16칸 × 문서 10개라 끝이 없다. 기계가 볼 수 있는 것부터
// 전부 세어 놓고, 사람은 걸린 것만 확인한다.
//
// 쓰는 법: npx tsx 검수-판매팩.mts
import { readFileSync, readdirSync, existsSync } from "node:fs";
import * as XLSX from "xlsx";

const OUT = "판매용_템플릿/_배포/00_판매팩";

interface Finding {
  pack: string;
  level: "막음" | "고칠 것" | "참고";
  what: string;
}
const found: Finding[] = [];
const add = (pack: string, level: Finding["level"], what: string) =>
  found.push({ pack, level, what });

// 손님이 쓰는 메뉴인지 운영자가 쓰는 메뉴인지 이름으로 가른다.
const ADMIN = /(관리|운영|정산|대시보드|통계|승인|어드민|백오피스|판매자|입점|셀러|강사|총대|매장 운영)/;

function checkPack(dir: string) {
  const base = `${OUT}/${dir}`;
  const specPath = `${base}/07_AI빌드_스펙팩.json`;
  if (!existsSync(specPath)) {
    add(dir, "막음", "스펙팩(07)이 없습니다");
    return;
  }
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  const screens = spec.screens ?? [];
  const menus = spec.menus ?? [];

  // ── 1. 손님/운영자 메뉴가 섞여 있나 ───────────────────────────
  //
  // 스펙팩이 영역을 나눠 두었으면(navByAudience) 그걸 믿는다. 없으면 메뉴 이름으로
  // 짐작한다 — 아직 손대지 않은 팩을 찾아내기 위한 그물이다.
  const nav = spec.common?.navByAudience;
  if (nav) {
    if (!nav.owner?.length) {
      // 운영자 화면이 정말 없는 서비스(순수 B2C)면 정상이다.
      const guess = menus.filter((m: { nameKo: string }) => ADMIN.test(m.nameKo));
      if (guess.length) add(dir, "고칠 것", `운영자 메뉴로 보이는데 영역이 안 나뉨: ${guess.map((m: { nameKo: string }) => m.nameKo).join("·")}`);
    }
  } else {
    const adminMenus = menus.filter((m: { nameKo: string }) => ADMIN.test(m.nameKo));
    if (adminMenus.length > 0 && adminMenus.length < menus.length) {
      add(
        dir,
        "막음",
        `한 GNB에 손님 메뉴 ${menus.length - adminMenus.length}개 + 운영자 메뉴 ${adminMenus.length}개가 섞임 ` +
          `(운영자: ${adminMenus.map((m: { nameKo: string }) => m.nameKo).join("·")})`,
      );
    }
  }

  // ── 1-2. 영역을 나눴다면 권한 전환 안내가 들어 있나 ───────────
  if (nav?.owner?.length) {
    const md0 = readFileSync(`${base}/07_AI빌드_스펙팩.md`, "utf8");
    if (!md0.includes("매장 관리자로 전환") && !md0.includes("전환")) {
      add(dir, "고칠 것", "영역은 나눴는데 권한 전환 안내가 없음");
    }
  }

  // ── 2. 회원가입·로그인이 있나 ────────────────────────────────
  const names = screens.map((s: { pageName: string }) => s.pageName).join(" ");
  if (!/회원가입|가입/.test(names)) add(dir, "막음", "회원가입 화면이 없습니다");
  if (!/로그인/.test(names)) add(dir, "막음", "로그인 화면이 없습니다");

  // ── 3. 프롬프트에 색이 박혀 있나 ─────────────────────────────
  const colored = screens.filter((s: { prompt?: string }) => /#[0-9A-Fa-f]{6}/.test(s.prompt ?? ""));
  if (colored.length) add(dir, "고칠 것", `프롬프트에 색상코드가 남음 ${colored.length}개`);

  // ── 4. 버튼 이동이 얼마나 정의됐나 ───────────────────────────
  const withBtn = screens.filter((s: { buttons?: unknown[] }) => (s.buttons?.length ?? 0) > 0).length;
  const ratio = screens.length ? Math.round((withBtn / screens.length) * 100) : 0;
  if (ratio < 50) {
    add(dir, "고칠 것", `화면 ${screens.length}개 중 ${withBtn}개(${ratio}%)에만 버튼 이동이 있음`);
  }

  // ── 5. 빌드 가이드에 오늘 정한 규칙이 들어 있나 ──────────────
  const md = readFileSync(`${base}/07_AI빌드_스펙팩.md`, "utf8");
  const rules: [string, string][] = [
    ["쓰는 사람이 다른 메뉴는 헤더를 나누세요", "헤더 분리 규칙"],
    ["화면 안에서 끝나는 조작은 진짜로 동작", "버튼 규칙"],
    ["비율을 실제로 지킨다", "이미지 비율 규칙"],
    ["프리셋 파일을 함께 넣었다면 그것이 우선", "프리셋 우선 규칙"],
  ];
  for (const [needle, label] of rules) {
    if (!md.includes(needle)) add(dir, "막음", `빌드 가이드에 ${label}이 없음`);
  }

  // ── 6. WBS가 주말에 걸치나 ───────────────────────────────────
  const wbs = sheet(`${base}/04_WBS.xlsx`);
  const weekend = wbs.filter((r) =>
    [r["시작일"], r["종료일"]].some((x) => {
      const d = new Date(String(x) + "T00:00:00").getDay();
      return d === 0 || d === 6;
    }),
  );
  if (weekend.length) add(dir, "고칠 것", `WBS가 주말에 걸침 ${weekend.length}건`);

  // ── 7. 기능정의서 「기타」 비율 ──────────────────────────────
  const req = sheet(`${base}/03_기능정의서.xlsx`);
  const etc = req.filter((r) => r["유형"] === "기타").length;
  const etcPct = req.length ? Math.round((etc / req.length) * 100) : 0;
  if (etcPct > 15) add(dir, "참고", `기능정의서 「기타」 ${etcPct}% (${etc}/${req.length})`);

  // ── 8. 검수 시나리오 ────────────────────────────────────────
  const vPath = `${base}/08_검수시나리오.xlsx`;
  const isPaidTier = /디럭스|프리미엄/.test(dir);
  if (isPaidTier) {
    if (!existsSync(vPath)) add(dir, "막음", "디럭스·프리미엄인데 검수 시나리오가 없음");
    else {
      const v = sheet(vPath, "검수 시나리오");
      if (!("기대 결과" in (v[0] ?? {}))) add(dir, "고칠 것", "검수 시나리오에 '기대 결과' 열이 없음");
      const broken = v.filter((r) => {
        const t = String(r["확인 항목"] ?? "");
        return (t.match(/\(/g) || []).length !== (t.match(/\)/g) || []).length;
      });
      if (broken.length) add(dir, "고칠 것", `검수 항목이 문장 중간에서 잘림 ${broken.length}건`);
    }
  } else if (existsSync(vPath)) {
    add(dir, "고칠 것", "스탠다드·플러스인데 검수 시나리오가 들어 있음");
  }

  // ── 9. 프리셋 ───────────────────────────────────────────────
  const pDir = `${base}/디자인프리셋`;
  const pCount = existsSync(pDir) ? readdirSync(pDir).length : 0;
  if (pCount < 11) add(dir, "막음", `디자인프리셋이 ${pCount}개 (11개여야 함)`);

  // ── 10. 완성화면 ────────────────────────────────────────────
  const sDir = `${base}/완성화면`;
  if (isPaidTier && !existsSync(sDir)) add(dir, "참고", "완성 화면(HTML)이 아직 없음");
  if (existsSync(sDir)) {
    const html = readdirSync(`${sDir}/pages`).filter((f) => f.endsWith(".html")).length;
    if (html !== screens.length) add(dir, "막음", `완성 화면 ${html}개 ≠ 설계 ${screens.length}개`);
  }
}

function sheet(path: string, name?: string): Record<string, unknown>[] {
  if (!existsSync(path)) return [];
  const wb = XLSX.read(readFileSync(path));
  return XLSX.utils.sheet_to_json(wb.Sheets[name ?? wb.SheetNames[0]], { defval: "" });
}

const packs = readdirSync(OUT).filter((d) => existsSync(`${OUT}/${d}/07_AI빌드_스펙팩.md`));
for (const d of packs) checkPack(d);

console.log(`판매팩 ${packs.length}칸 검수\n`);
for (const level of ["막음", "고칠 것", "참고"] as const) {
  const rows = found.filter((f) => f.level === level);
  if (!rows.length) continue;
  console.log(`\n【${level}】 ${rows.length}건`);
  const byPack: Record<string, string[]> = {};
  for (const r of rows) (byPack[r.pack] ||= []).push(r.what);
  for (const [pack, whats] of Object.entries(byPack)) {
    console.log(`  ${pack}`);
    for (const w of whats) console.log(`     · ${w}`);
  }
}
const blocking = found.filter((f) => f.level === "막음").length;
console.log(`\n${blocking === 0 ? "팔 수 있습니다." : `팔 수 없습니다 — 막는 문제 ${blocking}건.`}`);

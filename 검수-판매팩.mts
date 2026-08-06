// 판매팩 16칸을 한 번에 훑어 "이대로 팔 수 있나"를 본다.
//
// 눈으로 열어 보는 건 16칸 × 문서 10개라 끝이 없다. 기계가 볼 수 있는 것부터
// 전부 세어 놓고, 사람은 걸린 것만 확인한다.
//
// 쓰는 법: npx tsx 검수-판매팩.mts
import { readFileSync, readdirSync, existsSync } from "node:fs";
import * as XLSX from "xlsx";

const OUT = "판매용_템플릿/_판매팩";

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

  // ── 4-2. 뒤로가기가 화면마다 정해져 있나 ─────────────────────
  //
  // 글로만 적었을 때는 만들어진 사이트에서 하나도 안 붙었다. 화면 스펙에 목적지를
  // 박아 두는 것이 유일하게 통하는 방법이라, 그게 들어 있는지 본다(2026-08-04).
  const withBack = screens.filter((s: { backTo?: unknown }) => s.backTo).length;
  const topScreens = (nav ? menus.length : menus.length) || 1;
  if (withBack === 0) {
    add(dir, "막음", "화면 스펙에 뒤로가기 목적지가 하나도 없음");
  } else {
    // 탭은 형제라 뒤로가기가 없는 게 맞다 — 메뉴 첫 화면과 함께 셈에서 뺀다.
    const noBack = screens.filter(
      (s: { pageName: string; backTo?: unknown }) => !s.backTo && !/탭$/.test(s.pageName.trim()),
    ).length;
    if (noBack > topScreens) {
      add(dir, "고칠 것", `뒤로가기가 없는 화면이 ${noBack}개 (메뉴 첫 화면 ${topScreens}개보다 많음)`);
    }
  }

  // 탭은 같은 계위다. 기본 탭을 뒤로가기 목적지로 삼으면 탭을 오가는 데 뒤로가기가 끼어들고,
  // 기본 탭에만 뒤로가기가 없어서 같은 줄에 있는 화면인데 있다 없다 한다(2026-08-06).
  const tabParent = screens.filter((s: { pageName: string; backTo?: { pageName: string } }) => {
    if (!s.backTo || !/탭$/.test(s.pageName.trim())) return false;
    const cut = s.pageName.lastIndexOf(" > ");
    return cut > 0 && s.backTo.pageName === s.pageName.slice(0, cut);
  });
  if (tabParent.length) {
    add(dir, "고칠 것", `탭 화면 ${tabParent.length}개가 형제인 기본 탭을 뒤로가기 목적지로 삼음 — 탭은 같은 계위입니다`);
  }

  // ── 4-3. "만들고 나서 눌러 보라"는 안내가 들어 있나 ──────────
  //
  // 우리가 만든 스펙팩으로 우리가 화면을 만들었는데도 매번 고칠 것이 나왔다.
  // 그걸 안 적으면 사는 사람은 안 눌러 보고 이상한 채로 오픈한다(2026-08-06).
  // 검수시나리오가 없는 스탠다드·플러스에서는 화면목록이 유일한 자리다.
  const iaPath = `${base}/02_IA_화면목록.xlsx`;
  if (existsSync(iaPath)) {
    const names = XLSX.read(readFileSync(iaPath)).SheetNames;
    if (!names.includes("먼저 읽어 주세요")) {
      add(dir, "고칠 것", "화면목록에 '만들고 나서 눌러 보라'는 안내 시트가 없음");
    }
  }

  // ── 5. 빌드 가이드에 오늘 정한 규칙이 들어 있나 ──────────────
  const md = readFileSync(`${base}/07_AI빌드_스펙팩.md`, "utf8");
  const rules: [string, string][] = [
    ["쓰는 사람이 다른 메뉴는 헤더를 나누세요", "헤더 분리 규칙"],
    ["화면 안에서 끝나는 조작은 진짜로 동작", "버튼 규칙"],
    ["비율을 실제로 지킨다", "이미지 비율 규칙"],
    ["프리셋 파일을 함께 넣었다면 그것이 우선", "프리셋 우선 규칙"],
    ["뒤로가기는 화면마다 정해져 있습니다", "뒤로가기 규칙"],
    ["토스트로 때우지 마세요", "안내로 때우지 말 것"],
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

  // ── 9-2. 프리셋에 간격 눈금이 실려 있나 ─────────────────────
  //
  // 간격을 "4px 배수" 한 줄로만 적어 뒀더니, 만드는 사람이 자리마다 값을
  // 그때그때 골랐다. 자리별 값이 문서에 있어야 눈금 밖의 값을 안 쓴다(2026-08-05).
  const guide = existsSync(pDir)
    ? readdirSync(pDir).find((f) => f.startsWith("가이드_01") && f.endsWith(".md"))
    : undefined;
  if (guide) {
    const g = readFileSync(`${pDir}/${guide}`, "utf8");
    if (!g.includes("간격 눈금")) add(dir, "고칠 것", "가이드 프리셋에 간격 눈금 표가 없음");
  }

  // ── 10. 완성화면 ────────────────────────────────────────────
  const sDir = `${base}/완성화면`;
  if (isPaidTier && !existsSync(sDir)) add(dir, "참고", "완성 화면(HTML)이 아직 없음");
  if (existsSync(sDir)) {
    const pageFiles = readdirSync(`${sDir}/pages`).filter((f) => f.endsWith(".html"));
    const html = pageFiles.length;
    if (html !== screens.length) add(dir, "막음", `완성 화면 ${html}개 ≠ 설계 ${screens.length}개`);
    const htmls = pageFiles.map((f) => readFileSync(`${sDir}/pages/${f}`, "utf8"));

    // 정의하지 않은 CSS 변수를 쓰면 브라우저가 그 속성을 통째로 버린다. 조용히.
    // --s7 하나 때문에 히어로 버튼 위 간격이 0이 됐는데 눈으로만 찾을 수 있었다.
    // 이건 세면 나온다(2026-08-05).
    const cssPath = `${sDir}/assets/css/base.css`;
    if (existsSync(cssPath)) {
      const css = readFileSync(cssPath, "utf8");
      const defined = new Set([...css.matchAll(/--([a-z0-9-]+)\s*:/g)].map((m) => m[1]));
      const used = new Set([...css.matchAll(/var\(\s*--([a-z0-9-]+)/g)].map((m) => m[1]));
      const missing = [...used].filter((u) => !defined.has(u));
      if (missing.length) {
        add(dir, "막음", `정의하지 않은 CSS 값을 씀 ${missing.length}개 (${missing.join(", ")}) — 그 속성이 통째로 무시됩니다`);
      }

      // 폭 꽉 찬 버튼을 위아래로 쌓을 때, 감싸는 상자에만 간격을 걸어 두면
      // 감싸는 걸 잊는 순간 0이 되어 버튼끼리 달라붙는다. 버튼 자신에게도 걸어야 한다(2026-08-06).
      if (/\.btn-block\s*\{/.test(css) && !/\.btn-block\s*\+\s*\.btn-block/.test(css)) {
        add(dir, "고칠 것", "세로로 쌓은 버튼에 간격 규칙이 없음 — .btns 로 감싸는 걸 잊으면 버튼끼리 달라붙습니다");
      }

      // 목록 카드는 눌러서 상세로 가야 한다. div 로 두면 눌러도 아무 일이 없다(2026-08-06).
      // `.card` 는 일반 상자라 빼야 한다 — 목록 한 칸을 뜻하는 이름만 본다.
      const deadCards = [...css.matchAll(/\.(scard|deal|pro-card|course-card|list-card)\s*\{/g)].map((m) => m[1]);
      for (const cls of new Set(deadCards)) {
        // 불러오는 중 자리(스켈레톤)는 링크가 없는 게 맞다 — 셈에서 뺀다.
        const asDiv = htmls.some((h) =>
          // 템플릿 문자열 안이라 \s 는 한 번 더 감싸야 정규식까지 살아 온다.
          [...h.matchAll(new RegExp(`<div class="${cls}"[^>]*>([\\s\\S]{0,220})`, "g"))]
            .some((m) => !m[1].includes('class="sk')),
        );
        if (asDiv) add(dir, "고칠 것", `목록 카드(.${cls})가 링크가 아님 — 눌러도 아무 일이 없습니다`);
      }

      // 링크 안에 링크를 넣으면 브라우저가 바깥 링크를 그 자리에서 닫는다.
      // 그러면 뒤에 오던 가격·버튼이 행 밖으로 튀어나가는데, 눈으로는
      // "왜 줄이 깨졌지"로만 보여 원인을 못 찾는다(2026-08-06).
      let nested = 0;
      for (const h of htmls) {
        for (const m of h.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
          if (/<a\b/.test(m[1])) nested++;
        }
      }
      if (nested) {
        add(dir, "막음", `링크 안에 링크가 든 곳 ${nested}개 — 브라우저가 바깥 링크를 끊어 줄이 깨집니다`);
      }

      // 콘텐츠 영역은 한 사이트에 하나여야 한다. 헤더는 1200 인데 본문만 1440 이라
      // 위아래가 120px 어긋난 사이트가 있었다 — 폭이 여럿이면 반드시 갈라진다(2026-08-06).
      const widths = new Set(
        [...css.matchAll(/max-width:\s*(\d{4})px/g)].map((m) => m[1]).filter((w) => +w >= 1000),
      );
      if (widths.size > 1) {
        add(dir, "고칠 것", `콘텐츠 영역 폭이 ${widths.size}가지 (${[...widths].join("px, ")}px) — 헤더와 본문이 어긋납니다`);
      }

      // 큰 제목이 두 줄로 넘어가면 윗줄과 아랫줄이 부딪힌다. 밑줄·형광펜을 얹었으면 더 그렇다.
      const tight = [...css.matchAll(/([^{}]*h1[^{}]*)\{([^}]*)\}/g)]
        .filter(([, sel, body]) => {
          const lh = /line-height:\s*([\d.]+)\s*[;}]/.exec(body);
          const size = /font-size:\s*(?:clamp\([^)]*?,\s*)?(\d+)px/.exec(body);
          return lh && +lh[1] < 1.2 && (!size || +size[1] >= 30) && !sel.includes("--");
        })
        .map(([, sel]) => sel.trim().slice(0, 30));
      if (tight.length) {
        add(dir, "고칠 것", `큰 제목 줄 간격이 1.2보다 좁음 (${tight.join(", ")}) — 두 줄로 넘어가면 글줄이 부딪힙니다`);
      }
    }
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

// 판매팩 16칸을 한 번에 훑어 "이대로 팔 수 있나"를 본다.
//
// 눈으로 열어 보는 건 16칸 × 문서 10개라 끝이 없다. 기계가 볼 수 있는 것부터
// 전부 세어 놓고, 사람은 걸린 것만 확인한다.
//
// 쓰는 법: npx tsx 검수-판매팩.mts
import { readFileSync, readdirSync, existsSync } from "node:fs";
import * as XLSX from "xlsx";
import {
  COMMON_RULES, DESIGN_OPTIONS, PRIMARY_SWATCHES_BY_STYLE, FONT_FEELS,
  DENSITIES, LAYOUTS, buildDetailedPresetMarkdown,
} from "./lib/design-presets";

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

  // ── 4-1. 화면 안에서 끝나는 동작이 적혀 있나 ─────────────────
  //
  // 버튼에 적을 수 있는 것이 "어느 화면으로 가는가" 하나뿐이던 동안,
  // 만들어진 사이트는 눌러도 값이 안 바뀌는 포스터가 됐다.
  // 우리가 안 시킨 것을 AI 가 알아서 해 주지는 않는다.
  // 그래서 이동만 세지 않고 화면 안 동작도 함께 센다(2026-08-06).
  const withAct = screens.filter((s: { acts?: unknown[] }) => (s.acts?.length ?? 0) > 0).length;
  const actPct = screens.length ? Math.round((withAct / screens.length) * 100) : 0;
  if (actPct < 50) {
    add(
      dir,
      "고칠 것",
      `화면 ${screens.length}개 중 ${withAct}개(${actPct}%)에만 「눌렀을 때」가 적혀 있음 — 화면 안에서 끝나는 조작을 적어 주세요`,
    );
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

  // 공용 규칙은 디자인 프리셋에도 있지만, 프리셋은 "색 고르는 파일"로 보여서
  // 이 스펙팩만 AI에게 건네는 사람이 있다. 게다가 버튼·LNB·견본 규칙은
  // 색이 아니라 동작이라 원래 여기가 제자리다(2026-08-06).
  const specMissing = COMMON_RULES.filter((r) => r.startsWith("### "))
    .map((r) => r.slice(4))
    .filter((h) => !md.includes(h));
  if (specMissing.length) {
    add(dir, "막음", `스펙팩 빌드 가이드에 공용 규칙이 빠짐: ${specMissing.map((m) => m.split(" —")[0]).join(", ")}`);
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

    // 파는 팩과 유저가 받는 팩이 각자 문서를 만들다가, 규칙 열 가지가 파는 쪽에만
    // 실린 적이 있다. 유저 문서는 오히려 반대로 말하고 있었다.
    // 두 벌로 적으면 반드시 갈라지므로, 공용 규칙이 통째로 들어 있는지 센다(2026-08-06).
    const missing = COMMON_RULES.filter((r) => r.startsWith("### ")).filter((h) => !g.includes(h));
    if (missing.length) {
      add(dir, "막음", `가이드 프리셋에 공용 규칙이 빠짐: ${missing.map((m) => m.replace(/^###\s*/, "").split(" —")[0]).join(", ")}`);
    }
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

      // 필터 적용·정렬·다음 차시처럼 화면 안에서 끝나는 조작을 링크로 만들면
      // 자기 자신으로 가는 링크가 된다. 눌러도 같은 화면이 다시 열려서
      // "눌렀는데 아무 일도 안 나네"로 보인다. 이 화면 안에서 끝나면 버튼이다(2026-08-06).
      let selfLinks = 0;
      for (const f of pageFiles) {
        const id = f.replace(/\.html$/, "");
        const h = readFileSync(`${sDir}/pages/${f}`, "utf8");
        selfLinks += [...h.matchAll(new RegExp(`<a class="btn [^"]*" href="${id}\\.html"`, "g"))].length;
      }
      if (selfLinks) {
        add(dir, "고칠 것", `자기 자신으로 가는 버튼 ${selfLinks}개 — 눌러도 같은 화면이 다시 열립니다. 화면 안에서 끝나는 조작은 버튼으로 두세요`);
      }

      // 박스형 콘텐츠는 한 단락에 하나만 두지 않는다. 마지막 줄도 마찬가지다.
      //
      // 규칙은 문서에 있었는데 검수가 못 봤다. 카드 이름(.mcard·.scard…)을 적어
      // 두고 셌더니, 그 이름이 아닌 상자로 채운 격자 162개가 "0개"로 잡혔다.
      // 이름을 세지 말고 격자의 바로 아래 자식을 세야 한다.
      // 격자가 아닌 가로 배너 한 장도 같은 이유로 그냥 지나갔다(2026-08-06).
      const colsOf = (cls: string) => {
        const m = /\b(?:mag|g|gal)-(\d)\b/.exec(cls);
        if (m) return +m[1];
        if (/\bg([234])\b/.test(cls)) return +/\bg([234])\b/.exec(cls)![1];
        if (/\bmag\b/.test(cls)) return 3;
        return 0;
      };
      // 격자를 열고 태그 깊이를 세며 제 짝을 찾는다 — 깊이 0인 것만 자식이다.
      const gridsIn = (h: string) => {
        const out: { cls: string; kids: number }[] = [];
        const open = /<div class="(?:mag|g2|g3|g4)[^"]*">/g;
        let m: RegExpExecArray | null;
        while ((m = open.exec(h))) {
          let depth = 0, kids = 0;
          const tag = /<(\/?)(div|a|section)\b[^>]*?(\/?)>/g;
          tag.lastIndex = m.index + m[0].length;
          let t: RegExpExecArray | null;
          while ((t = tag.exec(h))) {
            if (t[3] === "/") { if (depth === 0) kids++; continue; }
            if (t[1] === "/") { if (depth === 0) break; depth--; }
            else { if (depth === 0) kids++; depth++; }
          }
          out.push({ cls: /class="([^"]*)"/.exec(m[0])![1], kids });
        }
        return out;
      };
      let lonely = 0, straggler = 0;
      for (const h of htmls) {
        for (const g of gridsIn(h)) {
          if (g.kids === 1) { lonely++; continue; }
          const cols = colsOf(g.cls);
          if (cols && g.kids > 1 && g.kids % cols === 1) straggler++;
        }
        lonely += [...h.matchAll(/<a class="hero-banner"/g)].length;
      }
      if (lonely) {
        add(dir, "고칠 것", `한 단락에 박스형 콘텐츠가 하나뿐인 곳 ${lonely}곳 — 둘 이상으로 나누세요`);
      }
      if (straggler) {
        add(dir, "고칠 것", `마지막 줄에 카드가 하나만 남는 격자 ${straggler}곳 — 항목 수를 열 수에 맞추세요`);
      }

      // 가격은 낼 돈부터 읽힌다 — 판매가 · 정가 · 할인율 순서다.
      // 할인율을 앞에 두면 눈이 "20%"에 먼저 걸려 얼마인지를 뒤늦게 찾는다.
      // 할인율을 배지로 두면 정가·판매가와 무게가 비슷해져 셋이 서로 다툰다(2026-08-06).
      let priceOrder = 0, offBadge = 0;
      for (const h of htmls) {
        // 정가가 판매가보다 앞에 오면 순서가 뒤집힌 것
        for (const m of h.matchAll(/<span class="price-old"[^>]*>[\s\S]{0,80}?<\/span>\s*<span class="price(?:-lg)?"/g)) priceOrder++;
        // 할인율을 배지로 단 곳 — 숫자와 % 만 든 배지를 센다
        for (const m of h.matchAll(/<span class="badge b-acc">\s*\d{1,2}%/g)) offBadge++;
      }
      if (priceOrder) {
        add(dir, "고칠 것", `정가가 판매가보다 앞에 온 곳 ${priceOrder}곳 — 낼 돈부터 보여 주세요`);
      }
      if (offBadge) {
        add(dir, "고칠 것", `할인율을 배지로 단 곳 ${offBadge}곳 — 배지가 아니라 강조색 글자입니다`);
      }

      // 위 카테고리 줄과 왼쪽 LNB 가 같은 곳을 가리키면 같은 길이 두 번이다.
      // LNB 가 있는 화면은 접힌 채로 시작해야 하고, 없는 화면은 접으면 안 된다 —
      // 접으면 갈 길이 통째로 사라진다(2026-08-06).
      let dupNav = 0, deadNav = 0;
      for (const f of pageFiles) {
        const h = readFileSync(`${sDir}/pages/${f}`, "utf8");
        if (!/class="catbar/.test(h)) continue;
        const lnb = /<aside class="side\b/.test(h) || /<nav class="toc"/.test(h);
        const folded = /class="catbar is-folded"/.test(h);
        if (lnb && !folded) dupNav++;
        if (!lnb && folded) deadNav++;
      }
      if (dupNav) {
        add(dir, "고칠 것", `LNB 와 위 카테고리 줄이 함께 보이는 화면 ${dupNav}개 — 같은 길이 두 번입니다`);
      }
      if (deadNav) {
        add(dir, "막음", `LNB 가 없는데 카테고리 줄을 접은 화면 ${deadNav}개 — 갈 길이 사라집니다`);
      }

      // 사진 위에 글자를 얹는 혼합형은 어둠막이 없으면 밝은 사진에서 글자가 사라진다.
      // 사진은 사는 분이 바꿀 것이라 우리가 밝기를 미리 알 수 없다(2026-08-06).
      if (/\.ocard\s*\{/.test(css) && !/\.ocard::(after|before)/.test(css)) {
        add(dir, "막음", "사진 위에 글자를 얹는데 어둠막이 없음 — 밝은 사진이 오면 글자가 안 보입니다");
      }

      // 예외 화면을 보여주려고 넣은 안내 버튼·단락은 진짜 사이트에 없는 것이다.
      // 검색창 옆에 "결과가 없을 때"가 서 있으면 사는 분은 그게 기능인 줄 안다.
      // 빈 화면은 화면 목록에 따로 한 장으로 두면 된다(2026-08-06).
      const SAMPLE = /(결과가 없을 때|없을 때는 이렇게 보여요|비어 있을 때는 이렇게)/;
      const samples = htmls.reduce((n, h) => n + [...h.matchAll(new RegExp(SAMPLE, "g"))].length, 0);
      if (samples) {
        add(dir, "고칠 것", `견본 화면으로 가는 안내가 화면 안에 ${samples}곳 — 진짜 사이트에 없는 것입니다. 화면 목록에서 보게 하세요`);
      }

      // 카드를 늘어놓는 격자는 사이 간격이 하나여야 한다.
      // 재 보니 사이트마다 4~6가지였다(8·12·16·24·32·40px) — 눈금을 정해 놓고도
      // 격자마다 숫자를 직접 골랐다. 여백에서 겪은 "숫자 손잡이"가 gap 에도 있었다(2026-08-06).
      // 탭을 눌렀는데 화면이 아무것도 안 바뀌면, 사는 분 눈에는 포스터다.
      // data-go(다른 화면으로) 도 data-pane(내용 바꿔 끼기) 도 없는 탭을 센다.
      // "화면 안에서 끝나는 조작은 진짜로 동작한다"는 우리 스펙팩의 규칙인데
      // 정작 완성 화면이 안 지키고 있었다(2026-08-06).
      let deadTab = 0, tabTotal = 0;
      for (const h of htmls) {
        for (const m of h.matchAll(/<button class="tab[^"]*"[^>]*>/g)) {
          tabTotal++;
          if (!/data-go|data-pane/.test(m[0])) deadTab++;
        }
      }
      if (deadTab) {
        add(dir, "고칠 것", `눌러도 아무 일이 없는 탭 ${deadTab}개 (전체 ${tabTotal}개) — 내용을 바꿔 끼거나 화면으로 보내세요`);
      }

      // 콘텐츠 영역을 잡는 상자는 좌우 패딩이 하나여야 한다.
      // 뒤로가기 줄만 20px 이라 위아래 줄과 4px 어긋나 있었다 —
      // 눈에는 "살짝 튀어나온" 정도로만 보여서 못 찾는다(2026-08-06).
      // padding 은 값 개수에 따라 좌우가 어느 자리인지 달라진다.
      // 1개면 그 값, 2·3·4개면 두 번째가 좌우다. 첫 값만 보면 세로를 좌우로 잘못 센다.
      const padVars = new Set<string>();
      for (const m of css.matchAll(/max-width:\s*var\(--wrap\)[^}]*?padding:\s*([^;}]+)/g)) {
        const parts = m[1].trim().split(/\s+/);
        const x = parts.length === 1 ? parts[0] : parts[1];
        const v = /var\(--([a-z0-9-]+)\)/.exec(x);
        padVars.add(v ? v[1] : x);
      }
      if (padVars.size > 1) {
        add(dir, "고칠 것", `콘텐츠 영역 좌우 패딩이 ${padVars.size}가지 (--${[...padVars].join(", --")}) — 줄끼리 어긋납니다`);
      }

      // 격자는 사진을 늘어놓는 부품이지 단락을 감싸는 부품이 아니다.
      // 사진 3장 격자(.detail-gal)를 바깥 섹션에 썼더니 안의 .wrap 이 첫 칸에 갇혀
      // 콘텐츠 영역의 절반 폭으로 나왔다(2026-08-06).
      const gridClasses = [...css.matchAll(/(^|\n)\.([a-z][a-z0-9-]*)\s*\{[^}]*grid-template-columns/g)]
        .map((m) => m[2]);
      let boxedWrap = 0;
      for (const h of htmls) {
        for (const g of gridClasses) {
          for (const m of h.matchAll(new RegExp(`<section class="[^"]*\\b${g}\\b[^"]*">\\s*<div class="wrap`, "g"))) boxedWrap++;
        }
      }
      if (boxedWrap) {
        add(dir, "고칠 것", `격자로 콘텐츠 영역을 감싼 곳 ${boxedWrap}곳 — 안의 내용이 첫 칸에 갇혀 폭이 줄어듭니다`);
      }

      // 자리를 빠져나가도록 만든 부품(position:absolute)의 이름을 줄 안의 버튼에
      // 붙이면, 그 버튼이 줄을 빠져나가 엉뚱한 데 앉는다. 찜 버튼이 가격 위에
      // 겹쳐 앉은 적이 있다. 세 번 나온 병이라 센다(2026-08-06).
      const floating = [...css.matchAll(/(^|\n)\.([a-z][a-z0-9-]*)\s*\{[^}]*position:\s*absolute/g)]
        .map((m) => m[2]);
      const clash = new Set<string>();
      for (const h of htmls) {
        for (const m of h.matchAll(/class="([^"]*\bbtn\b[^"]*)"/g)) {
          for (const f of floating) if (new RegExp(`\\b${f}\\b`).test(m[1])) clash.add(f);
        }
      }
      if (clash.size) {
        add(dir, "고칠 것", `떠 있는 부품 이름을 줄 안 버튼에 붙인 곳 (.${[...clash].join(", .")}) — 버튼이 줄을 빠져나갑니다`);
      }

      // overflow-x:auto 를 주면 세로축이 visible 로 못 남고 auto 가 된다.
      // 안의 것이 1px만 넘쳐도 빈 세로 스크롤바가 하나 서서, 쓸데없는
      // 하늘색 막대가 붙어 있는 것처럼 보인다. 세로를 명시하지 않은 곳을 센다(2026-08-06).
      const strips = [...css.matchAll(/(^|\n)([^{}\n]+)\{([^}]*overflow-x:\s*(?:auto|scroll)[^}]*)\}/g)]
        .filter((m) => !/overflow-y:/.test(m[3]))
        .map((m) => m[2].trim().split(",")[0].trim());
      if (strips.length) {
        add(dir, "고칠 것", `가로 스크롤 상자에 세로축을 안 정한 곳 ${strips.length}곳 (${strips.slice(0, 4).join(", ")}) — 빈 세로 스크롤바가 섭니다`);
      }

      // 좌우와 위아래를 따로 센다. `column-gap:` 안에도 "gap:" 이 들어 있어서
      // 한 덩어리로 세면 가로만 잡히고 세로는 조용히 빠진다(2026-08-06).
      const CARD_GRID = /^\.(mag|gal|cats|g2|g3|g4|g5|g6|pro-g2|stair|carousel)\b/;
      const gapX = new Set<string>(), gapY = new Set<string>();
      for (const m of css.matchAll(/(^|\n)([^{}\n]+)\{([^}]*)\}/g)) {
        const first = m[2].trim().split(",")[0].trim();
        if (!CARD_GRID.test(first)) continue;
        for (const g of m[3].matchAll(/(^|[;\s])(column-|row-)?gap:\s*var\(--([a-z0-9-]+)\)/g)) {
          if (g[2] === "row-") gapY.add(g[3]);
          else gapX.add(g[3]);          // column-gap 과 gap 은 둘 다 좌우를 정한다
        }
      }
      if (gapX.size > 1) {
        add(dir, "고칠 것", `카드 격자 좌우 간격이 ${gapX.size}가지 (--${[...gapX].join(", --")}) — 한 값으로 모으세요`);
      }
      if (gapY.size > 1) {
        add(dir, "고칠 것", `카드 격자 위아래 간격이 ${gapY.size}가지 (--${[...gapY].join(", --")}) — 한 값으로 모으세요`);
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

/* 유저가 받는 문서도 같이 본다.
   파는 팩만 검수하는 동안, 유저가 받는 프리셋 문서에는 오늘 정한 규칙이
   하나도 안 실려 있었다. 오히려 "카드 = border 1px"라고 반대로 말했다.
   파는 것만 세면 파는 것만 맞는다(2026-08-06). */
{
  const heads = COMMON_RULES.filter((r) => r.startsWith("### "));
  for (const d of DESIGN_OPTIONS) {
    const md = buildDetailedPresetMarkdown(
      {
        style: d.key,
        primary: PRIMARY_SWATCHES_BY_STYLE[d.key][0],
        font: FONT_FEELS[0].key,
        radius: "normal",
        density: DENSITIES[1].key,
        dark: false,
        layout: LAYOUTS[0].key,
      },
      "검수",
    );
    const miss = heads.filter((h) => !md.includes(h));
    if (miss.length) {
      found.push({
        pack: `유저 프리셋 · ${d.title}`,
        level: "막음",
        what: `공용 규칙이 빠짐: ${miss.map((m) => m.slice(4).split(" —")[0]).join(", ")}`,
      });
    }
    // 공용 규칙과 정면으로 어긋나는 문장이 남아 있는지도 본다.
    if (/\| 카드 \| surface 배경, border 1px/.test(md) || /높이 44px/.test(md)) {
      found.push({
        pack: `유저 프리셋 · ${d.title}`,
        level: "막음",
        what: "공용 규칙과 반대로 적힌 문장이 있음 (사진 카드에 테두리 / 높이 44px 고정)",
      });
    }
  }
}

console.log(`판매팩 ${packs.length}칸 + 유저 프리셋 ${DESIGN_OPTIONS.length}종 검수\n`);
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

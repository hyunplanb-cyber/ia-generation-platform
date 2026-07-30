// 판매 데모 배포기.
//
// 프리미엄 스펙팩(144화면)을 Claude Code로 실제 구현한 결과물을 public/demo/에 올려
// "이렇게 나옵니다"를 말이 아니라 만져볼 수 있는 증거로 바꾼다.
//
// 반드시 지킬 것 — 원본 폴더에는 우리가 파는 산출물이 함께 들어 있다.
//   스펙팩/  … 07_AI빌드_스펙팩.json (유료 상품 본체)
//   build/   … 페이지 생성기. 전체 화면 데이터가 들어 있다
// 이 둘을 올리면 상품을 무료로 뿌리는 셈이라, 화이트리스트 방식으로만 복사한다.
//
// 사용법: npx tsx build-demo.mts
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC =
  "판매용_템플릿/_배포/판매_6종/여행_프리미엄/여행_프리미엄_사이트";
const DEST = "public/demo/travel";
/** 올릴 것만 명시한다. 여기 없는 건 절대 복사되지 않는다. */
const ALLOW = ["index.html", "pages", "assets"];

if (!existsSync(SRC)) throw new Error(`데모 원본이 없어요: ${SRC}`);

// 재실행 시 지난 파일이 남지 않도록 비우고 시작한다.
if (!DEST.endsWith("public/demo/travel")) throw new Error("삭제 경로 안전장치");
rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

for (const name of ALLOW) {
  const from = join(SRC, name);
  if (!existsSync(from)) throw new Error(`원본에 ${name}이(가) 없어요`);
  cpSync(from, join(DEST, name), { recursive: true });
}

// 데모임을 알리는 띠. 원본 사이트가 우측 하단에 화면ID 배지를 쓰므로 좌측 하단에 둔다.
const BANNER = `
<div id="cc-demo-note" style="position:fixed;left:16px;bottom:16px;z-index:2147483647;
  display:flex;align-items:center;gap:10px;max-width:calc(100vw - 32px);
  padding:10px 14px;border-radius:999px;background:#20261c;color:#ece1c7;
  font:500 13px/1.4 Pretendard,'Malgun Gothic',sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25)">
  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#e4762c;flex:none"></span>
  <span>카페인컬러 설계도로 <b>AI가 만든 데모</b>입니다. 실제 서비스가 아니에요.</span>
  <a href="/packages/travel?plan=premium" target="_blank" rel="noopener"
     style="flex:none;color:#20261c;background:#e4762c;text-decoration:none;font-weight:700;
            padding:5px 12px;border-radius:999px">설계도 보기</a>
</div>`;

const NOINDEX = `<meta name="robots" content="noindex,nofollow">`;

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith(".html") ? [p] : [];
  });
}

let patched = 0;
let scriptRefs = 0;
for (const f of htmlFiles(DEST)) {
  let html = readFileSync(f, "utf8");
  if (/<script\s[^>]*src=/.test(html)) scriptRefs += 1;
  // 검색 노출 차단 — 데모가 우리 판매 페이지보다 위에 뜨면 곤란하다.
  html = html.replace(/<meta charset="utf-8">/i, `<meta charset="utf-8">\n${NOINDEX}`);
  html = html.replace(/<\/body>/i, `${BANNER}\n</body>`);
  writeFileSync(f, html, "utf8");
  patched += 1;
}

const bytes = (function size(d: string): number {
  return readdirSync(d).reduce((n, e) => {
    const p = join(d, e);
    const st = statSync(p);
    return n + (st.isDirectory() ? size(p) : st.size);
  }, 0);
})(DEST);

console.log(`데모 배포 완료 → ${DEST}`);
console.log(`  HTML ${patched}개 (noindex + 데모 띠 삽입), 외부 스크립트 참조 ${scriptRefs}개`);
console.log(`  총 용량 ${(bytes / 1024 / 1024).toFixed(2)}MB`);
console.log(`  제외됨: 스펙팩/, build/, README.md (유료 산출물)`);

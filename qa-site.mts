// 판매 전 자체 점검 — 프리미엄에 넣는 완성 화면이 설계와 맞는지 확인한다.
//
// 고객에게 주는 검수 시나리오는 "고객이 자기 결과물을 확인하는 도구"다.
// 우리가 파는 화면은 그 전에 우리가 통과시켜 놔야 한다. FAIL이 있는 걸 팔 수는 없다.
//
//   npx tsx qa-site.mts
import { readFileSync, readdirSync, existsSync } from "node:fs";
import * as XLSX from "xlsx";

const SITE = "판매용_템플릿/_배포/판매_6종/여행_프리미엄/여행_프리미엄_사이트";
const IA = "판매용_템플릿/해외투어_티켓예약_상세IA/02_IA_화면목록.xlsx";

type Issue = { level: "FAIL" | "WARN"; where: string; what: string };
const issues: Issue[] = [];
const fail = (where: string, what: string) => issues.push({ level: "FAIL", where, what });
const warn = (where: string, what: string) => issues.push({ level: "WARN", where, what });

/* ── 1) 설계상 화면ID vs 실제 HTML ──────────────────────────── */
const wb = XLSX.read(readFileSync(IA));
const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], {
  defval: "",
});
// 화면ID로 보이는 칸을 찾는다 — 헤더 이름이 바뀌어도 값 모양으로 잡는다.
const idKey = Object.keys(rows[0] ?? {}).find((k) =>
  rows.slice(0, 30).some((r) => /^[A-Z]{2}\d{4}$/.test(String(r[k]).trim())),
);
if (!idKey) throw new Error("화면목록에서 화면ID 칸을 못 찾았어요");
const designIds = [
  ...new Set(
    rows.map((r) => String(r[idKey]).trim()).filter((v) => /^[A-Z]{2}\d{4}$/.test(v)),
  ),
];

const htmlFiles = readdirSync(`${SITE}/pages`).filter((f) => f.endsWith(".html"));
const builtIds = htmlFiles.map((f) => f.replace(/\.html$/, ""));

for (const id of designIds) if (!builtIds.includes(id)) fail(id, "설계에는 있는데 화면이 없음");
for (const id of builtIds) if (!designIds.includes(id)) warn(id, "화면은 있는데 설계 목록에 없음");

/* ── 2) 화면마다 — 내용, 링크, 스타일 ──────────────────────── */
const pageText = new Map<string, string>();
for (const f of htmlFiles) {
  const id = f.replace(/\.html$/, "");
  const html = readFileSync(`${SITE}/pages/${f}`, "utf8");

  // 껍데기만 있고 알맹이가 없는 화면
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
  const text = body.replace(/\s+/g, " ").trim();
  if (text.length < 200) fail(id, `내용이 거의 없음 (본문 ${text.length}자)`);
  pageText.set(id, text);

  // 한글이 깨진 화면
  if (/�/.test(html)) fail(id, "글자 깨짐(U+FFFD) 있음");

  // 제목
  if (!/<title>[^<]{2,}<\/title>/.test(html)) warn(id, "title 비어 있음");

  // 내부 링크가 실제 파일을 가리키는지
  for (const m of html.matchAll(/href="([^"#?][^"]*\.html)(?:[#?][^"]*)?"/g)) {
    const target = m[1].replace(/^\.\//, "");
    const abs = target.startsWith("../")
      ? `${SITE}/${target.replace(/^\.\.\//, "")}`
      : `${SITE}/pages/${target}`;
    if (!existsSync(abs)) fail(id, `링크가 없는 화면을 가리킴 → ${m[1]}`);
  }

  // 스타일·스크립트가 실제로 붙어 있는지
  for (const m of html.matchAll(/(?:href|src)="((?:\.\.\/)?assets\/[^"]+)"/g)) {
    const abs = `${SITE}/${m[1].replace(/^\.\.\//, "")}`;
    if (!existsSync(abs)) fail(id, `없는 파일을 부름 → ${m[1]}`);
  }
  if (!/assets\/css\/base\.css/.test(html)) fail(id, "스타일(base.css)이 안 붙음");
}

/* ── 3) 복붙으로 같아진 화면 ────────────────────────────────── */
const byText = new Map<string, string[]>();
for (const [id, t] of pageText) {
  const key = t.slice(0, 600);
  byText.set(key, [...(byText.get(key) ?? []), id]);
}
for (const ids of byText.values()) {
  if (ids.length > 1) warn(ids.join(", "), `앞부분 내용이 서로 같음 (${ids.length}개)`);
}

/* ── 4) 목록 화면에서 전부 닿는지 ───────────────────────────── */
const index = readFileSync(`${SITE}/index.html`, "utf8");
const linked = new Set(
  [...index.matchAll(/href="pages\/([A-Z]{2}\d{4})\.html"/g)].map((m) => m[1]),
);
for (const id of builtIds) if (!linked.has(id)) warn(id, "index.html에서 닿을 수 없음");

/* ── 결과 ───────────────────────────────────────────────────── */
const fails = issues.filter((i) => i.level === "FAIL");
const warns = issues.filter((i) => i.level === "WARN");
console.log(`설계 화면 ${designIds.length}개 · 만들어진 화면 ${builtIds.length}개\n`);
for (const i of [...fails, ...warns]) console.log(`  [${i.level}] ${i.where} — ${i.what}`);
console.log(
  `\n${fails.length ? "❌" : "✔"} FAIL ${fails.length}건 · WARN ${warns.length}건` +
    (fails.length ? "  → 판매 전에 고쳐야 합니다" : "  → 판매 가능"),
);

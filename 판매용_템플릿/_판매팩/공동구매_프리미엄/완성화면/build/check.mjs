/* 만든 화면을 훑어 본다 — 끊긴 링크, 반응 없는 버튼, 빈 화면, 남은 자리표시.
   실행: node build/check.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = path.join(ROOT, 'pages');
const files = fs.readdirSync(PAGES).filter((f) => f.endsWith('.html'));
const have = new Set(files.map((f) => f.replace(/\.html$/, '')));

let links = 0; const dead = [];
let buttons = 0; const mute = [];
const thin = []; const spec = [];

for (const f of files) {
  const html = fs.readFileSync(path.join(PAGES, f), 'utf8');

  // 화면 사이 이동 — 눌러서 아무 데도 못 가는 링크가 없어야 한다
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const h = m[1];
    if (h.startsWith('#') || h.startsWith('http') || h.startsWith('../index.html') || /\.(css|js)$/.test(h)) continue;
    links++;
    const id = h.replace(/^\.\.\//, '').replace(/\.html$/, '');
    if (!have.has(id) && id !== 'index') dead.push(`${f} → ${h}`);
  }

  // 버튼은 전부 반응해야 한다 — 이동하거나, 토스트를 띄우거나, 화면 안에서 무언가 바꾸거나
  for (const m of html.matchAll(/<button[^>]*>/g)) {
    const b = m[0];
    buttons++;
    // 수량 스텝퍼의 ＋ 단추처럼 부모가 동작을 맡는 것은 앞 100자를 보고 알아본다
    const near = html.slice(Math.max(0, m.index - 100), m.index);
    const reacts = /data-toast|data-modal|data-close|data-dismiss|data-go|data-step|data-mv|data-getcoupon|data-pane|disabled/.test(b)
      || /class="[^"]*\b(tab|chip|acc-q|heart|toggle|cal-d|slot|car-nav|dev-btn|radio|check|pin|btn-link)\b/.test(b)
      || /class="stepper"/.test(near);
    if (!reacts) mute.push(`${f} :: ${b.slice(0, 96)}`);
  }

  // 내용이 거의 없는 화면
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 900) thin.push(`${f} (${text.length}자)`);

  // 만들다 만 흔적
  if (/TODO|FIXME|Lorem|준비 중입니다|undefined|NaN/.test(html)) spec.push(f);
}

const out = (t, list) => {
  console.log(`\n${t}: ${list.length}건`);
  list.slice(0, 20).forEach((x) => console.log('  ' + x));
  if (list.length > 20) console.log(`  … 그 밖 ${list.length - 20}건`);
};

console.log(`화면 ${files.length}개 · 화면 링크 ${links}개 · 버튼 ${buttons}개`);
out('끊긴 링크', dead);
out('반응 없는 버튼', mute);
out('내용이 얇은 화면', thin);
out('만들다 만 흔적', spec);

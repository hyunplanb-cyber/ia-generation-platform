/* 팩마다 흩어진 «눌러도 반응 없는 버튼»에 마지막 그물을 붙인다.
 *
 * 왜 이렇게 하나 (2026-08-17)
 *   check-반응 을 전 팩에 돌려 보니 죽은 버튼이 팩마다 수십~수백 개인데,
 *   종류를 세어 보면 «몇 가지»뿐이다 — 알림 종, 무리 지어 고르는 버튼(.cat 따위),
 *   앞뒤 화살표, 그리고 손잡이가 있는데 감싸는 상자가 없어 터지는 것들.
 *   화면마다 낱낱이 고치면 1,500장을 손대야 한다. 팩마다 app.js 한 곳에 붙이면 끝난다.
 *
 *   ⚠ 그렇다고 «아무 버튼이나 눌리면 알림» 을 붙이면 이미 제대로 도는 손잡이와
 *     엇갈려 두 번 돈다. 그래서 «마지막 그물»로 만든다 —
 *     누르기 전 화면을 적어 두고, 다른 손잡이가 다 돈 뒤에도 그대로일 때만 나선다.
 *
 * 무엇을 해 주나 (위에서부터 먼저 맞는 것)
 *   ① 무리 지어 고르는 버튼이면 그 무리 안에서 골라진 표시를 옮긴다
 *   ② 옆에 가로로 흐르는 목록이 있으면 그것을 굴린다(앞뒤 화살표)
 *   ③ 둘 다 아니면 제 이름으로 알림을 띄운다 — 견본 화면의 정직한 답이다
 *
 * 쓰는 법
 *   npx tsx 고치기-마지막그물.mts              (완성화면이 든 팩 전부)
 *   npx tsx 고치기-마지막그물.mts 매칭_프리미엄  (한 팩만)
 *   npx tsx 고치기-마지막그물.mts --빼기        (도로 뺀다)
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const 팩방 = "판매용_템플릿/_판매팩";
const 고른팩 = process.argv.slice(2).find((a) => !a.startsWith("--"));
const 뺄까 = process.argv.includes("--빼기");

const 시작 = "/* ── 마지막 그물 ──────────────────────────────────────────";
const 끝 = "/* ── 마지막 그물 끝 ── */";

const 그물 = `
${시작}
   눌러도 아무 손잡이에 안 걸린 버튼에게 «그래도 답»을 준다.
   누르기 전 화면을 적어 두고, 다른 손잡이가 다 돈 뒤에도 그대로일 때만 나선다.
   ⚠ 이미 제대로 도는 버튼은 여기까지 오지 않는다 — 화면이 이미 바뀌었기 때문이다.
   ────────────────────────────────────────────────────────── */
(function () {
  function 이름(t) {
    var s = (t.getAttribute('aria-label') || t.textContent || '').trim().replace(/\\s+/g, ' ');
    return s.slice(0, 20);
  }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('button:not([disabled])') : null;
    if (!t) return;
    if (t.closest('.dev')) return;                       // 화면 정보 패널은 견본 장치다
    if (t.dataset && (t.dataset.toast || t.dataset.modal || t.dataset.go ||
                      t.dataset.close || t.dataset.dismiss)) return;  // 이미 제 답이 있다
    var 전 = document.body.innerHTML;
    setTimeout(function () {
      if (document.body.innerHTML !== 전) return;        // 누군가 이미 답했다

      // ① 무리 지어 고르는 버튼 — 형제 중에 «골라진 것»이 있으면 그 표시를 옮긴다
      var 상자 = t.parentElement;
      if (상자) {
        var 형제 = Array.prototype.filter.call(상자.children, function (c) { return c.tagName === 'BUTTON'; });
        var 골라진 = 형제.filter(function (b) { return b.classList.contains('on') || b.classList.contains('sel'); });
        if (형제.length > 1 && 골라진.length > 0) {
          var 표 = 골라진[0].classList.contains('sel') ? 'sel' : 'on';
          형제.forEach(function (b) { b.classList.remove(표); });
          t.classList.add(표);
          return;
        }
      }

      // ② 앞뒤 화살표 — 가까이에 가로로 흐르는 목록이 있으면 굴린다
      var 앞뒤 = /prev|next|이전|다음|‹|›/.test(t.className + ' ' + 이름(t));
      if (앞뒤) {
        var 둘레 = t.closest('section, .card, .box, div');
        for (var i = 0; i < 3 && 둘레; i++) {
          var 목록 = 둘레.querySelector('.carousel, [style*="overflow-x"], .row[style*="overflow"]');
          if (목록 && 목록.scrollWidth > 목록.clientWidth) {
            var 뒤로 = /prev|이전|‹/.test(t.className + ' ' + 이름(t));
            목록.scrollLeft += (뒤로 ? -1 : 1) * Math.max(240, 목록.clientWidth * 0.8);
            return;
          }
          둘레 = 둘레.parentElement;
        }
      }

      // ③ 그 밖에는 제 이름으로 알림 — 견본 화면이 줄 수 있는 정직한 답이다
      if (typeof window.toast === 'function') window.toast(이름(t) + ' — 눌렀어요');
    }, 0);
  }, true);
})();
${끝}
`;

const 팩들 = 고른팩
  ? [고른팩]
  : readdirSync(팩방, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(팩방, e.name, "완성화면", "assets", "js", "app.js")))
      .map((e) => e.name);

let 손댄팩 = 0;
for (const 팩 of 팩들) {
  const 길 = join(팩방, 팩, "완성화면", "assets", "js", "app.js");
  if (!existsSync(길)) { console.log(`  ${팩} — app.js 가 없어 건너뜁니다`); continue; }
  let s = readFileSync(길, "utf8");

  // 붙였던 것을 먼저 떼고 다시 붙인다 — 두 번 붙는 것을 막는다
  const 떼기 = new RegExp(`\\n*${시작.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${끝.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n*`, "g");
  const 있었나 = 떼기.test(s);
  s = s.replace(떼기, "\n");

  if (!뺄까) s = s.replace(/\s*$/, "\n") + 그물;
  writeFileSync(길, s, "utf8");
  손댄팩 += 1;
  console.log(`  ${뺄까 ? "뺐습니다" : 있었나 ? "다시 붙였습니다" : "붙였습니다"} — ${팩}`);
}

console.log(`\n${손댄팩}개 팩의 app.js 를 손봤습니다.`);
console.log("이어서 `npx tsx check-반응.mts` 로 다시 재 보세요.");

/* 직접 만든 AI팩 검수기 — «화면» 판.
 *
 * 왜 만드나 (2026-08-11, 사장님 제안)
 *   「예쁘지 않아도 되니까 로컬에라도 사이트처럼 보게 줘. 직접 파일 넣고 검수 돌려볼 수 있게,
 *    검수항목 리스트 노출되고, 파일 업로드 [검수하기].」
 *
 *   명령줄만 있으면 사장님이 못 쓰신다. 파일을 끌어다 놓고 누르면 되게 한다.
 *
 * ⚠ **우리 사이트(Next.js)와 아무 상관 없다.** 따로 도는 작은 서버다.
 *   판매 사이트에 검수기가 섞이면 손님 화면에 나가 버린다.
 *
 * 재는 알맹이는 `lib/검수-직접팩.mts` 하나다 — 명령줄 판과 같은 것을 쓴다.
 * 검수항목 목록도 `검수항목.md` 를 그때그때 읽는다. **여기 다시 적지 않는다.**
 *
 * 쓰는 법
 *   npx tsx 검수기-화면.mts          →  http://localhost:4321 이 열린다
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import JSZip from "jszip";
import { 검수하기, 항목읽기, type 항목 } from "./lib/검수-직접팩.mjs";

const 포트 = 4321;

/* 검수항목.md 는 마크다운이다. 표 칸에 `**굵게**` 와 `` `코드` `` 가 들어 있는데,
   그대로 뿌리면 별표가 글자로 보인다. 2026-08-11 에 화면에 `**문서끼리…**` 로 나왔다.
   ⚠ 여는 글자를 먼저 막고(<>&) 나서 마크다운을 푼다. 차례를 바꾸면 태그가 새어 든다. */
const 글로 = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`(.+?)`/g, "<code>$1</code>");

const 칸 = (a: 항목) => `<tr>
  <td class="no">${글로(a.번호)}</td><td>${글로(a.무엇)}</td>
  <td class="who">${글로(a.누가)}</td><td class="ap">${글로(a.적용)}</td></tr>`;

function 페이지() {
  const { 기본, 변경 } = 항목읽기(readFileSync("검수항목.md", "utf8"));
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<title>AI팩 검수기</title>
<style>
  :root{--pa:#EAE8DE;--ink:#20261C;--or:#E4762C;--te:#0E6F60;--line:#D6D3C6}
  *{box-sizing:border-box}
  body{margin:0;background:var(--pa);color:var(--ink);font:16px/1.6 Paperlogy,Pretendard,"Malgun Gothic",sans-serif}
  .wrap{max-width:900px;margin:0 auto;padding:40px 20px 80px}
  h1{font-size:28px;margin:0 0 6px}
  .sub{color:#6B6B5E;margin:0 0 28px}
  .box{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px;margin-bottom:22px}
  .drop{border:2px dashed var(--line);border-radius:12px;padding:34px;text-align:center;cursor:pointer;background:#FCFBF7}
  .drop.on{border-color:var(--or);background:#FDF3EA}
  .drop b{display:block;font-size:17px;margin-bottom:4px}
  .drop span{color:#6B6B5E;font-size:14px}
  button{margin-top:14px;width:100%;padding:14px;border:0;border-radius:10px;background:var(--or);
         color:#fff;font-size:17px;font-weight:800;cursor:pointer}
  button:disabled{background:#C9C6BA;cursor:default}
  h2{font-size:19px;margin:26px 0 10px}
  h2 small{font-weight:400;font-size:14px;color:#6B6B5E;margin-left:6px}
  table{width:100%;border-collapse:collapse;font-size:14px}
  th,td{text-align:left;padding:7px 8px;border-bottom:1px solid #EFEDE4;vertical-align:top}
  th{color:#6B6B5E;font-weight:600;font-size:13px}
  .no{font-weight:800;width:44px}.who{width:150px;color:#6B6B5E}.ap{width:52px;color:#6B6B5E}
  #결과{display:none}
  .줄{display:flex;gap:10px;padding:10px 12px;border-radius:9px;margin-bottom:7px;font-size:15px}
  .fail{background:#FDECEC;border-left:4px solid #C0392B}
  .warn{background:#FDF6E6;border-left:4px solid #C9922B}
  .ok{background:#E9F5F0;border-left:4px solid var(--te);font-weight:700}
  /* 「흠이 아니다」는 눈에 덜 띄게. 경고와 같은 색이면 고칠 것으로 읽힌다. */
  .info{background:#F1F0EA;border-left:4px solid #A8A493;color:#4A4737}
  .뱃{font-weight:800;flex:none;min-width:34px}
  .셈{font-size:15px;margin:14px 0 6px;font-weight:700}
  .셈.나쁨{color:#C0392B}
  .셈.옅게{color:#6B6B5E;font-weight:400;font-size:14px;margin-top:18px}
  code{background:#EFEEE7;border-radius:5px;padding:1px 5px;font-size:13px}
</style></head><body><div class="wrap">

<h1>AI팩 검수기</h1>
<p class="sub">우리 사이트에서 만든 팩을 넣으면 성한지 재 드립니다. 이 화면은 <b>내 컴퓨터에서만</b> 돕니다.</p>

<div class="box">
  <div class="drop" id="drop">
    <b>여기에 zip 을 끌어다 놓으세요</b>
    <span>눌러서 고르셔도 됩니다 · 내려받은 팩 zip 그대로</span>
    <input type="file" id="f" accept=".zip" hidden>
  </div>
  <button id="go" disabled>검수하기</button>
  <div id="결과"></div>
</div>

<h2>기본 검수항목 <small>처음부터 재던 것 ${기본.length}개</small></h2>
<div class="box"><table>
  <tr><th>#</th><th>무엇을 본다</th><th>누가 재나</th><th>적용</th></tr>
  ${기본.map(칸).join("")}
</table></div>

<h2>변경 검수항목 <small>사장님과 이야기하다 더한 것 ${변경.length}개</small></h2>
<div class="box"><table>
  <tr><th>#</th><th>무엇을 본다</th><th>누가 재나</th><th>적용</th></tr>
  ${변경.map(칸).join("")}
</table></div>

<script>
const drop=document.getElementById('drop'), f=document.getElementById('f'),
      go=document.getElementById('go'), 결과=document.getElementById('결과');
let 고른것=null;
const 고름=(file)=>{ 고른것=file; go.disabled=!file;
  drop.querySelector('b').textContent = file ? file.name : '여기에 zip 을 끌어다 놓으세요';
  drop.querySelector('span').textContent = file
    ? Math.round(file.size/1024).toLocaleString()+'KB · 눌러서 다시 고를 수 있어요'
    : '눌러서 고르셔도 됩니다 · 내려받은 팩 zip 그대로'; };
drop.onclick=()=>f.click();
f.onchange=()=>고름(f.files[0]);
drop.ondragover=(e)=>{e.preventDefault();drop.classList.add('on')};
drop.ondragleave=()=>drop.classList.remove('on');
drop.ondrop=(e)=>{e.preventDefault();drop.classList.remove('on');고름(e.dataTransfer.files[0])};

go.onclick=async()=>{
  if(!고른것)return;
  go.disabled=true; go.textContent='재는 중…'; 결과.style.display='none';
  try{
    const r=await fetch('/run',{method:'POST',body:await 고른것.arrayBuffer(),
      headers:{'content-type':'application/octet-stream'}});
    const j=await r.json();
    결과.style.display='block';
    if(j.오류){ 결과.innerHTML='<div class="줄 fail"><span class="뱃">✗</span><span>'+j.오류+'</span></div>'; return; }
    const 굵게=(s)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
    const 반 = { FAIL:['fail','✗'], WARN:['warn','△'], '알림':['info','ℹ'] };
    const 줄=(i)=>{const [c,b]=반[i.급]||반.WARN;
      return '<div class="줄 '+c+'"><span class="뱃">'+b+'</span><span><b>['+i.항목+']</b> '+굵게(i.무엇)+'</span></div>';};
    const 못=j.흠들.filter(x=>x.급==='FAIL'), 걸=j.흠들.filter(x=>x.급==='WARN'), 알=j.흠들.filter(x=>x.급==='알림');
    /* 「고쳐야 할 것」과 「그냥 알려 주는 것」을 눈에 띄게 가른다.
       섞어 놓으면 무엇을 손대야 하는지 알 수 없다(2026-08-11 사장님 지적). */
    const 맨위 = 못.length
      ? '<p class="셈 나쁨">고쳐야 할 것 '+못.length+'건 — 이대로는 손님에게 못 줍니다</p>'
      : (걸.length
          ? '<p class="셈">못 넘긴 것 없음 · 봐줄 만한 것 '+걸.length+'건</p>'
          : '<div class="줄 ok"><span class="뱃">✓</span><span>고칠 것이 없습니다. 이대로 쓰셔도 됩니다.</span></div>');
    결과.innerHTML = '<p class="셈">파일 '+j.파일수+'개</p>' + 맨위
      + 못.map(줄).join('') + 걸.map(줄).join('')
      + (알.length ? '<p class="셈 옅게">아래는 «흠이 아닙니다». 그냥 알려 드리는 것입니다.</p>'+알.map(줄).join('') : '');
  }catch(e){ 결과.style.display='block';
    결과.innerHTML='<div class="줄 fail"><span class="뱃">✗</span><span>'+e.message+'</span></div>'; }
  finally{ go.disabled=false; go.textContent='검수하기'; }
};
</script></div></body></html>`;
}

createServer(async (req, res) => {
  /* ⚠ 주소만은 영문으로 둔다.
     한글 주소로 두면 브라우저는 퍼센트 인코딩해 보내고 curl 은 날바이트로 보낸다.
     받는 쪽에서 어느 쪽인지 알 수가 없다 — 2026-08-11 에 여기서 두 번 헛돌았다.
     화면에 보이는 글은 다 한글이니, 이 한 줄만 영문이어도 읽는 데 지장 없다. */
  if (req.method === "POST" && req.url === "/run") {
    /* 파일을 통째로 받는다. multipart 를 파싱하지 않으려고 «날바이트»로 보낸다 —
       라이브러리를 하나 더 깔 이유가 없다. */
    const 조각: Buffer[] = [];
    for await (const c of req) 조각.push(c as Buffer);
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    try {
      const z = await JSZip.loadAsync(Buffer.concat(조각));
      const 파일들 = new Map<string, Buffer>();
      for (const [p, ff] of Object.entries(z.files)) {
        if (ff.dir) continue;
        파일들.set(p.includes("/") ? p.slice(p.indexOf("/") + 1) : p,
          Buffer.from(await ff.async("uint8array")));
      }
      if (파일들.size === 0) { res.end(JSON.stringify({ 오류: "zip 안이 비었습니다." })); return; }
      res.end(JSON.stringify({ 파일수: 파일들.size, 흠들: await 검수하기(파일들) }));
    } catch (e) {
      res.end(JSON.stringify({ 오류: `zip 이 안 열립니다 — ${(e as Error).message.slice(0, 80)}` }));
    }
    return;
  }
  /* 항목표는 «부를 때마다» 다시 읽는다. 검수항목.md 를 고치면 새로고침만 하면 된다. */
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(페이지());
}).listen(포트, () => {
  const 주소 = `http://localhost:${포트}`;
  console.log(`\nAI팩 검수기가 열렸습니다 — ${주소}`);
  console.log("  zip 을 끌어다 놓고 「검수하기」를 누르세요.");
  console.log("  끄려면 Ctrl+C.\n");
  try { execFileSync("cmd", ["/c", "start", '""', `"${주소}"`], { stdio: "ignore" }); } catch { /* 손으로 열면 된다 */ }
});

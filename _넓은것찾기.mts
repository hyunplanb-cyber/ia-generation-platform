/* 폰 폭(375)에서 «무엇이» 옆으로 미는지 딱 집어낸다.
   헤드리스 크롬은 창을 375 밑으로 못 줄이지만, 375짜리 iframe 안은 진짜 375 다
   (check-눈으로.mts 의 폰폭재기와 같은 수법). */
import { execFileSync, spawn } from "node:child_process";
import { writeFileSync, unlinkSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const W = process.argv[2];
const 쪽 = process.argv[3];
const 찌꺼기 = mkdtempSync(join(tmpdir(), "wide-"));
const 몰이 = join(W, "_넓은것.html");
writeFileSync(몰이, `<!doctype html><meta charset="utf-8"><body style="margin:0"><script>
 const f=document.createElement("iframe");
 f.style.cssText="width:375px;height:812px;border:0;position:absolute;left:0;top:0";
 document.body.appendChild(f);
 f.onload=()=>{ setTimeout(()=>{ try{
   const d=f.contentDocument, 셈=[], 창=d.documentElement.clientWidth;
   d.querySelectorAll("body *").forEach(el=>{
     const r=el.getBoundingClientRect();
     if(r.right>창+1 && r.width>30)
       셈.push(el.tagName.toLowerCase()+"."+String(el.className||"").split(" ").filter(Boolean).slice(0,3).join(".")
         +" 오른끝"+Math.round(r.right)+" 폭"+Math.round(r.width));
   });
   document.title=JSON.stringify({창,문서:d.documentElement.scrollWidth,것:셈.slice(0,14)});
  }catch(e){document.title="{\\"오류\\":\\""+e.message+"\\"}";} },400); };
 f.src="pages/${쪽}";
<\/script></body>`, "utf8");
const 항 = 4700 + (process.pid % 200);
const 서버 = spawn("node", ["-e", `
 const http=require("http"),fs=require("fs"),p=require("path");
 http.createServer((q,s)=>{const 길=p.join(${JSON.stringify(W)},decodeURIComponent(q.url.split("?")[0]));
  try{const b=fs.readFileSync(길);
   s.writeHead(200,{"content-type":길.endsWith(".html")?"text/html; charset=utf-8":길.endsWith(".css")?"text/css":길.endsWith(".js")?"text/javascript":"image/webp"});
   s.end(b);}catch{s.writeHead(404);s.end("no");}}).listen(${항});
`], { stdio: "ignore" });
try {
  execFileSync("node", ["-e", "setTimeout(()=>{},900)"], { stdio: "ignore" });
  let dom = "";
  try {
    dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 찌꺼기, "--disable-gpu",
      "--window-size=1200,900", "--virtual-time-budget=6000", "--dump-dom",
      `http://localhost:${항}/_넓은것.html`], { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 });
  } catch { /* 아래에서 잡힌다 */ }
  const t = (/<title>([\s\S]*?)<\/title>/.exec(dom)?.[1] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  if (!t.startsWith("{")) { console.log("못 쟀습니다"); }
  else {
    const r = JSON.parse(t);
    console.log(`${쪽} — 창 ${r.창} · 문서 ${r.문서}`);
    (r.것 ?? []).forEach((x: string) => console.log("  " + x));
    if (r.오류) console.log("  오류: " + r.오류);
  }
} finally { 서버.kill(); try { unlinkSync(몰이); } catch { /* 이미 없으면 그만 */ } }

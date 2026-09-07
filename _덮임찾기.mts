/* 「찜 하트가 무엇에 덮였나」를 딱 집어낸다. */
import { execFileSync, spawn } from "node:child_process";
import { writeFileSync, unlinkSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 방 = "판매용_템플릿/_만드는중/중고거래_디럭스/완성화면";
const 쪽 = process.argv[2] ?? "HO-01";
const 찌꺼기 = mkdtempSync(join(tmpdir(), "cov-"));
const 몰이 = join(방, "_덮임.html");
writeFileSync(몰이, `<!doctype html><meta charset="utf-8"><body style="margin:0"><script>
 const f=document.createElement("iframe");
 f.style.cssText="width:1280px;height:900px;border:0;position:absolute;left:0;top:0";
 document.body.appendChild(f);
 f.onload=()=>{ setTimeout(()=>{ try{
   const d=f.contentDocument, 셈=[];
   d.querySelectorAll(".heart").forEach((h,i)=>{
     const r=h.getBoundingClientRect();
     const 안보임 = r.width===0 || h.offsetParent===null;
     const 화면밖 = r.top<0 || r.bottom>f.contentWindow.innerHeight;
     const 맨위 = 화면밖?null:d.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
     셈.push({i, 위치:Math.round(r.top)+","+Math.round(r.left), 폭:Math.round(r.width),
       안보임, 화면밖,
       맨위: 맨위 ? 맨위.tagName.toLowerCase()+"."+String(맨위.className||"").split(" ").slice(0,3).join(".") : "(없음)",
       덮임: !!(맨위 && !h.contains(맨위) && 맨위!==h)});
   });
   document.title=JSON.stringify(셈.slice(0,8));
  }catch(e){document.title='[{"오류":"'+e.message+'"}]';} },500); };
 f.src="pages/${쪽}.html";
<\/script></body>`, "utf8");
const 항 = 4900 + (process.pid % 90);
const 서버 = spawn("node", ["-e", `
 const http=require("http"),fs=require("fs"),p=require("path");
 http.createServer((q,s)=>{const 길=p.join(${JSON.stringify(방)},decodeURIComponent(q.url.split("?")[0]));
  try{const b=fs.readFileSync(길);s.writeHead(200,{"content-type":길.endsWith(".html")?"text/html; charset=utf-8":길.endsWith(".css")?"text/css":길.endsWith(".js")?"text/javascript":"image/webp"});s.end(b);}
  catch{s.writeHead(404);s.end("no");}}).listen(${항});
`], { stdio: "ignore" });
try {
  execFileSync("node", ["-e", "setTimeout(()=>{},900)"], { stdio: "ignore" });
  let dom = "";
  try { dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 찌꺼기, "--disable-gpu",
    "--window-size=1400,1000", "--virtual-time-budget=6000", "--dump-dom",
    `http://localhost:${항}/_덮임.html`], { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 }); } catch { /* */ }
  const t = (/<title>([\s\S]*?)<\/title>/.exec(dom)?.[1] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  console.log(t.startsWith("[") ? JSON.parse(t).map((x: Record<string, unknown>) => JSON.stringify(x)).join("\n") : "못 쟀습니다");
} finally { 서버.kill(); try { unlinkSync(몰이); } catch { /* */ } }

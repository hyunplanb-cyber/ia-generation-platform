/* 팩 전체를 한 번에 띄우는 검수용 서버. (2026-08-19)
 *
 * 왜 만들었나 — `npx serve` 는 `/…/완성화면/index.html` 을 `/…/완성화면` 으로 «되돌린다».
 *   끝 빗금이 떨어지면 브라우저가 `assets/css/base.css` 를 한 칸 «위»에서 찾아 404 가 되고,
 *   화면이 글자만 남은 민얼굴로 뜬다. 팩이 깨진 것처럼 보이지만 팩은 멀쩡하다.
 *   그래서 **되돌리지 않고** 폴더면 그 자리에서 index.html 을 그냥 준다.
 *
 *   node _작업/팩서버.mjs [포트] [뿌리]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const 포트 = Number(process.argv[2] || 4200);
const 뿌리 = resolve(process.argv[3] || "판매용_템플릿/_판매팩");

const 종류 = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".mp4": "video/mp4",
};

createServer(async (req, res) => {
  try {
    let 길 = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let 실제 = join(뿌리, 길);
    /* ⭐ 폴더인데 «끝 빗금이 없으면» 빗금을 붙여 되돌린다.
       빗금이 없으면 브라우저가 마지막 칸을 «파일 이름»으로 보고,
       assets/css/base.css 를 한 칸 «위»에서 찾는다 —
       /LMS_프리미엄/완성화면 + assets/… → /LMS_프리미엄/assets/… (404, 민얼굴)
       이것이 사장님이 보신 「화면목록 깨짐」의 정체다. (2026-08-19) */
    try {
      if ((await stat(실제)).isDirectory()) {
        if (!길.endsWith("/")) {
          res.writeHead(301, { location: encodeURI(길) + "/" });
          return res.end();
        }
        실제 = join(실제, "index.html");
      }
    } catch { }
    const 몸 = await readFile(실제);
    res.writeHead(200, { "content-type": 종류[extname(실제).toLowerCase()] || "application/octet-stream" });
    res.end(몸);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("없습니다: " + req.url);
  }
}).listen(포트, () => {
  console.log(`팩 서버 — http://localhost:${포트}/`);
  console.log(`뿌리: ${뿌리}`);
  console.log("끝 빗금이 없으면 붙여서 되돌립니다 — 민얼굴로 뜨지 않습니다.");
});

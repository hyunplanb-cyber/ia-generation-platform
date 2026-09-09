/* 팩 안에 넣을 «안내장» — 안내서 본문 대신 «웹 주소»를 가리킨다.
 *
 * 왜 이렇게 바꿨나 (2026-08-14 사장님 지시)
 *   「사이트 내놓는 법」·「앱으로 내놓는 법」은 **내용이 자주 바뀐다.**
 *   배포 서비스 화면이 바뀌고, 애플 심사 기준이 바뀌고, 값이 바뀐다.
 *   그런데 팩에 «본문 통째로»(90KB·38KB) 넣어 두면, 이미 산 손님의 파일은
 *   **영원히 그날 것으로 굳는다.** 고쳐도 산 사람에게는 안 간다.
 *
 *   그래서 팩에는 «한 장짜리 안내장»만 넣고 본문은 웹에 둔다.
 *   손님이 그 파일을 열면 「여기서 보세요」 하고 최신 글로 데려간다.
 *
 * ⚠ 파일 이름(09_·10_)은 그대로 둔다. 손님 습관을 바꾸지 않는다.
 * ⚠ 인터넷이 끊긴 자리에서도 «무엇을 하는 글인지»는 읽히게 요약을 넣는다.
 *   빈 껍데기를 주면 「파일이 왜 이래」가 된다.
 */

import { 검수안내서HTML } from "./export/검수안내서";

const 사이트주소 = "https://www.caffeinecolor.com";

type 안내 = {
  파일: string;
  제목: string;
  주소: string;
  한줄: string;
  담긴것: string[];
  /** 안내장이 아니라 «본문»을 통째로 담아야 하는 것. 11번이 그렇다 —
   *  손님이 붙여 넣을 «코드»가 있어야 하는데, 링크만 주면 또 한 걸음이 는다. */
  본문?: () => string;
};

const 안내서들: 안내[] = [
  {
    파일: "09_사이트_내놓는_법.html",
    제목: "만든 사이트를 세상에 내놓는 법",
    주소: `${사이트주소}/guide/deploy-guide.html`,
    한줄: "내 컴퓨터에서만 보이는 화면을, 주소를 가진 진짜 사이트로 만드는 법",
    담긴것: [
      "무료로 올리는 법 (Vercel · Netlify)",
      "도메인 사기와 연결하기",
      "로그인·회원가입 붙이기",
      "결제 붙이기 — PG 신청부터 심사까지",
      "올린 뒤에 꼭 확인할 것",
    ],
  },
  {
    파일: "10_앱으로_내놓는_법.html",
    제목: "만든 사이트를 앱으로 내놓는 법",
    주소: `${사이트주소}/guide/app-guide.html`,
    한줄: "반응형이라고 웹뷰로 감싸면 애플 심사 4.2에서 떨어진다 — 그 이야기부터",
    담긴것: [
      "웹뷰로 감싸면 왜 떨어지나 (애플 심사 4.2)",
      "앱으로 만들 값어치가 있는지 먼저 재기",
      "아이콘·스플래시·스크린샷 만들기",
      "권한 설명 문구 쓰는 법",
      "스토어 등록 절차와 걸리는 시간",
    ],
  },
  {
    파일: "11_내사이트_검수하는_법.html",
    제목: "만든 사이트를 스스로 검수하는 법",
    주소: `${사이트주소}/guide/verify-guide.html`,
    한줄: "저희가 팩을 재는 잣대 그대로, 손님 화면도 재 보세요 — 붙여 넣기 한 번이면 됩니다",
    담긴것: [
      "F12 눌러 콘솔 여는 법부터",
      "화면 한 장 재기 — 붙여 넣고 엔터",
      "화면이 100장일 때 한 번에 재기",
      "무엇을 재나 — 열두 가지 목록",
      "우리 팩으로 만든 것이 아니어도 됩니다",
    ],
    본문: 검수안내서HTML,
  },
];

/* ⛔ 2026-09-10 현님: 「11도 링크로 바꿔주고 한 화면에서 3개 링크를 모두 보이도록 해줘」
 *
 *   여태 팩에 «파일 셋»이 들어갔다 — 09·10 은 링크 안내장(2.4KB), 11 만 본문 통째로(41KB).
 *   11 을 통째로 넣던 까닭은 「붙여 넣을 코드가 있어 링크만 주면 한 걸음이 는다」였는데,
 *   2026-09-09 에 `/guide/verify-guide.html` 404 를 고쳐 이제 웹에서 열린다. 그 까닭이 없어졌다.
 *   → 셋 다 링크로 하고, «한 장»에 모아 담는다. 손님이 파일 셋을 여닫을 일이 없다.
 *   ⚠ `본문` 은 지우지 않는다 — `public/guide/verify-guide.html` 을 만들 때 쓰는 원본이다.
 *     다만 «팩에 넣는 글»로는 더 이상 쓰지 않는다. */

const 바탕꾸밈 = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Paperlogy,Pretendard,"Malgun Gothic",sans-serif;background:#F0EFEB;color:#22201D;
       padding:32px 24px 56px;line-height:1.7}
  .wrap{max-width:720px;margin:0 auto}
  .head{margin:8px 0 26px}
  .lab{font-size:13px;font-weight:700;color:#DE6F26;letter-spacing:.02em}
  .head h1{font-size:30px;font-weight:800;letter-spacing:-.02em;margin:10px 0 10px;word-break:keep-all}
  .head p{font-size:16px;color:#6B655C;word-break:keep-all}
  .card{background:#FFFDF8;border:1px solid #E3DED2;border-radius:20px;
        padding:34px 32px;box-shadow:0 2px 16px rgba(0,0,0,.05);margin-bottom:18px}
  .card h2{font-size:23px;font-weight:800;letter-spacing:-.02em;margin-bottom:8px;word-break:keep-all}
  .sub{font-size:15px;color:#6B655C;margin-bottom:20px;word-break:keep-all}
  .btn{display:inline-block;background:#DE6F26;color:#fff;text-decoration:none;font-weight:700;
       font-size:16px;padding:13px 26px;border-radius:12px}
  .btn:hover{background:#C25D1B}
  ul{margin:16px 0 0 18px;font-size:15px;color:#3B372F}
  li{margin-bottom:6px}
  .url{margin-top:14px;font-size:13px;color:#8A8377;word-break:break-all}
  .why{margin-top:10px;padding:22px 24px;border:1px dashed #DDD6C8;border-radius:14px;
       font-size:14px;color:#6B655C;word-break:keep-all;background:#FAF8F2}
`;

const 왜링크 = `<p class="why"><b>왜 파일이 아니라 링크인가요?</b><br>
    배포 서비스 화면도, 앱 심사 기준도 자주 바뀝니다. 파일로 드리면 사신 날 그대로 굳어
    버려서, 저희가 고쳐도 손님 파일은 옛날 글로 남습니다.
    <b>링크로 두면 언제 여셔도 최신 글</b>이 나옵니다.</p>`;

const 한칸 = (a: 안내) => `  <div class="card">
    <h2>${a.제목}</h2>
    <p class="sub">${a.한줄}</p>
    <a class="btn" href="${a.주소}">안내서 열기 →</a>
    <ul>${a.담긴것.map((x) => `<li>${x}</li>`).join("")}</ul>
    <p class="url">${a.주소}</p>
  </div>`;

/** 팩에 넣을 안내장 — «한 장»에 셋을 다 담는다. 인터넷이 없어도 무엇이 있는지는 읽힌다. */
function 안내장모음HTML(들: 안내[] = 안내서들): string {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>카페인컬러 안내서 — ${들.length}가지</title>
<style>${바탕꾸밈}</style></head>
<body><div class="wrap">
  <div class="head">
    <p class="lab">카페인컬러 안내서</p>
    <h1>만들고 나서 할 일, ${들.length}가지</h1>
    <p>화면을 다 만드셨다면 여기부터 보세요. 누르면 최신 글이 열립니다.</p>
  </div>
${들.map(한칸).join("\n")}
  ${왜링크}
</div></body></html>
`;
}

/** 한 안내서만 한 장으로. (남겨 둔다 — 낱장으로 쓸 자리가 생기면 쓴다) */
function 안내장HTML(a: 안내): string {
  return 안내장모음HTML([a]);
}

/* 내보내는 이름은 «영문»으로 둔다.
   한글 이름을 내보내면 tsx(esbuild)가 이름을 유니코드 escape 로 바꿔 놓아
   부르는 쪽에서 「그런 export 가 없다」로 죽는다. 2026-08-14 에 실제로 그랬다.
   이 저장소의 다른 lib(design-presets · preset-pack)도 모두 영문으로 내보낸다.
   안쪽 이름과 주석은 한글 그대로 둔다. */
/** 팩·zip 에 들어가는 «한 장»의 파일 이름. 셋을 여기 다 담는다. */
const 모음파일 = "09_안내서_세_가지.html";

export {
  안내서들 as GUIDES,
  안내장HTML as buildGuideCardHtml,
  안내장모음HTML as buildAllGuidesHtml,
  모음파일 as GUIDES_FILE,
  사이트주소 as SITE_URL,
};
export type { 안내 as Guide };

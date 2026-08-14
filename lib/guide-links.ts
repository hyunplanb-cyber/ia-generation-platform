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

const 사이트주소 = "https://www.caffeinecolor.com";

type 안내 = {
  파일: string;
  제목: string;
  주소: string;
  한줄: string;
  담긴것: string[];
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
];

/** 팩에 넣을 안내장 한 장. 인터넷이 없어도 무엇을 하는 글인지는 읽힌다. */
function 안내장HTML(a: 안내): string {
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${a.제목} — 카페인컬러</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Paperlogy,Pretendard,"Malgun Gothic",sans-serif;background:#F0EFEB;color:#22201D;
       display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;line-height:1.7}
  .card{background:#FFFDF8;border:1px solid #E3DED2;border-radius:20px;max-width:640px;width:100%;
        padding:44px 40px;box-shadow:0 2px 16px rgba(0,0,0,.05)}
  .lab{font-size:13px;font-weight:700;color:#DE6F26;letter-spacing:.02em}
  h1{font-size:30px;font-weight:800;letter-spacing:-.02em;margin:10px 0 12px;word-break:keep-all}
  .sub{font-size:16px;color:#6B655C;margin-bottom:26px;word-break:keep-all}
  .btn{display:inline-block;background:#DE6F26;color:#fff;text-decoration:none;font-weight:700;
       font-size:17px;padding:15px 30px;border-radius:12px}
  .btn:hover{background:#C25D1B}
  .why{margin-top:30px;padding-top:24px;border-top:1px solid #EDE8DE;font-size:14px;color:#6B655C;word-break:keep-all}
  ul{margin:14px 0 0 18px;font-size:15px;color:#3B372F}
  li{margin-bottom:7px}
  .url{margin-top:18px;font-size:13px;color:#8A8377;word-break:break-all}
</style></head>
<body><div class="card">
  <p class="lab">카페인컬러 안내서</p>
  <h1>${a.제목}</h1>
  <p class="sub">${a.한줄}</p>
  <a class="btn" href="${a.주소}">안내서 열기 →</a>
  <ul>${a.담긴것.map((x) => `<li>${x}</li>`).join("")}</ul>
  <p class="why"><b>왜 파일이 아니라 링크인가요?</b><br>
    배포 서비스 화면도, 앱 심사 기준도 자주 바뀝니다. 파일로 드리면 사신 날 그대로 굳어
    버려서, 저희가 고쳐도 손님 파일은 옛날 글로 남습니다.
    <b>링크로 두면 언제 여셔도 최신 글</b>이 나옵니다.</p>
  <p class="url">${a.주소}</p>
</div></body></html>
`;
}

/* 내보내는 이름은 «영문»으로 둔다.
   한글 이름을 내보내면 tsx(esbuild)가 이름을 유니코드 escape 로 바꿔 놓아
   부르는 쪽에서 「그런 export 가 없다」로 죽는다. 2026-08-14 에 실제로 그랬다.
   이 저장소의 다른 lib(design-presets · preset-pack)도 모두 영문으로 내보낸다.
   안쪽 이름과 주석은 한글 그대로 둔다. */
export { 안내서들 as GUIDES, 안내장HTML as buildGuideCardHtml, 사이트주소 as SITE_URL };
export type { 안내 as Guide };

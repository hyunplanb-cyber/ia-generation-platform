# 레이아웃 프리셋 A — 여백 중심형

> 덜 넣는다. 큰 사진 한 장과 넉넉한 빈 자리로 말한다.

## 사용 방법

1. 이 파일과 **가이드 프리셋 하나**(색·글꼴)를 함께 AI 코딩 도구에 넣으세요.
2. 스펙팩(07_AI빌드_스펙팩.json)과 함께 넣으면 그 화면들이 이 뼈대로 만들어집니다.
3. 가이드 3종 × 레이아웃 2종 = **6가지 조합** 중 마음에 드는 대로 고르시면 됩니다.

## 자리별 규칙

| 자리 | 어떻게 |
| --- | --- |
| 첫 화면 위쪽 | 가운데 정렬. 짧은 문구 한 줄 위에 여백을 크게 두고, 아래에 큰 사진 딱 한 장. |
| 목록 화면 | 1열(본문 폭 760px). 카드 테두리와 그림자를 쓰지 않고 여백으로만 나눈다. 한 화면에 4~6개까지만. |
| 내비게이션 | 상단 가로 GNB. 메뉴 글자를 작게 하고 자간을 넓힌다. 로고는 가운데. |
| 상세 화면 | 본문 한 단 가운데 정렬(최대 폭 760px). 구분선 대신 빈 줄로 나눈다. |
| 카드(썸네일) | 사진 위에 어두운 그라데이션을 깔고 제목·태그를 그 위에 얹는다. 카드 밖에 글자가 없다. (비율 4:3) |

**어울리는 곳** — 차분한 인상이 중요한 것(공방·클리닉·프리미엄 브랜드·전시)

## 칸이 몇 개이고, 카드가 몇 px인가

| 화면 폭 | 좌우 여백 | 칸 사이 | 칸 수 | 카드 한 장 |
| --- | --- | --- | --- | --- |
| 1440px 이상 (노트북) | 24px | 16px | 1칸 | 760px |
| 1024px (태블릿 가로) | 24px | 16px | 1칸 | 760px |
| 375px (휴대폰) | 16px | 12px | 1칸 | 343px |

카드 사진은 **4:3**입니다. 위 폭에 맞추면 사진 크기는 이렇게 됩니다.

- 노트북 760×570 · 태블릿 760×570 · 휴대폰 343×257

> 이미지를 준비하실 때는 가장 큰 값의 **2배**로 만드세요(고해상도 화면 대비).

## 그대로 붙여 넣는 CSS

아래 두 덩이를 **그대로** 쓰세요. 간격·칸 수·비율을 손으로 다시 적지 마세요 — 자리마다 값이 갈립니다.

**① 공통 격자** (어느 뼈대를 골라도 같습니다)

```css
:root{
  --wrap: 1440px;      /* 콘텐츠 폭 — 헤더·본문·푸터·고정바가 모두 이 값을 쓴다 */
  --pad-x: 24px;    /* 좌우 여백 */
  --card-gap:   16px;     /* 카드와 카드 사이 — 좌우 */
  --card-gap-y: 28px;     /* 카드 줄과 줄 사이 — 위아래 */
  --side-w:     260px;               /* 사이드바 폭 (사이드바 뼈대에서만) */
  --side-gap:   32px;                /* 사이드바와 본문 사이 */
  --row-gap:    14px;                /* 가로 행 카드 안: 썸네일과 글자 사이 */

  --card-pad:   24px;                /* 카드 안쪽 여백 */
  --row-h:      48px;                /* 표 한 줄 높이 — 안 정하면 줄마다 들쭉날쭉해진다 */
  --btn-gap:    8px;                 /* 나란히 놓은 버튼 사이 */
}
@media (max-width: 720px){
  :root{ --pad-x: 16px; --card-gap: 12px; }
}
.wrap { max-width: var(--wrap); margin-inline: auto; padding-inline: var(--pad-x); }
.cards{ display: grid; column-gap: var(--card-gap); row-gap: var(--card-gap-y); }

/* 지표 줄 — 화면 맨 위에 숫자 카드를 나란히 놓는 자리.
   카드 격자(.cards)와 다른 물건이므로 .cards 를 쓰지 않는다. 지표는 넷이 기본이다. */
.stats{ display: grid; grid-template-columns: repeat(4, 1fr);
        column-gap: var(--card-gap); row-gap: var(--card-gap-y); }
@media (max-width: 1024px){ .stats{ grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 720px){ .stats{ grid-template-columns: 1fr; } }

/* 모자이크 — 홈 첫 화면에 「큰 1장 + 작은 4장」을 놓는 자리.
   첫 장이 2칸×2줄, 나머지 넷이 옆을 채운다.
   어느 것을 크게 할지 class 로 정하지 않는다 — 맨 앞에 둔 것이 큰 것이다. */
.mosaic{ display: grid; grid-template-columns: repeat(4, 1fr);
         column-gap: var(--card-gap); row-gap: var(--card-gap-y); }
.mosaic > :first-child{ grid-column: span 2; grid-row: span 2;
                        display: flex; flex-direction: column; }
/* 큰 칸의 사진은 카드 비율을 따르지 않는다 — 두 줄 높이와 안 맞아 제목이 밀려난다.
   큰 칸에서는 사진이 남는 자리를 채운다. */
.mosaic > :first-child > .thumb{ aspect-ratio: auto; flex: 1; min-height: 0; }
@media (max-width: 1024px){
  .mosaic{ grid-template-columns: repeat(2, 1fr); }
  .mosaic > :first-child{ grid-row: auto; }   /* 2열에서 세로로 겹치면 빈칸이 생긴다 */
}
@media (max-width: 720px){
  .mosaic{ grid-template-columns: 1fr; }
  .mosaic > :first-child{ grid-column: auto; }
}

/* 상세 화면의 대표 사진 — 카드 비율을 그대로 쓰지 않는다.
   4:3 을 본문 폭 1392px 에 적용하면 세로가 1044px 이 되어 노트북 화면을 통째로 덮는다.
   가로로 눕히고(16:9) 세로를 420px 로 막는다 — 사진 아래 내용이 같이 보이는 선이다. */
.detail-img{ aspect-ratio: 16 / 9; max-height: 420px; width: 100%;
             border-radius: 12px; overflow: hidden; }
.detail-img > img{ width: 100%; height: 100%; object-fit: cover; display: block; }

/* 간격은 반드시 이 변수로 쓴다. gap:16px 처럼 숫자를 직접 적으면 자리마다 값이 갈린다. */
```

**② 한 단 뼈대**

```css
/* 한 단 — 읽는 폭을 좁혀야 글이 눈에 들어온다 */
.wrap > section { max-width: 760px; margin-inline: auto; }
.cards { grid-template-columns: 1fr; }
```

**③ 사진 위 겹침**

```css
.card { background: none; border: 0; box-shadow: none; display: block; }
.card .thumb { aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; position: relative; }
.card .thumb > img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* 글자가 사진 위에 놓이므로 어둠막이 없으면 밝은 사진에서 안 읽힌다 */
.card .thumb::after { content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.45) 38%, rgba(0,0,0,0) 72%); }
.card .body { position: absolute; left: 14px; right: 14px; bottom: 12px; padding: 0; color: #fff; z-index: 1; }
/* ⭐ 사진이 아직 없을 때는 어둠막을 걷는다 — 옅은 자리표시자 위에 검정을 덮으면
   자리표시자 글이 묻혀 «깨진 그림»처럼 보인다. 사진을 넣으면 이 줄만 지우면 된다. */
.card .thumb.is-placeholder::after { display: none; }
.card .thumb.is-placeholder + .body, .card .thumb.is-placeholder .body {
  position: static; color: var(--text); padding: 12px 2px 0; }
```

### 카드 모양을 바꾸고 싶다면

이 뼈대의 기본 카드는 **사진 위 겹침**입니다. 아래 중 다른 것으로 바꿔 쓰셔도 됩니다 — 뼈대는 그대로 두고 카드만 갈아 끼우면 인상이 크게 달라집니다.

| 카드 모양 | 비율 | 어떻게 | 어울리는 곳 |
| --- | --- | --- | --- |
| 정사각 카드 | 1:1 | 사진이 카드 위쪽을 정사각으로 채우고, 아래에 제목 → 보조정보 → 가격. | 상품·공구처럼 물건 자체를 보여줄 때 |
| 와이드 카드 | 16:9 | 가로로 넓은 사진 아래 제목 두 줄까지. 재생 시간·배지는 사진 위 우하단에. | 강의·영상처럼 화면을 담는 것 |
| 세로 카드 | 3:4 | 세로로 긴 사진에 제목을 아래 얹는다. 한 줄에 적게 넣는다. | 패션·인테리어처럼 분위기를 파는 것 |
| 사진 위 겹침 **(기본)** | 4:3 | 사진 위에 어두운 그라데이션을 깔고 제목·태그를 그 위에 얹는다. 카드 밖에 글자가 없다. | 여행지·매장처럼 사진 한 장으로 설명되는 것 |
| 가로 행 | 1:1 (왼쪽 고정) | 왼쪽에 작은 정사각 썸네일, 오른쪽에 제목·정보, 맨 끝에 액션 버튼. | 비교하며 훑는 목록 |
| 사진 없는 카드 | 없음 | 사진을 쓰지 않는다. 제목·숫자·배지만으로 위계를 만든다. 좌측에 색 띠 한 줄. | 표·대시보드처럼 숫자가 주인공인 화면 |

---

## AI에게 그대로 넣는 지시문

```
화면 뼈대를 아래대로 잡아줘. 색과 글꼴은 함께 넣은 가이드 프리셋을 따르고,
뼈대는 이 규칙을 우선해줘.

- 첫 화면 위쪽: 가운데 정렬. 짧은 문구 한 줄 위에 여백을 크게 두고, 아래에 큰 사진 딱 한 장.
- 목록 화면: 1열(본문 폭 760px). 카드 테두리와 그림자를 쓰지 않고 여백으로만 나눈다. 한 화면에 4~6개까지만.
- 내비게이션: 상단 가로 GNB. 메뉴 글자를 작게 하고 자간을 넓힌다. 로고는 가운데.
- 상세 화면: 본문 한 단 가운데 정렬(최대 폭 760px). 구분선 대신 빈 줄로 나눈다.
- 카드(썸네일): 사진 위에 어두운 그라데이션을 깔고 제목·태그를 그 위에 얹는다. 카드 밖에 글자가 없다. 이미지 비율은 4:3 를 지켜줘.

색만 맞추고 이 뼈대를 무시하면 어떤 색으로 만들어도 같은 화면이 나와. 뼈대를 먼저 잡고 색을 입혀줘.
```

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// 공유 링크(카톡·슬랙·X 등)에 뜨는 대표 카드 이미지.
// opengraph-image / twitter-image 두 파일이 이 렌더러를 함께 쓴다.
// 레트로 모던(종이·오렌지·틸) 톤을 실제 랜딩과 맞춘다.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT =
  "카페인컬러 — 만들기 전엔 설계도, 오픈 전엔 검수";

const PAPER = "#ece1c7";
const PAPER_LINE = "#d9cca8";
const INK = "#20261c";
const INK_SOFT = "#4e4a3b";
const ORANGE = "#c25d17";
const TEAL = "#0e6f60";

async function loadFonts() {
  const [regular, extraBold] = await Promise.all([
    readFile(join(process.cwd(), "assets/Paperlogy-4Regular.ttf")),
    readFile(join(process.cwd(), "assets/Paperlogy-8ExtraBold.ttf")),
  ]);
  return [
    { name: "Paperlogy", data: regular, style: "normal" as const, weight: 400 as const },
    { name: "Paperlogy", data: extraBold, style: "normal" as const, weight: 800 as const },
  ];
}

export async function renderBrandOg() {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          fontFamily: "Paperlogy",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* 상단 액센트 바 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            background: `linear-gradient(90deg, ${ORANGE} 0%, ${TEAL} 100%)`,
          }}
        />
        {/* 편집 프레임 */}
        <div
          style={{
            position: "absolute",
            top: 34,
            left: 34,
            right: 34,
            bottom: 34,
            border: `1.5px solid ${PAPER_LINE}`,
            borderRadius: 8,
          }}
        />

        {/* 상단: 브랜드 */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 46,
              height: 46,
              borderRadius: 12,
              background: ORANGE,
              color: PAPER,
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            C
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800 }}>
            카페인컬러
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: 6,
              padding: "6px 14px",
              borderRadius: 999,
              border: `1.5px solid ${TEAL}`,
              color: TEAL,
              fontSize: 20,
              fontWeight: 400,
            }}
          >
            AI 웹기획 · 오픈 전 검수
          </div>
        </div>

        {/* 중앙: 헤드라인 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* flex는 요소 사이 공백을 없애므로, 단어 간격은 gap으로 준다. */}
          <div
            style={{ display: "flex", gap: 20, fontSize: 82, fontWeight: 800, lineHeight: 1.14 }}
          >
            <span>만들기 전엔</span>
            <span style={{ color: ORANGE }}>설계도,</span>
          </div>
          <div
            style={{ display: "flex", gap: 20, fontSize: 82, fontWeight: 800, lineHeight: 1.14 }}
          >
            <span>오픈 전엔</span>
            <span style={{ color: TEAL }}>검수.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 29,
              fontWeight: 400,
              color: INK_SOFT,
              lineHeight: 1.4,
            }}
          >
            컨셉 한 줄로 화면별 프롬프트·스펙팩, URL 한 줄로 검수 리포트.
          </div>
        </div>

        {/* 하단: 도메인 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: TEAL }}>
            caffeinecolor.com
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 400, color: INK_SOFT }}>
            Cursor · Claude Code에 바로
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}

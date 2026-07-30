import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const paperlogy = localFont({
  src: [
    { path: "./fonts/paperlogy/Paperlogy-4Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/paperlogy/Paperlogy-5Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/paperlogy/Paperlogy-6SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/paperlogy/Paperlogy-7Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/paperlogy/Paperlogy-8ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-paperlogy",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "카페인컬러";
const SITE_TITLE = "카페인컬러 — 만들기 전엔 설계도, 오픈 전엔 검수";
const SITE_DESC =
  "바이브코딩으로 사이트 만드는 사람을 위한 서비스. 컨셉 한 줄이면 화면 목록·화면별 프롬프트·AI 빌드 스펙팩이 나와 Cursor·Claude Code에 바로. 오픈 전엔 URL 한 줄로 검수 리포트까지.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | 카페인컬러",
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    "웹기획",
    "IA",
    "화면설계",
    "기능정의서",
    "바이브코딩",
    "AI 사이트 제작",
    "화면별 프롬프트",
    "사이트 검수",
    "QA",
    "Cursor",
    "Claude Code",
    "카페인컬러",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${paperlogy.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "IA 자동생성 플랫폼",
  description: "사이트 컨셉과 메뉴만 입력하면 IA·화면기능정의·AI프롬프트·일정을 자동으로 만들어드려요.",
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

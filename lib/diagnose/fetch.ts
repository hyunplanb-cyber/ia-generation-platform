// 바깥 사이트를 «대신» 가져오는 부분.
//
// 브라우저는 남의 사이트를 직접 못 읽는다(CORS). 그래서 우리 서버가 대신 접속한다.
// 그런데 「주소를 받아 서버가 접속해 준다」는 기능은 그 자체가 공격 통로다 —
// 손님이 `http://169.254.169.254`(클라우드 메타데이터)를 넣으면 우리 열쇠가 새 나간다.
// 그걸 여기서 전부 막는다. 이 파일을 손볼 때는 SSRF 방어를 절대 걷어내지 마라.
//
// 참고: 리다이렉트를 브라우저에 맡기지 않고 «직접» 따라간다. 바깥 주소로 시작해
// 중간에 내부망으로 튀는 수법이 있어서, 매 단계마다 다시 검사해야 한다.

import dns from "node:dns/promises";
import net from "node:net";

export const TIMEOUT_MS = 8000; // 한 번 가져오는 데 최대 8초
export const MAX_BYTES = 2_000_000; // 2MB 넘으면 끊는다
const MAX_HOPS = 3; // 리다이렉트 3번까지
const UA = "CaffeineColor-Diagnose/1.0 (+https://caffeinecolor.kr)";

/** 사설·예약 대역이면 true — 여기로 가는 요청은 막는다. */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const p = ip.split(".").map(Number);
    if (p[0] === 10) return true;
    if (p[0] === 127) return true;
    if (p[0] === 0) return true;
    if (p[0] === 169 && p[1] === 254) return true; // 링크로컬 · 클라우드 메타데이터
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true; // 통신사 CGNAT
    if (p[0] >= 224) return true; // 멀티캐스트 이상
    return false;
  }
  const s = ip.toLowerCase();
  if (s === "::1" || s === "::") return true;
  if (s.startsWith("fe80") || s.startsWith("fc") || s.startsWith("fd")) return true;
  if (s.startsWith("::ffff:")) return isPrivateIp(s.slice(7)); // IPv4 매핑 주소
  return false;
}

/** 도메인이 가리키는 주소가 «전부» 바깥인지 확인한다. 하나라도 내부면 막는다. */
async function assertPublic(hostname: string): Promise<void> {
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("내부망 주소로는 진단할 수 없습니다");
    return;
  }
  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error("도메인을 찾을 수 없습니다");
  }
  if (!addrs.length) throw new Error("도메인을 찾을 수 없습니다");
  for (const a of addrs) {
    if (isPrivateIp(a.address)) throw new Error("내부망 주소로는 진단할 수 없습니다");
  }
}

// 눈에 안 보이는 문자들 — 폭 없는 공백 3종 · BOM · 줄바꿈 없는 공백.
// 코드포인트를 «숫자로» 적는다. 소스에 글자 그대로 넣으면 보이지 않아서,
// 나중에 편집하다 지워져도 아무도 눈치채지 못한다.
const INVISIBLE = new RegExp(
  `[${[0x200b, 0x200c, 0x200d, 0xfeff, 0x00a0].map((c) => String.fromCharCode(c)).join("")}]`,
  "g",
);

/** 사람이 붙여넣는 주소에는 눈에 안 보이는 문자가 섞여 온다. 그걸 털어낸다. */
export function normalize(input: string): URL {
  let u = String(input || "")
    .replace(INVISIBLE, "")
    .replace(/^["'<\s]+|["'>\s]+$/g, "");
  if (!u) throw new Error("주소를 입력해 주세요");
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;

  let url: URL;
  try {
    url = new URL(u);
  } catch {
    throw new Error("주소 형식을 확인해 주세요");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("http 또는 https 주소만 진단할 수 있습니다");
  }
  url.hash = "";
  return url;
}

export type FetchResult = {
  ok: boolean;
  status: number;
  url: string;
  type?: string;
  body: string;
  error?: string;
  /** 응답 헤더 몇 개. `X-Robots-Tag` 로도 noindex 를 걸 수 있어서 본문만 봐서는 놓친다. */
  headers?: Record<string, string>;
  /** 리다이렉트를 몇 번 거쳤나. 많으면 로봇이 도중에 포기한다. */
  hops?: number;
  /** 본문을 받는 데 걸린 밀리초. */
  ms?: number;
};

export async function safeFetch(
  rawUrl: string | URL,
  opts: { accept?: string } = {},
): Promise<FetchResult> {
  let url = typeof rawUrl === "string" ? normalize(rawUrl) : rawUrl;
  const started = Date.now();

  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    await assertPublic(url.hostname); // 매 단계마다 다시 본다

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url.href, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "User-Agent": UA, Accept: opts.accept || "*/*" },
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { ok: false, status: res.status, url: url.href, body: "" };
      url = new URL(loc, url.href);
      continue;
    }

    // 본문을 조각씩 읽으면서 상한을 넘으면 끊는다.
    // 통째로 받으면 거대한 파일 하나로 서버가 멎을 수 있다.
    let body = "";
    if (res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder("utf-8");
      let got = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        got += value.length;
        body += dec.decode(value, { stream: true });
        if (got > MAX_BYTES) {
          try {
            await reader.cancel();
          } catch {
            // 이미 닫힌 경우 — 무시해도 된다
          }
          break;
        }
      }
    } else {
      body = await res.text();
    }

    return {
      ok: res.ok,
      status: res.status,
      url: url.href,
      type: res.headers.get("content-type") || "",
      body,
      headers: {
        "x-robots-tag": res.headers.get("x-robots-tag") || "",
        "content-type": res.headers.get("content-type") || "",
      },
      hops: hop,
      ms: Date.now() - started,
    };
  }

  return { ok: false, status: 0, url: url.href, body: "", error: "리다이렉트가 너무 많습니다" };
}

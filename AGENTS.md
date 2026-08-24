<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# ⛔ 결제 경로 — 개발은 «구독», 종량제는 «손님 몫»만

**2026-08-24 사장님 지시.** 이 규칙은 돈이 걸려 있어 다른 무엇보다 앞선다.

| 무엇을 할 때 | 어디서 나가야 하나 |
| --- | --- |
| **여기서 하는 개발·분석·검수·에이전트 작업** | 사장님의 **Claude Max 구독** 주간 사용량 |
| **손님이 홈페이지에서 AI팩을 만들 때** | 앤트로픽 콘솔의 **API 종량제 잔액** |

## 절대 하지 않는 것

- `ANTHROPIC_API_KEY` · `ANTHROPIC_AUTH_TOKEN` 을 **셸·환경변수·설정 파일에 내보내지 않는다.**
  하나라도 있으면 Claude Code 가 구독이 아니라 **종량제**로 돈다.
- `settings.json` 에 `apiKeyHelper` 를 넣지 않는다.
- **개발용 스크립트에서 앤트로픽 SDK 를 직접 부르지 않는다.** 모델에게 뭘 물어야 하면
  이 대화(구독) 안에서 한다. 2026-08-24 에 그런 찌꺼기(`_작업/판정.mjs`)를 지웠다.

## 반대로, 이것은 «있어야 맞는» 것이다 — 지우면 서비스가 죽는다

- **Vercel 의 `ANTHROPIC_API_KEY`** — 손님이 AI팩을 만들 때 쓰는 열쇠다.
- **`.env.local` 의 `ANTHROPIC_API_KEY`** — 로컬에서 앱을 띄워 볼 때 같은 몫이다.
- **`adapters/` · `app/` · `application/` · `lib/` 의 API 호출** — 그게 손님 몫이다.

## 확인하는 법

```bash
npx tsx 결제경로.mts        # 새는 곳이 있으면 1 로 끝난다
```

## ⚠ 열쇠에 «만료»를 걸지 않는다

2026-07-15 에 만든 열쇠가 **1개월 만료**로 설정돼 있어 8/15 에 죽었다.
그 뒤 **9일 동안** 아무도 몰랐고, 8/20 에 손님 한 분이 두 번 눌러 보고 그냥 갔다.
새 열쇠를 만들 때 만료는 **없음(Never)** 으로 둔다.

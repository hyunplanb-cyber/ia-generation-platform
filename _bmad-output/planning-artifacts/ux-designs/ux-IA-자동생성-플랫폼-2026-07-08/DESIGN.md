---
title: IA 자동생성 플랫폼 DESIGN
status: final
created: 2026-07-08
updated: 2026-07-08
name: IA 자동생성 플랫폼
description: >-
  웹기획자·비전문가 창업자가 메뉴만 입력하면 IA·화면별 기능정의·AI프롬프트·일정을 자동 생성해주는 웹 서비스.
  shadcn/ui + Tailwind 기반이며 본 DESIGN.md는 브랜드 레이어 델타만 정의한다. [ASSUMPTION: UI 시스템은
  shadcn/ui + Next.js + Tailwind로 가정 — 최종 확정은 bmad-architecture]
colors:
  # 기본 배경/표면 — "평범한 느낌" 레퍼런스의 화이트+라이트그레이 어드민 구조를 따름
  background: '#FAFAFA'
  surface: '#FFFFFF'
  sidebar-background: '#FFFFFF'
  border: '#E7E7EA'
  foreground: '#1F2024'
  muted-foreground: '#6B6F76'
  # 브랜드 포인트 컬러 — "포인트 컬러로 가독성 명확하게" 원칙을 인디고-바이올렛으로 구현
  # (레퍼런스의 오렌지-레드 대신, 파스텔 라벤더 베이스와 어울리는 톤으로 합성) [ASSUMPTION]
  primary: '#5B4FE5'
  primary-foreground: '#FFFFFF'
  primary-soft: '#EDE9FE'
  # primary-soft 위에 텍스트로 쓸 때 전용 — primary 원색은 대비 4.79:1로 AA 경계선이라 여유 확보용 [수정: 접근성 검토 반영]
  primary-on-soft: '#4A3DD1'
  # 파스텔 워시 — "컬러감 부드럽게" 레퍼런스에서 채용, 카드 배경/보조 태그 전용
  pastel-mint: '#DFF5EC'
  pastel-mint-foreground: '#0F6B4C'
  pastel-lavender: '#EDE9FE'
  pastel-lavender-foreground: '#4B3FA6'
  pastel-yellow: '#FFF6D9'
  pastel-yellow-foreground: '#8A6D00'
  # 시맨틱 상태색 — 브랜드색과 분리, 화면 리스트의 경고배지 전용
  # [수정: 접근성 검토에서 전경색 대비 미달(success 3.06:1/warning 3.2:1/danger 3.73:1) 발견 —
  #  배경은 유지하고 전경을 AA 4.5:1 이상 확보되도록 어둡게 조정. 최종 확정 전 실측 재검증 필요]
  success: '#0B6B3D'
  success-soft: '#E3F7EC'
  warning: '#8A5A00'
  warning-soft: '#FCEFD6'
  danger: '#B42318'
  danger-soft: '#FBE4E4'
  neutral-badge: '#4B4F56'
  neutral-badge-soft: '#EEEEF0'
  # 다크모드는 MVP 비목표 — 필요 시 Phase 2에서 별도 정의 [ASSUMPTION]
typography:
  display:
    fontFamily: 'Pretendard'
    fontSize: '28px'
    fontWeight: '700'
    lineHeight: '1.3'
  display-sm:
    fontFamily: 'Pretendard'
    fontSize: '20px'
    fontWeight: '600'
    lineHeight: '1.35'
  body:
    fontFamily: 'Pretendard'
    fontSize: '14px'
    fontWeight: '400'
    lineHeight: '1.55'
  label:
    fontFamily: 'Pretendard'
    fontSize: '12px'
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0.02em'
  code:
    fontFamily: 'JetBrains Mono, ui-monospace'
    fontSize: '13px'
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: '6px'
  md: '10px'
  lg: '16px'
  full: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '6': '24px'
  '8': '32px'
  gutter: '24px'
  sidebar-width: '240px'
components:
  button-primary:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.md}'
  status-badge:
    radius: '{rounded.full}'
    variants:
      success: { background: '{colors.success-soft}', foreground: '{colors.success}' }
      warning: { background: '{colors.warning-soft}', foreground: '{colors.warning}' }
      danger: { background: '{colors.danger-soft}', foreground: '{colors.danger}' }
      neutral: { background: '{colors.neutral-badge-soft}', foreground: '{colors.neutral-badge}' }
  page-id-cell:
    fontFamily: '{typography.code.fontFamily}'
    background: '{colors.pastel-lavender}'
    foreground: '{colors.pastel-lavender-foreground}'
    radius: '{rounded.sm}'
  summary-card:
    background: '{colors.pastel-mint}'
    radius: '{rounded.lg}'
    border: 'none'
  sidebar-nav-item-active:
    background: '{colors.primary-soft}'
    foreground: '{colors.primary-on-soft}'
    radius: '{rounded.md}'
  page-id-selector:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.sm}'
    focusRing: '{colors.primary}'
    optionActiveBackground: '{colors.primary-soft}'
    optionActiveForeground: '{colors.primary-on-soft}'
  advanced-settings-panel:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.md}'
    toggleIconRotation: '90deg'
  feedback-icon-button:
    size: '32px'
    idleForeground: '{colors.muted-foreground}'
    activeForeground: '{colors.primary}'
    radius: '{rounded.sm}'
---

## Brand & Style

이 제품은 화려함보다 **신뢰**가 먼저인 도구다. 사용자는 프로젝트 산출물(견적·클라이언트 보고용 엑셀)을 이 화면에서 만들어 가지고 나가야 하므로, 표면은 "평범하고 예측 가능한 어드민"으로 두어 학습비용을 없앤다. 그 위에 두 겹의 표현을 얹는다: 대시보드·요약 영역에는 파스텔 워시(민트·라벤더·옐로우)로 "부드러운" 온기를 주고, 실제 작업 표면인 화면 리스트에서는 상태배지·페이지ID에만 선명한 포인트 컬러를 써서 "한눈에 읽히게" 한다. 장식은 파스텔 워시 안에서만 허용되고, 데이터가 밀집한 표 영역은 철저히 절제한다.

## Colors

- **Primary Indigo (`#5B4FE5`)** — 주요 액션 버튼([실행: IA 생성], 저장, 다운로드), 활성 내비게이션, 링크. 레퍼런스 `imports/포인트 컬러로 가독성 명확하게.jpg`의 "명확한 포인트 컬러" 원칙을 반영하되, 그 이미지의 오렌지-레드 대신 파스텔 라벤더와 같은 색상군으로 묶어 톤 충돌을 피했다. `primary-on-soft`는 파스텔/soft 배경 위에 텍스트로 쓸 때 전용(사이드바 활성 아이템 등) — 원색 `primary`보다 어둡게 잡아 대비 여유를 확보한다.
- **파스텔 워시 3종(mint/lavender/yellow)** — `imports/컬러감부드럽게.jpg`(민트-라벤더 그라데이션, 둥근 카드)에서 채용. 대시보드 요약 카드, 태그성 정보(예: 메뉴 카테고리 라벨) 배경 전용. **상태 경고에는 절대 사용하지 않는다** — 상태는 시맨틱 컬러의 몫.
- **레이아웃/구조 기준** — `imports/평범한 느낌.jpg`(화이트+라이트그레이 배경, 좌측 아이콘 사이드바, 카드+차트+테이블 어드민)를 구조적 기준으로 삼는다. 색상 팔레트 자체는 이 레퍼런스를 따르지 않고, 위 두 레퍼런스에서 합성한 색을 얹는다.
- **시맨틱 상태색(success/warning/danger)** — 화면 리스트의 배지 전용: 정상=success, 범위이탈·역전 일정·격리된 화면·방식 혼재=warning, 깨진 링크=danger. 브랜드색(Primary)과 절대 겹치지 않게 분리해, "이건 액션 버튼", "이건 경고"가 색만으로도 구분되게 한다. 전경색은 배경(`-soft`) 대비 WCAG AA 4.5:1 이상을 목표로 어둡게 잡았다(`[NOTE] 실제 렌더링 폰트/두께 기준 실측 재검증 필요`).
- **중립(neutral-badge)** — "자동생성됨/수정됨" 같은 사실 전달용 라벨. 경고가 아님을 명확히 하기 위해 회색 계열만 사용.

Avoid: 파스텔 워시를 경고/에러에 사용, 시맨틱 컬러를 장식적으로 사용, 브랜드색을 3개 이상으로 늘리는 것.

## Typography

Pretendard(한국어 가변폭 산세리프)를 전체 UI 기본으로 쓴다 `[ASSUMPTION: 한국어 SaaS에서 널리 검증된 선택 — 실제 라이선스/웹폰트 적용은 Architecture 단계 확인]`. 예외는 하나뿐이다: **페이지ID·요구사항ID 같은 코드성 데이터는 `{typography.code}`(모노스페이스)로 표시**해 자릿수·패턴이 한눈에 비교되게 한다(스프레드시트형 화면 리스트에서 특히 중요). `display`는 대시보드/프로젝트 헤더에, `label`은 표 헤더·폼 라벨에 쓴다.

## Layout & Spacing

Tailwind 4px 스케일 상속. 데스크톱 우선(`≥ lg`, 1024px+)이 1차 타겟이며, 화면 리스트 표는 좌우 스크롤을 허용하는 와이드 테이블로 설계한다(Drift류 "표 아님" 원칙과 반대 — 이 제품은 명백히 스프레드시트형 도구). 사이드바(GNB 하위 내비 아님, 프로젝트 내 서브내비)는 `lg+`에서 고정 `{spacing.sidebar-width}`(240px), 그 이하에서는 아이콘 전용으로 축소.

## Elevation & Depth

그림자는 최소한으로: 카드(요약/파스텔 워시)에만 낮은 그림자(hover 시 소폭 상승), 표 영역은 그림자 없이 보더(`{colors.border}`)로만 구분한다. 모달/사이드패널은 중간 그림자로 표면 위에 뜬 느낌을 준다.

## Shapes

`rounded.sm`(6px)은 인풋·표 셀·페이지ID 태그, `rounded.md`(10px)는 버튼·카드·사이드바 활성 아이템, `rounded.lg`(16px)는 대시보드 요약 카드·다이얼로그, `rounded.full`은 상태배지 전용 — 파스텔 레퍼런스의 "둥근 필배지" 느낌을 상태배지에만 살린다.

## Components

- **Button (primary)** — `{colors.primary}` 배경, `{rounded.md}`. secondary/outline/ghost/destructive는 shadcn 기본 상속.
- **Status badge** — pill 모양(`{rounded.full}`), success/warning/danger/neutral 4종. 색만이 아니라 항상 짧은 텍스트 라벨(예: "깨진 링크")을 동반한다(접근성).
- **Page ID cell** — 모노스페이스, 라벤더 워시 배경의 태그형 셀. 화면 리스트 표에서 시각적으로 즉시 식별되게 한다.
- **Summary card** — 대시보드의 프로젝트 카드/통계 카드. 파스텔 워시 3색을 순환 배정(민트→라벤더→옐로우)해 여러 카드가 나열될 때 리듬을 준다.
- **Sidebar nav item (active)** — `{colors.primary-soft}` 배경 + `{colors.primary-on-soft}` 텍스트(원색 `primary`보다 어둡게, 대비 여유 확보).
- **Page ID selector** — 페이지ID 드롭다운/콤보박스. 화이트 표면 + 보더, 포커스 시 `{colors.primary}` 링. 옵션 목록에서 키보드로 강조된 항목은 `{colors.primary-soft}` 배경 + `{colors.primary-on-soft}` 텍스트(사이드바 활성 아이템과 동일 규칙). `page-id-cell`(표 셀 표시용)과는 별개 컴포넌트.
- **Advanced settings panel** — 아코디언형. 접힌/펼침 상태를 아이콘 90도 회전으로 표현, 배경/보더는 일반 카드와 동일.
- **Feedback icon button** — AI프롬프트 👍/👎. 최소 32px 정사각 히트영역(밀집한 표 행 안에서도 오조작 방지), 비활성 시 `{colors.muted-foreground}`, 선택 시 `{colors.primary}`.

## Do's and Don'ts

| Do | Don't |
|---|---|
| 파스텔 워시는 요약/대시보드 영역에만 | 파스텔 워시를 경고/에러 배지에 사용 |
| 상태배지는 색+텍스트 라벨 병행 | 색상만으로 상태 구분 |
| 페이지ID는 항상 모노스페이스 | 페이지ID를 본문 폰트로 표시해 숫자열 비교를 어렵게 함 |
| 브랜드색(Primary)은 액션에만 | Primary를 장식이나 상태 표시에 사용 |
| 표 영역은 보더로만 구분, 그림자 최소화 | 표 셀마다 그림자·색배경을 남발해 데이터 밀도를 해침 |

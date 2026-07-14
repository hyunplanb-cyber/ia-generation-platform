---
date: 2026-07-13
status: approved
scope: minor
---

# Sprint Change Proposal — AI프롬프트 생성 방식 앞당김 (FR-12)

## 1. 이슈 요약

Epic 2 진행 중, 사용자가 산출물(메뉴구조/IA/페이지정의서/화면생성프롬프트/화면목록/관리자페이지목록/기능명세초안)을 더 풍성하게 확장하고 싶다는 요청을 계기로, PM(존)·아키텍트(위스턴)·UX(샐리)·애널리스트(메리) 논의를 진행했다. 이 과정에서 "화면 생성용 프롬프트"(FR-12)가 원래 MVP는 규칙기반 템플릿, Phase 2에 LLM API 연동으로 고도화하는 2단계 계획이었는데, 실제 Claude API(`claude-haiku-4-5`) 가격표를 확인한 결과 **프로젝트당 원가가 100~300원 수준**(거의 무시할 수준)으로 나타났다. 굳이 저품질 템플릿을 먼저 구현했다가 나중에 전면 교체할 이유가 없다는 결론에 도달했고, 사용자가 이 변경을 승인했다("당겨서 진행해줘").

## 2. 영향 분석

- **PRD**: 6장(범위/단계) MVP·Phase 2 행, FR-12, NFR-6에서 "MVP=템플릿/Phase2=LLM" 문구를 "MVP부터 Claude API 실제 생성"으로 정정.
- **Architecture Spine**: `PromptGenerator` 포트의 MVP 어댑터를 `ClaudePromptGenerator`(Claude API 호출)로 확정, 규칙기반 템플릿 어댑터는 만들지 않음. Stack 표에 `@anthropic-ai/sdk` 추가. Deferred 목록에서 "LLM 기반 PromptGenerator 구현 상세" 항목 제거(더 이상 미정 아님) — 남은 미정은 API 실패 시 폴백 전략뿐.
- **Epics**: FR-12 커버리지 문구, Story 3.4(AI프롬프트 확인하고 수정하기) 설명/AC를 Claude API 기준으로 정정.
- **영향받는 스토리**: Story 3.4(직접 영향). Story 3.1(화면 자동생성, 규칙기반 패턴 매칭)은 변경 없음 — 이번 결정은 "화면을 뽑는 로직"이 아니라 "화면별 프롬프트 문장을 짓는 로직"에만 해당.
- **영향받지 않는 것**: 관리자 페이지 목록/페이지 정의서/기능명세초안 확장, 가격 구조(구독 vs 1회성)는 이번 변경에 포함하지 않음 — 사용자가 명시적으로 "시장가 조사 먼저"라고 보류했으므로 별도 결정 대기.
- **기술적 영향**: 새 외부 API 의존성(Anthropic) 추가, `ANTHROPIC_API_KEY` 환경변수 필요(Story 3.4 착수 시 설치·설정). 아직 코드 변경 없음 — Epic 3가 시작 전이라 계획 문서만 수정.

## 3. 권장 접근

**Direct Adjustment**(직접 조정) — 이미 계획 문서(PRD/Architecture/Epics)에 반영 완료. Epic 3는 아직 백로그 상태라 롤백하거나 재작업할 기존 구현이 없다.

## 4. 세부 변경 내역

| 문서 | 변경 |
|---|---|
| `prd.md` §6 | MVP 행에 "AI프롬프트는 Claude API(Haiku 4.5) 기반 실제 LLM 생성" 추가, Phase 2 행에서 AI프롬프트 고도화 항목 제거 |
| `prd.md` FR-12 | 템플릿 예시 문구 삭제, Claude API 호출 방식으로 재기술, API 실패 폴백은 Architecture 단계 결정으로 명시 |
| `prd.md` NFR-6 | "LLM API 연동(Phase 2)" → 삭제(더 이상 Phase 2 항목 아님) |
| `ARCHITECTURE-SPINE.md` Design Paradigm | `PromptGenerator` 설명을 Claude API 기반으로, 정정 이력 남김 |
| `ARCHITECTURE-SPINE.md` 다이어그램 | `TemplatePromptGenerator`+`LLMPromptGenerator`(Phase 2 점선) → `ClaudePromptGenerator` 단일 노드로 교체 |
| `ARCHITECTURE-SPINE.md` Stack | `@anthropic-ai/sdk` 행 추가(모델·설치 시점 명시) |
| `ARCHITECTURE-SPINE.md` Capability Map | FR-12/FR-20 행 갱신 |
| `ARCHITECTURE-SPINE.md` Deferred | "LLM 기반 PromptGenerator 구현 상세" 항목 제거, 남은 미정(API 폴백 전략)만 명시 |
| `epics.md` FR Coverage Map | FR-12 두 곳 정정 |
| `epics.md` Additional Requirements | 스택 목록에 `@anthropic-ai/sdk` 추가 |
| `epics.md` Story 3.4 | 설명/AC를 Claude API 기준으로 정정 |

## 5. 구현 핸드오프

**분류: Minor.** 계획 문서 수정만 완료된 상태이며, 실제 코드 구현은 Epic 3 Story 3.1(화면 자동생성)이 끝난 뒤 Story 3.4를 만들 때 `bmad-create-story`가 이 정정된 계획을 그대로 반영해 스토리 컨텍스트를 생성한다. 별도 재작업이나 롤백 대상 없음 — Developer(Amelia) 에이전트가 Story 3.4 착수 시 직접 구현.

**성공 기준**: Story 3.4 생성 시 Dev Notes에 "Claude API(claude-haiku-4-5) 호출, 폴백 전략 결정 필요"가 반영되어 있는지 확인.

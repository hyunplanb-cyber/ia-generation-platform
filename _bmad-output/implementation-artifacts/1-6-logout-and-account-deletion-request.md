---
baseline_commit: e43cbae6e217ecfecca77302bea0bea27149eb7b
---

# Story 1.6: 계정 설정에서 로그아웃하고 탈퇴 요청하기

Status: review

## Story

As a 로그인한 사용자,
I want 로그아웃하거나 계정을 탈퇴 요청하기를,
so that 더 이상 서비스를 쓰지 않을 때 내 데이터를 정리할 수 있다.

## Acceptance Criteria

1. **Given** 로그인한 사용자 **When** 프로필 메뉴에서 로그아웃을 선택하면 **Then** 세션이 종료되고 로그인 화면으로 이동한다.
2. **Given** 계정 설정에서 "계정 탈퇴"를 요청함 **When** 탈퇴를 확정하면 **Then** 계정과 프로젝트가 즉시 삭제되지 않고 30일 유예 상태(`deleted_at` 기록)로 전환되며, "계정이 N일 후 삭제됩니다. 프로젝트를 내보내 두세요." 안내와 함께 엑셀 다운로드 바로가기가 보인다(FR-18).

## Tasks / Subtasks

- [x] Task 1: `user.deleted_at` 컬럼 추가 (AC: #2)
  - [x] `lib/auth.ts`의 `user.additionalFields`에 `deletedAt: { type: 'date', required: false, input: false }` 추가(Story 1.3에서 `plan`을 추가했던 것과 동일한 패턴)
  - [x] `npx auth@latest generate --config lib/auth.ts -y` 실행 후 생성된 `user` 테이블 정의를 `db/schema.ts`에 수동 반영, 루트에 생긴 `auth-schema.ts`는 삭제(반복되는 이 프로젝트의 알려진 이슈)
  - [x] `npx drizzle-kit generate` → `npx drizzle-kit migrate`로 Neon에 적용

- [x] Task 2: 로그아웃 리다이렉트 수정 (AC: #1)
  - [x] `components/profile-menu.tsx`의 로그아웃 핸들러를 `await authClient.signOut()` 후 `router.push("/login")`으로 수정(기존엔 세션은 지워지지만 화면 이동이 없었던 알려진 갭 — Story 1.4/1.5 Dev Notes에서 "이번 스토리 범위 밖"으로 미뤄뒀던 것을 여기서 처리)

- [x] Task 3: Repository/Application — 계정 탈퇴 요청·취소 (AC: #2)
  - [x] `domain/ports/project-repository.ts`에 `softDeleteAllByOwner(ownerId, deletedAt): Promise<void>`, `restoreAllByOwner(ownerId): Promise<void>` 추가(현재 시스템에서 `project.deleted_at`을 설정하는 유일한 경로가 이 계정탈퇴 플로우이므로, 취소 시 전부 원복해도 안전함 — 별도의 개별 프로젝트 소프트삭제 기능이 생기면 이 가정을 재검토해야 함)
  - [x] `adapters/repository/drizzle/project-repository.ts`에 두 메서드 구현
  - [x] `application/request-account-deletion.ts` — `requireSession()` → `db.update(user).set({ deletedAt: now }).where(eq(user.id, session.user.id))` + `drizzleProjectRepository.softDeleteAllByOwner(session.user.id, now)`. `application/`은 Drizzle/`db`를 직접 import해도 되므로(AD-1은 `domain/`만 제한) User는 별도 도메인 포트 없이 여기서 직접 처리(이미 Better Auth가 `user` 테이블의 생명주기를 관장하고 있어 지금까지 이 프로젝트에 User 도메인/포트가 없었던 것과 같은 이유)
  - [x] `application/cancel-account-deletion.ts` — 위와 대칭: `deletedAt`을 `null`로 되돌림 + `restoreAllByOwner`

- [x] Task 4: 계정 설정 화면 (AC: #2)
  - [x] `app/(app)/account/page.tsx` — 이름/이메일 표시(읽기전용, 수정 기능은 이번 스토리 범위 밖), 탈퇴 유예 중이 아니면 "계정 탈퇴" 버튼(확인 다이얼로그: "계정과 모든 프로젝트가 30일 후 삭제돼요. 그 전에 취소할 수 있어요."), 유예 중이면 "계정이 N일 후 삭제됩니다. 프로젝트를 내보내 두세요." 안내 + "탈퇴 취소" 버튼
  - [x] "엑셀 다운로드 바로가기"는 실제 내보내기 기능(Epic 4)이 아직 없으므로 `disabled` 버튼으로 자리만 확보하고 "Epic 4에서 지원 예정"임을 옆에 명시(작동하지 않는 기능을 작동하는 것처럼 보이게 하지 않는다)
  - [x] `app/(app)/account/actions.ts` — `'use server'` `requestAccountDeletionAction`/`cancelAccountDeletionAction`, 처리 후 `/account`로 redirect
  - [x] `app/(app)/layout.tsx`에 탈퇴 유예 배너 추가 — `requireSession()`으로 `session.user.deletedAt`을 확인해 설정돼 있으면 로그인 중 모든 화면 상단에 동일 안내 배너 표시(EXPERIENCE.md: "로그인 시 배너")

- [x] Task 5: 검증 (AC: #1, #2)
  - [x] 로그인 후 프로필 메뉴 "로그아웃" → `/login`으로 실제 이동하는지 확인(리다이렉트 갭 해결 확인)
  - [x] "계정 설정" → "계정 탈퇴" → 확인 → Neon에서 `user.deleted_at`과 해당 계정의 모든 `project.deleted_at`이 채워졌는지 확인
  - [x] 탈퇴 요청 후 `/dashboard` 등 다른 화면에서도 유예 배너가 뜨는지 확인
  - [x] "탈퇴 취소" → `user.deleted_at`/`project.deleted_at`이 다시 `null`로 돌아오는지 확인, 배너가 사라지는지 확인
  - [x] `npm run build`, `npm run lint`, `npm run depcruise` 통과
  - [x] 검증에 사용한 테스트 계정/프로젝트 데이터 정리

## Dev Notes

- **30일 경과 후 실제 영구 삭제(배치/크론)는 이번 스토리 범위 밖이다** — 이 프로젝트엔 아직 스케줄드 잡 인프라가 없고, PRD/Epic 어디에도 자동 영구삭제 잡을 만들라는 요구가 없다. 이번 스토리는 "유예 상태로 전환 + 안내"까지만 다룬다.
- **탈퇴는 즉시 로그아웃시키지 않는다** — EXPERIENCE.md가 "로그인 시 배너"라고 명시한 것 자체가 유예 기간 중에도 정상 로그인/이용이 가능함을 전제한다.
- **"탈퇴 취소" 기능은 AC에 명시적으로 없지만 이번 스토리에 포함한다** — "유예(30일)"라는 개념 자체가 되돌릴 수 있음을 전제하는데, 취소 경로가 없으면 실수로 탈퇴를 누른 사용자가 30일간 되돌릴 방법이 없는 반쪽짜리 기능이 된다. 시스템이 실제로 끝까지 동작하려면 필요한 최소 보완으로 판단해 추가.
- User는 Better Auth가 스키마 생명주기를 관장하므로 이번에도 Story 1.3의 `plan` 필드와 동일하게 `additionalFields`로 확장한다 — 별도 `domain/user/` 포트를 새로 만들지 않는다(지금까지 이 프로젝트에 User 도메인 계층이 없었던 것과 일관).

### Project Structure Notes

```
{repo-root}/
  lib/auth.ts                      # 수정 — user.additionalFields.deletedAt
  db/schema.ts                     # 수정 — user.deletedAt 컬럼
  domain/ports/project-repository.ts  # 수정 — softDeleteAllByOwner/restoreAllByOwner
  adapters/repository/drizzle/project-repository.ts  # 수정
  application/
    request-account-deletion.ts     # 신규
    cancel-account-deletion.ts      # 신규
  components/profile-menu.tsx      # 수정 — 로그아웃 리다이렉트
  app/(app)/
    layout.tsx                      # 수정 — 유예 배너
    account/
      page.tsx                       # 신규
      actions.ts                      # 신규
```

### References

- [Source: epics.md#Story 1.6]
- [Source: PRD#FR-18] — 30일 유예 규칙
- [Source: EXPERIENCE.md#State Patterns] — "계정 삭제 유예 중" 배너 문구
- [Source: 1-3-signup-and-login.md] — `additionalFields` + `auth generate` 패턴
- [Source: 1-4-create-project.md] — `project.deleted_at` 컬럼이 이미 이 목적으로 준비돼 있었음

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npx auth@latest generate --config lib/auth.ts -y` → `user.deletedAt` 컬럼이 생성된 `auth-schema.ts`에 나타남, 내용을 `db/schema.ts`로 옮기고 루트 파일 삭제(Story 1.1/1.3와 동일한 반복 이슈)
- `npx drizzle-kit generate` → `drizzle/0003_eager_expediter.sql`(`ALTER TABLE "user" ADD COLUMN "deleted_at" timestamp;`) 생성, `npx drizzle-kit migrate`로 Neon 적용
- `npm run build`/`npm run lint`/`npm run depcruise` 모두 통과. 참고로 `app/(app)/layout.tsx`가 `requireSession()`을 호출하도록 바뀌면서 `/dashboard/new` 라우트가 정적(○)에서 동적(ƒ)으로 바뀌었음 — 공유 레이아웃이 인증 체크를 하면서 하위 라우트가 정적으로 프리렌더될 수 없게 된 자연스러운 결과(회귀 아님)
- **실측 중 실제 버그 발견 및 수정**: 계정 탈퇴 후 "탈퇴 취소"를 눌러도 `/account` 페이지 본문은 취소된 상태로 정확히 갱신됐지만, 공유 레이아웃(`app/(app)/layout.tsx`)의 유예 배너는 그대로 남아있었음 — Next.js가 동일 세그먼트로의 Server Action 리다이렉트에서 레이아웃을 재사용(캐시)하기 때문. `app/(app)/account/actions.ts`의 두 액션에 `revalidatePath("/", "layout")`을 추가해 해결, 재검증으로 배너가 정확히 사라짐을 확인
- 브라우저 실측: 신규 계정 가입 → 로그아웃 → `/login`으로 실제 이동 확인(기존엔 세션만 지워지고 이동이 없었던 갭) → 재로그인 → "계정 탈퇴" → 확인 다이얼로그 통과 → `/account`와 `/dashboard` 양쪽에 "계정이 30일 후 삭제됩니다" 배너 확인 → Neon에서 `user.deleted_at` 채워짐 확인 → "탈퇴 취소" → 배너 소멸, `user.deleted_at`/`project.deleted_at` 모두 `null`로 복원 확인
- 검증에 사용한 테스트 계정은 Neon에서 직접 삭제해 정리 완료

### Completion Notes List

- Epic 1의 마지막 스토리 — Story 1.1~1.6이 모두 review 상태로 완료됨.
- `user.deletedAt`은 Story 1.3의 `plan` 필드와 동일하게 Better Auth `additionalFields`로 확장 — 별도 User 도메인/포트를 신설하지 않음(이 프로젝트에서 User는 Better Auth가 전담).
- AC에 명시되지 않은 "탈퇴 취소" 기능을 추가함 — "30일 유예"가 되돌릴 수 있음을 전제하는 개념인데 취소 경로가 없으면 실수로 탈퇴를 누른 사용자가 영영 되돌릴 수 없는 반쪽짜리 기능이 되므로, 시스템이 끝까지 제대로 동작하기 위한 최소 보완으로 판단해 포함(Dev Notes에 근거 기록).
- "엑셀 다운로드 바로가기"는 Epic 4가 아직 없어 `disabled` 버튼 + "Epic 4에서 지원 예정" 라벨로 자리만 확보 — 작동하지 않는 기능을 작동하는 것처럼 보이게 하지 않기 위한 의도적 선택.
- 30일 경과 후 실제 영구 삭제(배치/크론)는 스케줄드 잡 인프라가 없어 이번 스토리에서 구현하지 않음 — "유예 상태 전환 + 안내"까지만 범위.

### File List

- `lib/auth.ts` (수정 — `user.additionalFields.deletedAt`)
- `db/schema.ts` (수정 — `user.deletedAt` 컬럼)
- `drizzle/0003_eager_expediter.sql` (신규 — 마이그레이션)
- `components/profile-menu.tsx` (수정 — 로그아웃 후 `/login` redirect)
- `domain/ports/project-repository.ts` (수정 — `softDeleteAllByOwner`/`restoreAllByOwner`)
- `adapters/repository/drizzle/project-repository.ts` (수정)
- `application/request-account-deletion.ts` (신규)
- `application/cancel-account-deletion.ts` (신규)
- `lib/account-deletion.ts` (신규 — `daysUntilAccountDeletion` 헬퍼)
- `app/(app)/layout.tsx` (수정 — 유예 배너)
- `app/(app)/account/page.tsx` (신규)
- `app/(app)/account/actions.ts` (신규)
- `app/(app)/account/delete-account-button.tsx` (신규)

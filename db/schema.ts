import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  uuid,
  date,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  plan: text("plan").default("free"),
  // FR-18: 계정 탈퇴 요청 시각. 채워지면 30일 유예 상태.
  deletedAt: timestamp("deleted_at"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const project = pgTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    concept: text("concept").notNull(),
    // 메뉴 관리(Epic 2)가 생기기 전까지의 임시 자유입력 — 프로젝트 생성 시점의 참고용 메모.
    menuDraft: text("menu_draft"),
    // 원하는 분위기/스타일에 대한 텍스트 설명. 이미지 업로드+AI 무드 분석은 추후 지원.
    designConcept: text("design_concept"),
    // 디자인 프리셋 상세 설정(JSON): { style, primary, font, radius, density, dark }
    presetConfig: text("preset_config"),
    // 프리셋 md 다운로드를 처음 결제한 시각(있으면 같은 내용 재다운로드는 무료)
    presetDownloadedAt: timestamp("preset_downloaded_at"),
    // 마지막으로 결제하고 받은 프리셋 설정. 지금 설정과 다르면 '수정본'이다.
    //
    // 프리셋은 프로젝트에 묶이지 않는 파일이라, 한 번 받으면 다른 프로젝트에 그대로
    // 넣어 쓸 수 있다. 그래서 고쳐서 다시 받는 건 값을 받되(처음보다 싸게) 횟수를 둔다.
    // 고치지 않고 그대로 다시 받는 건 계속 무료다 — 산 것을 잃지 않게(2026-08-04).
    presetDownloadedConfig: text("preset_downloaded_config"),
    // 수정본을 몇 번 받았나(PRESET_REVISION_LIMIT까지).
    presetRevisions: integer("preset_revisions").default(0).notNull(),
    overallStart: date("overall_start").notNull(),
    overallEnd: date("overall_end").notNull(),
    deviceMode: text("device_mode").default("responsive").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    // FR-18(계정 삭제 30일 유예)을 위한 컬럼. 실제 소프트삭제 로직은 Story 1.6에서 구현.
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("project_ownerId_idx").on(table.ownerId)],
);

export const menu = pgTable(
  "menu",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    nameKo: text("name_ko").notNull(),
    nameEn: text("name_en").notNull(),
    menuCode: text("menu_code").notNull(),
    description: text("description"),
    desiredFeatures: text("desired_features"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    // 메뉴 삭제 = 소프트 삭제(Story 3.7) — screen.menu_id FK를 건드리지 않기 위해
    // project.deletedAt과 같은 패턴을 쓴다. listByProject()가 이 값이 null인 것만 반환한다.
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("menu_projectId_idx").on(table.projectId),
    uniqueIndex("menu_project_menu_code_idx").on(table.projectId, table.menuCode),
  ],
);

export const screen = pgTable(
  "screen",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    menuId: uuid("menu_id")
      .notNull()
      .references(() => menu.id, { onDelete: "cascade" }),
    pageId: text("page_id").notNull(),
    pageName: text("page_name").notNull(),
    // 상세 IA(3뎁스): 이 화면이 속한 2뎁스 화면 그룹명. 기본 생성은 null(2뎁스).
    // 상세 생성에선 screenGroup=2뎁스 화면, pageName=3뎁스 상태·탭.
    screenGroup: text("screen_group"),
    // 'active' | 'quarantined' — 격리는 Story 3.7
    status: text("status").default("active").notNull(),
    // 재실행 매칭키(AD-3), 예: list/detail/create/done — Story 3.6이 사용
    screenRole: text("screen_role").notNull(),
    // 'PC' | 'MO' — 반응형 프로젝트는 전부 'PC'
    deviceCode: text("device_code").notNull(),
    // 화면기능정의(Story 3.3), AI프롬프트(Story 3.4) — 지금은 채우지 않음
    funcDef: text("func_def"),
    prompt: text("prompt"),
    // 'auto' | 'manual' — AD-5, 필드 그룹별 자동/수동 추적
    pageIdSource: text("page_id_source").default("auto").notNull(),
    pageNameSource: text("page_name_source").default("auto").notNull(),
    funcDefSource: text("func_def_source").default("auto").notNull(),
    promptSource: text("prompt_source").default("auto").notNull(),
    // Story 3.5가 채움
    scheduleStart: date("schedule_start"),
    scheduleEnd: date("schedule_end"),
    scheduleLocked: boolean("schedule_locked").default(false).notNull(),
    // 'up' | 'down' | null — Story 3.8
    promptFeedback: text("prompt_feedback"),
    // 다운로드할 때 오푸스가 이 화면의 기능정의·프롬프트를 다시 쓴 시각.
    // 화면 단위로 남기는 이유: 한 묶음이 실패해도 나머지는 이미 끝난 것으로 남고,
    // 다시 받을 때 끝난 화면에 또 돈을 쓰지 않는다(뼈대는 절대 안 건드린다).
    enrichedAt: timestamp("enriched_at"),
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
    // precision: 3(밀리초)로 고정 — JS Date는 밀리초 정밀도까지만 표현하므로,
    // 컬럼이 마이크로초 정밀도를 유지하면 AD-9 낙관적 동시성 비교(updated_at 완전 일치)가
    // 클라이언트 왕복 후 항상 불일치로 깨진다.
    updatedAt: timestamp("updated_at", { precision: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("screen_projectId_idx").on(table.projectId),
    index("screen_menuId_idx").on(table.menuId),
    uniqueIndex("screen_project_page_id_idx").on(table.projectId, table.pageId),
  ],
);

export const buttonAction = pgTable(
  "button_action",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    screenId: uuid("screen_id")
      .notNull()
      .references(() => screen.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    // onDelete 지정 안 함(기본 RESTRICT) — AD-3: 참조가 남아있는 화면은 하드 삭제를 막아야 한다
    targetScreenId: uuid("target_screen_id")
      .notNull()
      .references(() => screen.id),
    // 연결 확정 시점의 대상 page_id 스냅샷(AD-4) — 대상의 page_id가 나중에 바뀌면
    // 이 값과 비교해 "연결 대상 이름이 바뀌었어요" 경고를 파생 계산한다
    targetPageIdSnapshot: text("target_page_id_snapshot").notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("button_action_screenId_idx").on(table.screenId),
    index("button_action_targetScreenId_idx").on(table.targetScreenId),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  projects: many(project),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  owner: one(user, {
    fields: [project.ownerId],
    references: [user.id],
  }),
  menus: many(menu),
  screens: many(screen),
}));

export const menuRelations = relations(menu, ({ one, many }) => ({
  project: one(project, {
    fields: [menu.projectId],
    references: [project.id],
  }),
  screens: many(screen),
}));

export const screenRelations = relations(screen, ({ one, many }) => ({
  project: one(project, {
    fields: [screen.projectId],
    references: [project.id],
  }),
  menu: one(menu, {
    fields: [screen.menuId],
    references: [menu.id],
  }),
  buttonActions: many(buttonAction, { relationName: "screenButtonActions" }),
  incomingButtonActions: many(buttonAction, { relationName: "targetButtonActions" }),
}));

export const buttonActionRelations = relations(buttonAction, ({ one }) => ({
  screen: one(screen, {
    fields: [buttonAction.screenId],
    references: [screen.id],
    relationName: "screenButtonActions",
  }),
  targetScreen: one(screen, {
    fields: [buttonAction.targetScreenId],
    references: [screen.id],
    relationName: "targetButtonActions",
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// 유료 플랜 알림 신청 기록.
// 결제 수단이 붙기 전까지 다운로드는 잠겨 있는데, 그때 "열리면 알려달라"고
// 누른 사람을 남긴다. 몇 명이 어느 등급을 원했는지가 가격 산정의 유일한 근거다.
export const planInterest = pgTable(
  "plan_interest",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** 관심을 보인 등급(standard/pro). */
    planId: text("plan_id").notNull(),
    /** 어디서 눌렀는지 — "download"(다운로드 잠금에서 넘어옴) | "billing"(요금제 화면에서 바로) */
    source: text("source").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // 같은 사람이 같은 등급을 여러 번 눌러도 한 번으로 센다(중복 집계 방지).
  (table) => [uniqueIndex("plan_interest_user_plan_idx").on(table.userId, table.planId)],
);

export const planInterestRelations = relations(planInterest, ({ one }) => ({
  user: one(user, {
    fields: [planInterest.userId],
    references: [user.id],
  }),
}));

// 사이트 검수 실행 기록. 무료 횟수 집계 + 결과 저장(내 프로젝트 연동)에 쓴다.
// (better-auth의 verification 테이블과 이름이 겹치지 않게 verify_run으로 둔다.)
export const verifyRun = pgTable(
  "verify_run",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // 프로젝트에 연결된 검수면 그 프로젝트(설계도 대비 검수). 아니면 null(독립 검수).
    projectId: uuid("project_id").references(() => project.id, { onDelete: "set null" }),
    mode: text("mode").notNull(), // "site" | "document"
    target: text("target").notNull(), // URL 또는 파일명
    report: text("report").notNull(), // VerificationReport JSON 문자열
    passCount: integer("pass_count").default(0).notNull(),
    failCount: integer("fail_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("verify_run_user_idx").on(table.userId)],
);

export const verifyRunRelations = relations(verifyRun, ({ one }) => ({
  user: one(user, { fields: [verifyRun.userId], references: [user.id] }),
  project: one(project, { fields: [verifyRun.projectId], references: [project.id] }),
}));

// 크레딧 원장(append-only). 잔액은 이 행들의 amount 합.
// 양수 = 지급/충전, 음수 = 사용. 결제·구독이 아니라 "충전형" 지갑이다.
export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // 양수 = 지급/충전, 음수 = 사용
    amount: integer("amount").notNull(),
    // "free"(가입 무료) | "charge"(충전) | "spend"(사용) | "refund"(환불)
    kind: text("kind").notNull(),
    // 사람이 읽는 설명 — "가입 무료 크레딧", "10,000원 충전", "설계도 생성(상세)"
    memo: text("memo").notNull(),
    // 지급분의 만료 시각(무료 3일·유상 1년). 사용분은 null.
    expiresAt: timestamp("expires_at"),
    // 참조(JSON 문자열): { orderId, paymentKey, projectId } 등
    meta: text("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("credit_ledger_user_idx").on(table.userId)],
);

export const creditLedgerRelations = relations(creditLedger, ({ one }) => ({
  user: one(user, { fields: [creditLedger.userId], references: [user.id] }),
}));

// 크레딧 충전 주문. 토스 결제 금액 검증·중복 지급 방지에 쓴다.
export const creditOrder = pgTable(
  "credit_order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: text("order_id").notNull().unique(), // 토스에 보내는 주문번호
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    packId: text("pack_id").notNull(),
    amountKrw: integer("amount_krw").notNull(),
    credits: integer("credits").notNull(),
    status: text("status").notNull().default("pending"), // pending | paid | failed
    paymentKey: text("payment_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    paidAt: timestamp("paid_at"),
  },
  (table) => [index("credit_order_user_idx").on(table.userId)],
);

export const creditOrderRelations = relations(creditOrder, ({ one }) => ({
  user: one(user, { fields: [creditOrder.userId], references: [user.id] }),
}));

// 프로젝트 산출물 다운로드 잠금 해제 기록. 한 번 열면(크레딧 차감) 그 프로젝트 파일은 계속 무료.
export const downloadUnlock = pgTable(
  "download_unlock",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    creditsSpent: integer("credits_spent").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("download_unlock_user_project_idx").on(table.userId, table.projectId)],
);

export const downloadUnlockRelations = relations(downloadUnlock, ({ one }) => ({
  user: one(user, { fields: [downloadUnlock.userId], references: [user.id] }),
  project: one(project, { fields: [downloadUnlock.projectId], references: [project.id] }),
}));

// 검수 시나리오 다운로드 잠금 해제 기록. 검수 기록(run) 단위로 한 번 열면 계속 무료.
export const verifyDownloadUnlock = pgTable(
  "verify_download_unlock",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verifyRunId: uuid("verify_run_id")
      .notNull()
      .references(() => verifyRun.id, { onDelete: "cascade" }),
    creditsSpent: integer("credits_spent").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("verify_download_unlock_idx").on(table.userId, table.verifyRunId)],
);

export const verifyDownloadUnlockRelations = relations(verifyDownloadUnlock, ({ one }) => ({
  user: one(user, { fields: [verifyDownloadUnlock.userId], references: [user.id] }),
  run: one(verifyRun, { fields: [verifyDownloadUnlock.verifyRunId], references: [verifyRun.id] }),
}));

// AI팩 구매 주문. 크레딧 충전(creditOrder)과 같은 흐름이지만 사는 물건이 다르다 —
// 크레딧은 잔액이 늘고, 이쪽은 그 팩의 zip을 받을 권리가 생긴다.
//
// 크몽은 별개 판로다. 수수료 때문에 값이 다를 수 있고 승인 여부도 우리 손 밖이라,
// 우리 사이트는 "구매하기 → 바로 다운로드"가 되어야 한다(2026-08-03).
export const packOrder = pgTable(
  "pack_order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: text("order_id").notNull().unique(), // 토스에 보내는 주문번호
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    packageId: text("package_id").notNull(), // lib/packages.ts의 PackageDef.id
    planId: text("plan_id").notNull(), // standard | plus | deluxe | premium
    amountKrw: integer("amount_krw").notNull(),
    status: text("status").notNull().default("pending"), // pending | paid | failed
    paymentKey: text("payment_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    paidAt: timestamp("paid_at"),
  },
  (table) => [
    index("pack_order_user_idx").on(table.userId),
    // 산 것을 다시 찾을 때 쓰는 길 — "이 사람이 이 팩을 샀나"를 바로 본다.
    index("pack_order_owned_idx").on(table.userId, table.packageId, table.planId, table.status),
  ],
);

export const packOrderRelations = relations(packOrder, ({ one }) => ({
  user: one(user, { fields: [packOrder.userId], references: [user.id] }),
}));

/* ── SNS 콘텐츠 검수 ─────────────────────────────────────────────────
 *
 * 왜 DB 에 두나 (2026-08-17 사장님 지시)
 *   「루틴에 맞춰서 콘텐츠 작업해서 «검수하는 사이트»를 만들자.
 *    로컬에만 말고 내 아이디만 볼 수 있게 열어줘 — 로컬이 자꾸 막히니까.」
 *
 *   그동안 검수는 «내가 보고서를 써서 알려 드리는» 방식이었다. 그래서 내가 못 본 것은
 *   사장님도 못 보셨고, 유튜브에 올라간 뒤에야 「화면이 짤렸어」를 듣고 세 번 다시 올렸다.
 *   이제 **칸마다 «실제로 나갈 프레임»과 «그 칸 자막»을 나란히** 놓고 사장님이 보신다.
 *
 * ⭐ 굽는 일은 «로컬에 남는다» — 이건 고를 수 있는 게 아니다.
 *   ffmpeg · 헤드리스 크롬 · 11분짜리 녹화본 원본 · 유튜브 인증 토큰이 전부
 *   사장님 컴퓨터에 있다. Vercel 함수는 그것을 못 돌린다. 그래서 이렇게 나눈다:
 *
 *     로컬 루틴  대본 → 자막검사 → 굽기 → 칸별 프레임 → 여기에 「검토 대기」로 넣는다
 *     이 사이트  /admin/sns  자막·캡션을 고치고 「검토 완료」
 *     로컬       승인된 것만 다시 굽고 유튜브(비공개) + G 드라이브
 */
export const snsContent = pgTable(
  "sns_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** 몇 주차인가 — `3주차_2026-08-24` 처럼 드라이브 폴더 이름과 같게 둔다. */
    batch: text("batch").notNull(),
    /** 대본 JSON 의 `이름`. 로컬이 어느 대본인지 찾는 열쇠라 회차 안에서 겹치지 않는다. */
    slug: text("slug").notNull(),
    /** waiting(검토 대기) · approved(검토 완료) · published(올림) · dropped(버림) */
    status: text("status").notNull().default("waiting"),
    verticalTitle: text("vertical_title").notNull(),
    horizontalTitle: text("horizontal_title").notNull(),
    /** 오른쪽 위 작은 태그 — 「반려동물 유치원 편」. 업종 이름은 여기에만 둔다. */
    ep: text("ep").notNull().default(""),
    music: text("music").notNull().default(""),
    /** 자막 한 칸이 몇 초인가. 지금은 1.8. */
    secPerCard: text("sec_per_card").notNull().default("1.8"),
    captionYoutube: text("caption_youtube").notNull().default(""),
    captionInstagram: text("caption_instagram").notNull().default(""),
    hashtags: text("hashtags").notNull().default(""),
    /** 언제 올릴 것인가 — 「3주 목 8/27 09:00」. 사장님이 그 시각에 공개를 누르신다. */
    slotLabel: text("slot_label").notNull().default(""),
    /** `자막검사.mjs` 가 마지막으로 낸 결과. 통과면 빈 문자열. */
    checkResult: text("check_result").notNull().default(""),
    /** 올린 뒤 채운다. 옛 판을 지울 때 이 값으로 찾는다. */
    youtubeVerticalId: text("youtube_vertical_id"),
    youtubeHorizontalId: text("youtube_horizontal_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    approvedAt: timestamp("approved_at"),
    publishedAt: timestamp("published_at"),
  },
  (table) => [uniqueIndex("sns_content_batch_slug_idx").on(table.batch, table.slug)],
);

export const snsCut = pgTable(
  "sns_cut",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => snsContent.id, { onDelete: "cascade" }),
    /** 몇 번째 칸인가 (1부터). */
    ord: integer("ord").notNull(),
    /** 그 칸 자막. 줄 배열을 JSON 으로 담는다 — `["첫 줄", "둘째 줄"]`.
     *  `<span class='o'>…</span>` 같은 표시가 그대로 들어 있다(포인트 색). */
    captionJson: text("caption_json").notNull().default("[]"),
    /** ⭐ **실제로 나갈 프레임** — 구운 세로 영상에서 이 칸 가운데를 뽑아 405px webp 로 줄인 것.
     *  data URI 로 담는다. 20칸 × 25KB 면 한 편에 500KB 다.
     *  이게 있어야 「화면이 잘렸나」와 「자막이 화면과 맞나」를 눈으로 본다. */
    frameDataUri: text("frame_data_uri").notNull().default(""),
    pose: text("pose").notNull().default(""),
    clip: text("clip").notNull().default(""),
    ss: text("ss").notNull().default(""),
    zoom: text("zoom").notNull().default(""),
    /** 로컬이 붙인 메모 — 「이 칸에 무엇이 떠 있나」. 사장님이 자막을 고칠 때 근거가 된다. */
    screenNote: text("screen_note").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("sns_cut_content_ord_idx").on(table.contentId, table.ord)],
);

export const snsContentRelations = relations(snsContent, ({ many }) => ({
  cuts: many(snsCut),
}));

export const snsCutRelations = relations(snsCut, ({ one }) => ({
  content: one(snsContent, { fields: [snsCut.contentId], references: [snsContent.id] }),
}));

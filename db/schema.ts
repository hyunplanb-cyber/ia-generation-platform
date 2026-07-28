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

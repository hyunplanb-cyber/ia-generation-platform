import type { VerificationReport } from "@/domain/verify/report";

export interface VerifyRun {
  id: string;
  userId: string;
  projectId: string | null;
  mode: "site" | "document";
  target: string;
  report: VerificationReport;
  createdAt: Date;
}

export interface CreateVerifyRunInput {
  userId: string;
  projectId: string | null;
  report: VerificationReport;
}

export interface VerifyRunRepository {
  create(input: CreateVerifyRunInput): Promise<VerifyRun>;
  countByUser(userId: string): Promise<number>;
  listByUser(userId: string): Promise<VerifyRun[]>;
  listByProject(projectId: string): Promise<VerifyRun[]>;
  findById(id: string, userId: string): Promise<VerifyRun | null>;
}

import type { Project } from "@/domain/project/project";

export interface IaGeneratorInput {
  concept: string;
  menuDraft: string | null;
  designConcept: string | null;
  deviceMode: Project["deviceMode"];
  // 상세 IA(3뎁스: 화면→상태·탭) 모드. 화면을 상태·탭까지 촘촘히 나눠 100개+로.
  detail?: boolean;
}

export interface GeneratedButtonDraft {
  label: string;
  // 이동 대상 화면의 ref(같은 생성 결과 안의 다른 화면을 가리킴)
  targetRef: string;
}

export interface GeneratedScreenDraft {
  // LLM이 생성 결과 안에서 부여하는 고유 참조 id(버튼 연결 대상 지정에 사용)
  ref: string;
  pageName: string;
  // 상세 IA(3뎁스)의 2뎁스 화면 그룹명(기본 모드는 null)
  screenGroup?: string | null;
  // 재실행 매칭키(AD-3) — list/detail/create/done 등 화면 유형 태그
  screenRole: string;
  // 화면 설명 + 기능정의(샘플 IA의 Description 열에 해당)
  funcDef: string;
  // 이 화면을 AI 코딩 도구로 만들 때 붙여넣을 프롬프트
  prompt: string;
  // 이 화면 안의 버튼과 클릭 시 이동할 화면
  buttons: GeneratedButtonDraft[];
}

export interface GeneratedMenuDraft {
  nameKo: string;
  nameEn: string;
  description: string | null;
  screens: GeneratedScreenDraft[];
}

export interface IaGeneratorOutput {
  menus: GeneratedMenuDraft[];
}

export interface IaGenerator {
  generate(input: IaGeneratorInput): Promise<IaGeneratorOutput>;
}

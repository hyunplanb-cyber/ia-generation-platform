import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PackStorage } from "@/domain/ports/pack-storage";

// 판매 zip은 저장소의 packs/ 폴더에 함께 둔다.
//
// 바깥 저장소(Blob 등)를 쓰지 않는 이유: 지금 파는 8칸을 다 합쳐도 2MB대라,
// 저장소를 하나 더 만들고 토큰을 관리하는 비용이 이득보다 크다.
// 완성 화면이 붙은 등급이 늘어 파일이 커지면 그때 옮긴다(domain/ports/pack-storage.ts).
//
// 파일 이름을 `travel-premium.zip`처럼 영문으로 두는 이유: 배포에 파일을 실어 보낼 때
// 경로를 글로브로 지정하는데(next.config.ts), 한글 경로는 환경에 따라 어긋난다.
// 손님이 받는 이름은 한글 그대로다(packFileName).
const PACKS_DIR = path.join(process.cwd(), "packs");

export const fsPackStorage: PackStorage = {
  async read(key: string): Promise<Uint8Array | null> {
    // 키는 우리가 만든 값이지만, 경로 조작이 끼어들 여지를 원천에서 막는다.
    if (!/^[a-z0-9-]+$/.test(key)) return null;
    try {
      return await readFile(path.join(PACKS_DIR, `${key}.zip`));
    } catch {
      return null;
    }
  },
};

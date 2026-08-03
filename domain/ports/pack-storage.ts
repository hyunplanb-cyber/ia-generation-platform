/**
 * 산 사람에게 내려줄 AI팩 zip을 어디서 가져오는가.
 *
 * 지금은 저장소에 함께 두고 파일로 읽지만(adapters/storage/fs-pack-storage.ts),
 * 완성 화면이 붙은 등급이 늘면 파일이 커진다. 그때 저장소를 바깥(Blob 등)으로
 * 옮기더라도 이 자리만 갈아 끼우면 되도록 통로를 하나로 좁혀 둔다.
 */
export interface PackStorage {
  /** 없으면 null. 키는 `travel-premium` 처럼 업종-등급이다. */
  read(key: string): Promise<Uint8Array | null>;
}

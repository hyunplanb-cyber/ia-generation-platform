"use client";

import Image from "next/image";
import { useState } from "react";

// 마스코트 이미지 슬롯. public/mascot.png 파일을 넣으면 자동으로 표시되고,
// 파일이 없으면(onError) 아무것도 렌더하지 않아 깨진 이미지가 보이지 않는다.
export function MascotImage({ className }: { className?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <Image
      src="/mascot.png"
      alt="플랫폼 마스코트"
      width={200}
      height={200}
      priority
      onError={() => setOk(false)}
      className={className}
    />
  );
}

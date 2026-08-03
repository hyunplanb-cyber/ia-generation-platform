import { fsPackStorage } from "@/adapters/storage/fs-pack-storage";
import { ownsPack, packKey } from "@/application/pack-order";
import { getSession } from "@/lib/session";
import { PACKAGES, packFileName, planOf, type PlanId } from "@/lib/packages";

// 산 사람이 AI팩 zip을 받는 곳.
//
// 크몽이 아니라 여기서 바로 받아야 한다 — 크몽은 별개 판로고, 수수료 때문에 값도
// 다를 수 있으며 승인 여부가 우리 손 밖이다(2026-08-03).
// 판매를 아직 열지 않았어도 이 길은 열어 둔다. 막는 건 화면의 구매 버튼이지
// 이미 낸 사람의 다운로드가 아니다.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ packageId: string; planId: string }> },
) {
  const { packageId, planId } = await params;

  const pkg = PACKAGES.find((p) => p.id === packageId);
  const plan = pkg && planOf(pkg, planId);
  if (!pkg || !plan) {
    return new Response("없는 AI팩이에요.", { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return new Response("로그인이 필요해요.", { status: 401 });
  }
  if (!(await ownsPack(packageId, planId))) {
    return new Response("구매하지 않은 AI팩이에요.", { status: 403 });
  }

  const bytes = await fsPackStorage.read(packKey(packageId, planId));
  if (!bytes) {
    // 결제는 됐는데 파일이 없는 상황 — 손님 잘못이 아니므로 연락처를 함께 준다.
    return new Response("파일을 찾지 못했어요. caffeinecolor.all@gmail.com 으로 알려주세요.", {
      status: 500,
    });
  }

  const filename = packFileName(pkg, plan.id as PlanId);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/zip",
      // 한글 파일명은 filename*(RFC 5987)으로 전달해야 깨지지 않는다.
      "Content-Disposition": `attachment; filename="${packageId}-${planId}.zip"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "no-store",
    },
  });
}

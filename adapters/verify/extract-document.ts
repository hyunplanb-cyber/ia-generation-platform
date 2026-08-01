// 업로드한 설계 문서(PDF·PPTX)에서 텍스트를 뽑는다.
// 피그마·워드·한글도 PDF로 내보내면 이 경로로 들어온다.
import JSZip from "jszip";

export type DocKind = "pdf" | "pptx";

export function detectDocKind(filename: string): DocKind | null {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (ext === "pptx") return "pptx";
  return null;
}

async function extractPdf(bytes: ArrayBuffer): Promise<string> {
  // unpdf는 서버(Node)에서 PDF 텍스트를 추출한다.
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  // mergePages:true → text는 문자열 하나로 합쳐져 온다.
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

async function extractPptx(bytes: ArrayBuffer): Promise<string> {
  // PPTX는 슬라이드 XML을 담은 zip. <a:t>글자</a:t> 조각만 이어 붙인다.
  const zip = await JSZip.loadAsync(bytes);
  const slideNames = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)/)?.[1] ?? 0);
      const nb = Number(b.match(/slide(\d+)/)?.[1] ?? 0);
      return na - nb;
    });
  const parts: string[] = [];
  for (const name of slideNames) {
    const xml = await zip.files[name].async("string");
    const runs = xml.match(/<a:t>([\s\S]*?)<\/a:t>/g) ?? [];
    const text = runs.map((r) => r.replace(/<\/?a:t>/g, "")).join(" ");
    if (text.trim()) parts.push(text);
  }
  return parts.join("\n");
}

// 한 문서에서 읽어 들이는 최대 길이. 부르는 쪽이 16,000자씩 8토막으로 나눠 본다
// (verify-site.ts의 DOC_CHUNK_CHARS × MAX_DOC_CHUNKS와 맞춰 둔다).
const MAX_DOC_CHARS = 128000;

// 파일을 텍스트로. 지원하지 않는 형식이면 UNSUPPORTED_DOC, 내용이 없으면 EMPTY_DOC.
export async function extractDocumentText(filename: string, bytes: ArrayBuffer): Promise<string> {
  const kind = detectDocKind(filename);
  if (!kind) throw new Error("UNSUPPORTED_DOC");

  const text = kind === "pdf" ? await extractPdf(bytes) : await extractPptx(bytes);
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 20) throw new Error("EMPTY_DOC");
  // 예전엔 여기서 16,000자로 잘라 뒷부분을 통째로 버렸다. 3뎁스까지 펼친 설계서는
  // 그보다 훨씬 길어서, "상세" 등급을 골라도 뒷화면은 아예 못 보고 있었다.
  // 지금은 부르는 쪽(verify-site.ts)이 토막으로 나눠 여러 번 본다.
  return cleaned.slice(0, MAX_DOC_CHARS);
}

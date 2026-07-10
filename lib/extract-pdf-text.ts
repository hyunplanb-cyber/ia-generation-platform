import { extractText, getDocumentProxy } from "unpdf";

const MAX_EXTRACTED_CHARS = 20000;

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text.trim().slice(0, MAX_EXTRACTED_CHARS);
}

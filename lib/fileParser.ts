export class FileParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileParseError";
  }
}

async function extractPdfWithPdfJs(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  }).promise;

  const parts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) parts.push(pageText);
  }

  return parts.join("\n\n").trim();
}

async function extractPdfWithPdfParse(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return (data.text ?? "").trim();
}

export async function extractFileText(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt"
): Promise<string> {
  if (fileType === "txt") {
    return buffer.toString("utf-8").trim();
  }

  if (fileType === "pdf") {
    let text = "";

    try {
      text = await extractPdfWithPdfJs(buffer);
    } catch {
      /* try fallback parser */
    }

    if (!text) {
      try {
        text = await extractPdfWithPdfParse(buffer);
      } catch {
        /* handled below */
      }
    }

    if (!text) {
      throw new FileParseError(
        "This PDF has no extractable text (it may be scanned images only). Paste the content below or upload a DOCX/TXT file."
      );
    }

    return text;
  }

  if (fileType === "docx") {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value ?? "").trim();
      if (!text) {
        throw new FileParseError(
          "This DOCX appears empty. Paste content manually instead."
        );
      }
      return text;
    } catch (e) {
      if (e instanceof FileParseError) throw e;
      const detail = e instanceof Error ? e.message : "unknown error";
      throw new FileParseError(`Could not read this DOCX (${detail}).`);
    }
  }

  throw new FileParseError(`Unsupported file type: ${fileType}`);
}

export function detectFileType(filename: string): "pdf" | "docx" | "txt" | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".txt")) return "txt";
  return null;
}

export function detectFileTypeFromMime(
  mime: string,
  filename: string
): "pdf" | "docx" | "txt" | null {
  const fromName = detectFileType(filename);
  if (fromName) return fromName;

  if (mime === "application/pdf") return "pdf";
  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  if (mime === "text/plain") return "txt";
  return null;
}

import pdf from "pdf-parse";
import mammoth from "mammoth";
import type { FileType } from "@/types";

export async function parseFile(
  buffer: Buffer,
  fileType: FileType
): Promise<string> {
  switch (fileType) {
    case "pdf": {
      const result = await pdf(buffer);
      return result.text?.trim() ?? "";
    }
    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value?.trim() ?? "";
    }
    case "txt":
      return buffer.toString("utf-8").trim();
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

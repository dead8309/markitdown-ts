import fs from "fs";
import { PDFParse } from "pdf-parse";
import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";

export class PdfConverter implements DocumentConverter {
  async convert(
    source: string | Buffer,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (![".pdf"].includes(fileExtension.toLowerCase())) {
      return null;
    }

    try {
      const pdfContent = typeof source === "string" ? fs.readFileSync(source) : Buffer.from(source);
      return this._convert(pdfContent);
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      return null;
    }
  }
  private async _convert(pdfContent: Buffer): Promise<ConverterResult> {
    try {
      const parser = new PDFParse({ data: pdfContent });
      const result = await parser.getText();
      return { title: null, markdown: result.text, text_content: result.text };
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      return null;
    }
  }
}

import fs from "fs";
import { DocumentConverter, ConverterOptions, ConverterResult } from "../types";
import { pdfToText } from "pdf-ts";

export class PdfConverter implements DocumentConverter {
  async convert(
    localPath: string,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (![".pdf"].includes(fileExtension.toLowerCase())) {
      return null;
    }

    try {
      const pdfContent = fs.readFileSync(localPath);
      return this._convert(pdfContent);
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      return null;
    }
  }
  private async _convert(pdfContent: Buffer): Promise<ConverterResult> {
    try {
      const textContent = await pdfToText(pdfContent);
      return {
        title: null,
        text_content: textContent
      };
    } catch (error) {
      console.error("PDF Parsing Error:", error);
      return null;
    }
  }
}

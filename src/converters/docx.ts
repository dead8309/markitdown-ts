import { ConverterOptions, ConverterResult } from "../types";
import * as fs from "fs";
import { HtmlConverter } from "./html";
import Mammoth from "mammoth";

export class DocxConverter extends HtmlConverter {
  async convert(source: string | Buffer, options: ConverterOptions): Promise<ConverterResult> {
    const fileExtension = options.file_extension || "";
    if (![".docx"].includes(fileExtension.toLowerCase())) {
      return null;
    }

    try {
      let mammothInput: { path: string } | { buffer: Buffer };
      if (typeof source === "string") {
        if (!fs.existsSync(source)) {
          throw new Error("File does'nt exists");
        }
        mammothInput = { path: source };
      } else {
        mammothInput = { buffer: Buffer.from(source) };
      }

      let htmlContent = await Mammoth.convertToHtml(mammothInput, {
        ...options
      });

      return await this._convert(htmlContent.value);
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

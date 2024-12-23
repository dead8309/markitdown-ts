import { ConverterOptions, ConverterResult } from "../types";
import * as fs from "fs";
import { HtmlConverter } from "./html";
import Mammoth from "mammoth";

export class DocxConverter extends HtmlConverter {
  async convert(local_path: string, options: ConverterOptions): Promise<ConverterResult> {
    const fileExtension = options.file_extension || "";
    if (![".docx"].includes(fileExtension.toLowerCase())) {
      return null;
    }

    try {
      let exists = fs.existsSync(local_path);
      if (!exists) {
        throw new Error("File does'nt exists");
      }
      let htmlContent = await Mammoth.convertToHtml(
        {
          path: local_path
        },
        {
          ...options
        }
      );

      return await this._convert(htmlContent.value);
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

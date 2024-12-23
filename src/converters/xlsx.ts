import { ConverterOptions, ConverterResult } from "../types";
import { HtmlConverter } from "./html";
import * as fs from "fs";
import XLSX from "xlsx";

export class XlsxConverter extends HtmlConverter {
  async convert(local_path: string, options: ConverterOptions): Promise<ConverterResult> {
    const extension = options.file_extension || "";
    if (![".xlsx"].includes(extension.toLowerCase())) {
      return null;
    }

    try {
      let exists = fs.existsSync(local_path);
      if (!exists) {
        throw new Error("File does'nt exists");
      }
      let workbook = XLSX.readFile(local_path);
      let mdContent = "";

      for (const sheetName of workbook.SheetNames) {
        mdContent += `## ${sheetName}\n`;
        let htmlContent = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
        mdContent += (await this._convert(htmlContent))?.text_content.trim() + "\n\n";
      }
      return {
        title: workbook?.Props?.Title || "Untitled",
        text_content: mdContent
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

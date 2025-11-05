import { ConverterOptions, ConverterResult } from "../types";
import { HtmlConverter } from "./html";
import * as fs from "fs";
import * as XLSX from "xlsx";

export class XlsxConverter extends HtmlConverter {
  async convert(source: string | Buffer, options: ConverterOptions): Promise<ConverterResult> {
    const extension = options.file_extension || "";
    if (![".xlsx"].includes(extension.toLowerCase())) {
      return null;
    }

    try {
      let workbook: XLSX.WorkBook;
      if (typeof source === "string") {
        if (!fs.existsSync(source)) {
          throw new Error("File does'nt exists");
        }
        workbook = XLSX.readFile(source);
      } else {
        workbook = XLSX.read(source, { type: "buffer" });
      }

      let mdContent = "";

      for (const sheetName of workbook.SheetNames) {
        mdContent += `## ${sheetName}\n`;
        let htmlContent = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
        mdContent += (await this._convert(htmlContent))?.markdown.trim() + "\n\n";
      }
      return { title: workbook?.Props?.Title || "Untitled", markdown: mdContent, text_content: mdContent };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

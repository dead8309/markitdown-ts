import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";
import * as fs from "fs";

export class IpynbConverter implements DocumentConverter {
  async convert(
    source: string | Buffer,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (fileExtension.toLowerCase() !== ".ipynb") {
      return null;
    }
    try {
      const contentStirng =
        typeof source === "string"
          ? fs.readFileSync(source, { encoding: "utf-8" })
          : source.toString("utf-8");
      const notebookContent = JSON.parse(contentStirng);
      return this._convert(notebookContent);
    } catch (error) {
      console.error("Error converting .ipynb file:", error);
      return null;
    }
  }

  private _convert(notebookContent: any): ConverterResult {
    try {
      const mdOutput: string[] = [];
      let title: string | null = null;
      for (const cell of notebookContent.cells || []) {
        const cellType = cell.cell_type || "";
        const sourceLines: string[] = cell.source || [];

        if (cellType === "markdown") {
          mdOutput.push(sourceLines.join(""));
          if (!title) {
            for (const line of sourceLines) {
              if (line.startsWith("# ")) {
                title = line.substring(line.indexOf("# ") + 2).trim();
                break;
              }
            }
          }
        } else if (cellType === "code") {
          mdOutput.push(`\`\`\`python\n${sourceLines.join("")}\n\`\`\``);
        } else if (cellType === "raw") {
          mdOutput.push(`\`\`\`\n${sourceLines.join("")}\n\`\`\``);
        }
      }
      const mdText = mdOutput.join("\n\n");
      title = notebookContent.metadata?.title || title;
      return {
        title: title,
        text_content: mdText
      };
    } catch (e) {
      console.error("Error converting .ipynb file:", e);
      throw new Error(`Error converting .ipynb file: ${e}`);
    }
  }
}

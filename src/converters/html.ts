import * as fs from "fs";
import { JSDOM } from "jsdom";
import { CustomTurnDown } from "../custom-turndown";
import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";

export class HtmlConverter implements DocumentConverter {
  async convert(source: string | Buffer, options: ConverterOptions): Promise<ConverterResult> {
    const extension = options.file_extension || "";
    if (![".html", ".htm"].includes(extension.toLowerCase())) {
      return null;
    }

    try {
      let content;
      if (typeof source === "string") {
        let exists = fs.existsSync(source);
        if (!exists) {
          throw new Error("File does'nt exists");
        }
        content = fs.readFileSync(source, { encoding: "utf-8" });
      } else {
        content = source.toString("utf-8");
      }

      return await this._convert(content);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async _convert(htmlContent: string): Promise<ConverterResult> {
    const soup = new JSDOM(htmlContent);
    // NOTE: I can add this to avoid getting
    // ReferenceError: HTMLElement is not defined in CustomTurndown
    // but I'm not sure if it's the right way to do it
    // global.HTMLElement = soup.window.HTMLElement;

    const doc = soup.window.document;

    doc.querySelectorAll("script, style").forEach((script) => {
      script.remove();
    });

    const bodyElm = doc.querySelector("body");
    let webpageText = "";
    if (bodyElm) {
      webpageText = new CustomTurnDown().convert_soup(bodyElm);
    } else {
      webpageText = new CustomTurnDown().convert_soup(doc);
    }

    return {
      title: doc.title,
      markdown: webpageText,
      text_content: webpageText
    };
  }
}

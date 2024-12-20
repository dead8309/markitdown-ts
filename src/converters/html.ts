import * as fs from "fs";
import { JSDOM } from "jsdom";
import { CustomTurnDown } from "../custom-turndown";
import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";

export class HtmlConverter implements DocumentConverter {
  async convert(local_path: string, options: ConverterOptions): Promise<ConverterResult> {
    const extension = options.file_extension || "";
    if (![".html", ".htm"].includes(extension.toLowerCase())) {
      return null;
    }

    try {
      let exists = fs.existsSync(local_path);
      if (!exists) {
        throw new Error("File does'nt exists");
      }
      let content = fs.readFileSync(local_path, { encoding: "utf-8" });
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
      text_content: webpageText
    };
  }
}

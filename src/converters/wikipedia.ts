import * as fs from "fs";
import { JSDOM } from "jsdom";
import { CustomTurnDown } from "../custom-turndown";
import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";

export class WikipediaConverter implements DocumentConverter {
  async convert(
    localPath: string,
    options: ConverterOptions = {}
  ): Promise<ConverterResult> {
    const fileExtension = options.file_extension || "";
    if (![".html", ".htm"].includes(fileExtension.toLowerCase())) {
      return null;
    }
    const url = options.url || "";
    if (!/^https?:\/\/[a-zA-Z]{2,3}\.wikipedia\.org\//.test(url)) {
      return null;
    }

    try {
      const htmlContent = fs.readFileSync(localPath, { encoding: "utf-8" });
      return this._convert(htmlContent);
    } catch (error) {
      console.error("Wikipedia Parsing Error:", error);
      return null;
    }
  }

  private _convert(htmlContent: string): ConverterResult {
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    doc.querySelectorAll("script, style").forEach((script) => {
      script.remove();
    });

    const bodyElm = doc.querySelector("div#mw-content-text");
    const titleElm = doc.querySelector("span.mw-page-title-main");

    let webpageText = "";
    let mainTitle = doc.title;

    if (bodyElm) {
      if (titleElm && titleElm.textContent) {
        mainTitle = titleElm.textContent;
      }
      webpageText =
        `# ${mainTitle}\n\n` +
        new CustomTurnDown().convert_soup(bodyElm as HTMLElement);
    } else {
      webpageText = new CustomTurnDown().convert_soup(doc);
    }

    return {
      title: mainTitle,
      text_content: webpageText,
    };
  }
}

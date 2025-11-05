import * as fs from "fs";
import { JSDOM } from "jsdom";
import { CustomTurnDown } from "../custom-turndown";
import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";

const WIKIPEDIA_REGEX = /^https?:\/\/[a-zA-Z]{2,3}\.wikipedia\.org\//;
const BODY_SELECTOR_QUERY = "div#mw-content-text";
const TITLE_SELECTOR_QUERY = "span.mw-page-title-main";

export class WikipediaConverter implements DocumentConverter {
  async convert(source: string | Buffer, options: ConverterOptions = {}): Promise<ConverterResult> {
    const fileExtension = options.file_extension || "";
    if (![".html", ".htm"].includes(fileExtension.toLowerCase())) {
      return null;
    }
    const url = options.url || "";
    if (!WIKIPEDIA_REGEX.test(url)) {
      return null;
    }

    try {
      const htmlContent =
        typeof source === "string"
          ? fs.readFileSync(source, { encoding: "utf-8" })
          : source.toString("utf-8");
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

    const bodyElm = doc.querySelector(BODY_SELECTOR_QUERY);
    const titleElm = doc.querySelector(TITLE_SELECTOR_QUERY);

    let webpageText = "";
    let mainTitle = doc.title;

    if (bodyElm) {
      if (titleElm && titleElm.textContent) {
        mainTitle = titleElm.textContent;
      }
      webpageText =
        `# ${mainTitle}\n\n` + new CustomTurnDown().convert_soup(bodyElm as HTMLElement);
    } else {
      webpageText = new CustomTurnDown().convert_soup(doc);
    }

    return { title: mainTitle, markdown: webpageText, text_content: webpageText };
  }
}

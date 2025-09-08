import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";
import * as fs from "fs";
import { JSDOM } from "jsdom";
import { URL, URLSearchParams } from "url";
import { CustomTurnDown } from "../custom-turndown";

export class BingSerpConverter implements DocumentConverter {
  async convert(
    source: string | Buffer,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (![".html", ".htm"].includes(fileExtension.toLowerCase())) {
      return null;
    }
    const url = options.url || "";
    if (!/^https:\/\/www\.bing\.com\/search\?q=/.test(url)) {
      return null;
    }

    try {
      const htmlContent =
        typeof source === "string"
          ? fs.readFileSync(source, { encoding: "utf-8" })
          : Buffer.from(source).toString("utf-8");
      return this._convert(htmlContent, url);
    } catch (error) {
      console.error("Bing SERP Parsing Error:", error);
      return null;
    }
  }
  private _convert(htmlContent: string, url: string): ConverterResult {
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;
    const parsedParams = new URL(url).searchParams;
    const query = parsedParams.get("q") || "";

    doc.querySelectorAll(".tptt").forEach((tptt) => {
      if (tptt.textContent) {
        tptt.textContent += " ";
      }
    });
    doc.querySelectorAll(".algoSlug_icon").forEach((slug) => {
      slug.remove();
    });

    const markdownify = new CustomTurnDown();
    const results: string[] = [];
    doc.querySelectorAll(".b_algo").forEach((result) => {
      result.querySelectorAll("a[href]").forEach((a) => {
        try {
          const parsedHref = new URL(a.getAttribute("href")!);
          const params = parsedHref.searchParams;
          const u = params.get("u");
          if (u) {
            const decoded = this._decodeBase64Url(u);
            a.setAttribute("href", decoded);
          }
        } catch (e) {}
      });
      const mdResult = markdownify.convert_soup(result as HTMLElement).trim();
      const lines = mdResult
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      results.push(lines.join("\n"));
    });
    const webpageText = `## A Bing search for '${query}' found the following results:\n\n${results.join("\n\n")}`;
    return {
      title: doc.title,
      text_content: webpageText
    };
  }

  private _decodeBase64Url(encodedUrl: string): string {
    let u = encodedUrl.slice(2).trim() + "==";
    try {
      const decoded = Buffer.from(u, "base64").toString("utf-8");
      return decoded;
    } catch (error) {
      console.error("Error decoding Base64URL:", error);
      return encodedUrl;
    }
  }
}

import { CustomTurnDown } from "../custom-turndown";
import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";
import { Document, DOMParser, Element } from "@xmldom/xmldom";
import * as fs from "fs";
import { JSDOM } from "jsdom";

export class RSSConverter implements DocumentConverter {
  async convert(source: string | Buffer, options: ConverterOptions = {}): Promise<ConverterResult> {
    const fileExtension = options.file_extension || "";
    if (![".xml", ".rss", ".atom"].includes(fileExtension.toLowerCase())) {
      return null;
    }

    try {
      const xmlString =
        typeof source === "string"
          ? fs.readFileSync(source, { encoding: "utf-8" })
          : source.toString("utf-8");
      const doc = new DOMParser().parseFromString(xmlString, "text/xml");

      let result;

      if (doc.getElementsByTagName("rss").length > 0) {
        result = this._parseRssType(doc);
      } else if (doc.getElementsByTagName("feed").length > 0) {
        const root = doc.getElementsByTagName("feed")[0];
        if (root.getElementsByTagName("entry").length > 0) {
          result = this._parseAtomType(doc);
        }
      }
      return result;
    } catch (error) {
      console.error("RSS Parsing Error:", error);
      return null;
    }
  }
  private _parseAtomType(doc: Document) {
    try {
      const root = doc.getElementsByTagName("feed")[0];
      const title = this._getDataByTagName(root, "title");
      const subtitle = this._getDataByTagName(root, "subtitle");
      const entries = root.getElementsByTagName("entry");
      let mdText = `# ${title}\n`;
      if (subtitle) {
        mdText += `${subtitle}\n`;
      }
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const entryTitle = this._getDataByTagName(entry, "title");
        const entrySummary = this._getDataByTagName(entry, "summary");
        const entryUpdated = this._getDataByTagName(entry, "updated");
        const entryContent = this._getDataByTagName(entry, "content");
        if (entryTitle) {
          mdText += `\n## ${entryTitle}\n`;
        }
        if (entryUpdated) {
          mdText += `Updated on: ${entryUpdated}\n`;
        }
        if (entrySummary) {
          mdText += this._parseContent(entrySummary);
        }
        if (entryContent) {
          mdText += this._parseContent(entryContent);
        }
      }
      return { title: title, markdown: mdText, text_content: mdText };
    } catch (error) {
      console.error("Atom Parsing Error:", error);
      return null;
    }
  }

  private _parseRssType(doc: Document) {
    try {
      const root = doc.getElementsByTagName("rss")[0];
      const channel = root.getElementsByTagName("channel");
      if (!channel || channel.length === 0) {
        return null;
      }
      const channelElement = channel[0];
      const channelTitle = this._getDataByTagName(channelElement, "title");
      const channelDescription = this._getDataByTagName(channelElement, "description");
      const items = channelElement.getElementsByTagName("item");
      let mdText = "";
      if (channelTitle) {
        mdText = `# ${channelTitle}\n`;
      }
      if (channelDescription) {
        mdText += `${channelDescription}\n`;
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title = this._getDataByTagName(item, "title");
        const description = this._getDataByTagName(item, "description");
        const pubDate = this._getDataByTagName(item, "pubDate");
        const content = this._getDataByTagName(item, "content:encoded");
        if (title) {
          mdText += `\n## ${title}\n`;
        }
        if (pubDate) {
          mdText += `Published on: ${pubDate}\n`;
        }
        if (description) {
          mdText += this._parseContent(description);
        }
        if (content) {
          mdText += this._parseContent(content);
        }
      }
      return { title: channelTitle, markdown: mdText, text_content: mdText };
    } catch (error) {
      console.error("RSS Parsing Error:", error);
      return null;
    }
  }

  private _parseContent(content: string) {
    try {
      const dom = new JSDOM(content);
      const document = dom.window.document;
      return new CustomTurnDown().convert_soup(document);
    } catch (error) {
      console.warn("Parsing content error", error);
      return content;
    }
  }

  private _getDataByTagName(element: Element, tagName: string) {
    const nodes = element.getElementsByTagName(tagName);
    if (!nodes || nodes.length === 0) {
      return null;
    }
    const fc = nodes[0].firstChild;
    if (fc && fc.nodeValue) {
      return fc.nodeValue;
    }
    return null;
  }
}

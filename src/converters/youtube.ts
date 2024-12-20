import * as fs from "fs";
import { JSDOM } from "jsdom";
import { URL } from "url";
import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";

export class YouTubeConverter implements DocumentConverter {
  async convert(
    localPath: string,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (![".html", ".htm"].includes(fileExtension.toLowerCase())) {
      return null;
    }
    const url = options.url || "";
    if (!url.startsWith("https://www.youtube.com/watch?")) {
      return null;
    }
    try {
      const htmlContent = fs.readFileSync(localPath, { encoding: "utf-8" });
      return this._convert(htmlContent, url, options);
    } catch (error) {
      console.error("YouTube Parsing Error:", error);
      return null;
    }
  }
  private async _convert(
    htmlContent: string,
    url: string,
    options: ConverterOptions
  ): Promise<ConverterResult> {
    const dom = new JSDOM(htmlContent);
    const doc = dom.window.document;

    const metadata: Record<string, string> = {
      title: doc.title
    };

    doc.querySelectorAll("meta").forEach((meta) => {
      for (const a of meta.attributes) {
        const attributeContent = meta.getAttribute("content");
        if (["itemprop", "property", "name"].includes(a.name) && attributeContent) {
          // console.log({
          //   name: a.name,
          //   value: a.value,
          //   textContent: a.textContent,
          //   attributeContent: meta.getAttribute("content")
          // });
          metadata[a.value] = attributeContent;
          break;
        }
      }
    });

    // We can also try to read the full description. This is more prone to breaking, since it reaches into the page implementation
    try {
      for (const script of doc.querySelectorAll("script")) {
        const content = script.textContent || "";
        if (content.includes("ytInitialData")) {
          const lines = content.split(/\r?\n/);
          const objStart = lines[0].indexOf("{");
          const objEnd = lines[0].lastIndexOf("}");
          if (objStart >= 0 && objEnd >= 0) {
            const data = JSON.parse(lines[0].substring(objStart, objEnd + 1));
            const attrdesc = this._findKey(data, "attributedDescriptionBodyText");
            if (attrdesc) {
              metadata["description"] = attrdesc["content"];
            }
          }
          break;
        }
      }
    } catch (e) {
      console.warn("Error while parsing Youtube description");
    }
    let webpageText = "# YouTube\n";
    const title = this._get(metadata, ["title", "og:title", "name"]);
    if (title) {
      webpageText += `\n## ${title}\n`;
    }
    let stats = "";
    const views = this._get(metadata, ["interactionCount"]);
    if (views) {
      stats += `- **Views:** ${views}\n`;
    }
    const keywords = this._get(metadata, ["keywords"]);
    if (keywords) {
      stats += `- **Keywords:** ${keywords}\n`;
    }
    const runtime = this._get(metadata, ["duration"]);
    if (runtime) {
      stats += `- **Runtime:** ${runtime}\n`;
    }
    if (stats.length > 0) {
      webpageText += `\n### Video Metadata\n${stats}\n`;
    }
    const description = this._get(metadata, ["description", "og:description"]);
    if (description) {
      webpageText += `\n### Description\n${description}\n`;
    }
    if (options.enableYoutubeTranscript) {
      let transcriptText = "";
      const parsedUrl = new URL(url);
      const params = parsedUrl.searchParams;
      const videoId = params.get("v");
      let ytTranscript;
      try {
        ytTranscript = await import("youtube-transcript").then((mod) => mod.YoutubeTranscript);
      } catch (error) {
        console.warn(
          "Optional dependency 'youtube-transcript' is not installed. Run `npm install youtube-transcript` to enable this feature."
        );
        return null;
      }
      if (videoId) {
        try {
          const youtubeTranscriptLanguage = options.youtubeTranscriptLanguage || "en";
          const transcript = await ytTranscript.fetchTranscript(videoId, {
            lang: youtubeTranscriptLanguage
          });
          transcriptText = transcript.map((part) => part.text).join(" ");
        } catch (error) {
          console.warn("Error while extracting the Youtube Transcript", error);
        }
      }
      if (transcriptText) {
        webpageText += `\n### Transcript\n${transcriptText}\n`;
      }
    }
    const finalTitle = title ? title : doc.title;
    return {
      title: finalTitle,
      text_content: webpageText
    };
  }
  private _get(
    metadata: Record<string, string>,
    keys: string[],
    default_value?: string
  ): string | null {
    for (const k of keys) {
      if (metadata[k]) {
        return metadata[k];
      }
    }
    return default_value || null;
  }
  private _findKey(json: any, key: string): any {
    if (Array.isArray(json)) {
      for (const elm of json) {
        const ret = this._findKey(elm, key);
        if (ret) {
          return ret;
        }
      }
    } else if (typeof json === "object" && json !== null) {
      for (const k in json) {
        if (k === key) {
          return json[k];
        } else {
          const ret = this._findKey(json[k], key);
          if (ret) {
            return ret;
          }
        }
      }
    }
    return null;
  }
}

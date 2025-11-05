import { ConverterOptions, DocumentConverter, ConverterResult } from "../types";

import * as mime from "mime-types";
import fs from "fs";

export class PlainTextConverter implements DocumentConverter {
  async convert(source: string | Buffer, options: ConverterOptions = {}): Promise<ConverterResult> {
    const fileExtension = options.file_extension || "";
    const contentType = mime.lookup(fileExtension);

    if (!contentType) {
      return null;
    } else if (!contentType.toLowerCase().includes("text/")) {
      return null;
    }

    let content: string;
    if (typeof source === "string") {
      content = fs.readFileSync(source, { encoding: "utf-8" });
    } else {
      content = Buffer.from(source).toString("utf-8");
    }

    return {
      title: null,
      markdown: content,
      text_content: content
    };
  }
}

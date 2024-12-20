import { ConverterOptions, DocumentConverter, ConverterResult } from "../types";

import * as mime from "mime-types";
import fs from "fs";

export class PlainTextConverter implements DocumentConverter {
  async convert(
    local_path: string,
    options: ConverterOptions = {}
  ): Promise<ConverterResult> {
    const fileExtension = options.file_extension || "";
    const contentType = mime.lookup(fileExtension);

    if (!contentType) {
      return null;
    } else if (!contentType.toLowerCase().includes("text/")) {
      return null;
    }

    const content = fs.readFileSync(local_path, { encoding: "utf-8" });

    return {
      title: null,
      text_content: content,
    };
  }
}

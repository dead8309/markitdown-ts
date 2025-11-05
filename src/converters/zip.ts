import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";
import * as fs from "fs";
import * as path from "path";
import { PassThrough } from "stream";
import unzipper from "unzipper";

export class ZipConverter implements DocumentConverter {
  async convert(
    source: string | Buffer,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (fileExtension.toLowerCase() !== ".zip") {
      return null;
    }
    const parentConverters = options._parent_converters || [];
    if (!parentConverters) {
      return {
        title: null,
        markdown: `[ERROR] No converters available to process zip contents from: ${source}`,
        text_content: `[ERROR] No converters available to process zip contents from: ${source}`
      };
    }

    let unzipper;
    try {
      unzipper = await import("unzipper").then((mod) => mod.default);
    } catch (error) {
      console.error(
        "Optional dependency 'unzipper' is not installed. Run `npm install unzipper` to enable this feature."
      );
      return null;
    }

    try {
      const zipFileName = typeof source === "string" ? path.basename(source) : "archive.zip";
      let mdContent = `Content from the zip file \`${zipFileName}\`:\n\n`;
      const mdResults: string[] = [];

      const processEntry = async (entry: unzipper.Entry) => {
        const relativePath = entry.path;
        if (entry.type === "File") {
          const entryExtension = path.extname(relativePath);
          const entryBuffer = await entry.buffer();

          const fileOptions = {
            ...options,
            file_extension: entryExtension,
            _parent_converters: parentConverters
          };

          for (const converter of parentConverters) {
            if (converter instanceof ZipConverter) {
              continue;
            }
            const result = await converter.convert(entryBuffer, fileOptions);
            if (result) {
              mdResults.push(`\n## File: ${relativePath}\n\n${result.markdown}\n\n`);
              break;
            }
          }
        } else {
          entry.autodrain();
        }
      };

      const inputStream =
        typeof source === "string" ? fs.createReadStream(source) : new PassThrough().end(source);

      await new Promise((res, rej) => {
        const parser = unzipper.Parse();

        parser.on("entry", (entry: unzipper.Entry) => {
          processEntry(entry).catch((err) => {
            parser.destroy(err);
            rej(err);
          });
        });
        parser.on("finish", res);
        parser.on("error", rej);

        inputStream.pipe(parser);
      });

      mdContent += mdResults.join("");

      return { title: null, markdown: mdContent.trim(), text_content: mdContent.trim() };
    } catch (error: any) {
      if (error.message.includes("invalid signature")) {
        return {
          title: null,
          markdown: `[ERROR] Invalid or corrupted zip file: ${source}`,
          text_content: `[ERROR] Invalid or corrupted zip file: ${source}`
        };
      }
      return {
        title: null,
        markdown: `[ERROR] Failed to process zip file ${source}: ${String(error)}`,
        text_content: `[ERROR] Failed to process zip file ${source}: ${String(error)}`
      };
    }
  }
}

import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";
import * as fs from "fs/promises";
import * as path from "path";
import * as unzipper from "unzipper";

export class ZipConverter implements DocumentConverter {
  async convert(
    localPath: string,
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
        text_content: `[ERROR] No converters available to process zip contents from: ${localPath}`
      };
    }
    const extractedZipFolderName = `extracted_${path.basename(localPath).replace(".zip", "_zip")}`;
    const newFolder = path.normalize(path.join(path.dirname(localPath), extractedZipFolderName));
    let mdContent = `Content from the zip file \`${path.basename(localPath)}\`:\n\n`;

    if (!newFolder.startsWith(path.dirname(localPath))) {
      return {
        title: null,
        text_content: `[ERROR] Invalid zip file path: ${localPath}`
      };
    }
    try {
      await fs.mkdir(newFolder, { recursive: true });
      const zip = await unzipper.Open.file(localPath);
      await zip.extract({ path: newFolder });

      const files = await this._walk(newFolder);
      for (const { root, name } of files) {
        const filePath = path.join(root, name);
        const relativePath = path.relative(newFolder, filePath);
        const fileExtension = path.extname(name);

        const fileOptions = {
          ...options,
          file_extension: fileExtension,
          _parent_converters: parentConverters
        };

        for (const converter of parentConverters) {
          if (converter instanceof ZipConverter) {
            continue;
          }
          const result = await converter.convert(filePath, fileOptions);
          if (result) {
            mdContent += `\n## File: ${relativePath}\n\n`;
            mdContent += result.text_content + "\n\n";
            break;
          }
        }
      }
      if (options.cleanupExtracted !== false) {
        await fs.rm(newFolder, { recursive: true, force: true });
      }

      return {
        title: null,
        text_content: mdContent.trim()
      };
    } catch (error: any) {
      if (error.message.includes("invalid signature")) {
        return {
          title: null,
          text_content: `[ERROR] Invalid or corrupted zip file: ${localPath}`
        };
      }
      return {
        title: null,
        text_content: `[ERROR] Failed to process zip file ${localPath}: ${String(error)}`
      };
    }
  }
  private async _walk(dir: string): Promise<{ root: string; name: string }[]> {
    let results: { root: string; name: string }[] = [];
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        results = results.concat(await this._walk(path.join(dir, file.name)));
      } else {
        results.push({ root: dir, name: file.name });
      }
    }
    return results;
  }
}

import { ConverterOptions, ConverterResult } from "../types";
import { MediaConverter } from "./media";
import * as fs from "fs";
import { generateText } from "ai";

export class ImageConverter extends MediaConverter {
  async convert(
    source: string | Buffer,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (![".jpg", ".jpeg", ".png"].includes(fileExtension.toLowerCase())) {
      return null;
    }

    try {
      return this._convert(source, options);
    } catch (error) {
      console.error("Image Conversion Error:", error);
      return null;
    }
  }
  private async _convert(
    source: string | Buffer,
    options: ConverterOptions
  ): Promise<ConverterResult> {
    let mdContent = "";

    if (typeof source === "string") {
      const metadata = await this._getMetadata(source);
      if (metadata) {
        for (const f of [
          "ImageSize",
          "Title",
          "Caption",
          "Description",
          "Keywords",
          "Artist",
          "Author",
          "DateTimeOriginal",
          "CreateDate",
          "GPSPosition"
        ]) {
          if (metadata[f]) {
            mdContent += `${f}: ${metadata[f]}\n`;
          }
        }
      }
    } else {
      console.warn(
        "Metadata extraction is skipped for Buffer inputs as it requires a file path for exiftool."
      );
    }

    if (options.llmModel) {
      const imageBuffer =
        typeof source === "string" ? fs.readFileSync(source) : Buffer.from(source);
      mdContent += `\n# Description:\n${(await this._getLLMDescription(imageBuffer, options)).trim()}\n`;
    }
    return { title: null, markdown: mdContent.trim(), text_content: mdContent.trim() };
  }
  private async _getLLMDescription(
    imageBuffer: Buffer,
    options: ConverterOptions
  ): Promise<string> {
    if (!options.llmPrompt || options.llmPrompt.trim() === "") {
      options.llmPrompt = "Write a detailed caption for this image.";
    }
    const imageFileAsBase64 = imageBuffer.toString("base64");

    const result = await generateText({
      model: options.llmModel!,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: options.llmPrompt },
            {
              type: "image",
              image: imageFileAsBase64
            }
          ]
        }
      ]
    });

    return result.text.trim();
  }
}

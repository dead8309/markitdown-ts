import { ConverterOptions, ConverterResult } from "../types";
import { MediaConverter } from "./media";
import * as fs from "fs";
import { generateText } from "ai";

export class ImageConverter extends MediaConverter {
  async convert(
    localPath: string,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (![".jpg", ".jpeg", ".png"].includes(fileExtension.toLowerCase())) {
      return null;
    }

    try {
      return this._convert(localPath, options);
    } catch (error) {
      console.error("Image Conversion Error:", error);
      return null;
    }
  }
  private async _convert(localPath: string, options: ConverterOptions): Promise<ConverterResult> {
    let mdContent = "";

    const metadata = await this._getMetadata(localPath);
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
    if (options.llmModel) {
      mdContent += `\n# Description:\n${(
        await this._getLLMDescription(localPath, options)
      ).trim()}\n`;
    }
    return {
      title: null,
      text_content: mdContent.trim()
    };
  }
  private async _getLLMDescription(localPath: string, options: ConverterOptions): Promise<string> {
    if (!options.llmPrompt || options.llmPrompt.trim() === "") {
      options.llmPrompt = "Write a detailed caption for this image.";
    }
    const imageFile = fs.readFileSync(localPath).toString("base64");

    const result = await generateText({
      model: options.llmModel!,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: options.llmPrompt },
            {
              type: "image",
              image: imageFile
            }
          ]
        }
      ]
    });

    return result.text.trim();
  }
}

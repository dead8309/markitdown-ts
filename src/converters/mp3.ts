import { ConverterOptions, ConverterResult } from "../types";
import { WavConverter } from "./wav";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

export class Mp3Converter extends WavConverter {
  async convert(
    localPath: string,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (fileExtension.toLowerCase() !== ".mp3") {
      return null;
    }
    try {
      return await this._convert$(localPath, options);
    } catch (error) {
      console.error("MP3 Conversion Error:", error);
      return null;
    }
  }

  private async _convert$(localPath: string, options: ConverterOptions): Promise<ConverterResult> {
    let mdContent = "";
    const metadata = await this._getMetadata(localPath);
    if (metadata) {
      for (const f of [
        "Title",
        "Artist",
        "Author",
        "Band",
        "Album",
        "Genre",
        "Track",
        "DateTimeOriginal",
        "CreateDate",
        "Duration"
      ]) {
        if (metadata[f]) {
          mdContent += `${f}: ${metadata[f]}\n`;
        }
      }
    }

    const tempPath = await fs.mkdtemp(path.join(os.tmpdir(), "temp_"));
    const wavPath = path.join(tempPath, "audio.wav");
    try {
      const transcript = await super._transcribeAudio(wavPath);
      mdContent += `\n\n### Audio Transcript:\n${transcript == "" ? "[No speech detected]" : transcript}`;
    } catch (e) {
      mdContent += "\n\n### Audio Transcript:\nError. Could not transcribe this audio.";
    } finally {
      await fs.unlink(wavPath);
      await fs.rmdir(tempPath);
    }
    return {
      title: null,
      text_content: mdContent.trim()
    };
  }
}

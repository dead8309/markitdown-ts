import { ConverterOptions, ConverterResult } from "../types";
import { MediaConverter } from "./media";

export class WavConverter extends MediaConverter {
  async convert(
    localPath: string,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (fileExtension.toLowerCase() !== ".wav") {
      return null;
    }
    try {
      return this._convert(localPath, options);
    } catch (error) {
      console.error("WAV Conversion Error:", error);
      return null;
    }
  }
  private async _convert(localPath: string, _: ConverterOptions): Promise<ConverterResult> {
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

    try {
      const transcript = await this._transcribeAudio(localPath);
      mdContent += `\n\n### Audio Transcript:\n${
        transcript === "" ? "[No speech detected]" : transcript
      }`;
    } catch (error) {
      console.error("Error loading speech recognition module:", error);
      mdContent += "\n\n### Audio Transcript:\nError. Could not transcribe this audio.";
    }
    return {
      title: null,
      text_content: mdContent.trim()
    };
  }

  // TODO: Add speech to text
  protected async _transcribeAudio(_: string): Promise<string> {
    throw new Error("TODO: Audio transcription not implemented yet");
  }
}

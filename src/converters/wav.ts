import { ConverterOptions, ConverterResult } from "../types";
import { MediaConverter } from "./media";

export class WavConverter extends MediaConverter {
  async convert(
    source: string | Buffer,
    options: ConverterOptions = {}
  ): Promise<ConverterResult | null> {
    const fileExtension = options.file_extension || "";
    if (fileExtension.toLowerCase() !== ".wav") {
      return null;
    }
    try {
      return this._convert(source, options);
    } catch (error) {
      console.error("WAV Conversion Error:", error);
      return null;
    }
  }

  private async _convert(source: string | Buffer, _: ConverterOptions): Promise<ConverterResult> {
    let mdContent = "";

    if (typeof source === "string") {
      const metadata = await this._getMetadata(source);
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
    } else {
      console.warn(
        "Metadata extraction is skipped for Buffer inputs as it requires a file path for exiftool."
      );
    }

    if (typeof source === "string") {
      try {
        const transcript = await this._transcribeAudio(source);
        mdContent += `\n\n### Audio Transcript:\n${
          transcript === "" ? "[No speech detected]" : transcript
        }`;
      } catch (error) {
        console.error("Error loading speech recognition module:", error);
        mdContent += "\n\n### Audio Transcript:\nError. Could not transcribe this audio.";
      }
    } else {
      mdContent +=
        "\n\n### Audio Transcript:\n[Audio transcription is not supported for Buffer inputs in this version.]";
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

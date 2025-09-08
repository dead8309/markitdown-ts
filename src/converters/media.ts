import { ConverterOptions, ConverterResult, DocumentConverter } from "../types";
import * as childProcess from "child_process";
import * as util from "util";

const exec = util.promisify(childProcess.exec);

export abstract class MediaConverter implements DocumentConverter {
  abstract convert(
    source: string | Buffer,
    options: ConverterOptions
  ): Promise<ConverterResult | null>;

  async _getMetadata(local_path: string): Promise<{ [key: string]: string } | null> {
    const exiftool = await this._which("exiftool");
    if (!exiftool) {
      console.error("exiftool is not found on this system so metadata cannot be extracted");
      return null;
    }
    try {
      const result = await exec(`"${exiftool}" -json "${local_path}"`);
      return JSON.parse(result.stdout)[0];
    } catch (error) {
      console.error("Exiftool error:", error);
      return null;
    }
  }
  private async _which(command: string): Promise<string | null> {
    try {
      const result = await exec(`which ${command}`);
      return result.stdout.trim();
    } catch (error) {
      console.warn("Which command error:", error);
      return null;
    }
  }
}

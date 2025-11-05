import { LanguageModel } from "ai";
import mammoth from "mammoth";

export type ConverterResult =
  | {
      title: string | null;
      markdown: string;
      /** @deprecated Use `markdown` instead. */
      text_content: string;
    }
  | null
  | undefined;

export type ConverterOptions = {
  llmModel?: LanguageModel;
  llmPrompt?: string;
  file_extension?: string;
  url?: string;
  fetch?: typeof fetch;
  enableYoutubeTranscript?: boolean;
  youtubeTranscriptLanguage?: string;
  cleanupExtracted?: boolean;
  //
  _parent_converters?: DocumentConverter[];
} & MammothOptions;

type MammothOptions = Parameters<typeof mammoth.convertToHtml>[1];

export interface DocumentConverter {
  convert(source: string | Buffer, options: ConverterOptions): Promise<ConverterResult>;
}

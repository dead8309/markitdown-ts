import mammoth, { type convertToHtml } from "mammoth";

export interface MarkItDownOptions {
  llm_client: any;
  llm_model: any;
}

export type ConverterResult =
  | {
      title: string | null;
      text_content: string;
    }
  | null
  | undefined;

export type ConverterOptions = {
  file_extension?: string;
  url?: string;
  fetch?: typeof fetch;
  enableYoutubeTranscript?: boolean;
  youtubeTranscriptLanguage?: string;
} & MammothOptions;

type MammothOptions = Parameters<typeof mammoth.convertToHtml>[1];

export interface DocumentConverter {
  convert(local_path: string, options: ConverterOptions): Promise<ConverterResult>;
}

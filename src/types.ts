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
};

export interface DocumentConverter {
  convert(local_path: string, options: ConverterOptions): Promise<ConverterResult>;
}

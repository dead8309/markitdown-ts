# markitdown-ts

[![CI](https://github.com/dead8309/markitdown-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/dead8309/markitdown/actions/workflows/ci.yml)

`markitdown-ts` is a TypeScript library designed for converting various file formats to Markdown. This makes it suitable for indexing, text analysis, and other applications that benefit from structured text. It is a TypeScript implementation of the original `markitdown` [Python library.](https://github.com/microsoft/markitdown)

It supports:

- [x] PDF
- [x] PowerPoint
- [x] Word (.docx)
- [x] Excel (.xlsx)
- [x] Images (EXIF metadata extraction and optional LLM-based description)
- [x] Audio (EXIF metadata extraction only)
- [x] HTML
- [x] Text-based formats (plain text, .csv, .xml, .rss, .atom)
- [x] Jupyter Notebooks (.ipynb)
- [x] Bing Search Result Pages (SERP)
- [x] ZIP files (recursively iterates over contents)

> [!NOTE]
>
> Speech Recognition for audio converter has not been implemented yet. I'm happy to accept contributions for this feature.

## Installation

Install `markitdown-ts` using your preferred package manager:

```bash
pnpm add markitdown-ts
```

## Usage

```typescript
import { MarkItDown } from "markitdown-ts";

const markitdown = new MarkItDown();
try {
  const result = await markitdown.convert("path/to/your/file.pdf");
  if (result) {
    console.log(result.text_content);
  }
} catch (error) {
  console.error("Conversion failed:", error);
}
```

Pass additional options as needed for specific functionality.

## YouTube Transcript Support

When converting YouTube files, you can pass the `enableYoutubeTranscript` and the `youtubeTranscriptLanguage` option to control the transcript extraction. By default it will use `"en"` if the `youtubeTranscriptLanguage` is not provided.

```typescript
const markitdown = new MarkItDown();
const result = await markitdown.convert("https://www.youtube.com/watch?v=V2qZ_lgxTzg", {
  enableYoutubeTranscript: true,
  youtubeTranscriptLanguage: "en"
});
```

## LLM Image Description Support

To enable LLM functionality, you need to configure a model and client in the `options` for the image converter. You can use the `@ai-sdk/openai` to get an LLM client.

```typescript
import { openai } from "@ai-sdk/openai";

const markitdown = new MarkItDown();
const result = await markitdown.convert("test.jpg", {
  llmModel: openai("gpt-4o-mini"),
  llmPrompt: "Write a detailed description of this image"
});
```

## API

The library uses a single function `convert` for all conversions, with the options and the response type defined as such:

```typescript
export interface DocumentConverter {
  convert(local_path: string, options: ConverterOptions): Promise<ConverterResult>;
}

export type ConverterResult =
  | {
      title: string | null;
      text_content: string;
    }
  | null
  | undefined;

export type ConverterOption = {
  file_extension?: string;
  url?: string;
  fetch?: typeof fetch;
  enableYoutubeTranscript?: boolean; // false by default
  youtubeTranscriptLanguage?: string; // "en" by default
  llmModel: string;
  llmPrompt?: string;
  styleMap?: string | Array<string>;
  _parent_converters?: DocumentConverter[];
  cleanup_extracted?: boolean;
};
```

## Examples

Check out the [examples](./examples) folder.

## License

MIT License © 2024 [Vaibhav Raj](https://github.com/dead8309)

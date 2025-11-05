# markitdown-ts

[![CI](https://github.com/dead8309/markitdown-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/dead8309/markitdown/actions/workflows/ci.yml)

`markitdown-ts` is a TypeScript library designed for converting various file formats to Markdown. It can process fiiles from local paths, URLs, or directly from in-memory buffers, making it ideal for serverless and edge environments like Supabase Functions or Cloudflare Workers.

It is a TypeScript implementation of the original `markitdown` [Python library.](https://github.com/microsoft/markitdown) and is suitable for indexing, text analysis, and other applications that benefit from structured text.

It supports:

- [x] PDF
- [x] Word (.docx)
- [x] Excel (.xlsx)
- [x] Images (EXIF metadata extraction and optional LLM-based description)
- [x] Audio (EXIF metadata extraction only)
- [x] HTML
- [x] Text-based formats (plain text, .csv, .xml, .rss, .atom)
- [x] Jupyter Notebooks (.ipynb)
- [x] Bing Search Result Pages (SERP)
- [x] ZIP files (recursively iterates over contents)
- [ ] PowerPoint

> [!NOTE]
>
> Speech Recognition for audio converter has not been implemented yet. I'm happy to accept contributions for this feature.

## Installation

Install `markitdown-ts` using your preferred package manager:

```bash
pnpm add markitdown-ts
```

## Usage

### Basic Usage (from a File Path)

The simplest way to use the library is by providing a local file path or a URL.

```typescript
import { MarkItDown } from "markitdown-ts";

const markitdown = new MarkItDown();
try {
  // Convert a local file
  const result = await markitdown.convert("path/to/your/file.pdf");

  // Or convert from a URL
  const result = await markitdown.convert("https://arxiv.org/pdf/2308.08155v2.pdf");

  if (result) {
    console.log(result.markdown);
  }
} catch (error) {
  console.error("Conversion failed:", error);
}
```

### Advanced Usage (from Buffers, Blobs, or Responses)

For use in serverless environments where you can't rely on a persistent filesystem, you can convert data directly from memory.

> [!IMPORTANT]
>
> This is the recommended approach for environments like **Supabase Edge Functions**, **Cloudflare Workers**, or **AWS Lambda**.

#### From a Buffer

If you have your file content in a `Buffer`, use the `convertBuffer` method. You **must** provide the `file_extension` in the options so the library knows which converter to use.

```typescript
import { MarkItDown } from "markitdown-ts";
import * as fs from "fs";

const markitdown = new MarkItDown();
try {
  const buffer = fs.readFileSync("path/to/your/file.docx");
  const result = await markitdown.convertBuffer(buffer, {
    file_extension: ".docx"
  });
  console.log(result?.text_content);
} catch (error) {
  console.error("Conversion failed:", error);
}
```

#### From a Response or Blob

You can pass a standard `Response` object directly to the `convert` method. This is perfect for handling file uploads from a request body.

```typescript
import { MarkItDown } from "markitdown-ts";

const markitdown = new MarkItDown();

// Example: Simulating a file upload by creating a Blob and a Response
const buffer = fs.readFileSync("path/to/archive.zip");
const blob = new Blob([buffer]);
const response = new Response(blob, {
  headers: { "Content-Type": "application/zip" }
});

try {
  const result = await markitdown.convert(response);
  console.log(result?.text_content);
} catch (error) {
  console.error("Conversion failed:", error);
}
```

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

The library exposes a `MarkItDown` class with two primary conversion methods.

```typescript
class MarkItDown {
  /**
   * Converts a source from a file path, URL, or Response object.
   */
  async convert(source: string | Response, options?: ConverterOptions): Promise<ConverterResult>;

  /**
   * Converts a source from an in-memory Buffer.
   */
  async convertBuffer(
    source: Buffer,
    options: ConverterOptions & { file_extension: string }
  ): Promise<ConverterResult>;
}

export type ConverterResult =
  | {
      title: string | null;
      markdown: string;
      /** @deprecated Use `markdown` instead. */
      text_content: string;
    }
  | null
  | undefined;

export type ConverterOption = {
  // Required when using convertBuffer
  file_extension?: string;

  // For URL-based converters (e.g., Wikipedia, Bing SERP)
  url?: string;

  // Provide a custom fetch implementation
  fetch?: typeof fetch;

  // YouTube-specific options
  enableYoutubeTranscript?: boolean; // Default: false
  youtubeTranscriptLanguage?: string; // Default: "en"

  // Image-specific LLM options
  llmModel?: LanguageModel;
  llmPrompt?: string;

  // Options for .docx conversion (passed to mammoth.js)
  styleMap?: string | Array<string>;

  // Options for .zip conversion
  cleanupExtracted?: boolean; // Default: true
};
```

## Examples

Check out the [examples](./examples) folder.

## License

MIT License © 2024 [Vaibhav Raj](https://github.com/dead8309)

import * as mime from "mime-types";
import path from "path";
import * as fs from "fs";
import { ConverterOptions, DocumentConverter, ConverterResult } from "./types";
import { PlainTextConverter } from "./converters/plain-text";
import { HtmlConverter } from "./converters/html";
import { RSSConverter } from "./converters/xml-rss-atom";
import { WikipediaConverter } from "./converters/wikipedia";
import { YouTubeConverter } from "./converters/youtube";
import { IpynbConverter } from "./converters/ipynb";
import { BingSerpConverter } from "./converters/bingserp";
import { PdfConverter } from "./converters/pdf";
import { DocxConverter } from "./converters/docx";
import { XlsxConverter } from "./converters/xlsx";
import { WavConverter } from "./converters/wav";
import { Mp3Converter } from "./converters/mp3";
import { ImageConverter } from "./converters/image";
import { ZipConverter } from "./converters/zip";

export class MarkItDown {
  private readonly converters: Array<DocumentConverter> = [];

  constructor() {
    this.register_converter(new PlainTextConverter());
    this.register_converter(new HtmlConverter());
    this.register_converter(new RSSConverter());
    this.register_converter(new WikipediaConverter());
    this.register_converter(new YouTubeConverter());
    this.register_converter(new BingSerpConverter());
    this.register_converter(new DocxConverter());
    this.register_converter(new XlsxConverter());
    this.register_converter(new WavConverter());
    this.register_converter(new Mp3Converter());
    this.register_converter(new ImageConverter());
    this.register_converter(new IpynbConverter());
    this.register_converter(new PdfConverter());
    this.register_converter(new ZipConverter());
  }

  /**
   * Converts a source from a file path, URL, or Response object.
   */
  async convert(
    source: string | Response,
    options: ConverterOptions = {}
  ): Promise<ConverterResult> {
    if (source instanceof Response) {
      return await this.convert_response(source, options);
    } else {
      if (
        source.startsWith("http://") ||
        source.startsWith("https://") ||
        source.startsWith("file://")
      ) {
        return await this.convert_url(source, options);
      } else {
        return this.convert_local(source, options);
      }
    }
  }

  /**
   * Converts a source from an in-memory Buffer.
   */
  async convertBuffer(
    source: Buffer,
    options: ConverterOptions & { file_extension: string }
  ): Promise<ConverterResult> {
    const extensions = new Set<string>([options.file_extension]);
    return this._convert(source, extensions, options);
  }

  private async convert_url(
    source: string,
    { fetch = globalThis.fetch, ...options }: ConverterOptions
  ): Promise<ConverterResult> {
    let response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${source}, status: ${response.status}`);
    }

    return await this.convert_response(response, options);
  }

  private async convert_response(
    response: Response,
    options: ConverterOptions
  ): Promise<ConverterResult> {
    const ext = options.file_extension;
    const extensions = ext ? new Set<string>([ext]) : new Set<string>();
    const contentType = response.headers?.get("content-type")?.split(";")[0];
    if (!contentType) {
      throw new Error("Response Content-Type header is missing");
    }

    const mimeExtension = mime.extension(contentType);
    if (mimeExtension) {
      //NOTE: . was missing from the starting of the string which lead to youtube
      // test to fail as it was not able to find the correct extension i.e .html
      extensions.add(`.${mimeExtension}`);
    }

    const content_disposition = response.headers?.get("content-disposition") || "";
    const fname = content_disposition.match(/filename="([^;]+)"/);
    if (fname) {
      extensions.add(path.extname(fname[1]));
    }

    if (response.url) {
      const url_ext = path.extname(new URL(response.url).pathname);
      extensions.add(url_ext);
    }

    if (extensions.size === 0) {
      throw new Error(
        "Could not determine file type. Please provide a `file_extension` in the options."
      );
    }

    if (response.body == null) {
      throw new Error("Response body is empty");
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return await this._convert(buffer, extensions, {
      ...options,
      url: response.url
    });
  }

  private async convert_local(source: string, options: ConverterOptions): Promise<ConverterResult> {
    const ext = options.file_extension;
    const extensions = ext ? new Set<string>(ext) : new Set<string>();
    if (!fs.existsSync(source)) {
      throw new Error(`File not found: ${source}`);
    }

    const extname = path.extname(source);
    if (extname === "") {
      throw new Error(`File extension not found: ${source}`);
    }

    if (!extensions.has(extname)) {
      extensions.add(extname);
    }

    return await this._convert(source, extensions, options);
  }

  private async _convert(
    source: string | Buffer,
    extensions: Set<string>,
    options: any = {}
  ): Promise<ConverterResult> {
    let error;

    for (const ext of extensions) {
      for (const converter of this.converters) {
        let res;
        try {
          const op: ConverterOptions = {
            ...options,
            file_extension: ext,
            _parent_converters: this.converters
          };
          res = await converter.convert(source, op);
        } catch (e) {
          error = e;
        }

        if (res != null) {
          res.markdown = res.markdown.replace(/(?:\r\n|\r|\n)/g, "\n").trim();
          res.markdown = res.markdown.replace(/\n{3,}/g, "\n\n");

          return res;
        }
      }
    }

    if (error) {
      throw new Error(
        `Could not convert ${source} to markdown. While converting the following error occurred: ${error}`
      );
    }
    throw new Error(
      `Could not convert ${source} to markdown format. The ${Array.from(extensions).join(
        ", "
      )} are not supported.`
    );
  }

  // NOTE: Inserts the converter at the beginning of the list
  private register_converter(converter: DocumentConverter) {
    this.converters.unshift(converter);
  }
}

import { describe, it, expect } from "vitest";
import { MarkItDown } from "../src/markitdown";
import * as path from "path";
import isCi from "is-ci";
import { openai } from "@ai-sdk/openai";
import {
  PLAIN_TEST,
  BLOG_TEST_URL,
  BLOG_TEST_STRINGS,
  RSS_TEST_STRINGS,
  WIKIPEDIA_TEST_URL,
  WIKIPEDIA_TEST_STRINGS,
  WIKIPEDIA_TEST_EXCLUDES,
  YOUTUBE_TEST_URL,
  YOUTUBE_TEST_STRINGS,
  IPYNB_TEST_STRINGS,
  SERP_TEST_URL,
  SERP_TEST_STRINGS,
  SERP_TEST_EXCLUDES,
  PDF_TEST_URL,
  PDF_TEST_STRINGS,
  DOCX_TEST_STRINGS,
  DOCX_COMMENT_TEST_STRINGS,
  XLSX_TEST_STRINGS,
  WAV_TEST_STRINGS,
  JPG_TEST_EXIFTOOL,
  LLM_TEST_STRINGS
} from "./test.data";

describe("MarkItDown Tests", () => {
  describe("Plain Text Converter", () => {
    it("should convert plain text", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test.txt"));
      expect(result).toBeTruthy();
      const textContent = result?.text_content.replace("\\", "");
      expect(result?.title).toBeNull();
      for (const testStr of PLAIN_TEST) {
        expect(textContent).toContain(testStr);
      }
    });
  });
  describe("HTML Converter", () => {
    it("should convert HTML to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test_blog.html"), {
        url: BLOG_TEST_URL
      });
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of BLOG_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });

  describe("RSS Converter", () => {
    it("should convert RSS to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test_rss.xml"));
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of RSS_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });

  describe("Wikipedia Converter", () => {
    it("should convert Wikipedia to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test_wikipedia.html"), {
        url: WIKIPEDIA_TEST_URL
      });
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of WIKIPEDIA_TEST_EXCLUDES) {
        expect(textContent).not.toContain(testString);
      }
      for (const testString of WIKIPEDIA_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });

  if (!isCi) {
    describe("Youtube Converter", () => {
      it("should convert YouTube to markdown with transcript", async () => {
        const markitdown = new MarkItDown();
        const result = await markitdown.convert(YOUTUBE_TEST_URL, {
          enableYoutubeTranscript: true
        });
        expect(result).not.toBeNull();
        expect(result).not.toBeUndefined();
        const textContent = result?.text_content.replace("\\", "");
        for (const testString of YOUTUBE_TEST_STRINGS) {
          expect(textContent).toContain(testString);
        }
      }, 30000);
    });
  }

  describe("IPYNB Converter", () => {
    it("should convert .ipynb to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test_notebook.ipynb"));
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of IPYNB_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });
  describe("BingSerp Converter", () => {
    it("should convert Bing SERP to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test_serp.html"), {
        url: SERP_TEST_URL
      });
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of SERP_TEST_EXCLUDES) {
        expect(textContent).not.toContain(testString);
      }
      for (const testString of SERP_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });
  describe("PDF Converter", () => {
    it("should convert PDF to text", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test.pdf"), {
        url: PDF_TEST_URL
      });
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of PDF_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });
  describe("DOCX Converter", () => {
    it("should convert .docx to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test.docx"));
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of DOCX_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
    it("should convert .docx to markdown with comments", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(
        path.join(__dirname, "__files/test_with_comment.docx"),
        { styleMap: "comment-reference => " }
      );
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of DOCX_COMMENT_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });
  describe("XLSX Converter", () => {
    it("should convert .xlsx to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test.xlsx"));
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of XLSX_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });

  describe("WAV Converter", () => {
    it("should convert .wav metadata to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test.wav"));
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of WAV_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });

  describe("Image Converter", () => {
    it("should process .jpg metadata", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test.jpg"));
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      Object.entries(JPG_TEST_EXIFTOOL).forEach(([key, value]) => {
        const target = `${key}: ${value}`;
        expect(textContent).toContain(target);
      });
    });

    if (process.env.OPENAI_API_KEY && !isCi) {
      it("should process .jpg metadata with ai", { timeout: 30000 }, async () => {
        const markitdown = new MarkItDown();
        const result = await markitdown.convert(path.join(__dirname, "__files/test.jpg"), {
          llmModel: openai("gpt-4o-mini")
        });
        expect(result).not.toBeNull();
        expect(result).not.toBeUndefined();
        const textContent = result?.text_content.replace("\\", "");
        Object.entries(JPG_TEST_EXIFTOOL).forEach(([key, value]) => {
          const target = `${key}: ${value}`;
          expect(textContent).toContain(target);
        });
      });
    }

    if (process.env.OPENAI_API_KEY && !isCi) {
      it("should process colors, texts in images with llm", { timeout: 30000 }, async () => {
        const markitdown = new MarkItDown();
        const result = await markitdown.convert(path.join(__dirname, "__files/test_llm.jpg"), {
          llmModel: openai("gpt-4o-mini")
        });
        expect(result).not.toBeNull();
        expect(result).not.toBeUndefined();
        const textContent = result?.text_content.replace("\\", "");
        for (const testString of LLM_TEST_STRINGS) {
          expect(textContent).toContain(testString);
        }
        for (const testString of ["red", "circle", "blue", "square"]) {
          expect(textContent?.toLowerCase()).toContain(testString.toLowerCase());
        }
      });
    }
  });

  describe("Zip Converter", () => {
    it("should convert .zip file contents to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(path.join(__dirname, "__files/test_files.zip"));
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
      const textContent = result?.text_content.replace("\\", "");
      for (const testString of DOCX_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });
  });
});

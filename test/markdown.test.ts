import { MarkItDown } from "../src/markitdown";
import { describe, it, expect, vi } from "vitest";
import isCi from "is-ci";
import { openai } from "@ai-sdk/openai";

const PLAIN_TEST = ["hello world", "hi there", "bye bye"];

const BLOG_TEST_URL = "https://microsoft.github.io/autogen/blog/2023/04/21/LLM-tuning-math";
const BLOG_TEST_STRINGS = [
  "Large language models (LLMs) are powerful tools that can generate natural language texts for various applications, such as chatbots, summarization, translation, and more. GPT-4 is currently the state of the art LLM in the world. Is model selection irrelevant? What about inference parameters?",
  "an example where high cost can easily prevent a generic complex"
];

const RSS_TEST_STRINGS = [
  "The Official Microsoft Blog",
  "In the case of AI, it is absolutely true that the industry is moving incredibly fast"
];

const WIKIPEDIA_TEST_URL = "https://en.wikipedia.org/wiki/Microsoft";
const WIKIPEDIA_TEST_STRINGS = [
  "Microsoft entered the operating system (OS) business in 1980 with its own version of [Unix]",
  'Microsoft was founded by [Bill Gates](/wiki/Bill_Gates "Bill Gates")'
];
const WIKIPEDIA_TEST_EXCLUDES = [
  "You are encouraged to create an account and log in",
  "154 languages",
  "move to sidebar"
];

const YOUTUBE_TEST_URL = "https://www.youtube.com/watch?v=V2qZ_lgxTzg";
const YOUTUBE_TEST_STRINGS = [
  "## AutoGen FULL Tutorial with Python (Step-By-Step)",
  "This is an intermediate tutorial for installing and using AutoGen locally",
  "PT15M4S",
  "the model we&amp;#39;re going to be using today is GPT 3.5 turbo"
];

const IPYNB_TEST_STRINGS = [
  "Test Notebook",
  "## Code Cell Below",
  "print(42)",
  "print('markitdown')"
];

const SERP_TEST_URL = "https://www.bing.com/search?q=microsoft+wikipedia";
const SERP_TEST_STRINGS = [
  "](https://en.wikipedia.org/wiki/Microsoft",
  "Microsoft Corporation is **an American multinational corporation and technology company headquartered** in Redmond",
  "*   1995–2007: Foray into the Web, Windows 95, Windows XP, and Xbox"
];
const SERP_TEST_EXCLUDES = [
  "https://www.bing.com/ck/a?!&&p=",
  "data:image/svg+xml,%3Csvg%20width%3D"
];

const PDF_TEST_URL = "https://arxiv.org/pdf/2308.08155v2.pdf";
const PDF_TEST_STRINGS = ["While there is contemporaneous exploration of multi-agent approaches"];

const DOCX_TEST_STRINGS = [
  "314b0a30-5b04-470b-b9f7-eed2c2bec74a",
  "49e168b7-d2ae-407f-a055-2167576f39a1",
  "## d666f1f7-46cb-42bd-9a39-9a39cf2a509f",
  "# Abstract",
  "# Introduction",
  "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation"
];

const DOCX_COMMENT_TEST_STRINGS = [
  "314b0a30-5b04-470b-b9f7-eed2c2bec74a",
  "49e168b7-d2ae-407f-a055-2167576f39a1",
  "## d666f1f7-46cb-42bd-9a39-9a39cf2a509f",
  "# Abstract",
  "# Introduction",
  "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",
  "This is a test comment. 12df-321a",
  "Yet another comment in the doc. 55yiyi-asd09"
];

const XLSX_TEST_STRINGS = [
  "## 09060124-b5e7-4717-9d07-3c046eb",
  "6ff4173b-42a5-4784-9b19-f49caff4d93d",
  "affc7dad-52dc-4b98-9b5d-51e65d8a8ad0"
];

const PPTX_TEST_STRINGS = [
  "2cdda5c8-e50e-4db4-b5f0-9722a649f455",
  "04191ea8-5c73-4215-a1d3-1cfb43aaaf12",
  "44bf7d06-5e7a-4a40-a2e1-a2e42ef28c8a",
  "1b92870d-e3b5-4e65-8153-919f4ff45592",
  "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",
  "a3f6004b-6f4f-4ea8-bee3-3741f4dc385f", // chart title
  "2003" // chart value
];

const WAV_TEST_STRINGS = ["Duration: 0:00:51", "Audio Transcript:"];

const JPG_TEST_EXIFTOOL = {
  Author: "AutoGen Authors",
  Title: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",
  Description: "AutoGen enables diverse LLM-based applications",
  ImageSize: "1615x1967",
  DateTimeOriginal: "2024:03:14 22:10:00"
};

const LLM_TEST_STRINGS = ["5bda1dd6"];

//NOTE: Dont forget to add new converters to the markitdown class converters array
describe("MarkItDown Tests", () => {
   it("should convert plain text", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test.txt`);

     expect(result).toBeTruthy();

     const textContent = result?.text_content.replace("\\", "");
     expect(result?.title).toBeNull();

     for (const testStr of PLAIN_TEST) {
       expect(textContent).toContain(testStr);
     }
   });

   it("should convert HTML to markdown", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test_blog.html`, {
       url: BLOG_TEST_URL
     });

     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");
     for (const testString of BLOG_TEST_STRINGS) {
       expect(textContent).toContain(testString);
     }
   });

   it("should convert RSS to markdown", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test_rss.xml`);
     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");
     for (const testString of RSS_TEST_STRINGS) {
       expect(textContent).toContain(testString);
     }
   });

   it("should convert Wikipedia to markdown", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test_wikipedia.html`, {
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

   if (!isCi) {
     it("should convert YouTube to markdown", async () => {
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
     });
   }

   it("should convert .ipynb to markdown", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test_notebook.ipynb`);

     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");
     for (const testString of IPYNB_TEST_STRINGS) {
       expect(textContent).toContain(testString);
     }
   });

   it("should convert Bing SERP to markdown", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test_serp.html`, {
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

   it("should convert PDF to text", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test.pdf`, {
       url: PDF_TEST_URL
     });

     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");
     for (const testString of PDF_TEST_STRINGS) {
       expect(textContent).toContain(testString);
     }
   });

   it("should convert .docx to markdown", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test.docx`);

     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");
     for (const testString of DOCX_TEST_STRINGS) {
       expect(textContent).toContain(testString);
     }
   });

   it("should convert .docx to markdown with comments", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test_with_comment.docx`, {
       styleMap: "comment-reference => "
     });

     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");
     for (const testString of DOCX_COMMENT_TEST_STRINGS) {
       expect(textContent).toContain(testString);
     }
   });

   it("should convert .xlsx to markdown", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test.xlsx`);

     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");
     for (const testString of XLSX_TEST_STRINGS) {
       expect(textContent).toContain(testString);
     }
   });

   it("should convert .wav metadata to markdown", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test.wav`);

     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");
     for (const testString of WAV_TEST_STRINGS) {
       expect(textContent).toContain(testString);
     }
   });

   it("process .jpg metadata", async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test.jpg`);

     expect(result).not.toBeNull();
     expect(result).not.toBeUndefined();

     const textContent = result?.text_content.replace("\\", "");

     Object.entries(JPG_TEST_EXIFTOOL).forEach(([key, value]) => {
       const target = `${key}: ${value}`;
       expect(textContent).toContain(target);
     });
   });

   // Uncomment this test to test with openai
   it("process .jpg metadata with ai", { timeout: 30000 }, async () => {
     const markitdown = new MarkItDown();
     const result = await markitdown.convert(`${__dirname}/__files/test.jpg`, {
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

    it("should convert .zip file contents to markdown", async () => {
      const markitdown = new MarkItDown();
      const result = await markitdown.convert(`${__dirname}/__files/test_files.zip`);

      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();

      const textContent = result?.text_content.replace("\\", "");
      for (const testString of DOCX_TEST_STRINGS) {
        expect(textContent).toContain(testString);
      }
    });

  it("should process colors, texts in images with llm", { timeout: 30000 }, async () => {
    const markitdown = new MarkItDown();
    const result = await markitdown.convert(`${__dirname}/__files/test_llm.jpg`, {
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
});

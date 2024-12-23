import { MarkItDown } from "../src/markitdown";
import { describe, it, expect, vi } from "vitest";

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
});

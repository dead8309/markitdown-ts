import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const URLS = [
    "https://microsoft.github.io/autogen/blog/2023/04/21/LLM-tuning-math",
    "https://en.wikipedia.org/wiki/Microsoft",
    "https://www.youtube.com/watch?v=V2qZ_lgxTzg",
    "https://www.bing.com/search?q=microsoft+wikipedia",
    "https://arxiv.org/pdf/2308.08155v2.pdf"
  ];
  for (const url of URLS) {
    const result = await markitdown.convert(url);
    console.log(result?.markdown);
  }
})();

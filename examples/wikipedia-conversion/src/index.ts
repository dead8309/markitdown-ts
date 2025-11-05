import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const wikipediaFile = "./test_wikipedia.html";
  const result = await markitdown.convert(wikipediaFile);
  console.log(result?.markdown);
})();

import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const htmlFile = "./test.html";
  const result = await markitdown.convert(htmlFile);
  console.log(result?.markdown);
})();

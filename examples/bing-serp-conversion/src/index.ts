import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const serpFile = "./test_serp.html";
  const result = await markitdown.convert(serpFile);
  console.log(result?.text_content);
})();

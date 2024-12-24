import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const textFile = "./test.txt";
  const result = await markitdown.convert(textFile);
  console.log(result?.text_content);
})();

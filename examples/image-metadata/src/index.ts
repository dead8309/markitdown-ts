import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const imageFile = "./test.jpg";
  const result = await markitdown.convert(imageFile);
  console.log(result?.text_content);
})();

import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const pdfFile = "./test.pdf";
  const result = await markitdown.convert(pdfFile);
  console.log(result?.text_content);
})();

import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const docxFile = "./test.docx";
  const result = await markitdown.convert(docxFile);
  console.log(result?.text_content);
})();

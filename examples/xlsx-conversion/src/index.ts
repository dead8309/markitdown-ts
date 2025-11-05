import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const xlsxFile = "./test.xlsx";
  const result = await markitdown.convert(xlsxFile);
  console.log(result?.markdown);
})();

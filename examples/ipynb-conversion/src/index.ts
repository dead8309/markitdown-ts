import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const ipynbFile = "./test_notebook.ipynb";
  const result = await markitdown.convert(ipynbFile);
  console.log(result?.text_content);
})();

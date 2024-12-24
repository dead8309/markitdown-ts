import { MarkItDown } from "markitdown-ts";
import path from "path";

(async () => {
  const markitdown = new MarkItDown();
  const zipFile = path.normalize(`${__dirname}/../test_files.zip`);
  const result = await markitdown.convert(zipFile);
  console.log(result?.text_content);
})();

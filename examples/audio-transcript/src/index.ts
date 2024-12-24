import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const audioFile = "./test.wav";
  const result = await markitdown.convert(audioFile);
  console.log(result?.text_content);
})();

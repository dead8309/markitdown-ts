import { openai } from "@ai-sdk/openai";
import { MarkItDown } from "markitdown-ts";
import { configDotenv } from "dotenv";

configDotenv();

(async () => {
  const markitdown = new MarkItDown();
  const imageFile = "./test.jpg";
  const result = await markitdown.convert(imageFile, {
    llmModel: openai("gpt-4o-mini"),
  });
  console.log(result?.markdown);
})();

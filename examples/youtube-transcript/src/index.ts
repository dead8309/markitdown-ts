import { MarkItDown } from "markitdown-ts";

(async () => {
  const markitdown = new MarkItDown();
  const result = await markitdown.convert("https://www.youtube.com/watch?v=V2qZ_lgxTzg", {
    enableYoutubeTranscript: true,
    youtubeTranscriptLanguage: "en"
  });
  console.log(result?.text_content);
})();

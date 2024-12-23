import TurndownService from "turndown";
import turndownPluginGfm from "@joplin/turndown-plugin-gfm";

export class CustomTurnDown {
  convert_soup(doc: string | TurndownService.Node): string {
    let turnDownService = new TurndownService({
      headingStyle: "atx"
    });
    turnDownService.use(turndownPluginGfm.gfm);

    turnDownService.addRule("anchor tags", {
      filter: ["a"],
      replacement: function (content, node) {
        if (content === "") {
          return "";
        }

        let prefix = "";
        let suffix = "";
        if (content && content[0] === " ") {
          prefix = " ";
        }
        if (content && content[content.length - 1] === " ") {
          suffix = " ";
        }

        //NOTE:replace all the characters after \n\n with empty string if its present
        let text = content.trim().replace(/\n\n.*/g, "");
        if (text === "") {
          return "";
        }

        // NOTE: Ignore the type error for getAttribute and title call
        // @ts-ignore
        let href = node.getAttribute("href");
        // @ts-ignore
        let title = node.title;

        if (href) {
          try {
            let parsed_url = new URL(href);
            if (!["https:", "http:", "file:"].includes(parsed_url.protocol)) {
              return `${prefix}${text}${suffix}`;
            }
            // NOTE: Some Tests were failing if the href was encoded
            // href = encodeURIComponent(parsed_url.pathname);
          } catch (e) {
            if (!/^https?:|^file:/.test(href)) {
              return `${prefix}[${text}](${href} "${title}")${suffix}`;
            }
            return `${prefix}${text}${suffix}`;
          }
        }

        if (text.replace(/\\_/g, "_") === href && !title) {
          return `<${href}>`;
        }

        if (!title && href) {
          title = href;
        }

        let title_part = title ? ` "${title}"` : "";

        return `${prefix}[${text}](${href}${title_part})${suffix}`;
      }
    });

    turnDownService.addRule("img tags", {
      filter: ["img"],
      replacement: function (_, node) {
        if (!node || node.nodeName !== "IMG") {
          return "";
        }

        // NOTE: Ignore the type error for getAttribute calls
        // @ts-ignore
        let alt = node.getAttribute("alt") || "";
        // @ts-ignore
        let src = node.getAttribute("src") || "";
        // @ts-ignore
        let title = node.getAttribute("title") || "";

        let titlePart = title ? ` "${title}"` : "";

        if (src.startsWith("data:")) {
          src = src.split(",")[0] + "...";
        }

        return `![${alt}](${src}${titlePart})`;
      }
    });

    let markdown = turnDownService.turndown(doc);
    return markdown;
  }
}

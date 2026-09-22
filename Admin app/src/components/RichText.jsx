import { sanitizeRichHtml, hasRichHtml, richHtmlHasText } from "../lib/richText.js";

/** Safe rich-text display for admin previews (matches customer RichText). */
export function RichText({ as: Tag = "div", className = "", html, ...rest }) {
  const content = String(html ?? "").trim();
  if (!richHtmlHasText(content)) return null;

  if (!hasRichHtml(content)) {
    return (
      <Tag className={className} {...rest}>
        {content}
      </Tag>
    );
  }

  return (
    <Tag
      className={`rich-text ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
      {...rest}
    />
  );
}

import { sanitizeRichHtml, hasRichHtml } from "../../lib/richText.js";

export function RichText({ as: Tag = "div", className = "", html, ...rest }) {
  const content = String(html ?? "").trim();
  if (!content) return null;

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

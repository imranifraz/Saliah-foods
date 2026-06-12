const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "strike",
  "del",
  "a",
  "p",
  "div",
  "br",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
]);

const ALIGN_TAGS = new Set(["p", "div", "h2", "h3", "li", "blockquote"]);

function readAlignStyle(match) {
  const styleMatch = match.match(/style\s*=\s*("([^"]*)"|'([^']*)')/i);
  const style = styleMatch?.[1] || styleMatch?.[2] || "";
  const alignMatch = style.match(/text-align\s*:\s*(left|center|right|justify)/i);
  return alignMatch?.[1]?.toLowerCase() ?? "";
}

export function sanitizeRichHtml(input) {
  const value = String(input ?? "").trim();
  if (!value) return "";
  if (!/[<>]/.test(value)) return value;

  let out = value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  out = out.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
    const normalized = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(normalized)) return "";

    if (match.startsWith("</")) return `</${normalized}>`;
    if (normalized === "br") return "<br>";

    if (normalized === "a") {
      const hrefMatch = match.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = (hrefMatch?.[2] || hrefMatch?.[3] || hrefMatch?.[4] || "").trim();
      if (!href || /^javascript:/i.test(href) || /^data:/i.test(href)) return "";
      const safeHref = href.replace(/"/g, "&quot;");
      return `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">`;
    }

    const align = ALIGN_TAGS.has(normalized) ? readAlignStyle(match) : "";
    if (align) return `<${normalized} style="text-align: ${align}">`;

    return `<${normalized}>`;
  });

  return out.trim();
}

export function hasRichHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value ?? ""));
}

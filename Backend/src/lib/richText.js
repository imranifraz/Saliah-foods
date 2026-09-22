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
  "span",
  "font",
]);

const STYLE_TAGS = new Set(["p", "div", "h2", "h3", "li", "blockquote", "span"]);

const FONT_SIZE_BY_ATTR = {
  1: "12px",
  2: "13px",
  3: "16px",
  4: "18px",
  5: "22px",
  6: "28px",
  7: "32px",
};

const NAMED_FONT_SIZES = {
  "x-small": "12px",
  small: "13px",
  medium: "16px",
  large: "18px",
  "x-large": "22px",
  "xx-large": "28px",
  "xxx-large": "32px",
  "-webkit-xxx-large": "32px",
};

function normalizeFontSize(raw) {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "");
  if (!value) return "";
  if (NAMED_FONT_SIZES[value]) return NAMED_FONT_SIZES[value];
  const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (pxMatch) {
    const px = Math.round(Number(pxMatch[1]));
    if (px >= 10 && px <= 48) return `${px}px`;
  }
  return "";
}

function readSafeStyles(match) {
  const styleMatch = match.match(/style\s*=\s*("([^"]*)"|'([^']*)')/i);
  const style = styleMatch?.[2] || styleMatch?.[3] || "";
  if (!style) return "";

  const parts = [];

  const alignMatch = style.match(/text-align\s*:\s*(left|center|right|justify)/i);
  if (alignMatch) parts.push(`text-align: ${alignMatch[1].toLowerCase()}`);

  const sizeMatch = style.match(/font-size\s*:\s*([^;]+)/i);
  if (sizeMatch) {
    const size = normalizeFontSize(sizeMatch[1]);
    if (size) parts.push(`font-size: ${size}`);
  }

  if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) parts.push("font-weight: 700");
  if (/font-style\s*:\s*italic/i.test(style)) parts.push("font-style: italic");
  if (/text-decoration\s*:[^;]*underline/i.test(style)) parts.push("text-decoration: underline");
  if (/text-decoration\s*:[^;]*line-through/i.test(style)) {
    parts.push("text-decoration: line-through");
  }

  return parts.join("; ");
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

    if (match.startsWith("</")) {
      if (normalized === "font") return "</span>";
      return `</${normalized}>`;
    }
    if (normalized === "br") return "<br>";

    if (normalized === "a") {
      const hrefMatch = match.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = (hrefMatch?.[2] || hrefMatch?.[3] || hrefMatch?.[4] || "").trim();
      if (!href || /^javascript:/i.test(href) || /^data:/i.test(href)) return "";
      const safeHref = href.replace(/"/g, "&quot;");
      return `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">`;
    }

    if (normalized === "font") {
      const sizeAttr = match.match(/size\s*=\s*("([^"]*)"|'([^']*)'|([1-7]))/i);
      const sizeKey = sizeAttr?.[2] || sizeAttr?.[3] || sizeAttr?.[4] || "3";
      const px = FONT_SIZE_BY_ATTR[sizeKey] || "16px";
      return `<span style="font-size: ${px}">`;
    }

    if (STYLE_TAGS.has(normalized)) {
      const styles = readSafeStyles(match);
      return styles ? `<${normalized} style="${styles}">` : `<${normalized}>`;
    }

    return `<${normalized}>`;
  });

  return out.trim();
}

export function sanitizeOptionalRichHtml(input) {
  const sanitized = sanitizeRichHtml(input);
  return sanitized || String(input ?? "").trim();
}

export function hasRichHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value ?? ""));
}

export function richHtmlHasText(input) {
  return (
    String(input ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim().length > 0
  );
}

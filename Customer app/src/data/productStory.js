/**
 * Parse catalog fullDescription into structured PDP story blocks.
 * Supports plain text with section headings (Product Highlights, Ingredients, Nutrition…).
 */
const SECTION_HEADINGS = [
  "Product Highlights",
  "Highlights",
  "Ingredients",
  "Ingredient",
  "Nutrition Information",
  "Nutrition Information — Per 100g",
  "Nutrition",
  "Country of Origin",
  "Origin",
  "Storage",
  "Best Before",
  "Important Information",
  "Brand",
  "Product Facts",
  "Note",
];

function normalizeLineEndings(value) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function isSectionHeading(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed) return false;

  // "Label: value" on one line is content/fact data, not a section title.
  if (/^[^:：]+[:：]\s+\S/.test(trimmed)) return false;

  const cleaned = trimmed.replace(/[:：]\s*$/, "").trim().toLowerCase();
  return SECTION_HEADINGS.some((heading) => cleaned === heading.toLowerCase());
}

function headingKey(line) {
  const cleaned = line.replace(/[:：]\s*$/, "").trim().toLowerCase();
  if (cleaned === "product highlights" || cleaned === "highlights") return "highlights";
  if (cleaned === "ingredients" || cleaned === "ingredient") return "ingredients";
  if (cleaned.startsWith("nutrition")) return "nutrition";
  if (cleaned === "country of origin" || cleaned === "origin") return "origin";
  if (cleaned === "storage") return "storage";
  if (cleaned === "best before") return "bestBefore";
  if (cleaned === "important information") return "important";
  if (cleaned === "note") return "note";
  if (cleaned === "brand" || cleaned === "product facts") return "facts";
  return "other";
}

function splitOverviewParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, " ").trim())
    .filter(Boolean);
}

function parseListLines(body) {
  return body
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function parseFactLines(body) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([^:：]+)[:：]\s*(.+)$/);
      if (match) return { label: match[1].trim(), value: match[2].trim() };
      return { label: "", value: line };
    });
}

function parseNutritionLines(body) {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^values are approximate/i.test(line))
    .map((line) => {
      const match = line.match(/^([^:：]+)[:：]\s*(.+)$/);
      if (match) return { label: match[1].trim(), value: match[2].trim() };
      return null;
    })
    .filter(Boolean);
}

/**
 * @param {string} fullDescription
 * @returns {{
 *   overview: string[],
 *   highlights: string[],
 *   ingredients: string,
 *   nutrition: { label: string, value: string }[],
 *   nutritionNote: string,
 *   origin: string,
 *   storage: string,
 *   bestBefore: string,
 *   important: string,
 *   facts: { label: string, value: string }[],
 * }}
 */
export function parseProductStoryContent(fullDescription) {
  const empty = {
    overview: [],
    highlights: [],
    ingredients: "",
    nutrition: [],
    nutritionNote: "",
    origin: "",
    storage: "",
    bestBefore: "",
    important: "",
    facts: [],
  };

  const raw = normalizeLineEndings(fullDescription);
  if (!raw) return empty;

  const lines = raw.split("\n");
  const blocks = [];
  let current = { key: "overview", title: "", lines: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && isSectionHeading(trimmed)) {
      blocks.push(current);
      current = { key: headingKey(trimmed), title: trimmed.replace(/[:：]\s*$/, "").trim(), lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  blocks.push(current);

  const result = { ...empty };

  for (const block of blocks) {
    const body = block.lines.join("\n").trim();
    if (!body && block.key !== "overview") continue;

    switch (block.key) {
      case "overview":
        result.overview = splitOverviewParagraphs(body);
        break;
      case "highlights":
        result.highlights = parseListLines(body);
        break;
      case "ingredients":
        result.ingredients = body.replace(/\n+/g, " ").trim();
        break;
      case "nutrition": {
        const noteMatch = body.match(/Values are approximate[^\n]*/i);
        if (noteMatch) result.nutritionNote = noteMatch[0].trim();
        result.nutrition = parseNutritionLines(body);
        break;
      }
      case "origin":
        result.origin = body.replace(/\n+/g, " ").trim();
        break;
      case "storage":
        result.storage = body.replace(/\n+/g, " ").trim();
        break;
      case "bestBefore":
        result.bestBefore = body.replace(/\n+/g, " ").trim();
        break;
      case "important":
        result.important = body.replace(/\n+/g, " ").trim();
        break;
      case "facts":
        result.facts = parseFactLines(body);
        break;
      case "note":
        // Skip editorial / internal notes from the storefront.
        break;
      default:
        break;
    }
  }

  // Catch trailing "Brand: …" style rows that lived under overview when headings were missing.
  if (!result.facts.length) {
    const leftoverFacts = [];
    const keptOverview = [];
    for (const paragraph of result.overview) {
      if (/^(Brand|Product|Net Weight|Ingredient|Country of Origin|FSSAI)\b/i.test(paragraph)) {
        leftoverFacts.push(...parseFactLines(paragraph.replace(/\s{2,}/g, "\n")));
      } else {
        keptOverview.push(paragraph);
      }
    }
    result.overview = keptOverview;
    result.facts = leftoverFacts;
  }

  return result;
}

export function serializeProductStory(story = {}) {
  const overviewText = Array.isArray(story.overview)
    ? story.overview.join("\n\n")
    : normalizeLineEndings(story.overview);

  const highlights = (Array.isArray(story.highlights) ? story.highlights : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  const ingredients = String(story.ingredients || "").trim();
  const nutrition = (Array.isArray(story.nutrition) ? story.nutrition : [])
    .map((row) => ({
      label: String(row?.label || "").trim(),
      value: String(row?.value || "").trim(),
    }))
    .filter((row) => row.label && row.value);
  const nutritionNote = String(story.nutritionNote || "").trim();
  const origin = String(story.origin || "").trim();
  const storage = String(story.storage || "").trim();
  const bestBefore = String(story.bestBefore || "").trim();
  const important = String(story.important || "").trim();
  const facts = (Array.isArray(story.facts) ? story.facts : [])
    .map((row) => ({
      label: String(row?.label || "").trim(),
      value: String(row?.value || "").trim(),
    }))
    .filter((row) => row.label && row.value);

  const parts = [];
  if (overviewText) parts.push(overviewText);

  if (highlights.length) {
    parts.push(["Product Highlights", ...highlights].join("\n"));
  }
  if (ingredients) {
    parts.push(`Ingredients\n${ingredients}`);
  }
  if (nutrition.length) {
    const nutritionLines = nutrition.map((row) => `${row.label}: ${row.value}`);
    if (nutritionNote) nutritionLines.push(nutritionNote);
    parts.push(["Nutrition Information — Per 100g", ...nutritionLines].join("\n"));
  }
  if (origin) parts.push(`Country of Origin\n${origin}`);
  if (storage) parts.push(`Storage\n${storage}`);
  if (bestBefore) parts.push(`Best Before\n${bestBefore}`);
  if (important) parts.push(`Important Information\n${important}`);
  if (facts.length) {
    parts.push(["Product Facts", ...facts.map((row) => `${row.label}: ${row.value}`)].join("\n"));
  }

  return parts.join("\n\n").trim();
}

export function resolveProductHighlights(benefits, parsedHighlights = []) {
  const fromBenefits = Array.isArray(benefits)
    ? benefits.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  // Prefer clean short benefit chips; fall back to parsed highlight list.
  const looksBroken =
    fromBenefits.length > 0 &&
    fromBenefits.some((item) => item.length > 120 || /^[a-z]/.test(item) || item.split("–").length > 2);

  if (fromBenefits.length && !looksBroken) return fromBenefits;
  if (parsedHighlights.length) return parsedHighlights;
  return fromBenefits;
}

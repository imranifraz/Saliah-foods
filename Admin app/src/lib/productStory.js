/**
 * Product story format shared with the customer PDP.
 * fullDescription uses section headings the storefront parser understands.
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

export function createEmptyProductStory() {
  return {
    overview: "",
    highlights: [],
    ingredients: "",
    nutrition: [],
    nutritionNote: "Values are approximate as stated on the product packaging.",
    origin: "",
    storage: "Keep in a dry and cool area and keep away from direct sunlight.",
    bestBefore: "",
    important: "",
    facts: [],
  };
}

function normalizeLineEndings(value) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function isSectionHeading(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed) return false;
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

export function parseProductStoryContent(fullDescription) {
  const empty = createEmptyProductStory();
  empty.overview = "";
  empty.nutritionNote = "";
  empty.storage = "";

  const raw = normalizeLineEndings(fullDescription);
  if (!raw) return empty;

  const lines = raw.split("\n");
  const blocks = [];
  let current = { key: "overview", lines: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && isSectionHeading(trimmed)) {
      blocks.push(current);
      current = { key: headingKey(trimmed), lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  blocks.push(current);

  const result = { ...empty, overview: "", highlights: [], nutrition: [], facts: [] };

  for (const block of blocks) {
    const body = block.lines.join("\n").trim();
    if (!body && block.key !== "overview") continue;

    switch (block.key) {
      case "overview":
        result.overview = splitOverviewParagraphs(body).join("\n\n");
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
      default:
        break;
    }
  }

  if (!result.facts.length) {
    const leftoverFacts = [];
    const keptOverview = [];
    for (const paragraph of splitOverviewParagraphs(result.overview)) {
      if (/^(Brand|Product|Net Weight|Ingredient|Country of Origin|FSSAI)\b/i.test(paragraph)) {
        leftoverFacts.push(...parseFactLines(paragraph.replace(/\s{2,}/g, "\n")));
      } else {
        keptOverview.push(paragraph);
      }
    }
    result.overview = keptOverview.join("\n\n");
    result.facts = leftoverFacts;
  }

  return result;
}

export function resolveProductHighlights(benefits, parsedHighlights = []) {
  const fromBenefits = Array.isArray(benefits)
    ? benefits.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  const looksBroken =
    fromBenefits.length > 0 &&
    fromBenefits.some((item) => item.length > 120 || /^[a-z]/.test(item) || item.split("–").length > 2);

  if (fromBenefits.length && !looksBroken) return fromBenefits;
  if (parsedHighlights.length) return parsedHighlights;
  return fromBenefits;
}

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanPairs(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => ({
      label: String(row?.label || "").trim(),
      value: String(row?.value || "").trim(),
    }))
    .filter((row) => row.label && row.value);
}

/**
 * Serialize structured story fields into the catalog fullDescription format.
 */
export function serializeProductStory(story = {}) {
  const overview = normalizeLineEndings(story.overview);
  const highlights = cleanLines(story.highlights);
  const ingredients = String(story.ingredients || "").trim();
  const nutrition = cleanPairs(story.nutrition);
  const nutritionNote = String(story.nutritionNote || "").trim();
  const origin = String(story.origin || "").trim();
  const storage = String(story.storage || "").trim();
  const bestBefore = String(story.bestBefore || "").trim();
  const important = String(story.important || "").trim();
  const facts = cleanPairs(story.facts);

  const parts = [];
  if (overview) parts.push(overview);

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

export function storyFromProduct({ fullDescription = "", benefits = [], name = "", packSize = "" } = {}) {
  const parsed = parseProductStoryContent(fullDescription);
  const highlights = resolveProductHighlights(benefits, parsed.highlights);

  const facts = [...parsed.facts];
  if (name && !facts.some((row) => row.label.toLowerCase() === "product")) {
    facts.unshift({ label: "Product", value: name });
  }
  if (packSize && !facts.some((row) => /net weight/i.test(row.label))) {
    facts.push({ label: "Net Weight", value: packSize });
  }

  return {
    overview: parsed.overview || "",
    highlights,
    ingredients: parsed.ingredients || "",
    nutrition: parsed.nutrition.length
      ? parsed.nutrition
      : [{ label: "", value: "" }],
    nutritionNote:
      parsed.nutritionNote || "Values are approximate as stated on the product packaging.",
    origin: parsed.origin || "",
    storage: parsed.storage || "Keep in a dry and cool area and keep away from direct sunlight.",
    bestBefore: parsed.bestBefore || "",
    important: parsed.important || "",
    facts: facts.length ? facts : [{ label: "", value: "" }],
  };
}

export function pairsToTextarea(rows) {
  return cleanPairs(rows)
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");
}

export function textareaToPairs(text) {
  return parseFactLines(String(text || ""));
}

export function highlightsToTextarea(highlights) {
  return cleanLines(highlights).join("\n");
}

export function textareaToHighlights(text) {
  return cleanLines(String(text || "").split("\n"));
}

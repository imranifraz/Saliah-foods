import { motion, useReducedMotion } from "framer-motion";
import { parseProductStoryContent, resolveProductHighlights } from "../../data/productStory";

function StoryMetaCard({ label, value }) {
  if (!value) return null;
  return (
    <div className="pdp-story__meta-card">
      <p className="pdp-story__meta-label">{label}</p>
      <p className="pdp-story__meta-value">{value}</p>
    </div>
  );
}

function isNetWeightLabel(label) {
  return /^net\s*weight$/i.test(String(label || "").trim());
}

/** Prefer the selected pack/variant weight from the purchase panel over any static catalog fact. */
function withSelectedNetWeight(facts, netWeight) {
  const weight = String(netWeight || "").trim();
  const base = (Array.isArray(facts) ? facts : []).filter((row) => !isNetWeightLabel(row.label));
  if (!weight) return base;

  const netRow = { label: "Net Weight", value: weight };
  const productIdx = base.findIndex((row) => /^product$/i.test(String(row.label || "").trim()));
  if (productIdx >= 0) {
    return [...base.slice(0, productIdx + 1), netRow, ...base.slice(productIdx + 1)];
  }
  const brandIdx = base.findIndex((row) => /^brand$/i.test(String(row.label || "").trim()));
  if (brandIdx >= 0) {
    return [...base.slice(0, brandIdx + 1), netRow, ...base.slice(brandIdx + 1)];
  }
  return [netRow, ...base];
}

export function ProductDetailStorySection({
  description,
  benefits = [],
  categoryLabel,
  productName,
  netWeight = "",
}) {
  const reduce = useReducedMotion();
  const parsed = parseProductStoryContent(description);
  const highlights = resolveProductHighlights(benefits, parsed.highlights);
  const overview = parsed.overview.length
    ? parsed.overview
    : description?.trim()
      ? [description.trim()]
      : [];
  const facts = withSelectedNetWeight(parsed.facts, netWeight);

  const hasMeta =
    Boolean(parsed.ingredients) ||
    Boolean(parsed.origin) ||
    Boolean(parsed.storage) ||
    Boolean(parsed.bestBefore);
  const hasNutrition = parsed.nutrition.length > 0;
  const hasFacts = facts.length > 0;
  const hasImportant = Boolean(parsed.important);
  const hasHighlights = highlights.length > 0;

  if (!overview.length && !hasHighlights && !hasMeta && !hasNutrition && !hasFacts && !hasImportant) {
    return null;
  }

  const title = productName
    ? `About ${productName}`
    : categoryLabel
      ? `${categoryLabel}, elevated`
      : "Crafted with care";

  return (
    <motion.section
      className="pdp-story"
      aria-label="Product details"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pdp-story__rule" aria-hidden />

      <div className="pdp-story__intro">
        <p className="pdp-story__eyebrow">Product details</p>
        <h2 className="pdp-story__title">{title}</h2>
        {overview.length ? (
          <div className="pdp-story__overview">
            {overview.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="pdp-story__copy">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {hasHighlights ? (
        <div className="pdp-story__block">
          <h3 className="pdp-story__block-title">Highlights</h3>
          <ul className="pdp-story__benefits">
            {highlights.map((benefit, index) => (
              <li key={`${index}-${benefit}`} className="pdp-story__benefit">
                <span className="pdp-story__benefit-index" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="pdp-story__benefit-text">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasMeta ? (
        <div className="pdp-story__block">
          <h3 className="pdp-story__block-title">At a glance</h3>
          <div className="pdp-story__meta-grid">
            <StoryMetaCard label="Ingredients" value={parsed.ingredients} />
            <StoryMetaCard label="Country of origin" value={parsed.origin} />
            <StoryMetaCard label="Storage" value={parsed.storage} />
            <StoryMetaCard label="Best before" value={parsed.bestBefore} />
          </div>
        </div>
      ) : null}

      {hasNutrition ? (
        <div className="pdp-story__block">
          <h3 className="pdp-story__block-title">Nutrition information</h3>
          <p className="pdp-story__block-sub">Per 100g</p>
          <dl className="pdp-story__nutrition">
            {parsed.nutrition.map((row) => (
              <div key={row.label} className="pdp-story__nutrition-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          {parsed.nutritionNote ? <p className="pdp-story__footnote">{parsed.nutritionNote}</p> : null}
        </div>
      ) : null}

      {hasFacts || hasImportant ? (
        <div className="pdp-story__block pdp-story__block--muted">
          {hasFacts ? (
            <>
              <h3 className="pdp-story__block-title">Product information</h3>
              <dl className="pdp-story__facts">
                {facts.map((row, index) => (
                  <div key={`${row.label}-${index}`} className="pdp-story__facts-row">
                    {row.label ? <dt>{row.label}</dt> : null}
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}
          {hasImportant ? <p className="pdp-story__important">{parsed.important}</p> : null}
        </div>
      ) : null}
    </motion.section>
  );
}

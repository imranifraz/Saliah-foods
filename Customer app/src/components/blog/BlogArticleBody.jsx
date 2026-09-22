import { Reveal } from "../ui/Reveal";
import { RichText } from "../ui/RichText.jsx";
import { hasRichHtml, richHtmlHasText } from "../../lib/richText.js";

/**
 * Renders admin article blocks in order:
 * - type "h2" → section heading
 * - type "p"  → rich-text paragraph (bold, lists, size, links, etc.)
 */
function normalizeBlocks(content) {
  if (!Array.isArray(content)) return [];
  return content
    .map((block) => {
      const type = block?.type === "h2" ? "h2" : "p";
      const text = String(block?.text ?? "").trim();
      return { type, text };
    })
    .filter((block) => richHtmlHasText(block.text));
}

function HeadingBlock({ text, isFirst }) {
  const plain = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!plain) return null;
  return (
    <h2 className={`blog-article-prose__h2${isFirst ? " blog-article-prose__h2--first" : ""}`}>
      <span className="blog-article-prose__h2-mark" aria-hidden />
      <span>{plain}</span>
    </h2>
  );
}

function ParagraphBlock({ text, isLead }) {
  if (!richHtmlHasText(text)) return null;

  if (!hasRichHtml(text)) {
    return (
      <p className={`blog-article-prose__p${isLead ? " blog-article-prose__p--lead" : ""}`}>
        {text}
      </p>
    );
  }

  return (
    <RichText
      html={text}
      className={`blog-article-prose__rich${isLead ? " blog-article-prose__rich--lead" : ""}`}
    />
  );
}

export function BlogArticleBody({ content = [] }) {
  const blocks = normalizeBlocks(content);

  if (!blocks.length) {
    return (
      <div className="blog-article-prose">
        <p className="blog-article-prose__p blog-article-prose__p--muted">
          This article has no content yet.
        </p>
      </div>
    );
  }

  return (
    <div className="blog-article-prose" data-admin-structure="content-blocks">
      {blocks.map((block, i) => {
        const isFirst = i === 0;
        const isLead = isFirst && block.type !== "h2";
        return (
          <Reveal key={`${block.type}-${i}`} delay={Math.min(i * 0.035, 0.2)}>
            {block.type === "h2" ? (
              <HeadingBlock text={block.text} isFirst={isFirst} />
            ) : (
              <ParagraphBlock text={block.text} isLead={isLead} />
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

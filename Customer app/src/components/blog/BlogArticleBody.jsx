import { Reveal } from "../ui/Reveal";

export function BlogArticleBody({ content = [] }) {
  return (
    <div className="blog-article-prose">
      {content.map((block, i) => (
        <Reveal key={`${block.type}-${i}`} delay={i * 0.03}>
          {block.type === "h2" ? (
            <h2 className="blog-article-prose__h2">{block.text}</h2>
          ) : (
            <p className="blog-article-prose__p">{block.text}</p>
          )}
        </Reveal>
      ))}
    </div>
  );
}

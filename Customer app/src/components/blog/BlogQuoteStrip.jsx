import { Reveal } from "../ui/Reveal";

export function BlogQuoteStrip() {
  return (
    <Reveal>
      <blockquote className="blog-quote">
        <div className="blog-quote__ornament" aria-hidden>
          “
        </div>
        <p className="blog-quote__text">
          Dates are not merely fruit — they are memory, hospitality, and the quiet luxury of sharing
          something honest from the earth.
        </p>
        <footer className="blog-quote__cite">— Saliah Foods</footer>
      </blockquote>
    </Reveal>
  );
}

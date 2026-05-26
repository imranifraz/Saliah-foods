import { Reveal } from "../ui/Reveal";

export function BlogNewsletterCta() {
  return (
    <Reveal>
      <section className="blog-newsletter" aria-labelledby="blog-newsletter-title">
        <div className="blog-newsletter__inner marble-texture">
          <div className="blog-newsletter__glow" aria-hidden />
          <p className="blog-newsletter__eyebrow">The Saliah Letter</p>
          <h2 id="blog-newsletter-title" className="blog-newsletter__title">
            Receive the journal in your inbox
          </h2>
          <p className="blog-newsletter__desc">
            Seasonal recipes, sourcing notes, and early access to limited harvests — no clutter, only
            substance.
          </p>
          <form className="blog-newsletter__form" onSubmit={(e) => e.preventDefault()}>
            <label className="sr-only" htmlFor="blog-newsletter-email">
              Email address
            </label>
            <input
              id="blog-newsletter-email"
              type="email"
              required
              placeholder="your@email.com"
              className="blog-newsletter__input"
            />
            <button type="submit" className="blog-newsletter__btn">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </Reveal>
  );
}

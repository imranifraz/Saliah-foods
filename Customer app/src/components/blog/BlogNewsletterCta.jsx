import { useState } from "react";
import { Reveal } from "../ui/Reveal";
import { subscribeNewsletterApi } from "../../services/newsletterApi";

export function BlogNewsletterCta() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setFeedback({ type: "", message: "" });
    try {
      const data = await subscribeNewsletterApi({ email, source: "blog" });
      setFeedback({ type: "success", message: data.message || "Subscribed successfully." });
      if (!data.alreadySubscribed) setEmail("");
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Could not subscribe. Please try again." });
    } finally {
      setBusy(false);
    }
  }

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
          <form className="blog-newsletter__form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="blog-newsletter-email">
              Email address
            </label>
            <input
              id="blog-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              disabled={busy}
              className="blog-newsletter__input"
            />
            <button type="submit" className="blog-newsletter__btn" disabled={busy}>
              {busy ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          {feedback.message ? (
            <p
              className={`blog-newsletter__feedback mt-3 text-sm ${
                feedback.type === "error" ? "text-red-700" : "text-emerald-800"
              }`}
              role="status"
            >
              {feedback.message}
            </p>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}

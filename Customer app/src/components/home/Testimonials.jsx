import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";

const quotes = [
  {
    quote:
      "The Kimia dates are incredibly soft and fresh. Packaging feels premium — perfect for gifting and everyday snacking at home.",
    name: "Ananya R.",
    role: "Mumbai",
  },
  {
    quote:
      "We use Saliah date syrup daily in our kitchen. Natural sweetness without compromise — our whole family loves it.",
    name: "Karthik M.",
    role: "Bengaluru",
  },
  {
    quote:
      "Rose gulkand and amla candy remind me of home. Quality is consistent and delivery was neatly packed every time.",
    name: "Priya S.",
    role: "Hyderabad",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="section-pad bg-emerald-900" aria-labelledby="testimonials-title">
      <div className="section-container">
        <Reveal className="text-center">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.28em] text-gold-400">Testimonials</p>
          <h2
            id="testimonials-title"
            className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium text-cream-50"
          >
            Loved by Families Across India
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-sm text-cream-50/65 sm:text-base">
            What our customers say about Saliah dates, wellness foods, and natural everyday essentials.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {quotes.map((t, i) => (
            <motion.blockquote
              key={t.name}
              className="relative flex h-full flex-col rounded-2xl border border-cream-50/10 bg-emerald-950/40 p-5 backdrop-blur-sm sm:p-6 md:p-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <span className="font-display text-4xl leading-none text-gold-400/40" aria-hidden>
                &ldquo;
              </span>
              <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-cream-50/90 sm:text-base">{t.quote}</p>
              <footer className="mt-5 border-t border-cream-50/10 pt-4 sm:pt-5">
                <cite className="not-italic">
                  <span className="block font-body text-sm font-semibold text-cream-50">{t.name}</span>
                  <span className="font-body text-[10px] uppercase tracking-[0.18em] text-gold-400/80">{t.role}</span>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

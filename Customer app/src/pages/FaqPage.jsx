import { Link } from "react-router-dom";
import { faqItems } from "../data/pages";
import { PageMeta } from "../components/pages/PageMeta";
import { PageShell } from "../components/pages/PageShell";
import { FaqAccordion } from "../components/pages/FaqAccordion";
import { Reveal } from "../components/ui/Reveal";

export function FaqPage() {
  return (
    <>
      <PageMeta
        title="FAQ"
        description="Frequently asked questions about Saliah Foods orders, delivery, products, and returns."
      />
      <PageShell
        breadcrumb="FAQ"
        title="Frequently Asked Questions"
        subtitle="Quick answers about ordering, delivery, storage, and customer support."
      >
        <FaqAccordion categories={faqItems} />

        <Reveal className="mt-14 rounded-2xl border border-emerald-900/8 bg-cream-100 p-8 text-center md:p-10">
          <p className="font-body text-sm text-emerald-900/65">Still have a question?</p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-full gradient-gold px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md shadow-gold-500/25"
          >
            Contact us
          </Link>
        </Reveal>
      </PageShell>
    </>
  );
}

import { Link } from "react-router-dom";
import { PageMeta } from "../components/pages/PageMeta";
import { PageShell } from "../components/pages/PageShell";
import { FaqAccordion } from "../components/pages/FaqAccordion";
import { Reveal } from "../components/ui/Reveal";
import { FaqContentProvider, useFaqContent } from "../context/FaqContentContext.jsx";
import { RichText } from "../components/ui/RichText.jsx";

function FaqPageInner() {
  const { faq, loading } = useFaqContent();
  const { title, subtitle, faqItems, ctaText, ctaButtonLabel, ctaHref } = faq;

  return (
    <>
      <PageMeta
        title="FAQ"
        description="Frequently asked questions about Saliah Foods orders, delivery, products, and returns."
      />
      <PageShell breadcrumb="FAQ" title={title} subtitle={subtitle}>
        {loading ? (
          <p className="mt-12 text-sm text-emerald-900/55">Loading FAQs…</p>
        ) : (
          <FaqAccordion categories={faqItems} />
        )}

        <Reveal className="mt-14 rounded-2xl border border-emerald-900/8 bg-cream-100 p-8 text-center md:p-10">
          <RichText as="p" html={ctaText} className="font-body text-sm text-emerald-900/65" />
          <Link
            to={ctaHref}
            className="mt-4 inline-flex rounded-full gradient-gold px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md shadow-gold-500/25"
          >
            {ctaButtonLabel}
          </Link>
        </Reveal>
      </PageShell>
    </>
  );
}

export function FaqPage() {
  return (
    <FaqContentProvider>
      <FaqPageInner />
    </FaqContentProvider>
  );
}

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RichText } from "../ui/RichText.jsx";

function FaqItem({ question, answer, isOpen, onToggle }) {
  const reduce = useReducedMotion();

  return (
    <div className="border-b border-emerald-900/8 last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left font-body text-sm font-semibold text-emerald-900 transition-colors hover:text-emerald-800 md:text-base"
          aria-expanded={isOpen}
        >
          {question}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-emerald-800 transition-transform ${
              isOpen ? "rotate-45" : ""
            }`}
            aria-hidden
          >
            +
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={reduce ? undefined : { height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <RichText
              as="div"
              html={answer}
              className="pb-5 font-body text-sm leading-relaxed text-emerald-900/65"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FaqAccordion({ categories }) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="mt-12 space-y-10">
      {categories.map((cat) => (
        <section key={cat.category} aria-labelledby={`faq-${cat.category.replace(/\s+/g, "-").toLowerCase()}`}>
          <h2
            id={`faq-${cat.category.replace(/\s+/g, "-").toLowerCase()}`}
            className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600"
          >
            {cat.category}
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-900/8 bg-white px-5 shadow-luxury md:px-6">
            {cat.questions.map((item, i) => {
              const id = `${cat.category}-${i}`;
              return (
                <FaqItem
                  key={id}
                  question={item.q}
                  answer={item.a}
                  isOpen={openId === id}
                  onToggle={() => setOpenId(openId === id ? null : id)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

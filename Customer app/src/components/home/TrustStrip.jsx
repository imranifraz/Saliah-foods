import { trustStrip } from "../../data/homepage";

function TrustIcon({ type }) {
  const common = "h-5 w-5 text-emerald-800 sm:h-6 sm:w-6";
  switch (type) {
    case "box":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
      );
    case "leaf":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M12 22c-4-4-6-8-6-12a6 6 0 0 1 12 0c0 4-2 8-6 12z" />
          <path d="M12 22V10" />
        </svg>
      );
    case "shield":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M3 7h13v10H3z" />
          <path d="M16 10h4l1 3v4h-5" />
          <circle cx="7.5" cy="18" r="1.5" />
          <circle cx="17.5" cy="18" r="1.5" />
        </svg>
      );
  }
}

export function TrustStrip() {
  return (
    <section className="overflow-x-clip border-y border-cream-200 bg-cream-50 py-8 sm:py-10" aria-label="Why shop with Saliah Foods">
      <div className="section-container">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-6 md:grid-cols-4 md:gap-8">
          {trustStrip.map((item) => (
            <li key={item.title} className="flex min-w-0 flex-col items-center text-center sm:items-start sm:text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-100 sm:h-12 sm:w-12">
                <TrustIcon type={item.icon} />
              </span>
              <p className="mt-2 font-body text-xs font-semibold text-emerald-900 sm:mt-3 sm:text-sm">{item.title}</p>
              <p className="mt-1 font-body text-[10px] leading-snug text-emerald-900/55 sm:text-xs">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

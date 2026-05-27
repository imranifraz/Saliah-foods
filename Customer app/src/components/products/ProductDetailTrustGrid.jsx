import { PDP_HIGHLIGHTS } from "../../data/productDetail";

function TrustIcon({ name }) {
  const base = "h-4 w-4";
  switch (name) {
    case "leaf":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-6-8-6-12a6 6 0 0112 0c0 4-2 8-6 12z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c-2-2-3-4-3-6" />
        </svg>
      );
    case "box":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "shield":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      );
    case "delivery":
    default:
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677V6.75m0 3.375v1.125c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 10.875V9.75"
          />
        </svg>
      );
  }
}

export function ProductDetailTrustGrid({ items = PDP_HIGHLIGHTS }) {
  return (
    <ul className="pdp-trust-grid">
      {items.map((item) => (
        <li key={item.label} className="pdp-trust-grid__item">
          <span className="pdp-trust-grid__icon" aria-hidden>
            <TrustIcon name={item.icon} />
          </span>
          <span className="pdp-trust-grid__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

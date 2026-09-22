import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useShippingPromo } from "../../context/GstSettingsContext.jsx";

function OfferIcon() {
  return (
    <svg className="hero-shipping-offer__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21"
        className="hero-shipping-offer__icon-accent"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.625 11.25h18.75c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H2.625c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OfferMessage({ message }) {
  const parts = String(message).split(/(FREE)/i);
  return (
    <p className="hero-shipping-offer__message">
      {parts.map((part, index) =>
        /^FREE$/i.test(part) ? (
          <span key={`free-${index}`} className="hero-shipping-offer__free">
            {part}
          </span>
        ) : (
          <span key={`txt-${index}`}>{part}</span>
        )
      )}
    </p>
  );
}

export function HeroShippingOffer() {
  const { enabled, message, href } = useShippingPromo();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!enabled || !message) return null;

  const tipBody = (
    <>
      <OfferMessage message={message} />
      {href ? <span className="hero-shipping-offer__cta">Shop now</span> : null}
    </>
  );

  return (
    <div
      ref={rootRef}
      className={`hero-shipping-offer ${open ? "hero-shipping-offer--open" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="hero-shipping-offer__btn"
        aria-label="Shipping offer"
        aria-expanded={open}
        aria-controls={tipId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hero-shipping-offer__pulse" aria-hidden />
        <OfferIcon />
      </button>

      <div id={tipId} className="hero-shipping-offer__tip" role="tooltip">
        {href ? (
          /^https?:\/\//i.test(href) ? (
            <a href={href} className="hero-shipping-offer__tip-link" target="_blank" rel="noopener noreferrer">
              {tipBody}
            </a>
          ) : (
            <Link to={href} className="hero-shipping-offer__tip-link" onClick={() => setOpen(false)}>
              {tipBody}
            </Link>
          )
        ) : (
          <div className="hero-shipping-offer__tip-link">{tipBody}</div>
        )}
      </div>
    </div>
  );
}

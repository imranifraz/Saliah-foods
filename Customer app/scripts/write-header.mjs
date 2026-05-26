import { writeFileSync } from "node:fs";

writeFileSync(
  "src/components/layout/Header.jsx",
  `import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { mainNav } from "../../data/navigation";
import { productMenuCategories } from "../../data/productMenu";
import { ProductMegaMenu } from "./ProductMegaMenu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const megaRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMegaOpen(false);
    setMenuOpen(false);
    setMobileProductsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!megaOpen) return undefined;
    const onPointerDown = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={\`fixed inset-x-0 top-0 z-50 transition-all duration-500 \${
        scrolled ? "py-2" : "py-3 sm:py-4"
      }\`}
    >
      <div
        className={\`mx-auto max-w-[1440px] px-4 transition-all duration-500 sm:px-5 md:px-10 \${
          scrolled ? "rounded-full bg-cream-50/90 shadow-luxury backdrop-blur-md" : ""
        }\`}
      >
        <div className="flex min-h-[56px] items-center justify-between gap-3 sm:min-h-[64px] md:min-h-[72px] md:gap-6">
          <Link to="/" className="relative z-10 shrink-0" aria-label="Saliah Foods home">
            <img
              src="/assets/saliah-logo.webp"
              alt="Saliah Foods"
              className="h-11 w-auto sm:h-14 md:h-[72px] lg:h-[84px]"
              width={168}
              height={84}
              decoding="async"
            />
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-5 lg:flex lg:gap-8"
            aria-label="Primary"
          >
            {mainNav.map((item) =>
              item.megaMenu ? (
                <div key={item.label} ref={megaRef} className="relative">
                  <button
                    type="button"
                    className={\`shrink-0 font-body text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 \${
                      megaOpen ? "text-emerald-800" : "text-emerald-900/70 hover:text-emerald-800"
                    }\`}
                    aria-expanded={megaOpen}
                    aria-haspopup="dialog"
                    onClick={() => setMegaOpen((v) => !v)}
                  >
                    {item.label}
                  </button>
                  <AnimatePresence>
                    {megaOpen ? <ProductMegaMenu onClose={() => setMegaOpen(false)} /> : null}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="shrink-0 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-900/70 transition-colors duration-300 hover:text-emerald-800"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <button type="button" className="hidden h-11 w-11 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 sm:flex" aria-label="Search">
              <IconSearch />
            </button>
            <button type="button" className="hidden h-11 w-11 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 sm:flex" aria-label="Account">
              <IconUser />
            </button>
            <button type="button" className="relative flex h-10 min-w-[40px] items-center justify-center gap-2 rounded-full gradient-gold px-3 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-white sm:h-11 sm:min-w-[44px] sm:px-4 md:min-w-[110px]" aria-label="Cart, 0 items">
              <IconBag />
              <span className="hidden sm:inline">Cart</span>
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-900 text-[10px] font-bold text-cream-50">0</span>
            </button>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button type="button" className="fixed inset-0 z-40 bg-emerald-950/40 backdrop-blur-sm lg:hidden" aria-label="Close menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMenu} />
            <motion.nav className="fixed inset-x-0 top-[calc(56px+0.75rem)] z-50 mx-4 max-h-[min(80vh,640px)] overflow-y-auto rounded-2xl border border-cream-200 bg-cream-50 p-4 shadow-luxury-lg sm:top-[calc(64px+1rem)] sm:mx-5 lg:hidden" aria-label="Mobile" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <ul className="flex flex-col gap-1">
                <li>
                  <button type="button" className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-body text-sm font-medium text-emerald-900" onClick={() => setMobileProductsOpen((v) => !v)} aria-expanded={mobileProductsOpen}>
                    Products
                    <span className="text-emerald-900/40">{mobileProductsOpen ? "−" : "+"}</span>
                  </button>
                  {mobileProductsOpen ? (
                    <ul className="mb-2 ml-2 space-y-1 border-l border-cream-200 pl-3">
                      {productMenuCategories.map((cat) => (
                        <li key={cat.id}>
                          <Link to={cat.viewAllHref} className="block rounded-lg px-3 py-2.5 font-body text-sm text-emerald-900/80 hover:bg-cream-100" onClick={closeMenu}>
                            {cat.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
                {mainNav.filter((i) => !i.megaMenu).map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="block rounded-xl px-4 py-3.5 font-body text-sm font-medium text-emerald-900 hover:bg-cream-100" onClick={closeMenu}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}
`
);

console.log("header written");

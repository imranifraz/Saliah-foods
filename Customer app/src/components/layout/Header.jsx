import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { mainNav } from "../../data/navigation";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

import { MobileProductMegaMenu } from "./ProductMegaMenu";

const ProductMegaMenu = lazy(() =>
  import("./ProductMegaMenu").then((m) => ({ default: m.ProductMegaMenu }))
);

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const megaRef = useRef(null);
  const outsideHandlerRef = useRef(null);
  const location = useLocation();
  const { totalCount, openCart, closeCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { count: wishlistCount } = useWishlist();

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
    closeCart();
  }, [location.pathname, closeCart]);

  useEffect(() => {
    if (!megaOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    const timer = window.setTimeout(() => {
      const onPointerDown = (e) => {
        if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
      };
      outsideHandlerRef.current = onPointerDown;
      document.addEventListener("mousedown", onPointerDown);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      if (outsideHandlerRef.current) {
        document.removeEventListener("mousedown", outsideHandlerRef.current);
        outsideHandlerRef.current = null;
      }
      document.removeEventListener("keydown", onKey);
    };
  }, [megaOpen]);

  useEffect(() => {
    if (!megaOpen) return undefined;
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = () => {
      if (!mq.matches) setMegaOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [megaOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      ref={megaRef}
      className={`fixed inset-x-0 top-0 z-50 bg-transparent transition-all duration-500 ${
        scrolled ? "py-1.5" : "py-2"
      }`}
    >
      <motion.div
        className={`mx-auto max-w-[1440px] px-4 transition-all duration-500 sm:px-5 md:px-10 ${
          scrolled
            ? "rounded-full bg-white/85 shadow-luxury backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="flex h-[var(--site-header-bar)] items-center justify-between gap-2 sm:gap-3 md:gap-4">
          <Link
            to="/"
            className="relative z-10 flex h-full shrink-0 items-center max-w-[42%] sm:max-w-none"
            aria-label="Saliah Foods home"
          >
            <img
              src="/assets/application-logo.png"
              alt="Saliah Foods"
              className="block h-8 w-auto translate-y-[1px] rounded-lg sm:h-9 sm:translate-y-[1px] md:h-10 md:translate-y-[2px] lg:h-11 xl:h-12"
              width={595}
              height={131}
              decoding="async"
              fetchPriority="low"
            />
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-3 xl:flex xl:gap-6 2xl:gap-8"
            aria-label="Primary"
          >
            {mainNav.map((item) =>
              item.megaMenu ? (
                <button
                  key={item.label}
                  type="button"
                  className={`shrink-0 font-body text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
                    megaOpen ? "text-emerald-800" : "text-emerald-900/70 hover:text-emerald-800"
                  }`}
                  aria-expanded={megaOpen}
                  aria-haspopup="dialog"
                  onClick={() => setMegaOpen((v) => !v)}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="shrink-0 font-body text-xs font-medium uppercase tracking-[0.12em] text-emerald-900/70 transition-colors duration-300 hover:text-emerald-800"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <button type="button" className="hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 sm:flex" aria-label="Search">
              <IconSearch />
            </button>
            {isAuthenticated ? (
              <>
                <Link
                  to="/account?tab=wishlist"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 sm:flex"
                  aria-label={`Wishlist, ${wishlistCount} items`}
                >
                  <IconHeart />
                  {wishlistCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-white">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  ) : null}
                </Link>
                <Link
                  to="/account"
                  className="hidden h-9 w-9 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 sm:flex"
                  aria-label="Account"
                >
                  <IconUser />
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full border border-emerald-900/10 px-3 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-900/70 sm:inline-flex"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              className="relative flex h-9 min-w-[36px] items-center justify-center gap-2 rounded-full gradient-gold px-3 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-white sm:min-w-[40px] sm:px-4 md:min-w-[100px]"
              aria-label={`Cart, ${totalCount} items`}
              onClick={openCart}
            >
              <IconBag />
              <span className="hidden sm:inline">Cart</span>
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-900 text-[10px] font-bold text-cream-50">
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            </button>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 xl:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {megaOpen ? (
          <Suspense fallback={null}>
            <ProductMegaMenu onClose={() => setMegaOpen(false)} />
          </Suspense>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button type="button" className="fixed inset-0 z-40 bg-emerald-950/40 backdrop-blur-sm xl:hidden" aria-label="Close menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMenu} />
            <motion.nav className="fixed inset-x-0 top-[calc(var(--site-header)+0.5rem)] z-50 mx-4 max-h-[min(80vh,640px)] overflow-y-auto rounded-2xl border border-cream-200 bg-cream-50 p-4 shadow-luxury-lg sm:mx-5 xl:hidden" aria-label="Mobile" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <ul className="flex flex-col gap-1">
                <li>
                  <button type="button" className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-body text-base font-medium text-emerald-900" onClick={() => setMobileProductsOpen((v) => !v)} aria-expanded={mobileProductsOpen}>
                    Products
                    <span className="text-emerald-900/40">{mobileProductsOpen ? "−" : "+"}</span>
                  </button>
                  {mobileProductsOpen ? (
                    <div className="px-2 pb-1">
                      <MobileProductMegaMenu onClose={closeMenu} />
                    </div>
                  ) : null}
                </li>
                {mainNav.filter((i) => !i.megaMenu).map((item) => (
                  <li key={item.label}>
                    <Link to={item.href} className="block rounded-xl px-4 py-3.5 font-body text-base font-medium text-emerald-900 hover:bg-cream-100" onClick={closeMenu}>
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

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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

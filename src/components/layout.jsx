import { useState, useEffect, useRef } from "react";
import { C } from "../theme";
import { useCMS } from "../cms/useContent";
import { PageLink } from "./ui";
import { navigateTo } from "../links";
import { EditableText } from "../cms/EditableText";

function Monogram() {
  return (
    <svg className="sb-mono" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="16" y="21" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontStyle="italic" fontSize="15" fill="currentColor">sb</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { label: "work together", note: "audits, builds & fractional support", page: "services" },
  { label: "about", note: "the backstory, no stuffiness", page: "about" },
  { label: "kind words", note: "as told by my fave people", page: "home", section: "quotes" },
  { label: "cabana club", note: "the newsletter, no productivity guilt", page: "resources" },
];
const SERVICE_PAGES = ["services", "audit", "implementation", "fractional", "corporate"];

function Nav({ page, setPage, scrollY, isEditing }) {
  const { getContent } = useCMS();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // The mobile menu is a modal <dialog>: focus stays inside and Escape closes it
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    if (menuOpen && !menu.open) menu.showModal();
    if (!menuOpen && menu.open) menu.close();
  }, [menuOpen]);

  const go = (target, section) => {
    if (isEditing) return;
    setMenuOpen(false);
    navigateTo(setPage, target, section);
  };
  const isCurrent = (l) => !l.section && (l.page === "services" ? SERVICE_PAGES.includes(page) : page === l.page);
  const navLink = (l, children) => (
    <PageLink to={l.page} onNavigate={() => go(l.page, l.section)} aria-current={isCurrent(l) ? "page" : undefined}>{children}</PageLink>
  );

  return (
    <>
      <header className={`sb-header${scrollY > 8 ? " is-stuck" : ""}`}>
        <div className="sb-wrap sb-header-row">
          <PageLink to="home" onNavigate={() => go("home")} className="sb-wordmark"><Monogram /><EditableText contentKey="global.siteName" as="span" /></PageLink>
          <nav aria-label="main" className="sb-nav-desktop">
            <ul className="sb-nav-links">
              {NAV_LINKS.map((l) => <li key={l.label}>{navLink(l, l.label)}</li>)}
            </ul>
          </nav>
          <PageLink to="contact" onNavigate={() => go("contact")} className="sb-btn sb-btn-solid sb-btn-small sb-nav-cta">{getContent("nav.cta")}</PageLink>
          <button className="sb-menu-btn" type="button" aria-expanded={menuOpen} aria-controls="sb-menu" onClick={() => setMenuOpen(true)}>
            <span /><span /><span className="sb-sr-only">menu</span>
          </button>
        </div>
      </header>

      <dialog ref={menuRef} id="sb-menu" className="sb-menu" aria-label="menu" onClose={() => setMenuOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) setMenuOpen(false); }}>
        <div className="sb-menu-inner">
          <div className="sb-menu-top">
            <span className="sb-wordmark"><EditableText contentKey="global.siteName" as="span" /></span>
            <button className="sb-icon-btn" type="button" onClick={() => setMenuOpen(false)}>close</button>
          </div>
          <nav aria-label="main (mobile)">
            <ol className="sb-menu-links">
              {NAV_LINKS.map((l) => <li key={l.label}>{navLink(l, <>{l.label}<small>{l.note}</small></>)}</li>)}
            </ol>
          </nav>
          <p className="sb-script sb-menu-foot"><EditableText contentKey="footer.tagline" as="span" /></p>
        </div>
      </dialog>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   FOOTER
   ══════════════════════════════════════════════════════════════ */
function Footer({ setPage, isEditing }) {
  const { getContent } = useCMS();
  const go = (target, section) => { if (!isEditing) navigateTo(setPage, target, section); };
  const email = getContent("global.email");
  return (
    <footer className="sb-footer">
      <div className="sb-wrap sb-footer-grid">
        <div>
          <p className="sb-foot-mark"><EditableText contentKey="global.siteName" as="span" /></p>
          <p className="sb-script sb-foot-script"><EditableText contentKey="footer.tagline" as="span" /></p>
        </div>
        <nav aria-label="footer">
          <ul className="sb-nav-links sb-foot-links">
            {NAV_LINKS.map((l) => <li key={l.label}><PageLink to={l.page} onNavigate={() => go(l.page, l.section)}>{l.label}</PageLink></li>)}
            <li><PageLink to="contact" onNavigate={() => go("contact")}>contact</PageLink></li>
            {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
          </ul>
        </nav>
        <p className="sb-foot-fine"><EditableText contentKey="global.copyright" as="span" /></p>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════
   BACK TO TOP BUTTON
   ══════════════════════════════════════════════════════════════ */
function BackToTop({ scrollY }) {
  const [isHovered, setIsHovered] = useState(false);
  const visible = scrollY > 500;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: C.charcoal,
        border: `2px solid ${C.cream}`,
        color: C.cream,
        fontSize: 20,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(44,44,40,0.25)",
        opacity: visible ? 1 : 0,
        transform: visible ? (isHovered ? "translateY(-4px) scale(1.05)" : "translateY(0)") : "translateY(20px)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        pointerEvents: visible ? "auto" : "none",
        zIndex: 999
      }}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

export { Nav, Footer, BackToTop };

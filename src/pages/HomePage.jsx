import { useState, useEffect, useRef, Fragment } from "react";
import { C } from "../theme";
import { useCMS, useContent } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import { FloatingTag, Marquee, EditableBtn, NewsletterForm, PageLink } from "../components/ui";

/* ══════════════════════════════════════════════════════════════
   HOME HELPERS
   ══════════════════════════════════════════════════════════════ */

/* Presentational markup added around a field's words (the words never change) */
// Words typed in caps ("work FOR your life") become the italic accent
const emphasizeCaps = (html) => html.split(/(<[^>]+>)/).map((part) => (part.startsWith("<") ? part : part.replace(/\b([A-Z]{2,})\b/g, "<em>$1</em>"))).join("");
// "energy over hustle": the joining word is set in script
const scriptJoiner = (html) => html.replace(/ (over|beats|&gt;|>) /, " <i>$1</i> ");
// The last two words of a heading get the yellow highlighter
const markEnding = (html) => {
  const words = html.trim().split(/\s+/);
  if (/<[^>]+>/.test(html) || words.length < 4) return html;
  return `${words.slice(0, -2).join(" ")} <mark>${words.slice(-2).join(" ")}</mark>`;
};

/* A CMS field shown with that markup; plain editable text in edit mode */
function DecoratedText({ contentKey, decorate, as: Tag = "span", ...rest }) {
  const { value, isEditing } = useContent(contentKey);
  if (isEditing) return <EditableText contentKey={contentKey} as={Tag} {...rest} />;
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: decorate(String(value ?? "")) }} />;
}

function DecoratedArrayText({ contentKey, index, field, decorate, as: Tag = "span", ...rest }) {
  const { value, isEditing } = useContent(contentKey);
  if (isEditing) return <EditableArrayText contentKey={contentKey} index={index} field={field} as={Tag} {...rest} />;
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: decorate(String(value?.[index]?.[field] ?? "")) }} />;
}

/* The signature moment: the hero script line rewrites itself every 3s (static under reduced motion) */
function RotatingPhrase({ phrases }) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (phrases.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => { if (!document.hidden) setLeaving(true); }, 3200);
    return () => clearInterval(timer);
  }, [phrases.length]);

  // The next phrase comes in once the old one has finished sliding out
  const next = () => { if (leaving) { setStep((s) => s + 1); setLeaving(false); } };

  if (!phrases.length) return null;
  const state = leaving ? " is-out" : step > 0 ? " is-in" : "";
  return (
    <span className="sb-rotator">
      <span key={step} className={`sb-rotator-word${state}`} onAnimationEnd={next}>{phrases[step % phrases.length]}</span>
    </span>
  );
}

/* The "tired of" list is one field, each item after a → */
function WelcomeList() {
  const { value, isEditing } = useContent("home.welcome.body1");
  const [leadIn, ...items] = String(value ?? "").split("→").map((s) => s.trim());
  if (isEditing || items.length === 0) return <p><EditableText contentKey="home.welcome.body1" as="span" /></p>;
  return (
    <>
      {leadIn && <p className="sb-lead-in" dangerouslySetInnerHTML={{ __html: leadIn }} />}
      <ul className="sb-ticks">
        {items.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
      </ul>
    </>
  );
}

/* Marquee band, paused while it's off-screen */
function HomeMarquee({ isEditing }) {
  const ref = useRef(null);
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`sb-marquee${offscreen ? " is-offscreen" : ""}`} aria-hidden={isEditing ? undefined : "true"}>
      <Marquee contentKey="global.marquee1" text="feel-good systems · built with intention · sustainable growth" bg={C.charcoal} color={C.cream} />
    </div>
  );
}

const tagStyle = { fontWeight: 600, padding: "8px 16px", boxShadow: "0 18px 40px -24px rgba(44,44,40,.35), 0 4px 14px rgba(44,44,40,.08)" };
const blocksStyle = { width: "min(1200px, 100% - 2 * var(--gutter))", margin: "0 auto" };

/* ══════════════════════════════════════════════════════════════
   PAGE: HOME
   ══════════════════════════════════════════════════════════════ */
function HomePage({ setPage }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };

  const head = (scriptKey, headingKey, id, introKey) => (
    <div className="sb-section-head">
      <p className="sb-script"><EditableText contentKey={scriptKey} as="span" /></p>
      <h2 id={id}><EditableText contentKey={headingKey} as="span" /></h2>
      {introKey && <p className="sb-intro"><EditableText contentKey={introKey} as="span" /></p>}
    </div>
  );

  const sectionLabels = {
    hero: "Hero", marquee: "Marquee", welcome: "Welcome", systems: "Systems", services: "Services",
    about: "About", stats: "Proof", values: "Values", testimonials: "Kind Words", newsletter: "Cabana Club",
  };

  const sectionDefs = {
    hero: () => {
      const heroColor = getContent("style.home.hero.heading.color");
      return (
        <section className="sb-hero" id="top">
          <div className="sb-wrap sb-hero-grid">
            <figure className="sb-hero-photo">
              <span className="sb-ph" style={{ "--tint": "#d9b99a" }}>
                <EditableImage contentKey="image.home.hero" alt="sunset over the ocean, palm trees lining a coastal street" placeholderHeight="100%" placeholderRadius={0} placeholderLabel="upload your photo" placeholderBg={C.sandLight} style={{ height: "100%" }} />
              </span>
              {(getContent("home.hero.bubbleTags") || []).map((_, i) => (
                <span key={i} className={`sb-tag sb-tag-${i + 1}`}>
                  <FloatingTag contentKey="home.hero.bubbleTags" index={i} field="text" style={tagStyle} />
                </span>
              ))}
            </figure>
            <div className="sb-hero-copy">
              <p className="sb-script sb-hero-kicker"><EditableText contentKey="home.hero.kicker" as="span" /></p>
              <h1 style={heroColor ? { color: heroColor } : undefined}><DecoratedText contentKey="home.hero.heading" decorate={emphasizeCaps} /></h1>
              <p className="sb-hero-script" aria-live="off"><RotatingPhrase phrases={getContent("home.hero.typewriterPhrases") || []} /></p>
              <p className="sb-lede"><EditableText contentKey="home.hero.subheading" as="span" /></p>
              <div className="sb-actions">
                <EditableBtn contentKey="home.hero.ctaPrimary" className="sb-btn sb-btn-solid" defaultLabel="work with me" defaultLink="services" nav={nav} />
                <EditableBtn contentKey="home.hero.ctaSecondary" className="sb-btn sb-btn-ghost" defaultLabel="brand partnerships" defaultLink="contact" nav={nav} />
              </div>
            </div>
          </div>
        </section>
      );
    },

    marquee: () => <HomeMarquee isEditing={isEditing} />,

    welcome: () => (
      <>
        <section className="sb-welcome" aria-labelledby="welcome-h">
          <div className="sb-wrap sb-welcome-grid">
            <div className="sb-slip-col">
              <p className="sb-script"><EditableText contentKey="home.welcome.scriptLabel" as="span" /></p>
              <div className="sb-slip">
                <h2 id="welcome-h"><EditableText contentKey="home.welcome.heading" as="span" /></h2>
                <p className="sb-slip-line"><EditableText contentKey="home.welcome.slip.grantedLabel" as="span" /> <EditableText contentKey="home.welcome.slip.grantedValue" as="b" /></p>
                <p className="sb-slip-line"><EditableText contentKey="home.welcome.slip.forLabel" as="span" /> <EditableText contentKey="home.welcome.slip.forValue" as="b" /></p>
                <EditableText contentKey="home.welcome.highlight" as="span" className="sb-stamp" />
              </div>
            </div>
            <div className="sb-welcome-body">
              <WelcomeList />
              <p><EditableText contentKey="home.welcome.body2" as="span" /></p>
            </div>
          </div>
        </section>
        <EditableBlockList contentKey="blocks.home.welcome2" style={blocksStyle} />
      </>
    ),

    systems: () => (
      <section className="sb-contrast" aria-labelledby="contrast-h">
        <div className="sb-wrap">
          {head("home.systemsComparison.scriptLabel", "home.systemsComparison.heading", "contrast-h")}
          <div className="sb-contrast-grid">
            <div className="sb-col-without">
              <h3>without systems</h3>
              <ul>
                {(getContent("home.systemsComparison.without") || []).map((_, i) => <EditableArrayString key={i} contentKey="home.systemsComparison.without" index={i} as="li" />)}
              </ul>
            </div>
            <div className="sb-col-with">
              <h3>with systems</h3>
              <ul>
                {(getContent("home.systemsComparison.with") || []).map((_, i) => <EditableArrayString key={i} contentKey="home.systemsComparison.with" index={i} as="li" />)}
              </ul>
            </div>
          </div>
        </div>
      </section>
    ),

    services: () => {
      const paths = getContent("home.pathCards") || [];
      const pathLink = (i) => paths[i] && (
        <PageLink to={paths[i].page || "contact"} nav={nav} className="sb-text-link"><EditableArrayText contentKey="home.pathCards" index={i} field="cta" /></PageLink>
      );
      const offerTitles = (key) => (getContent(key) || []).map((_, i, all) => (
        <Fragment key={i}><EditableArrayText contentKey={key} index={i} field="title" />{i < all.length - 1 && " · "}</Fragment>
      ));
      return (
        <>
          <section className="sb-services" id="services" aria-labelledby="services-h">
            <div className="sb-wrap">
              {head("services.creators.scriptLabel", "services.creators.heading", "services-h", "services.creators.body")}
              <EditableCardGroup
                contentKey="services.creators.cards"
                gridClassName="sb-offers"
                defaultNewItem={{ num: "04", title: "new service", price: "TBD", body: "description here", page: "contact", bg: "#F5E6DC" }}
                renderCard={(c, i) => (
                  <article className={`sb-offer${i === 1 ? " sb-offer-feature" : ""}`} style={c.bg ? { background: c.bg } : undefined}>
                    <h3><EditableArrayText contentKey="services.creators.cards" index={i} field="title" /></h3>
                    <p className="sb-price"><EditableArrayText contentKey="services.creators.cards" index={i} field="price" /></p>
                    <p><EditableArrayText contentKey="services.creators.cards" index={i} field="body" /></p>
                    <p className="sb-offer-tag"><EditableArrayText contentKey="services.creators.cards" index={i} field="tag" /></p>
                    <PageLink to={c.page || "services"} nav={nav} className="sb-btn sb-btn-solid">{c.cta ? <EditableArrayText contentKey="services.creators.cards" index={i} field="cta" /> : "learn more"}</PageLink>
                  </article>
                )}
              />
              <div className="sb-paths-grid">
                <article className="sb-path">
                  <p className="sb-script"><EditableText contentKey="services.corporate.scriptLabel" as="span" /></p>
                  <h3><EditableText contentKey="services.corporate.heading" as="span" /></h3>
                  <p><EditableText contentKey="services.corporate.body" as="span" /></p>
                  <p className="sb-path-offers">{offerTitles("services.corporate.cards")}</p>
                  {pathLink(1)}
                </article>
                <article className="sb-path sb-path-brands">
                  <p className="sb-script"><EditableText contentKey="services.brands.scriptLabel" as="span" /></p>
                  <h3><EditableText contentKey="services.brands.heading" as="span" /></h3>
                  <p><EditableText contentKey="services.brands.body" as="span" /></p>
                  <p className="sb-path-offers">{offerTitles("services.brands.cards")}</p>
                  {pathLink(2)}
                </article>
              </div>
            </div>
          </section>
          <EditableBlockList contentKey="blocks.home.pathCards" style={blocksStyle} />
        </>
      );
    },

    about: () => (
      <section className="sb-about" id="about" aria-labelledby="about-h">
        <div className="sb-wrap sb-about-grid">
          <div className="sb-about-copy">
            <p className="sb-script"><EditableText contentKey="about.hero.scriptLabel" as="span" /></p>
            <h2 id="about-h"><EditableText contentKey="about.hero.title" as="span" /></h2>
            <p className="sb-lede"><EditableText contentKey="about.hero.subtitle" as="span" /></p>
            <p><EditableText contentKey="about.hero.body" as="span" /></p>
            <p><EditableText contentKey="about.backstory.body1" as="span" /></p>
            <p><EditableText contentKey="about.backstory.body2" as="span" /></p>
            <p className="sb-script sb-story"><EditableText contentKey="about.backstory.body3" as="span" /></p>
          </div>
          <figure className="sb-about-photo">
            <span className="sb-ph" style={{ "--tint": "#c7c3b0" }}>
              <EditableImage contentKey="image.home.testimonials.bg" alt="palm trees against a bright coastal sky" placeholderHeight="100%" placeholderRadius={0} placeholderLabel="upload a photo" placeholderBg={C.sandLight} style={{ height: "100%" }} />
            </span>
            <figcaption><EditableText contentKey="home.about.photoCaption" as="span" /></figcaption>
          </figure>
        </div>
      </section>
    ),

    stats: () => (
      <EditableSection contentKey="visibility.home.stats">
        <section className="sb-proof" id="proof" aria-labelledby="proof-h">
          <div className="sb-wrap">
            {head("home.stats.scriptLabel", "home.stats.heading", "proof-h")}
            <EditableCardGroup
              contentKey="home.stats"
              gridClassName="sb-ledger"
              defaultNewItem={{ stat: "0+", label: "new stat description" }}
              renderCard={(s, i) => (
                <div className="sb-ledger-item">
                  <EditableArrayText contentKey="home.stats" index={i} field="stat" className="sb-ledger-num" />
                  <EditableArrayText contentKey="home.stats" index={i} field="label" className="sb-ledger-label" />
                </div>
              )}
            />
            <ul className="sb-stamps" aria-label="credentials">
              {(getContent("home.stats.badges") || []).map((_, i) => <EditableArrayString key={i} contentKey="home.stats.badges" index={i} as="li" />)}
            </ul>
          </div>
        </section>
        <EditableBlockList contentKey="blocks.home.stats" style={blocksStyle} />
      </EditableSection>
    ),

    values: () => (
      <>
        <section className="sb-values" aria-labelledby="values-h">
          <div className="sb-wrap">
            {head("home.coreValues.scriptLabel", "home.coreValues.heading", "values-h")}
            <EditableCardGroup
              contentKey="home.coreValues.cards"
              gridClassName="sb-values-grid"
              defaultNewItem={{ emoji: "✨", title: "new value", desc: "description here" }}
              renderCard={(_, i) => (
                <div className="sb-value">
                  <h3><DecoratedArrayText contentKey="home.coreValues.cards" index={i} field="title" decorate={scriptJoiner} /></h3>
                  <p><EditableArrayText contentKey="home.coreValues.cards" index={i} field="desc" /></p>
                </div>
              )}
            />
          </div>
        </section>
        <EditableBlockList contentKey="blocks.home.coreValues" style={blocksStyle} />
      </>
    ),

    testimonials: () => (
      <EditableSection contentKey="visibility.home.testimonials">
        <section className="sb-quotes" id="quotes" aria-labelledby="quotes-h">
          <div className="sb-wrap">
            {head("home.testimonials.scriptLabel", "home.testimonials.heading", "quotes-h")}
            <EditableCardGroup
              contentKey="home.testimonials"
              gridClassName="sb-quotes-grid"
              defaultNewItem={{ text: "new testimonial", author: "role, company" }}
              renderCard={(t, i) => (
                <figure className={`sb-quote${i === 0 ? " sb-quote-lead" : ""}${String(t.text ?? "").length > 160 ? " is-long" : ""}`}>
                  <blockquote><EditableArrayText contentKey="home.testimonials" index={i} field="text" as="p" /></blockquote>
                  <figcaption><EditableArrayText contentKey="home.testimonials" index={i} field="author" /></figcaption>
                </figure>
              )}
            />
          </div>
        </section>
      </EditableSection>
    ),

    newsletter: () => (
      <EditableSection contentKey="visibility.home.newsletter">
        <section className="sb-cabana" id="cabana" aria-labelledby="cabana-h">
          <div className="sb-wrap sb-cabana-grid">
            <div>
              <p className="sb-script"><EditableText contentKey="home.newsletter.scriptLabel" as="span" /></p>
              <h2 id="cabana-h"><DecoratedText contentKey="home.closing.heading" decorate={markEnding} /></h2>
              <p><EditableText contentKey="home.closing.body" as="span" /></p>
              <p className="sb-script"><EditableText contentKey="home.closing.script" as="span" /></p>
            </div>
            <div className="sb-signup">
              {(isEditing || getContent("home.newsletter.heading")) && <h3><EditableText contentKey="home.newsletter.heading" as="span" /></h3>}
              {(isEditing || getContent("home.newsletter.body")) && <p><EditableText contentKey="home.newsletter.body" as="span" /></p>}
              <NewsletterForm />
            </div>
          </div>
        </section>
        <EditableBlockList contentKey="blocks.home.closing" style={blocksStyle} />
      </EditableSection>
    ),
  };

  // Saved order first; sections added since the order was saved go at the end
  const savedOrder = (getContent("home.layout.sectionOrder") || []).filter((id) => sectionDefs[id]);
  const sectionOrder = [...savedOrder, ...Object.keys(sectionDefs).filter((id) => !savedOrder.includes(id))];

  const moveSection = (from, to) => {
    if (to < 0 || to >= sectionOrder.length) return;
    const next = [...sectionOrder];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    updateContent("home.layout.sectionOrder", next);
  };

  const sectionMoveBtn = (direction, onClick, disabled) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: 36, height: 36, borderRadius: "50%", background: C.charcoal,
      border: `2px solid ${C.cream}`, cursor: disabled ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.cream, fontSize: 16,
      boxShadow: "0 4px 16px rgba(44,44,40,0.25)",
      opacity: disabled ? 0.3 : 1,
      transition: "all 0.3s",
    }} aria-label={direction === "up" ? "Move section up" : "Move section down"}>
      {direction === "up" ? "↑" : "↓"}
    </button>
  );

  return (
    <div className="sb-home">
      {sectionOrder.map((id, i) => (
        <div key={id} style={{ position: "relative" }}>
          {isEditing && (
            <div style={{
              position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 100,
            }}>
              {sectionMoveBtn("up", () => moveSection(i, i - 1), i === 0)}
              <span style={{
                fontFamily: "'Rubik', sans-serif", fontSize: 9, fontWeight: 700,
                color: "#fff", background: "rgba(45,45,45,0.85)", borderRadius: 6,
                padding: "3px 8px", whiteSpace: "nowrap", letterSpacing: "0.3px",
              }}>{sectionLabels[id] || id}</span>
              {sectionMoveBtn("down", () => moveSection(i, i + 1), i === sectionOrder.length - 1)}
            </div>
          )}
          {sectionDefs[id]()}
        </div>
      ))}
    </div>
  );
}

export default HomePage;

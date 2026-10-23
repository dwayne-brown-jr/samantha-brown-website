import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { ArrayMediaControls } from "../cms/EditableMedia";
import { PageLink } from "../components/ui";
import { Monogram } from "../components/layout";
import { navigateTo } from "../links";
import "../ugc.css";

/* ══════════════════════════════════════════════════════════════
   UGC PAGE — bysamanthabrown.com/ugc
   Unlisted: nothing on the main site links here; Sam shares the link.
   For a brand marketer on a phone deciding whether to reply. Blank
   fields stay hidden from visitors, so nothing half-filled shows.
   ══════════════════════════════════════════════════════════════ */

/* True when a CMS value has real text (editor HTML and &nbsp; ignored) */
const isFilled = (v) => (typeof v === "string" ? v.replace(/<[^>]*>|&nbsp;/g, "").trim() !== "" : Boolean(v));
const plain = (v) => String(v ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
const hasMedia = (item) => isFilled(item.poster) || isFilled(item.video);
const priced = (row) => isFilled(row.price);

function useList(key) {
  const { getContent } = useCMS();
  const value = getContent(key);
  return Array.isArray(value) ? value : [];
}

/* Which optional sections have enough real content to show visitors */
function useUgcSections() {
  const { isEditing } = useCMS();
  const work = useList("ugc.work.items");
  const services = useList("ugc.services.items");
  const base = useList("ugc.rates.base");
  const addons = useList("ugc.rates.addons");
  const paragraphs = useList("ugc.about.paragraphs");
  return {
    work: isEditing || work.some(hasMedia),
    services: isEditing || services.some((s) => isFilled(s.name)),
    rates: isEditing || base.some(priced) || addons.some(priced),
    about: isEditing || paragraphs.some((p) => isFilled(p.text)),
  };
}

/* Visitors see the items that pass `show`; the editor sees every item with add, remove and reorder */
function EditableList({ contentKey, items, show, className, defaultNewItem, renderItem }) {
  const { isEditing } = useCMS();
  if (isEditing) return <EditableCardGroup contentKey={contentKey} gridClassName={className} defaultNewItem={defaultNewItem} renderCard={renderItem} />;
  return (
    <div className={className}>
      {items.map((item, i) => (show(item) ? <div key={i} style={{ display: "flex", flexDirection: "column" }}>{renderItem(item, i)}</div> : null))}
    </div>
  );
}

/* Label/value rows (hero card, rate terms, about facts); rows without a value stay hidden */
function FactList({ contentKey, className }) {
  const { isEditing } = useCMS();
  const facts = useList(contentKey);
  const shown = facts.map((f, i) => [f, i]).filter(([f]) => isEditing || isFilled(f.value));
  if (!shown.length) return null;
  return (
    <dl className={`ugc-facts ${className || ""}`}>
      {shown.map(([, i]) => (
        <div key={i}>
          <EditableArrayText contentKey={contentKey} index={i} field="label" as="dt" />
          <EditableArrayText contentKey={contentKey} index={i} field="value" as="dd" data-placeholder="add, or leave blank to hide" />
        </div>
      ))}
    </dl>
  );
}

function EditorNote({ children }) {
  const { isEditing } = useCMS();
  if (!isEditing) return null;
  return <p data-editor-panel className="ugc-note">{children}</p>;
}

function SectionHead({ scriptKey, headingKey, id }) {
  return (
    <div className="sb-section-head">
      <p className="sb-script"><EditableText contentKey={scriptKey} as="span" /></p>
      <h2 id={id}><EditableText contentKey={headingKey} as="span" /></h2>
    </div>
  );
}

/* ── Header: jump links within the page; the wordmark goes to her main site ── */
export function UgcHeader({ setPage, scrollY, isEditing }) {
  const sections = useUgcSections();
  const links = [["work", "work"], ["services", "services"], ["rates", "rates"], ["about", "about"], ["contact", "contact"]]
    .filter(([id]) => id === "contact" || sections[id]);
  return (
    <header className={`sb-header${scrollY > 8 ? " is-stuck" : ""}`}>
      <div className="sb-wrap sb-header-row">
        <PageLink to="home" onNavigate={() => { if (!isEditing) navigateTo(setPage, "home"); }} className="sb-wordmark">
          <Monogram /><EditableText contentKey="global.siteName" as="span" />
        </PageLink>
        <nav aria-label="sections" className="sb-nav-desktop">
          <ul className="sb-nav-links">
            {links.map(([id, label]) => <li key={id}><a href={`#${id}`}>{label}</a></li>)}
          </ul>
        </nav>
        <a href="#contact" className="sb-btn sb-btn-solid sb-btn-small sb-nav-cta ugc-header-cta"><EditableText contentKey="ugc.hero.ctaPrimary" as="span" /></a>
      </div>
    </header>
  );
}

/* ── One portfolio video: the cover image loads lazily; the video only exists after a tap ── */
function WorkCard({ item, index, active, onPlay, onStop }) {
  const { isEditing, getContent, updateContent } = useCMS();
  const ref = useRef(null);
  const isClient = item.relationship === "client";

  // Scrolling an active video out of view stops it, so sound never follows the reader
  useEffect(() => {
    if (!active || !ref.current || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(([e]) => { if (!e.isIntersecting) onStop(); });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [active, onStop]);

  const toggleRelationship = () => {
    const items = getContent("ugc.work.items") || [];
    updateContent("ugc.work.items", items.map((it, i) => (i === index ? { ...it, relationship: isClient ? "spec" : "client" } : it)));
  };

  const name = plain(item.product) || "this video";
  return (
    <figure className="ugc-card" ref={ref}>
      <div className="ugc-frame">
        {active && item.video ? (
          <video src={item.video} poster={item.poster || undefined} controls autoPlay playsInline />
        ) : (
          <button type="button" className="ugc-frame-btn" onClick={() => item.video && onPlay(index)} disabled={!item.video} aria-label={item.video ? `Play ${name}` : name}>
            {item.poster ? <img src={item.poster} alt={plain(item.alt)} loading="lazy" /> : <span className="ugc-frame-empty">{isEditing ? "add a cover image" : ""}</span>}
            {item.video && <span className="ugc-play" aria-hidden="true" />}
          </button>
        )}
        {isEditing ? (
          <button type="button" data-editor-panel className={`ugc-badge${isClient ? " is-client" : ""}`} onClick={toggleRelationship} title="Click to switch between concept and client work">
            {isClient ? "client work" : "concept"} ⇄
          </button>
        ) : (
          <span className={`ugc-badge${isClient ? " is-client" : ""}`}>{isClient ? "client work" : "concept"}</span>
        )}
        {isEditing && <ArrayMediaControls contentKey="ugc.work.items" index={index} />}
      </div>
      <figcaption>
        <EditableArrayText contentKey="ugc.work.items" index={index} field="product" as="strong" data-placeholder="product or brand" />
        <EditableArrayText contentKey="ugc.work.items" index={index} field="format" as="span" data-placeholder="format, e.g. unboxing" />
        <EditableArrayText contentKey="ugc.work.items" index={index} field="placement" as="span" className="ugc-placement" data-placeholder="where it ran, or “spec concept”" />
        {isEditing && <EditableArrayText contentKey="ugc.work.items" index={index} field="alt" as="span" className="ugc-alt" data-placeholder="describe the cover image for screen readers" />}
      </figcaption>
    </figure>
  );
}

/* Small editable chip list with add/remove in edit mode */
function ChipList({ contentKey, extra = [] }) {
  const { isEditing, updateContent } = useCMS();
  const chips = useList(contentKey);
  return (
    <ul className="ugc-chips">
      {chips.map((chip, i) => (isEditing || isFilled(chip)) && (
        <li key={i} className="ugc-chip is-category">
          <EditableArrayString contentKey={contentKey} index={i} as="span" data-placeholder="category" />
          {isEditing && <button type="button" data-editor-panel className="ugc-chip-x" aria-label="Remove" onClick={() => updateContent(contentKey, chips.filter((_, j) => j !== i))}>✕</button>}
        </li>
      ))}
      {isEditing && <li><button type="button" data-editor-panel className="ugc-chip ugc-chip-add" onClick={() => updateContent(contentKey, [...chips, ""])}>+ category</button></li>}
      {extra.map((label, i) => <li key={`x${i}`} className="ugc-chip" dangerouslySetInnerHTML={{ __html: label }} />)}
    </ul>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════════════════ */
function UgcPage() {
  const { getContent, isEditing } = useCMS();
  const sections = useUgcSections();
  const work = useList("ugc.work.items");
  const services = useList("ugc.services.items");
  const base = useList("ugc.rates.base");
  const addons = useList("ugc.rates.addons");
  const paragraphs = useList("ugc.about.paragraphs");
  const stickers = useList("ugc.hero.stickers");
  const [playing, setPlaying] = useState(null);
  const stop = useCallback(() => setPlaying(null), []);

  const email = plain(getContent("ugc.contact.email"));
  const mailto = `mailto:${email}?subject=${encodeURIComponent(plain(getContent("ugc.contact.emailSubject")))}&body=${encodeURIComponent(getContent("ugc.contact.emailBody") || "")}`;
  const instagram = plain(getContent("ugc.contact.instagram")).replace(/^@/, "");
  const tiktok = plain(getContent("ugc.contact.tiktok")).replace(/^@/, "");
  const aboutPhoto = getContent("image.ugc.about");
  const showSpecNote = isEditing || work.some((it) => hasMedia(it) && it.relationship !== "client");

  return (
    <div className="sb-home ugc-page">
      {isEditing && (
        <p data-editor-panel className="ugc-edit-banner">
          Unlisted page: only people with the link <strong>bysamanthabrown.com/ugc</strong> can see it. Anything left blank stays hidden from visitors.
        </p>
      )}

      {/* Hero: the promise on the left, the facts a brand decides on in the card */}
      <section className="ugc-hero" id="top">
        <div className="sb-wrap ugc-hero-grid">
          <div className="ugc-hero-copy">
            <p className="sb-script sb-hero-kicker"><EditableText contentKey="ugc.hero.kicker" as="span" /></p>
            <h1><EditableText contentKey="ugc.hero.heading" as="span" /></h1>
            <p className="sb-lede"><EditableText contentKey="ugc.hero.subheading" as="span" /></p>
            <div className="sb-actions">
              <a className="sb-btn sb-btn-solid" href="#contact"><EditableText contentKey="ugc.hero.ctaPrimary" as="span" /></a>
              {sections.work && <a className="sb-btn sb-btn-ghost" href="#work"><EditableText contentKey="ugc.hero.ctaSecondary" as="span" /></a>}
            </div>
          </div>
          <div className="ugc-hero-card-wrap">
            <div className="ugc-hero-card">
              <p><EditableText contentKey="ugc.hero.positioning" as="span" /></p>
              <FactList contentKey="ugc.hero.facts" />
            </div>
            {stickers.map((s, i) => (isEditing || isFilled(s)) && (
              <EditableArrayString key={i} contentKey="ugc.hero.stickers" index={i} as="span" className={`ugc-sticker ugc-sticker-${(i % 2) + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* What she shoots: niches first, then formats */}
      <section className="ugc-shoot" aria-label="what i shoot">
        <div className="sb-wrap ugc-shoot-row">
          <p className="sb-script"><EditableText contentKey="ugc.shoot.scriptLabel" as="span" /></p>
          <ChipList contentKey="ugc.categories" extra={services.filter((s) => isFilled(s.name)).map((s) => s.name)} />
        </div>
      </section>

      {sections.work && (
        <section className="ugc-work" id="work" aria-labelledby="work-h">
          <div className="sb-wrap">
            <SectionHead scriptKey="ugc.work.scriptLabel" headingKey="ugc.work.heading" id="work-h" />
            {showSpecNote && <p className="ugc-disclosure"><EditableText contentKey="ugc.work.disclosure" as="span" /></p>}
            <EditorNote>Add a card per video. A card stays hidden from visitors until it has a cover image or a video. Tap the badge to switch between “concept” (spec work) and “client work”.</EditorNote>
            <EditableList
              contentKey="ugc.work.items"
              items={work}
              show={hasMedia}
              className="ugc-work-grid"
              defaultNewItem={{ relationship: "spec", product: "", format: "", placement: "spec concept, not a paid engagement", poster: "", video: "", alt: "" }}
              renderItem={(item, i) => <WorkCard item={item} index={i} active={playing === i} onPlay={setPlaying} onStop={stop} />}
            />
          </div>
        </section>
      )}

      {sections.services && (
        <section className="ugc-services" id="services" aria-labelledby="services-h">
          <div className="sb-wrap">
            <SectionHead scriptKey="ugc.services.scriptLabel" headingKey="ugc.services.heading" id="services-h" />
            <EditableList
              contentKey="ugc.services.items"
              items={services}
              show={(s) => isFilled(s.name)}
              className="ugc-services-grid"
              defaultNewItem={{ name: "", description: "" }}
              renderItem={(_, i) => (
                <div className="ugc-service">
                  <EditableArrayText contentKey="ugc.services.items" index={i} field="name" as="h3" data-placeholder="service" />
                  <EditableArrayText contentKey="ugc.services.items" index={i} field="description" as="p" data-placeholder="what the brand gets" />
                </div>
              )}
            />
          </div>
        </section>
      )}

      {sections.rates && (
        <section className="ugc-rates" id="rates" aria-labelledby="rates-h">
          <div className="sb-wrap">
            <SectionHead scriptKey="ugc.rates.scriptLabel" headingKey="ugc.rates.heading" id="rates-h" />
            <EditorNote>A rate stays hidden from visitors until it has a price. Write prices the way you want them shown, e.g. “$350” or “+$150 per video / 90 days”.</EditorNote>
            <EditableList
              contentKey="ugc.rates.base"
              items={base}
              show={priced}
              className="ugc-rate-cards"
              defaultNewItem={{ label: "", price: "", detail: "" }}
              renderItem={(_, i) => (
                <article className={`ugc-rate-card ugc-tint-${(i % 3) + 1}`}>
                  <EditableArrayText contentKey="ugc.rates.base" index={i} field="label" as="h3" data-placeholder="what it is" />
                  <EditableArrayText contentKey="ugc.rates.base" index={i} field="price" as="p" className="ugc-price" data-placeholder="price" />
                  <EditableArrayText contentKey="ugc.rates.base" index={i} field="detail" as="p" data-placeholder="what's included" />
                </article>
              )}
            />
            {(isEditing || addons.some(priced)) && (
              <>
                <h3 className="ugc-subhead"><EditableText contentKey="ugc.rates.addonsHeading" as="span" /></h3>
                <EditableList
                  contentKey="ugc.rates.addons"
                  items={addons}
                  show={priced}
                  className="ugc-addons"
                  defaultNewItem={{ label: "", price: "", detail: "" }}
                  renderItem={(_, i) => (
                    <div className="ugc-addon">
                      <div>
                        <EditableArrayText contentKey="ugc.rates.addons" index={i} field="label" as="h4" data-placeholder="add-on" />
                        <EditableArrayText contentKey="ugc.rates.addons" index={i} field="detail" as="p" data-placeholder="what it covers" />
                      </div>
                      <EditableArrayText contentKey="ugc.rates.addons" index={i} field="price" as="p" className="ugc-price" data-placeholder="price" />
                    </div>
                  )}
                />
              </>
            )}
            <FactList contentKey="ugc.rates.terms" className="ugc-terms" />
          </div>
        </section>
      )}

      {sections.about && (
        <section className="sb-about ugc-about" id="about" aria-labelledby="about-h">
          <div className={`sb-wrap sb-about-grid${aboutPhoto || isEditing ? "" : " ugc-about-solo"}`}>
            <div className="sb-about-copy">
              <p className="sb-script"><EditableText contentKey="ugc.about.scriptLabel" as="span" /></p>
              <h2 id="about-h"><EditableText contentKey="ugc.about.heading" as="span" /></h2>
              <EditableList
                contentKey="ugc.about.paragraphs"
                items={paragraphs}
                show={(p) => isFilled(p.text)}
                className="ugc-paragraphs"
                defaultNewItem={{ text: "" }}
                renderItem={(_, i) => <EditableArrayText contentKey="ugc.about.paragraphs" index={i} field="text" as="p" data-placeholder="a few sentences: who you are, what you shoot, your setup" />}
              />
              <FactList contentKey="ugc.about.facts" className="ugc-about-facts" />
            </div>
            {(aboutPhoto || isEditing) && (
              <figure className="sb-about-photo">
                <span className="sb-ph" style={{ "--tint": "#c7c3b0" }}>
                  <EditableImage contentKey="image.ugc.about" alt="samantha brown" placeholderHeight="100%" placeholderRadius={0} placeholderLabel="add a photo of you" placeholderBg={C.sandLight} style={{ height: "100%" }} />
                </span>
              </figure>
            )}
          </div>
        </section>
      )}

      <section className="ugc-contact" id="contact" aria-labelledby="contact-h">
        <div className="sb-wrap ugc-contact-grid">
          <div>
            <p className="sb-script"><EditableText contentKey="ugc.contact.scriptLabel" as="span" /></p>
            <h2 id="contact-h"><EditableText contentKey="ugc.contact.heading" as="span" /></h2>
            <p><EditableText contentKey="ugc.contact.body" as="span" /></p>
          </div>
          <div className="ugc-contact-card">
            {isEditing ? (
              <p className="ugc-email"><EditableText contentKey="ugc.contact.email" as="span" /></p>
            ) : (
              <a className="ugc-email" href={mailto}>{email}</a>
            )}
            <a className="sb-btn sb-btn-solid" href={mailto} onClick={(e) => { if (isEditing) e.preventDefault(); }}>
              <EditableText contentKey="ugc.hero.ctaPrimary" as="span" />
            </a>
            {(isEditing || instagram || tiktok) && (
              <ul className="ugc-handles">
                {(isEditing || instagram) && (
                  <li>instagram {isEditing ? <EditableText contentKey="ugc.contact.instagram" as="span" data-placeholder="handle, without the @" /> : <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener">@{instagram}</a>}</li>
                )}
                {(isEditing || tiktok) && (
                  <li>tiktok {isEditing ? <EditableText contentKey="ugc.contact.tiktok" as="span" data-placeholder="handle, without the @" /> : <a href={`https://www.tiktok.com/@${tiktok}`} target="_blank" rel="noopener">@{tiktok}</a>}</li>
                )}
              </ul>
            )}
            {(isEditing || isFilled(getContent("ugc.contact.responseTime"))) && (
              <p className="ugc-response"><EditableText contentKey="ugc.contact.responseTime" as="span" data-placeholder="how fast you reply, e.g. replies within one business day" /></p>
            )}
          </div>
        </div>
      </section>

      {!isEditing && (
        <a className="sb-btn sb-btn-solid ugc-mobile-cta" href="#contact"><EditableText contentKey="ugc.hero.ctaPrimary" as="span" /></a>
      )}
    </div>
  );
}

export default UgcPage;

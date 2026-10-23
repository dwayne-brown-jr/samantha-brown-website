import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText } from "../cms/EditableText";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import { PageLink } from "../components/ui";

const blocksStyle = { width: "min(1200px, 100% - 2 * var(--gutter))", margin: "0 auto" };

/* One group of offers (creators, corporate, brands): heading, intro, price cards in the home page's style.
   Each card links to its own page; cards without one go to contact. */
function OfferGroup({ id, groupKey, defaultNewItem, nav, paper, featureIndex }) {
  const { getContent } = useCMS();
  const cardsKey = `${groupKey}.cards`;
  const count = (getContent(cardsKey) || []).length;
  return (
    <section className={`sb-band${paper ? " is-paper" : ""}`} id={id} aria-labelledby={`${id}-h`}>
      <div className="sb-wrap">
        <div className="sb-section-head">
          <p className="sb-script"><EditableText contentKey={`${groupKey}.scriptLabel`} as="span" /></p>
          <h2 id={`${id}-h`}><EditableText contentKey={`${groupKey}.heading`} as="span" /></h2>
          <p className="sb-intro"><EditableText contentKey={`${groupKey}.body`} as="span" /></p>
        </div>
        <EditableCardGroup
          contentKey={cardsKey}
          gridClassName={`sb-offers is-flush${count === 2 ? " is-cols-2" : ""}`}
          defaultNewItem={defaultNewItem}
          renderCard={(c, i) => (
            <article className={`sb-offer${i === featureIndex ? " sb-offer-feature" : ""}`} style={c.bg ? { background: c.bg } : undefined}>
              <h3><EditableArrayText contentKey={cardsKey} index={i} field="title" /></h3>
              <p className="sb-price"><EditableArrayText contentKey={cardsKey} index={i} field="price" /></p>
              <p><EditableArrayText contentKey={cardsKey} index={i} field="body" /></p>
              <p className="sb-offer-tag">{c.tag ? <EditableArrayText contentKey={cardsKey} index={i} field="tag" /> : null}</p>
              <PageLink to={c.page || "contact"} nav={nav} className="sb-btn sb-btn-solid">
                {c.cta ? <EditableArrayText contentKey={cardsKey} index={i} field="cta" /> : c.page && c.page !== "contact" ? "learn more" : "get in touch"}
              </PageLink>
            </article>
          )}
        />
      </div>
    </section>
  );
}

function ServicesPage({ setPage }) {
  const { isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };
  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="sb-home sb-inner">
      <section className="sb-page-hero">
        <div className="sb-wrap">
          <p className="sb-script"><EditableText contentKey="services.hero.scriptLabel" as="span" /></p>
          <h1><EditableText contentKey="services.hero.heading" as="span" /></h1>
          <p className="sb-lede"><EditableText contentKey="services.hero.subheading" as="span" /></p>
          {/* Jump buttons scroll within the page (a #hash would switch pages in this app) */}
          <div className="sb-jump">
            <button type="button" className="sb-btn sb-btn-ghost sb-btn-small" onClick={() => jump("creators")}>for founders</button>
            <button type="button" className="sb-btn sb-btn-ghost sb-btn-small" onClick={() => jump("corporate")}>for corporate teams</button>
            <button type="button" className="sb-btn sb-btn-ghost sb-btn-small" onClick={() => jump("brands")}>for brands</button>
          </div>
        </div>
      </section>

      <EditableSection contentKey="visibility.services.creators">
        <OfferGroup id="creators" groupKey="services.creators" nav={nav} featureIndex={1}
          defaultNewItem={{ num: "04", title: "new service", price: "TBD", body: "description here", page: "contact", bg: "#F5E6DC" }} />
      </EditableSection>
      <EditableBlockList contentKey="blocks.services.creators" style={blocksStyle} />

      <EditableSection contentKey="visibility.services.corporate">
        <OfferGroup id="corporate" groupKey="services.corporate" nav={nav} paper
          defaultNewItem={{ num: "03", title: "new offering", price: "custom pricing", body: "description here", page: "corporate", bg: "#E8DDD4" }} />
      </EditableSection>
      <EditableBlockList contentKey="blocks.services.corporate" style={blocksStyle} />

      <EditableSection contentKey="visibility.services.brands">
        <OfferGroup id="brands" groupKey="services.brands" nav={nav}
          defaultNewItem={{ num: "04", title: "new partnership", price: "inquire", body: "description here", page: "contact", bg: "#F5E6DC" }} />
      </EditableSection>
      <EditableBlockList contentKey="blocks.services.brands" style={blocksStyle} />
    </div>
  );
}

export default ServicesPage;

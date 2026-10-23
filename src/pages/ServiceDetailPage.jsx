import { C } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayString } from "../cms/EditableText";
import { FAQAccordion, EditableTagList, EditableBtn, PageLink } from "../components/ui";

/* One page per offer (audit, implementation, fractional, corporate). Everything comes from
   services.<key>.* (corporate uses services.corporate.detail.*); empty sections don't render. */
function ServiceDetailPage({ setPage, serviceKey }) {
  const { getContent, isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };
  const p = serviceKey === "corporate" ? "services.corporate.detail" : `services.${serviceKey}`;
  const list = (k) => getContent(`${p}.${k}`) || [];

  const includes = list("includes");
  const timeline = list("timeline");
  const process = list("process");
  const fitPerfect = list("fit.perfect");
  const fitNotFit = list("fit.notFit");
  const faqs = list("faqs");
  const quoteText = getContent(`${p}.quote.text`);
  const price = getContent(`${p}.price`);
  const different = getContent(`${p}.different`);

  return (
    <div className="sb-home sb-inner">
      <section className="sb-page-hero">
        <div className="sb-wrap">
          <PageLink to="services" nav={nav} className="sb-back">← all services</PageLink>
          {(price || isEditing) && <p className="sb-script"><EditableText contentKey={`${p}.price`} as="span" /></p>}
          <h1><EditableText contentKey={`${p}.title`} as="span" /></h1>
          <p className="sb-lede"><EditableText contentKey={`${p}.subtitle`} as="span" /></p>
          <div className="sb-actions">
            <EditableBtn contentKey={`${p}.cta`} className="sb-btn sb-btn-solid" defaultLabel="work with me →" defaultLink="contact" nav={nav} />
          </div>
        </div>
      </section>

      <section className="sb-band" aria-labelledby="problem-h">
        <div className="sb-wrap sb-narrow">
          <div className="sb-section-head"><p className="sb-script"><EditableText contentKey="services.detail.problem.scriptLabel" as="span" /></p><h2 id="problem-h" className="is-small"><EditableText contentKey="services.detail.problem.heading" as="span" /></h2></div>
          <p className="sb-story-block"><EditableText contentKey={`${p}.problem`} as="span" /></p>
        </div>
      </section>

      <section className="sb-band is-paper" aria-labelledby="what-h">
        <div className="sb-wrap sb-narrow">
          <div className="sb-section-head"><p className="sb-script"><EditableText contentKey="services.detail.what.scriptLabel" as="span" /></p><h2 id="what-h" className="is-small"><EditableText contentKey="services.detail.what.heading" as="span" /></h2></div>
          <p><EditableText contentKey={`${p}.whatIntro`} as="span" /></p>
          {includes.length > 0 && (
            <ul className="sb-ticks is-compact">
              {includes.map((_, i) => <EditableArrayString key={i} contentKey={`${p}.includes`} index={i} as="li" />)}
            </ul>
          )}
          {isEditing ? (
            <EditableTagList contentKey={`${p}.timeline`} items={timeline} tagBg={C.butter} tagColor={C.charcoal} />
          ) : timeline.length > 0 && (
            <ul className="sb-stamps" aria-label="timeline and investment">
              {timeline.map((t, i) => <li key={i} dangerouslySetInnerHTML={{ __html: t }} />)}
            </ul>
          )}
        </div>
      </section>

      {process.length > 0 && (
        <section className="sb-band" aria-labelledby="process-h">
          <div className="sb-wrap sb-narrow">
            <div className="sb-section-head"><p className="sb-script"><EditableText contentKey="services.detail.process.scriptLabel" as="span" /></p><h2 id="process-h" className="is-small"><EditableText contentKey="services.detail.process.heading" as="span" /></h2></div>
            <ol className="sb-steps">
              {process.map((_, i) => <EditableArrayString key={i} contentKey={`${p}.process`} index={i} as="li" />)}
            </ol>
          </div>
        </section>
      )}

      {(fitPerfect.length > 0 || fitNotFit.length > 0) && (
        <section className="sb-band" aria-labelledby="fit-h">
          <div className="sb-wrap">
            <div className="sb-section-head"><p className="sb-script"><EditableText contentKey="services.detail.fit.scriptLabel" as="span" /></p><h2 id="fit-h" className="is-small"><EditableText contentKey="services.detail.fit.heading" as="span" /></h2></div>
            <div className="sb-fit-grid">
              <div className="sb-fit-yes">
                <h3><EditableText contentKey="services.detail.fitYes" as="span" /></h3>
                <ul>{fitPerfect.map((_, i) => <EditableArrayString key={i} contentKey={`${p}.fit.perfect`} index={i} as="li" />)}</ul>
              </div>
              <div className="sb-fit-no">
                <h3><EditableText contentKey="services.detail.fitNo" as="span" /></h3>
                <ul>{fitNotFit.map((_, i) => <EditableArrayString key={i} contentKey={`${p}.fit.notFit`} index={i} as="li" />)}</ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {different && (
        <section className="sb-band is-paper" aria-labelledby="different-h">
          <div className="sb-wrap sb-narrow">
            <div className="sb-section-head"><p className="sb-script"><EditableText contentKey="services.detail.different.scriptLabel" as="span" /></p><h2 id="different-h" className="is-small"><EditableText contentKey="services.detail.different.heading" as="span" /></h2></div>
            <p className="sb-story-block"><EditableText contentKey={`${p}.different`} as="span" /></p>
          </div>
        </section>
      )}

      {quoteText && (
        <section className="sb-quote-band">
          <figure className="sb-wrap" style={{ margin: "0 auto" }}>
            <blockquote><EditableText contentKey={`${p}.quote.text`} as="span" /></blockquote>
            <figcaption><EditableText contentKey={`${p}.quote.author`} as="span" /></figcaption>
          </figure>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="sb-band" aria-labelledby="faq-h">
          <div className="sb-wrap sb-faq">
            <div className="sb-section-head"><p className="sb-script"><EditableText contentKey="services.detail.faq.scriptLabel" as="span" /></p><h2 id="faq-h" className="is-small"><EditableText contentKey="services.detail.faq.heading" as="span" /></h2></div>
            <FAQAccordion faqs={faqs} contentKey={`${p}.faqs`} />
          </div>
        </section>
      )}

      <section className="sb-cta-band">
        <div className="sb-wrap">
          <h2><EditableText contentKey={`${p}.title`} as="span" /></h2>
          <p className="sb-script"><EditableText contentKey={`${p}.subtitle`} as="span" /></p>
          <div className="sb-actions">
            <EditableBtn contentKey={`${p}.cta`} className="sb-btn sb-btn-solid" defaultLabel="work with me →" defaultLink="contact" nav={nav} />
            <PageLink to="services" nav={nav} className="sb-btn sb-btn-ghost">see all services</PageLink>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServiceDetailPage;

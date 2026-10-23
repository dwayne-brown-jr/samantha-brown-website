import { C } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText } from "../cms/EditableText";
import { EditableImage } from "../cms/EditableImage";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EditableBlockList } from "../cms/EditableBlockList";
import { EmojiIcon } from "../icons";
import { EditableBtn, DecoratedText, DecoratedArrayText, RotatingPhrase } from "../components/ui";
import { scriptJoiner, markEnding } from "../decorate";

const blocksStyle = { width: "min(1200px, 100% - 2 * var(--gutter))", margin: "0 auto" };

function AboutPage({ setPage }) {
  const { getContent, isEditing } = useCMS();
  const nav = (p) => { if (!isEditing) { setPage(p); window.scrollTo({ top: 0 }); } };

  // Until Sam adds her own about photo, visitors see the one from the home page's about section
  const ownPhoto = getContent("image.about.hero");
  const photoKey = isEditing || ownPhoto ? "image.about.hero" : "image.home.testimonials.bg";
  const hasPhoto = isEditing || ownPhoto || getContent("image.home.testimonials.bg");
  const lifestyle = getContent("about.lifestyle") || [];

  return (
    <div className="sb-home sb-inner">
      <section className={`sb-about-hero${hasPhoto ? "" : " is-solo"}`}>
        <div className="sb-wrap sb-about-grid">
          {hasPhoto && (
            <figure className="sb-about-photo">
              <span className="sb-ph" style={{ "--tint": "#c7c3b0" }}>
                <EditableImage contentKey={photoKey} alt="samantha brown" placeholderHeight="100%" placeholderRadius={0} placeholderLabel="add a photo of you" placeholderBg={C.sandLight} style={{ height: "100%" }} />
              </span>
            </figure>
          )}
          <div className="sb-about-copy">
            <p className="sb-script"><EditableText contentKey="about.hero.scriptLabel" as="span" /></p>
            <h1><EditableText contentKey="about.hero.title" as="span" /></h1>
            <p className="sb-hero-script" aria-live="off"><RotatingPhrase contentKey="about.hero.typewriterTraits" label="rotating lines" /></p>
            <p className="sb-lede"><EditableText contentKey="about.hero.body" as="span" /></p>
          </div>
        </div>
      </section>

      <EditableSection contentKey="visibility.about.backstory">
        <section className="sb-band is-paper" aria-labelledby="backstory-h">
          <div className="sb-wrap sb-narrow">
            <div className="sb-section-head">
              <p className="sb-script"><EditableText contentKey="about.backstory.scriptLabel" as="span" /></p>
              <h2 id="backstory-h"><EditableText contentKey="about.backstory.heading" as="span" /></h2>
            </div>
            <p><EditableText contentKey="about.backstory.body1" as="span" /></p>
            <p><EditableText contentKey="about.backstory.body2" as="span" /></p>
            <p className="sb-script sb-story"><EditableText contentKey="about.backstory.body3" as="span" /></p>
          </div>
        </section>
      </EditableSection>
      <EditableBlockList contentKey="blocks.about.backstory" style={blocksStyle} />

      <EditableSection contentKey="visibility.about.beliefs">
        <section className="sb-band" aria-labelledby="beliefs-h">
          <div className="sb-wrap">
            <div className="sb-section-head">
              <p className="sb-script"><EditableText contentKey="about.beliefs.scriptLabel" as="span" /></p>
              <h2 id="beliefs-h"><EditableText contentKey="about.beliefs.heading" as="span" /></h2>
            </div>
            <EditableCardGroup
              contentKey="about.beliefs"
              gridClassName="sb-beliefs"
              defaultNewItem={{ b: "new belief", d: "why it matters", tag: "short tag" }}
              renderCard={(_, i) => (
                <div className="sb-belief">
                  <EditableArrayText contentKey="about.beliefs" index={i} field="tag" as="span" className="sb-stamp-tag" />
                  <h3><DecoratedArrayText contentKey="about.beliefs" index={i} field="b" decorate={scriptJoiner} /></h3>
                  <p><EditableArrayText contentKey="about.beliefs" index={i} field="d" /></p>
                </div>
              )}
            />
          </div>
        </section>
      </EditableSection>
      <EditableBlockList contentKey="blocks.about.beliefs" style={blocksStyle} />

      <EditableSection contentKey="visibility.about.lifestyle">
        <section className="sb-band is-paper" aria-labelledby="life-h">
          <div className="sb-wrap">
            <div className="sb-section-head">
              <h2 id="life-h" className="sb-script"><EditableText contentKey="about.lifestyle.scriptLabel" as="span" /></h2>
            </div>
            <ul className="sb-chips">
              {lifestyle.map((t, i) => (
                <li key={i}><EmojiIcon emoji={t.emoji} size={18} /><EditableArrayText contentKey="about.lifestyle" index={i} field="text" /></li>
              ))}
            </ul>
          </div>
        </section>
      </EditableSection>

      <section className="sb-cta-band">
        <div className="sb-wrap">
          <h2><DecoratedText contentKey="about.cta.heading" decorate={markEnding} /></h2>
          <p className="sb-script"><EditableText contentKey="about.cta.script" as="span" /></p>
          <div className="sb-actions">
            <EditableBtn contentKey="about.closing.cta" className="sb-btn sb-btn-solid" defaultLabel="work with me →" defaultLink="services" nav={nav} />
            <EditableBtn contentKey="about.closing.ctaSecondary" className="sb-btn sb-btn-ghost" defaultLabel="join the cabana club →" defaultLink="resources" nav={nav} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;

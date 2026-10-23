import { C } from "../theme";
import { useCMS } from "../cms/useContent";
import { EditableText, EditableArrayText } from "../cms/EditableText";
import { EditableSection } from "../cms/EditableSection";
import { EditableCardGroup } from "../cms/EditableCardGroup";
import { EmojiIcon, BrandGlyph, brandForLabel } from "../icons";
import { NewsletterForm } from "../components/ui";

const toolTints = ["var(--peach)", "var(--blue)", "var(--lavender)", "var(--sand)"];

/* The Cabana Club: newsletter signup (Flodesk's form, skinned like the home page's card) and her toolkit */
function ResourcesPage() {
  const { isEditing } = useCMS();
  return (
    <div className="sb-home sb-inner">
      <section className="sb-page-hero">
        <div className="sb-wrap">
          <h1><EditableText contentKey="resources.hero.heading" as="span" /></h1>
          <p className="sb-script"><EditableText contentKey="resources.hero.subheading" as="span" /></p>
        </div>
      </section>

      <EditableSection contentKey="visibility.resources.newsletter">
        <section className="sb-cabana" aria-labelledby="newsletter-h">
          <div className="sb-wrap sb-cabana-grid">
            <div>
              <p className="sb-script"><EditableText contentKey="resources.newsletter.scriptLabel" as="span" /></p>
              <h2 id="newsletter-h"><EditableText contentKey="resources.newsletter.heading" as="span" /></h2>
              <p><EditableText contentKey="resources.newsletter.body" as="span" /></p>
            </div>
            <div className="sb-signup"><NewsletterForm /></div>
          </div>
        </section>
      </EditableSection>

      <EditableSection contentKey="visibility.resources.free">
        <section className="sb-band" aria-labelledby="tools-h">
          <div className="sb-wrap">
            <div className="sb-section-head">
              <p className="sb-script"><EditableText contentKey="resources.tools.scriptLabel" as="span" /></p>
              <h2 id="tools-h"><EditableText contentKey="resources.tools.heading" as="span" /></h2>
              <p className="sb-intro"><EditableText contentKey="resources.tools.subheading" as="span" /></p>
            </div>
            <EditableCardGroup
              contentKey="resources.tools.items"
              gridClassName="sb-tools"
              defaultNewItem={{ emoji: "✨", title: "new tool", desc: "why you recommend it" }}
              renderCard={(tool, i) => (
                <article className="sb-tool">
                  <div className="sb-tool-icon" style={{ background: tool.bg || toolTints[i % toolTints.length] }}>
                    {isEditing
                      ? <span style={{ fontSize: 36 }}><EditableArrayText contentKey="resources.tools.items" index={i} field="emoji" /></span>
                      : brandForLabel(tool.title)
                        ? <BrandGlyph brand={brandForLabel(tool.title)} size={34} color={C.charcoal} />
                        : <EmojiIcon emoji={tool.emoji} size={36} color={C.charcoal} />}
                  </div>
                  <div className="sb-tool-body">
                    <h3><EditableArrayText contentKey="resources.tools.items" index={i} field="title" /></h3>
                    <p><EditableArrayText contentKey="resources.tools.items" index={i} field="desc" /></p>
                  </div>
                </article>
              )}
            />
          </div>
        </section>
      </EditableSection>
    </div>
  );
}

export default ResourcesPage;

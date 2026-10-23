import { useState, useEffect } from "react";
import { C } from "../theme";
import { pageHref } from "../links";
import { useCMS, useContent } from "../cms/useContent";
import { EditableText, EditableArrayText, EditableArrayString } from "../cms/EditableText";
import { EmojiIcon } from "../icons";
import { PhraseListEditor } from "../cms/EditablePhrases";

/* ── Floating Tag (angled pill that hangs off image edges) ── */
const bubbleColorOptions = [
  { label: "white",  value: "#FFFFFF" },
  { label: "cream",  value: "#FDFAF4" },
  { label: "butter", value: "#F2E84B" },
  { label: "blue",   value: "#D8EBF9" },
  { label: "earth",  value: "#7A5C4E" },
  { label: "olive",  value: "#555407" },
  { label: "sand",   value: "#E2DDD4" },
  { label: "charcoal", value: "#2C2C28" },
];

function FloatingTag({ emoji, text, contentKey, index, field, style = {} }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const item = contentKey ? getContent(contentKey)?.[index] : null;
  const val = item?.[field] ?? text ?? "";
  const emojiVal = item?.emoji ?? emoji ?? "";
  const bgVal = item?.bg ?? style.background ?? C.white;

  const [editingEmoji, setEditingEmoji] = useState(false);
  const [emojiDraft, setEmojiDraft] = useState(emojiVal);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const updateField = (fields) => {
    if (!contentKey) return;
    const arr = getContent(contentKey) || [];
    const next = arr.map((it, i) => i === index ? { ...it, ...fields } : it);
    updateContent(contentKey, next);
  };

  const saveEmoji = () => { updateField({ emoji: emojiDraft }); setEditingEmoji(false); };

  // Text color: dark bg → white text, light bg → charcoal text
  const isDarkBg = ["#555407", "#2C2C28", "#7A5C4E"].includes(bgVal);
  const textColor = isDarkBg ? C.white : C.charcoal;
  const borderColor = isDarkBg ? "transparent" : C.sand;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        borderRadius: 50,
        padding: "10px 18px",
        border: `1px solid ${borderColor}`,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        fontFamily: "'Rubik', sans-serif", fontWeight: 700, fontSize: 13,
        color: textColor, whiteSpace: "nowrap",
        ...style, background: bgVal,
      }}>
        {isEditing && contentKey ? (
          <>
            {editingEmoji ? (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  value={emojiDraft}
                  onChange={e => setEmojiDraft(e.target.value)}
                  onBlur={saveEmoji}
                  onKeyDown={e => e.key === "Enter" && saveEmoji()}
                  autoFocus
                  style={{ width: 36, fontSize: 16, border: "1px solid #ccc", borderRadius: 4, padding: "2px 4px", textAlign: "center" }}
                />
              </span>
            ) : (
              <span
                onClick={(e) => { e.stopPropagation(); setEmojiDraft(emojiVal); setEditingEmoji(true); }}
                title="Click to edit emoji"
                style={{ fontSize: 16, cursor: "pointer" }}
              >{emojiVal}</span>
            )}
            <EditableArrayText contentKey={contentKey} index={index} field={field} as="span" style={{ color: textColor }} />
            {/* Color picker toggle */}
            <span
              data-editor-panel
              onClick={(e) => { e.stopPropagation(); setShowColorPicker(p => !p); }}
              title="Change bubble color"
              style={{ fontSize: 12, cursor: "pointer", opacity: 0.6, marginLeft: 2 }}
            >🎨</span>
          </>
        ) : (
          <>
            <EmojiIcon emoji={emojiVal} size={16} color={textColor} />
            <span style={{ color: textColor }}>{val}</span>
          </>
        )}
      </div>

      {/* Bubble color picker popover */}
      {showColorPicker && isEditing && (
        <div data-editor-panel style={{
          position: "absolute", top: "110%", left: 0, zIndex: 9999,
          background: "rgba(28,28,28,0.97)", backdropFilter: "blur(12px)",
          borderRadius: 12, padding: 10, display: "flex", gap: 6, flexWrap: "wrap",
          border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          width: 140,
        }}>
          {bubbleColorOptions.map(opt => (
            <button
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); updateField({ bg: opt.value }); setShowColorPicker(false); }}
              title={opt.label}
              style={{
                width: 24, height: 24, borderRadius: "50%", background: opt.value,
                border: bgVal === opt.value ? "2px solid #3B82F6" : "1.5px solid rgba(255,255,255,0.2)",
                cursor: "pointer", flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MARQUEE / INFINITE TICKER (CMS-editable text)
   ══════════════════════════════════════════════════════════════ */
function Marquee({ text, contentKey, bg = C.charcoal, color = C.sand, speed = 60 }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const displayText = contentKey ? (getContent(contentKey) || text) : text;
  const items = Array(8).fill(displayText);

  const openEdit = () => { setDraft(displayText); setEditing(true); };
  const saveEdit = () => {
    if (contentKey) updateContent(contentKey, draft);
    setEditing(false);
  };

  return (
    <div style={{ overflow: "hidden", background: bg, padding: "14px 0", whiteSpace: "nowrap", position: "relative", zIndex: 0 }}>
      <div style={{ display: "inline-flex", animation: `marquee ${speed}s linear infinite` }}>
        {items.map((t, i) => (
          <span key={i} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 500, fontSize: 14, color, letterSpacing: "0.5px", textTransform: "lowercase", padding: "0 32px", display: "inline-flex", alignItems: "center", gap: 32 }}>
            {t} <span style={{ color: C.butter, fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>
      <div style={{ display: "inline-flex", animation: `marquee ${speed}s linear infinite` }}>
        {items.map((t, i) => (
          <span key={`d-${i}`} style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 500, fontSize: 14, color, letterSpacing: "0.5px", textTransform: "lowercase", padding: "0 32px", display: "inline-flex", alignItems: "center", gap: 32 }}>
            {t} <span style={{ color: C.butter, fontSize: 10 }}>✦</span>
          </span>
        ))}
      </div>

      {/* Edit button — admin only */}
      {isEditing && contentKey && (
        <button
          onClick={openEdit}
          data-editor-panel
          style={{
            position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff", fontSize: 11, fontWeight: 600, fontFamily: "'Rubik', sans-serif",
            padding: "4px 12px", borderRadius: 20, cursor: "pointer", zIndex: 10,
            backdropFilter: "blur(8px)",
          }}
        >
          ✏️ edit text
        </button>
      )}

      {/* Inline edit popup */}
      {editing && (
        <div data-editor-panel style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          background: "rgba(28,28,28,0.97)", backdropFilter: "blur(16px)",
          borderRadius: 16, padding: 28, zIndex: 9999, width: "min(560px, 90vw)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Edit marquee text</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
            style={{
              width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14,
              fontFamily: "'Rubik', sans-serif", outline: "none", resize: "vertical", lineHeight: 1.6,
              boxSizing: "border-box",
            }}
          />
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
            Separate segments with · (middle dot)
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={saveEdit} style={{ flex: 1, background: C.olive, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 0", fontFamily: "'Rubik', sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SCRIPT LABEL (brand: Georgia italic accent)

/* ══════════════════════════════════════════════════════════════
   HORIZONTAL SCROLL CAROUSEL (PLM pattern)

/* ══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS

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
function RotatingPhrase({ phrases: phrasesProp = [], contentKey, label }) {
  const { isEditing } = useCMS();
  const { value } = useContent(contentKey || "__none__");
  const phrases = contentKey ? (Array.isArray(value) ? value.filter(Boolean) : []) : phrasesProp;
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (isEditing || phrases.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => { if (!document.hidden) setLeaving(true); }, 3200);
    return () => clearInterval(timer);
  }, [phrases.length, isEditing]);

  // The next phrase comes in once the old one has finished sliding out
  const next = () => { if (leaving) { setStep((s) => s + 1); setLeaving(false); } };

  // While editing, hold the first line still and offer the list editor
  if (isEditing && contentKey) {
    return (
      <span className="sb-rotator">
        <span className="sb-rotator-word">{phrases[0] || "add your rotating lines"}</span>
        <PhraseListEditor contentKey={contentKey} label={label} />
      </span>
    );
  }
  if (!phrases.length) return null;
  const state = leaving ? " is-out" : step > 0 ? " is-in" : "";
  return (
    <span className="sb-rotator">
      <span key={step} className={`sb-rotator-word${state}`} onAnimationEnd={next}>{phrases[step % phrases.length]}</span>
    </span>
  );
}

/* ── A real link to a page or URL; in-app pages switch without a reload ── */
function PageLink({ to, nav, onNavigate, children, ...rest }) {
  const isUrl = /^(https?:|mailto:)/.test(to || "");
  const onClick = (e) => {
    if (isUrl || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (onNavigate) onNavigate();
    else nav?.(to || "home");
  };
  return (
    <a href={pageHref(to)} onClick={onClick} {...(to?.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})} {...rest}>
      {children}
    </a>
  );
}

/* ── Editable Button (label + link destination in edit mode) ── */
/* Pass className to render a real link (<a href>) styled by CSS instead of the inline button */
function EditableBtn({ contentKey, variant = "primary", defaultLabel = "button", defaultLink = "contact", nav, style = {}, className }) {
  const { getContent, updateContent, isEditing } = useCMS();
  const label = getContent(`${contentKey}.label`) ?? defaultLabel;
  const link = getContent(`${contentKey}.link`) ?? defaultLink;
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);
  const [draftLink, setDraftLink] = useState(link);

  const save = () => {
    updateContent(`${contentKey}.label`, draftLabel);
    updateContent(`${contentKey}.link`, draftLink);
    setEditing(false);
  };

  const handleClick = () => {
    if (isEditing) { setDraftLabel(label); setDraftLink(link); setEditing(true); return; }
    if (link.startsWith("http")) { window.open(link, "_blank", "noopener"); }
    else if (nav) { nav(link); }
  };

  const base = { fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, border: "none", borderRadius: 100, padding: "13px 32px", cursor: "pointer", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", letterSpacing: "1px", textTransform: "uppercase" };
  const variants = {
    primary: { ...base, background: C.olive, color: C.cream, border: `2px solid ${C.olive}` },
    outline: { ...base, background: "transparent", color: C.olive, border: `2px solid ${C.olive}` },
    sand: { ...base, background: C.sand, color: C.charcoal, border: `2px solid ${C.sand}` },
    yellow: { ...base, background: C.butter, color: C.charcoal, border: `2px solid ${C.butter}` },
    ocean: { ...base, background: C.olive, color: C.white, border: `2px solid ${C.olive}` },
  };

  return (
    <>
      {className ? (
        <PageLink to={link} nav={nav} className={className} style={style} {...(isEditing ? { onClick: (e) => { e.preventDefault(); handleClick(); } } : {})}>
          {label}
          {isEditing && (
            <span data-editor-panel style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "2px 6px", marginLeft: 4 }}>✏️</span>
          )}
        </PageLink>
      ) : (
        <button onClick={handleClick} style={{ ...variants[variant] || variants.primary, position: "relative", ...style }}>
          {label}
          {isEditing && (
            <span data-editor-panel style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "2px 6px", marginLeft: 4 }}>✏️</span>
          )}
        </button>
      )}
      {editing && (
        <div data-editor-panel style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "rgba(28,28,28,0.97)", backdropFilter: "blur(16px)", borderRadius: 16, padding: 24, zIndex: 9999, width: "min(440px, 90vw)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Edit button</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>LABEL</label>
            <input value={draftLabel} onChange={e => setDraftLabel(e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, fontFamily: "'Rubik', sans-serif", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 4 }}>LINK (page name or full URL)</label>
            <input value={draftLink} onChange={e => setDraftLink(e.target.value)} placeholder="services, contact, https://..." style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, fontFamily: "'Rubik', sans-serif", boxSizing: "border-box" }} />
            <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Use a page name (home, services, about, contact) or a full URL (https://...)</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={save} style={{ flex: 1, background: C.olive, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontFamily: "'Rubik', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 0", fontFamily: "'Rubik', sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}


function FAQAccordion({ faqs, contentKey }) {
  const { update, isEditing } = useContent(contentKey || "__none__");
  const [openIndex, setOpenIndex] = useState(null);

  const addFaq = () => {
    const next = [...faqs, { q: "New question?", a: "Answer here..." }];
    update(next);
  };

  const deleteFaq = (idx) => {
    const next = faqs.filter((_, i) => i !== idx);
    update(next);
  };

  return (
    <div>
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} style={{ borderBottom: `1px solid ${C.sand}`, position: "relative" }}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                padding: "20px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 15, color: C.charcoal, lineHeight: 1.4 }}>
                {contentKey ? <EditableArrayText contentKey={contentKey} index={i} field="q" as="span" /> : faq.q}
              </span>
              <span style={{
                fontFamily: "'Rubik', sans-serif",
                fontSize: 20,
                color: C.olive,
                flexShrink: 0,
                transition: "transform 0.3s",
                transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
              }}>+</span>
            </button>
            <div style={{
              maxHeight: isOpen ? 300 : 0,
              overflow: "hidden",
              transition: "max-height 0.35s ease",
            }}>
              <p style={{ fontFamily: "'Rubik', sans-serif", fontSize: 14, color: C.body, lineHeight: 1.7, margin: "0 0 20px", paddingRight: 40 }}>
                {contentKey ? <EditableArrayText contentKey={contentKey} index={i} field="a" as="span" /> : faq.a}
              </p>
            </div>
            {isEditing && contentKey && (
              <button
                data-editor-panel
                onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this FAQ?")) deleteFaq(i); }}
                style={{
                  position: "absolute", top: 18, right: 40,
                  background: `${C.charcoal}18`, border: `1px solid ${C.charcoal}40`,
                  color: C.charcoal, fontSize: 11, fontWeight: 600,
                  fontFamily: "'Rubik', sans-serif", padding: "3px 10px",
                  borderRadius: 20, cursor: "pointer",
                }}
              >✕ delete</button>
            )}
          </div>
        );
      })}
      {isEditing && contentKey && (
        <button
          data-editor-panel
          onClick={addFaq}
          style={{
            marginTop: 16, width: "100%", padding: "12px",
            background: `${C.olive}08`, border: `2px dashed ${C.olive}40`,
            borderRadius: 10, fontFamily: "'Rubik', sans-serif",
            fontSize: 13, fontWeight: 600, color: C.olive,
            cursor: "pointer",
          }}
        >+ add FAQ</button>
      )}
    </div>
  );
}

/* ── Editable tag list (feature tags, timeline items) with add/delete in edit mode ── */
function EditableTagList({ contentKey, items = [], tagBg = C.butter, tagColor = C.charcoal }) {
  const { update, isEditing } = useContent(contentKey);
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const deleteTag = (idx) => {
    update(items.filter((_, i) => i !== idx));
  };

  const addTag = () => {
    if (!newTag.trim()) { setAdding(false); return; }
    update([...items, newTag.trim()]);
    setNewTag("");
    setAdding(false);
  };

  if (items.length === 0 && !isEditing) return null;

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
      {items.map((t, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: 12, background: tagBg, color: tagColor, padding: "5px 16px", borderRadius: 50, position: "relative" }}>
          <EditableArrayString contentKey={contentKey} index={i} as="span" />
          {isEditing && (
            <button onClick={() => deleteTag(i)} style={{ background: "none", border: "none", cursor: "pointer", color: tagColor, fontSize: 12, padding: 0, lineHeight: 1, opacity: 0.6 }}>✕</button>
          )}
        </span>
      ))}
      {isEditing && (
        adding ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addTag(); if (e.key === "Escape") { setAdding(false); setNewTag(""); } }}
              placeholder="tag text..."
              autoFocus
              style={{ fontFamily: "'Rubik', sans-serif", fontSize: 12, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.olive}`, outline: "none", width: 120 }}
            />
            <button onClick={addTag} style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, fontWeight: 700, background: C.olive, color: "#fff", border: "none", borderRadius: 20, padding: "4px 10px", cursor: "pointer" }}>add</button>
          </span>
        ) : (
          <button onClick={() => setAdding(true)} style={{ fontFamily: "'Rubik', sans-serif", fontSize: 11, fontWeight: 600, color: C.olive, background: `${C.olive}10`, border: `1px dashed ${C.olive}60`, borderRadius: 20, padding: "4px 12px", cursor: "pointer" }}>+ tag</button>
        )
      )}
    </div>
  );
}

/* ── Social Proof — parallax-style scroll-in with uploadable logos ── */
function NewsletterForm() {
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="flodesk"]');
    if (!existingScript) {
      (function(w, d, t, h, s, n) {
        w.FlodeskObject = n;
        var fn = function() { (w[n].q = w[n].q || []).push(arguments); };
        w[n] = w[n] || fn;
        var f = d.getElementsByTagName(t)[0];
        var v = '?v=' + Math.floor(new Date().getTime() / (120 * 1000)) * 60;
        var sm = d.createElement(t);
        sm.async = true; sm.type = 'module';
        sm.src = h + s + '.mjs' + v;
        f.parentNode.insertBefore(sm, f);
        var sn = d.createElement(t);
        sn.async = true; sn.noModule = true;
        sn.src = h + s + '.js' + v;
        f.parentNode.insertBefore(sn, f);
      })(window, document, 'script', 'https://assets.flodesk.com', '/universal', 'fd');
    }
    window.fd('form', {
      formId: '69a492cf680779e5364b6ffe',
      containerEl: '#fd-form-69a492cf680779e5364b6ffe'
    });
  }, []);

  return <div id="fd-form-69a492cf680779e5364b6ffe" />;
}

/* ── Nav button with hover effect ── */

export {
  FloatingTag, Marquee, EditableBtn, FAQAccordion, EditableTagList, NewsletterForm, PageLink, DecoratedText, DecoratedArrayText, RotatingPhrase,
};

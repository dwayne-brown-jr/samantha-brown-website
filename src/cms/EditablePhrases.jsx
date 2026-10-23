import { useState } from "react";
import { createPortal } from "react-dom";
import { useContent } from "./useContent";

const font = "'Rubik', sans-serif";
const field = { flex: 1, minWidth: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, fontFamily: font, boxSizing: "border-box" };
const iconBtn = { width: 30, height: 30, flex: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: font };

/* Edit-mode button + panel for a list of short lines (the rotating script lines).
   Saves through the editor like any other change, so Save Draft / Publish apply. */
export function PhraseListEditor({ contentKey, label = "rotating lines" }) {
  const { value, update } = useContent(contentKey);
  const saved = Array.isArray(value) ? value : [];
  const [draft, setDraft] = useState(null);

  const open = () => setDraft(saved.length ? [...saved] : [""]);
  const setAt = (i, text) => setDraft((d) => d.map((p, j) => (j === i ? text : p)));
  const move = (i, to) => setDraft((d) => { if (to < 0 || to >= d.length) return d; const n = [...d]; [n[i], n[to]] = [n[to], n[i]]; return n; });
  const remove = (i) => setDraft((d) => (d.length > 1 ? d.filter((_, j) => j !== i) : [""]));
  const save = () => { update(draft.map((p) => p.trim()).filter(Boolean)); setDraft(null); };

  return (
    <>
      <button type="button" data-editor-panel onClick={open}
        style={{ marginLeft: 10, verticalAlign: "middle", fontFamily: font, fontStyle: "normal", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", background: "rgba(28,28,28,0.85)", color: "#fff" }}>
        ✏️ edit {label}
      </button>
      {/* Rendered on <body> so a transformed parent (the hero's settle-in animation) can't trap it */}
      {draft && createPortal(
        <div data-editor-panel role="dialog" aria-label={`Edit ${label}`}
          style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999, width: "min(480px, 92vw)", maxHeight: "86vh", overflow: "auto", background: "rgba(28,28,28,0.97)", backdropFilter: "blur(16px)", borderRadius: 16, padding: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", fontStyle: "normal" }}>
          <p style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Edit {label}</p>
          <p style={{ fontFamily: font, fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "0 0 16px", lineHeight: 1.5 }}>
            One short line per box. They take turns, one every 3 seconds, in this order. Empty boxes are skipped.
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            {draft.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input value={p} onChange={(e) => setAt(i, e.target.value)} aria-label={`Line ${i + 1}`} style={field} autoFocus={i === draft.length - 1 && p === ""} />
                <button type="button" style={{ ...iconBtn, opacity: i === 0 ? 0.35 : 1 }} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">↑</button>
                <button type="button" style={{ ...iconBtn, opacity: i === draft.length - 1 ? 0.35 : 1 }} disabled={i === draft.length - 1} onClick={() => move(i, i + 1)} aria-label="Move down">↓</button>
                <button type="button" style={{ ...iconBtn, color: "#F2A39A" }} onClick={() => remove(i)} aria-label="Remove line">✕</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setDraft((d) => [...d, ""])}
            style={{ marginTop: 10, width: "100%", padding: "8px 0", borderRadius: 8, border: "1px dashed rgba(255,255,255,0.3)", background: "none", color: "rgba(255,255,255,0.8)", fontFamily: font, fontSize: 13, cursor: "pointer" }}>
            + add a line
          </button>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={save} style={{ flex: 1, background: "#555407", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontFamily: font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button type="button" onClick={() => setDraft(null)} style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 0", fontFamily: font, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

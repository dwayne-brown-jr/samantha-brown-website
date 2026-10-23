import { useRef, useState } from "react";
import { useContent } from "./useContent";
import { uploadImage } from "../supabase/storage";

/* Largest file the storage project accepts in one upload (Supabase's default per-file cap) */
const MAX_UPLOAD_MB = 50;

/* Shrink a cover image so it still covers a 1080×1920 frame, then save it as a JPEG.
   Files the browser can't decode (HEIC in some browsers) upload untouched. */
async function shrinkImage(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, Math.max(1080 / bitmap.width, 1920 / bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

const btn = {
  fontFamily: "'Rubik', sans-serif", fontSize: 11, fontWeight: 600, padding: "6px 10px", borderRadius: 8,
  border: "none", cursor: "pointer", background: "rgba(28,28,28,0.85)", color: "#fff", backdropFilter: "blur(8px)",
};

/* Edit-mode controls for one card's cover image and video, stored on an item in an array key.
   Only rendered while editing; visitors never see it. */
export function ArrayMediaControls({ contentKey, index, imageField = "poster", videoField = "video" }) {
  const { value: items, update } = useContent(contentKey);
  const item = Array.isArray(items) ? items[index] || {} : {};
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const imageInput = useRef(null);
  const videoInput = useRef(null);

  const setField = (field, url) => {
    const arr = Array.isArray(items) ? items : [];
    update(arr.map((it, i) => (i === index ? { ...it, [field]: url } : it)));
  };

  const upload = async (file, field, kind) => {
    setError(null);
    if (kind === "video") {
      const mb = file.size / (1024 * 1024);
      if (mb > MAX_UPLOAD_MB) {
        setError(`This video is ${Math.round(mb)} MB and the limit is ${MAX_UPLOAD_MB} MB. Export it as an MP4 at 1080p (CapCut or iMovie can do this) and upload again.`);
        return;
      }
    }
    setBusy(kind);
    try {
      const ready = kind === "image" ? await shrinkImage(file) : file;
      if (kind === "image" && ready.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`That image is over ${MAX_UPLOAD_MB} MB even after shrinking. Try a JPEG or PNG.`);
      const url = await uploadImage(ready, `${contentKey}.${index}.${field}`);
      setField(field, url);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const pick = (field, kind) => (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) upload(file, field, kind);
  };

  return (
    <div data-editor-panel style={{ position: "absolute", left: 8, right: 8, bottom: 8, display: "grid", gap: 6, zIndex: 5 }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <button type="button" style={btn} disabled={!!busy} onClick={() => imageInput.current?.click()}>
          {busy === "image" ? "Uploading…" : item[imageField] ? "Replace cover" : "Upload cover image"}
        </button>
        <button type="button" style={btn} disabled={!!busy} onClick={() => videoInput.current?.click()}>
          {busy === "video" ? "Uploading video…" : item[videoField] ? "Replace video" : "Upload video"}
        </button>
        {(item[imageField] || item[videoField]) && (
          <button type="button" style={{ ...btn, background: "rgba(140,40,30,0.85)" }} disabled={!!busy}
            onClick={() => { const arr = Array.isArray(items) ? items : []; update(arr.map((it, i) => (i === index ? { ...it, [imageField]: "", [videoField]: "" } : it))); }}>
            Remove media
          </button>
        )}
      </div>
      <p style={{ ...btn, cursor: "default", fontWeight: 400, lineHeight: 1.4, margin: 0 }}>
        Vertical 9:16 works best. Any size fits the frame. Videos: MP4, under {MAX_UPLOAD_MB} MB.
      </p>
      {error && <p style={{ ...btn, cursor: "default", background: "rgba(140,40,30,0.92)", fontWeight: 500, lineHeight: 1.4, margin: 0 }}>{error}</p>}
      <input ref={imageInput} type="file" accept="image/*,.heic,.heif" hidden onChange={pick(imageField, "image")} />
      <input ref={videoInput} type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" hidden onChange={pick(videoField, "video")} />
    </div>
  );
}

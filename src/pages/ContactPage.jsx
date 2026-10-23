import { useRef, useEffect } from "react";
import { useCMS } from "../cms/useContent";
import { EditableText } from "../cms/EditableText";

/* Discovery-call booking: Sam's Dubsado form (URL set in the editor), plus an email alternative */
function ContactPage() {
  const { getContent } = useCMS();
  const dubsadoUrl = getContent("contact.dubsado.embedUrl");
  const email = getContent("global.email");
  const iframeRef = useRef(null);

  // Dubsado's form reports its height through iframe-resizer, so the frame never scrolls inside itself
  useEffect(() => {
    if (!dubsadoUrl) return;
    const resize = () => { if (window.iFrameResize && iframeRef.current) window.iFrameResize({ checkOrigin: false, heightCalculationMethod: "taggedElement" }, iframeRef.current); };
    if (document.querySelector('script[src*="iframeResizer"]')) { setTimeout(resize, 30); return; }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.14/iframeResizer.min.js";
    script.onload = resize;
    document.head.appendChild(script);
  }, [dubsadoUrl]);

  return (
    <div className="sb-home sb-inner">
      <section className="sb-page-hero">
        <div className="sb-wrap">
          <h1><EditableText contentKey="contact.hero.heading" as="span" /></h1>
          <p className="sb-script"><EditableText contentKey="contact.hero.subheading" as="span" /></p>
        </div>
      </section>

      <section className="sb-band" aria-label="book a discovery call">
        <div className="sb-wrap"><div style={{ maxWidth: 860 }}>
          {dubsadoUrl ? (
            <div className="sb-booking">
              <iframe ref={iframeRef} src={dubsadoUrl} title="Book a discovery call" />
            </div>
          ) : (
            <div className="sb-booking sb-booking-empty">
              <h2 className="is-small">discovery call booking</h2>
              <p><EditableText contentKey="contact.dubsado.placeholder" as="span" /></p>
            </div>
          )}

          <div className="sb-email-alt">
            <h3><EditableText contentKey="contact.emailAlt.heading" as="span" /></h3>
            <p><EditableText contentKey="contact.emailAlt.body" as="span" /> {email && <a href={`mailto:${email}`}>{email}</a>}</p>
          </div>
        </div></div>
      </section>
    </div>
  );
}

export default ContactPage;

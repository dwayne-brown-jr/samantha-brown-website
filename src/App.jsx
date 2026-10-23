import { useState, useEffect, useCallback } from "react";
import { C } from "./theme";
import { useScrollY } from "./hooks";
import { useCMS } from "./cms/useContent";
import { EditorToolbar } from "./cms/EditorToolbar";
import { SelectionOverlay } from "./cms/SelectionOverlay";
import { PropertyPanel } from "./cms/PropertyPanel";
import { AdminLoginListener, AdminLoginModal } from "./cms/AdminAuth";
import "./home.css";
import { Nav, Footer, BackToTop } from "./components/layout";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AboutPage from "./pages/AboutPage";
import ResourcesPage from "./pages/ResourcesPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  // URL-aware routing: read initial page from hash, sync with browser history
  const getPageFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    return hash || "home";
  };

  const [page, setPageState] = useState(getPageFromHash);
  const scrollY = useScrollY();
  const { isEditing } = useCMS();

  // Wrap setPage to push browser history — blocked during edit mode
  const setPage = useCallback((newPage) => {
    if (isEditing) return;
    setPageState(newPage);
    const hash = newPage === "home" ? "" : `#${newPage}`;
    window.history.pushState({ page: newPage }, "", `/${hash}`);
  }, [isEditing]);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setPageState(getPageFromHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const pages = {
    home: <HomePage setPage={setPage} />,
    services: <ServicesPage setPage={setPage} />,
    audit: <ServiceDetailPage setPage={setPage} serviceKey="audit" />,
    implementation: <ServiceDetailPage setPage={setPage} serviceKey="implementation" />,
    fractional: <ServiceDetailPage setPage={setPage} serviceKey="fractional" />,
    corporate: <ServiceDetailPage setPage={setPage} serviceKey="corporate" />,
    about: <AboutPage setPage={setPage} />,
    resources: <ResourcesPage />,
    contact: <ContactPage />,
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        body {
          background: ${C.cream};
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        ::selection { background: ${C.oceanLight}; color: ${C.charcoal}; }
        input::placeholder, textarea::placeholder { font-family: 'Rubik', sans-serif; color: ${C.muted}; }
        button:hover { opacity: 0.93; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        /* Enhanced Form Inputs */
        input:focus, textarea:focus, select:focus {
          outline: none !important;
          border-color: ${C.oceanBlue} !important;
          box-shadow: 0 0 0 3px rgba(123, 167, 179, 0.1), 0 4px 12px rgba(123, 167, 179, 0.15) !important;
          transform: translateY(-1px);
        }

        input, textarea, select {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.sand}; border-radius: 10px; }

        @media (max-width: 640px) {
          select, input, textarea { font-size: 16px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <AdminLoginListener />
      <AdminLoginModal />
      <Nav page={page} setPage={setPage} scrollY={scrollY} isEditing={isEditing} />
      <main>{pages[page]}</main>
      <Footer setPage={setPage} isEditing={isEditing} />
      <BackToTop scrollY={scrollY} />
      <EditorToolbar />
      <SelectionOverlay />
      <PropertyPanel />
    </>
  );
}

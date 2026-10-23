/* Links: real hrefs to the app's pages; in-app pages switch without a reload */
export function pageHref(to) {
  if (!to || to === "home") return "/";
  return /^(https?:|mailto:)/.test(to) ? to : `/#${to}`;
}

/* Switch page, then land on a section of it (or the top) */
export function navigateTo(setPage, target, section) {
  setPage(target);
  if (section) requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" }));
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

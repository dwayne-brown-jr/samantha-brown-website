/* Presentational markup added around a field's words (the words never change) */
// Words typed in caps ("work FOR your life") become the italic accent
export const emphasizeCaps = (html) => html.split(/(<[^>]+>)/).map((part) => (part.startsWith("<") ? part : part.replace(/\b([A-Z]{2,})\b/g, "<em>$1</em>"))).join("");
// "energy over hustle": the joining word is set in script
export const scriptJoiner = (html) => html.replace(/ (over|beats|&gt;|>) /, " <i>$1</i> ");
// The last two words of a heading get the yellow highlighter
export const markEnding = (html) => {
  const words = html.trim().split(/\s+/);
  if (/<[^>]+>/.test(html) || words.length < 4) return html;
  return `${words.slice(0, -2).join(" ")} <mark>${words.slice(-2).join(" ")}</mark>`;
};

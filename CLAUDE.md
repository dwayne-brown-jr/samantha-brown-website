# by samantha brown — website

This is Sam's business website, **bysamanthabrown.com**. The person you're working with is usually **Sam herself**: she owns the business and the site, she isn't a developer, and she wants to make changes without needing anyone else.

## How to work with Sam

- **Plain language.** Explain what you'll change and what she'll see, not how the code works. No jargon unless she asks.
- **Show, don't describe.** After any visual change, run the site locally and show her screenshots at desktop (1440 wide) and phone (390 wide) before anything goes live.
- **Nothing goes live without her saying so.** Pushing to `main` publishes the site within seconds. Always ask "ready to publish?" first and wait for a clear yes.
- **One change at a time.** Work on a branch per change (`git checkout -b <short-name>`), so an unfinished idea never reaches the live site.
- **If she's asking to change words or photos, tell her she can do that herself in the site editor** (see "Two ways to change the site" below). It's faster and doesn't need you.
- If something goes wrong after publishing, fix it fast: `git revert` the commit and push, then explain what happened.

## Two ways to change the site

1. **Words, photos, prices, testimonials, section order, hiding sections** → the built-in editor on the live site. Sam goes to `bysamanthabrown.com/?admin` (or presses Cmd+Shift+A), signs in, clicks **Edit Page**, edits in place, then **Publish**. These edits are stored in Supabase, not in this code. No deploy needed.
2. **Layout, design, new sections, new pages, behaviour** → code changes in this repo, made in a Claude Code session, published by pushing to `main`.

Never "fix" content by typing it into the code. If a sentence on the site is wrong, it's almost always CMS content Sam can edit.

## Commands

```bash
npm install          # first time only
npm run dev          # local preview (http://localhost:5173); use the preview pane
npm run lint         # must pass (0 problems) before publishing
npm run build        # must pass before publishing
```

`.env.local` (not in git) holds the public Supabase URL and anon key. Without it the local site shows the default text from `contentSchema.js` instead of Sam's real content. The values are in Sam's handoff guide.

## Publishing

- The site is hosted on **Netlify**, which deploys automatically from the `main` branch of `github.com/dwayne-brown-jr/samantha-brown-website`. A push to `main` is live in about 15 seconds.
- Before publishing: `npm run lint` and `npm run build` pass, screenshots approved by Sam, changes committed on a branch.
- To publish: merge the branch into `main` (fast-forward) and `git push origin main`. Then load https://bysamanthabrown.com and confirm the change is there.
- Never force-push. Never commit `.env.local`, `node_modules`, `dist`, or the `sam-rebuild/` / `briefs/` folders.
- Undo a bad publish: `git revert <commit>` then push. (Netlify's dashboard can also re-publish an earlier deploy.)

## How the code is organised

- React 19 + Vite single-page app. Pages switch by URL hash: `/#services`, `/#about`, `/#contact`, `/#resources`, `/#audit`, `/#implementation`, `/#fractional`, `/#corporate`. Home is `/`. A hash that isn't a page name shows a blank page, so **don't use `#section` anchors for in-page links**; use `PageLink` / `navigateTo` from `src/links.js` and `src/components/ui.jsx` (they support landing on a section after switching page).
- `src/App.jsx` — routing, page list, a few global styles.
- `src/pages/` — one file per page. `HomePage.jsx` is the redesigned home page.
- `src/components/layout.jsx` — header (with the phone menu), footer, back-to-top button. Nav labels live in `NAV_LINKS` there.
- `src/components/ui.jsx` — shared pieces (buttons, marquee, bubble tags, Flodesk signup form, etc.).
- `src/home.css` — styles for the home page, header and footer (`sb-*` classes) and the design tokens (colours, spacing, type sizes) on `:root`. Other pages still use inline styles with colours from `src/theme.js`.
- `src/cms/` — the content editor. Don't change editor behaviour unless Sam asks for an editor feature.
- `docs/design/` — the design brief and decisions behind the current look. Read `DESIGN.md` before any visual change and stay in that style.

## Content (the CMS) — rules

- All text and images come from Supabase (table `content`, rows `live` and `draft`; images in the `cms-images` storage bucket). Code reads them with `useContent(key)` / `getContent(key)` and shows them with `EditableText`, `EditableArrayText`, `EditableImage`, `EditableCardGroup`, etc., so they stay editable.
- Defaults for every key live in `src/cms/contentSchema.js`. Supabase only stores what Sam has changed; anything she hasn't touched falls back to these defaults.
- **Adding new text:** add a new key with its default to `contentSchema.js` and render it with an `Editable*` component. Never hardcode visible words that should be editable, and never retype text that already comes from a key.
- **Never write to the Supabase `content` table directly** (no SQL updates, no scripts). Sam's published edits live there and could be lost. Don't change database tables, storage, or security rules without Sam explicitly asking, and explain the risk first.
- Home page section order is stored in `home.layout.sectionOrder` (the editor's up/down arrows). Visibility toggles are `visibility.home.*`.
- Some fields carry formatting hints that the home page renders specially: words typed in CAPS in the hero heading show in italic script; " over " in value titles is set in script; the "tired of" list is one field split on `→`.

## Design guardrails

- Colours: cream `#FDFAF4` background, ink `#2C2C28` text, olive `#555407` accent, pastels `#F5E6DC` / `#D6E8EC` / `#EDE8F4`, yellow `#F2E84B` highlight. Use the CSS variables in `home.css`.
- Fonts: Rubik (headings bold, lowercase) and Fraunces italic for the handwritten "script" lines. No third font.
- Motion: only the rotating hero line and the marquee. No scroll-triggered fade-ins, no counting numbers. Always respect reduced-motion.
- Every link must go somewhere real (no `href="#"`). Nothing may be invisible until the visitor scrolls.
- Check phone (390 wide) as carefully as desktop.

## Things that live outside this code

- **Newsletter (Cabana Club):** the signup form is Flodesk's embed (form id `69a492cf680779e5364b6ffe`); its wording and fields are changed in Flodesk. `home.css` only restyles it — never replace it with a homemade form (signups might stop arriving).
- **Discovery-call booking:** Dubsado form embedded on the contact page (`contact.dubsado.embedUrl` in the CMS).
- **Supabase project:** `rgtfgqbpsvqhgnfdsali`. Editor logins are Supabase Auth users; public sign-ups are off.

# Design

<!-- Written by Blueprint Sites stage 2, test run. -->

## Mode
persuade: the visitor picks a path or joins the list.

## World
Sunlit notebook: warm cream paper, ink-dark lowercase Rubik headlines, Fraunces italic as Sam's handwriting in the margins, one olive accent, pastel paper blocks laid on the page like sticky notes, and the beach photo framed like a print. References: the current site (keep its warmth), editorial magazine layouts (borrow asymmetric two-column openings).

## Type
- Display: Rubik variable, 700, lowercase, tracking -0.025em (self-hosted, latin subset)
- Text: Rubik 400/500
- Accent: Fraunces italic (self-hosted), used only for script lines. Two families total.
- Scale desktop / phone: 76/44 · 52/34 · 30/24 · 19/17 · 16/15
- Measure: 62ch body

## Color
| Role | Hex | Contrast vs bg |
|---|---|---|
| Background | #FDFAF4 | — |
| Text | #2C2C28 | 13.6:1 |
| Muted text | #5E5C52 | 6.4:1 |
| Accent (olive) | #555407 | 7.4:1 |
| Peach / blue / lavender blocks | #F5E6DC / #D6E8EC / #EDE8F4 | text stays #2C2C28 |
| Highlight | #F2E84B | used behind ink text only |

## Spacing, radius, depth
- Scale: 4 8 12 16 24 32 48 64 96 128
- Radius: 14px cards, 999px pills, 22px photo
- Shadows: soft, offset: 0 18px 40px -24px rgba(44,44,40,.35)

## Motion
- Signature moment: the hero's script line rewrites itself through Sam's five phrases ("systems that scale" → "boundaries that stick"…), one every 3 s, with a soft vertical slide. Static first phrase under reduced motion or no JS.
- Feedback: buttons 160ms ease-out, press scale .97; hover only on hover-capable devices.
- One slow marquee, paused off-screen and stopped under reduced motion. No counters, no scroll reveals.

## Page plan
### Home
| # | Section | Job | Layout | Content source |
|---|---|---|---|---|
| 1 | Header | orient, one CTA | wordmark left, 3 anchors, olive pill | CONTENT 1 |
| 2 | Hero | hook | photo card left with bubble tags, text right; stacks photo-under-headline on phone | CONTENT 1 |
| 3 | Marquee | brand rhythm | thin ink band | CONTENT 2 |
| 4 | Welcome | empathy | big heading left, list right with tick marks | CONTENT 3 |
| 5 | Without / with | explain | two contrasting columns, "with" on olive | CONTENT 6 |
| 6 | Paths | route | three full-width pastel rows, staggered indent | CONTENT 4 (corporate copy from content store) |
| 7 | Proof | prove | ledger: big numbers left-aligned in a row with hairlines, credentials as stamps, footnote in script | CONTENT 7, 8 |
| 8 | Values | believe | 2×2 typographic pairs, no icons | CONTENT 5 |
| 9 | Testimonials | prove | one large pull quote + two smaller | CONTENT 9 |
| 10 | Cabana Club + closing | act | yellow-highlight heading, form in a paper card | CONTENT 10, 11 |
| 11 | Footer | basics | wordmark, anchors, © 2026 | — |

## Images
| Where | Photo | Crop/treatment | Status |
|---|---|---|---|
| Hero | beach sunset | 3:4, 22px radius, slight tilt on desktop | have (her CMS URL; download into /img at launch) |
| Share image | generated | cream card with headline | built |

## Dials (Taste)
Variance 6 · Motion 3 · Density 4: warm and calm, one moment of motion.

## Stack
Static HTML/CSS + 40 lines of JS. One page, any host.

## Rebuild: Keep / Change / Drop
| Element | Decision | Why |
|---|---|---|
| Voice, words, photo, palette, fonts, bubble tags | Keep | Brand commitments |
| Counters | Change → real numbers, static | Problem 1 |
| Scroll reveals | Drop | Problem 2 |
| `#` links | Change → in-page anchors; missing destinations listed | Problem 3 |
| Emoji value icons, 01/02/03 card numbers, script label over every heading | Drop | Taste floor |
| Carousel | Change → all three quotes visible | Hidden content, tiny dots |
| Second marquee, "certified & trusted by" duplicate block | Drop | Repeats; merged into proof |

## Context Carry
- World: sunlit notebook (cream, ink, olive, pastel paper, script margins)
- Type: Rubik 700 lowercase / Rubik 400; Fraunces italic accents
- Colors: #FDFAF4 / #2C2C28 / #555407
- Motion moment: hero script line cycling her five phrases
- Pages and section order: home: header, hero, marquee, welcome, without/with, paths, proof, values, testimonials, cabana club, footer
- Stack: static HTML/CSS/JS
- Dials: 6 / 3 / 4
- Rebuild: refresh

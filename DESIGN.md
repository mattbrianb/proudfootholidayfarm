---
name: Proudfoot Holiday Farm
description: Off-grid, pet-friendly farm stay in the KZN Midlands, sold by its own golden-hour light.
colors:
  ink: "#1f2421"
  muted: "#545c57"
  line: "#e2e6e2"
  paper: "#ffffff"
  wash: "#f3f6f2"
  farm-green: "#2f6b3f"
  farm-green-deep: "#24532f"
  farm-green-pale: "#e3eee5"
  booked-grey: "#6f7772"
  error-rust: "#a3321f"
  error-wash: "#f8e9e5"
  field-stroke: "#cfd5d0"
  footer-text: "#e6eae7"
  footer-muted: "#a8b1ab"
  whatsapp-green: "#25d366"
typography:
  display:
    fontFamily: "Gelasio, Georgia, serif"
    fontSize: "clamp(40px, 5.2vw, 72px)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Gelasio, Georgia, serif"
    fontSize: "clamp(30px, 3.2vw, 42px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Gelasio, Georgia, serif"
    fontSize: "clamp(30px, 3vw, 40px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  price:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(34px, 3.6vw, 44px)"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "tnum"
  lead:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(18px, 1.6vw, 21px)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  photo-lightbox: "8px"
  control: "10px"
  photo: "14px"
  booking-bar: "16px"
  card: "18px"
  panel: "20px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 4.5vw, 64px)"
  section: "clamp(64px, 8vw, 110px)"
  container: "1440px"
  grid-gap: "36px"
  gallery-gap: "10px"
  form-gap: "14px"
  card-pad: "28px"
  panel-pad: "48px"
components:
  button-primary:
    backgroundColor: "{colors.farm-green}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "15px 26px"
  button-primary-hover:
    backgroundColor: "{colors.farm-green-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.farm-green}"
    rounded: "{rounded.control}"
    padding: "15px 26px"
  button-ghost-hover:
    backgroundColor: "{colors.farm-green-pale}"
  booking-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.booking-bar}"
    padding: "8px"
  fact-chip:
    backgroundColor: "{colors.farm-green-pale}"
    textColor: "{colors.farm-green-deep}"
    rounded: "{rounded.pill}"
    padding: "8px 13px"
  side-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-pad}"
  panel:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-pad}"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  calendar-day:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  calendar-day-selected:
    backgroundColor: "{colors.farm-green}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
  calendar-day-in-range:
    backgroundColor: "{colors.farm-green-pale}"
    textColor: "{colors.ink}"
  calendar-day-booked:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.booked-grey}"
    rounded: "{rounded.control}"
  form-note-ok:
    backgroundColor: "{colors.farm-green-pale}"
    textColor: "{colors.farm-green-deep}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  form-note-error:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.error-rust}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.footer-text}"
  whatsapp-button:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    size: "62px"
---

# Design System: Proudfoot Holiday Farm

All tokens live as CSS custom properties in `:root` of `assets/css/site.css` (`--ink`, `--muted`, `--line`, `--paper`, `--wash`, `--green`, `--green-d`, `--green-l`, `--booked`, `--error`, `--shade`, `--radius`, `--gutter`, `--display`, `--body`). Change a colour there and it changes everywhere. The colours listed in the frontmatter without a variable (field stroke, footer text, footer muted, error wash, WhatsApp green) are written as literal hex in the stylesheet; reuse the same hex rather than inventing a near neighbour.

## Overview

**Creative North Star: "Sunset Light"**

The farm sells itself through its own photographs taken in late, warm light. Every page opens on a full-bleed photo darkened at the top and bottom so white type and the white logo sit on it, and everything after the photo is calm: clean white pages, near-black ink, one farm green that marks every action and every fact. The photograph carries the feeling; the interface stays out of its way.

Density is relaxed and listing-like: generous section spacing, two-column grids that collapse to one on phones, rounded photo corners, and a single white booking bar with a soft deep shadow floating on the home hero. The serif headings (Gelasio, roman only) give warmth; Figtree does all the working text so prices, dates and forms read cleanly on a phone in a weak-signal farm area.

The world is light-only (`color-scheme: light`). There are no reviews, badges or invented social proof anywhere in the system.

**Key Characteristics:**
- Full-bleed, scrim-darkened photo headers with white type on every page except Rates, Contact and 404 (plain heading on white).
- One action colour: farm green for buttons, links, chips, selected dates, checkmarks and focus rings.
- Gelasio headings at weight 500 (hero) and 600 (sections); Figtree for everything else.
- Rounded but not bubbly: 10px controls, 14px photos, 16 to 20px containers, pills only for fact chips and round icon buttons.
- Mostly flat; shadows only on things that float (booking bar, side card, mobile menu, WhatsApp button).

## Colors

A quiet green-grey neutral set with one farm green doing all the work, plus a rust red reserved for errors.

### Primary
- **Farm Green** (`farm-green`, `--green`): every button, every inline link (`.link`), price numbers, checkmarks in amenity lists, selected calendar dates, focus outline, text selection, and native form accents.
- **Deep Farm Green** (`farm-green-deep`, `--green-d`): button hover, and the text colour on pale-green fact chips and success notes.
- **Pale Farm Green** (`farm-green-pale`, `--green-l`): fact chip background, ghost button hover, calendar day hover and in-range nights, the input focus halo, success note background.

### Tertiary
- **Error Rust** (`error-rust`, `--error`): invalid field borders, error notes, calendar warning messages. Never decorative.
- **Error Wash** (`error-wash`): background of the error note only.
- **WhatsApp Green** (`whatsapp-green`): the floating WhatsApp button only. It is WhatsApp's brand colour, not part of the farm palette; do not use it anywhere else.

### Neutral
- **Ink** (`ink`, `--ink`): body text, headings on white, and the footer background. Also the browser `theme-color`.
- **Muted Sage-Grey** (`muted`, `--muted`): secondary text, field labels, captions, table headers, calendar weekday letters.
- **Line** (`line`, `--line`): hairline borders on cards, calendar, table rows, booking bar dividers, mobile menu dividers.
- **Paper** (`paper`, `--paper`): page background, booking bar, cards, inputs.
- **Green-Grey Wash** (`wash`, `--wash`): quiet panels (home rates band, contact form panel), neutral form note, booked calendar nights.
- **Booked Grey** (`booked-grey`, `--booked`): struck-through booked dates and their legend sample.
- **Field Stroke** (`field-stroke`): 1.5px border on enquiry form inputs.
- **Footer Text** / **Footer Muted** (`footer-text`, `footer-muted`): text and small headings on the ink footer.
- **Photo Shade** (`--shade: 15,20,17`): an RGB triple used inside `rgba(var(--shade), alpha)` for every photo scrim, the lightbox backdrop and the float shadows. Keeping one shade colour is what makes the scrims feel like one light.

### Named Rules
**The One Green Rule.** Farm green is the only action colour. If something is clickable and primary, it is green; if it is green, it is either an action, a fact, or a selected state. Do not introduce a second accent.

**The Shared Shade Rule.** Darkening on photos and shadows always uses `rgba(var(--shade), …)`, never pure black. The WhatsApp button shadow (`rgba(0,0,0,.28)`) is the one exception and should stay the only one.

## Typography

**Display Font:** Gelasio (with Georgia, serif), weights 500 and 600, roman only
**Body Font:** Figtree (with system-ui, sans-serif), weights 400, 500, 600, 700

Both load from Google Fonts with `display=swap`. Only the weights listed are loaded; using another weight will fall back to a synthesised one.

**Character:** A warm, slightly old-fashioned book serif for names and headings over a friendly, round, very legible sans for everything practical.

### Hierarchy
- **Display** (Gelasio 500, clamp(40px, 5.2vw, 72px), line-height 1.05, -0.015em): the home hero headline only, max width about 12em so it breaks into two or three lines. Inner page photo headers use the same weight at clamp(40px, 5vw, 68px); plain headers (Rates, Contact, 404) use clamp(38px, 4.6vw, 60px).
- **Headline** (Gelasio 600, clamp(30px, 3.2vw, 42px), line-height 1.1): section headings. All h1 to h3 get `text-wrap: balance`.
- **Title** (Gelasio 600, clamp(30px, 3vw, 40px)): place names on the home cards. Smaller sub-headings (rates terms, farm page subsections) sit at clamp(26px, 2.6vw, 32px) to clamp(28px, 3vw, 36px).
- **Price** (Figtree 700, clamp(34px, 3.6vw, 44px), farm green, tabular figures): rand amounts in the rates band and side card (40px in the side card).
- **Lead** (Figtree 400, clamp(18px, 1.6vw, 21px), line-height 1.6, max 62ch): opening paragraph on detail pages.
- **Body** (Figtree 400, 17px, line-height 1.6; 16px under 560px): running text. Card copy is 18px muted, max 52ch.
- **Label** (Figtree 700, 12px, 0.06em tracking, uppercase, muted): booking bar field labels. The same small-caps-style treatment at 13px is used for price table column headers, contact-list item labels and footer column headings, always as the name of the thing directly beneath it.
- **Utility headings** (Figtree 700, 16 to 18px): the calendar's "Availability" title and month names use the body font, not the serif.

### Named Rules
**The Serif Is For Names Rule.** Gelasio is used for page and section headings and place names only. Numbers, labels, buttons, forms and the calendar are Figtree.

**The Label Names Its Value Rule.** Uppercase tracked labels only appear directly above or beside the value they name (a field, a table column, a phone number, a footer link list). They are never a decorative line above a section heading.

## Layout

- **Container:** content sits in `.wrap`: max width 1440px, centred, with a fluid side gutter of clamp(20px, 4.5vw, 64px).
- **Vertical rhythm:** each section has top padding clamp(64px, 8vw, 110px); the footer has a top margin of clamp(80px, 10vw, 120px). Section heads sit 28px above their content.
- **Home hero:** fills the viewport (min 100svh, at least 700px). Headline and one supporting line sit lower left; the booking bar sits along the bottom (52px from the edge, max width 940px).
- **Inner photo headers:** min(70svh, 620px) tall, heading lower left.
- **Grids:** places 1:1 (36px gap); farm life 5:7; detail page and booking area 7:5 (main content left, side card or form right); contact 5:7; footer 2:1:1:1; gallery 4 columns with the first photo spanning 2x2; photo strip 2:1:1.
- **Responsive breakpoints:**
  - **At 1100px and below:** booking bar becomes a 2x2 grid of fields with a full-width button underneath; detail, booking and contact grids stack to one column; the side card stops being sticky; footer goes to 2 columns.
  - **At 860px and below:** the nav collapses behind a hamburger into a white dropdown card; logo shrinks from 72px to 56px; the home hero stops being full-screen: the photo is a fixed band (min(86svh, 760px)) with the headline on it, and the booking bar drops below the headline on the white page; places, farm life, rates band and terms stack; the strip goes 2 columns with the first photo full width; gallery goes 2 columns; the calendar shows one month instead of two; panels tighten to 28px by 22px padding; lightbox arrows move to the bottom.
  - **At 560px and below:** body text drops to 16px; hero photo band shortens to min(68svh, 560px); booking bar becomes "Where to stay" full width, then Arrive and Leave side by side, then Adults with a compact button beside it; perks, amenities and the enquiry form go single column; footer goes single column; WhatsApp button shrinks to 56px.
- **Reduced motion:** all animation and transitions are switched off and smooth scrolling is disabled.

## Elevation & Depth

Flat by default, with tonal layering (white page, green-grey wash panels, ink footer) and hairline borders. Shadows appear only on elements that float above a photo or the page.

### Shadow Vocabulary
- **Booking bar float** (`box-shadow: 0 18px 44px rgba(var(--shade), .22)`): the white booking bar sitting on the hero photo.
- **Menu float** (`box-shadow: 0 18px 40px rgba(var(--shade), .2)`): the mobile nav dropdown.
- **Side card lift** (`box-shadow: 0 10px 30px rgba(var(--shade), .07)`): barely there; paired with a 1px line border.
- **WhatsApp float** (`box-shadow: 0 10px 24px rgba(0,0,0,.28)`): the floating chat button.
- **Focus halo** (`box-shadow: 0 0 0 3px var(--green-l)`): enquiry form inputs on focus, together with a green border.

### Named Rules
**The Only-What-Floats Rule.** A shadow means "this sits on top of something". Cards in a grid, panels and photos get no shadow.

## Shapes

Soft, consistent rounding sized to the element: 10px for controls (buttons, inputs, calendar days, gallery tiles, form notes), 14px (`--radius`) for content photos and the mobile menu, 16px for the booking bar, 18px for the side card and calendar, 20px for wash panels, 8px for the enlarged lightbox photo. Full pills (999px) only for fact chips; full circles only for the calendar month arrows (40px), lightbox buttons (52px) and the WhatsApp button (62px). Borders are 1px `line` hairlines on containers and 1.5px on form fields and the ghost button. Checkmarks in amenity lists are drawn in CSS (a rotated green L), not with an icon font or glyph. Icons that exist (menu, WhatsApp, calendar and lightbox arrows) are inline SVG using `currentColor`.

## Components

### Header
Logo left (white logo on photo pages, 72px tall; 56px under 860px), nav right with 30px gaps at weight 500. On photo pages the header is laid over the photo in white. Nav links show a 2px underline in the current text colour on hover and for the current page (`aria-current="page"`). Under 860px, a hamburger button opens a white rounded (14px) dropdown card with ink text, links separated by hairlines, the current page in farm green.

### Hero (home) and photo headers (inner pages)
Full-bleed photo (`object-fit: cover`) behind a double scrim: a vertical gradient darkening top (for the nav) and bottom, plus a horizontal gradient darkening the left side behind the headline. The home photo eases in from 1.06 scale over 2.4s (`cubic-bezier(.16,1,.3,1)`); inner photos do not animate. Each page tunes `object-position` inline to keep the building in frame. On phones the home photo uses a portrait crop via `<picture>`.

### Booking bar
A white 16px-rounded bar with 8px inner padding and the booking-bar float shadow. Five slots on desktop (ratio 1.25 : 1.1 : 1.1 : 0.6 : auto): Where to stay, Arrive, Leave, Adults, and a green "Check availability" button. Each field is a label containing an uppercase 12px muted field label over a borderless 17px weight-500 control; fields are separated by 1px line dividers. Empty date inputs show in muted grey. Submitting carries the place and dates to that place's availability calendar. See Layout for how it reflows at 1100 and 560.

### Buttons
- **Shape:** gently rounded (10px).
- **Primary:** farm green with white Figtree 600 16px text, 15px by 26px padding, no border; hover goes to deep farm green (0.2s colour transition). Disabled: 60% opacity with a progress cursor while sending.
- **Ghost:** transparent with a 1.5px inset farm-green outline and green text; hover fills pale green. Used for the secondary "Send on WhatsApp instead" action beside the primary.
- **Text link (`.link`):** farm green, weight 600, underlined (4px offset). Used for "See the Main House", "More about the farm" and similar.
- **Focus (all interactive elements):** 3px solid farm green outline, 3px offset.

### Place cards
No card container: a 4:3 photo with 14px corners, a Gelasio title 22px below, an 18px muted description (max 52ch), a row of fact chips, and a green text link. Two side by side; stacked under 860px.

### Fact chips
Pale farm green pill, deep green Figtree 600 14px text, 8px by 13px padding, 8px gaps, wrapping. They state facts (Sleeps 15, Fireplace, Own braai); they are not buttons and have no hover.

### Side card
On detail pages, beside the main description: white, 1px line border, 18px corners, 28px padding, side card lift shadow, sticky 24px from the top (static under 1100px). Holds the price number, a muted "per adult per night", a two-column definition list (muted terms left, weight-600 values right-aligned) and a full-width primary button.

### Panels
Green-grey wash, 20px corners, 48px padding (28px by 22px under 860px). Used for the home rates band (heading plus two big green price numbers) and the contact form.

### Gallery and lightbox
A 4-column grid with 10px gaps; tiles are 4:3 with 10px corners and the first photo spans 2x2. Tiles are buttons with a zoom-in cursor; on hover the photo scales to 1.03 over 0.5s. The section head carries a muted "N photos · tap to enlarge" note. Clicking opens a native `<dialog>` lightbox: full screen, backdrop `rgba(var(--shade), .92)`, photo contained with 8px corners, a centred light caption below, round translucent white buttons (52px, 14% white, 26% on hover) for previous, next and close. Under 860px the arrows move to the bottom.

### Availability calendar
A 1px-bordered, 18px-rounded box with 24px padding. Top row: Figtree "Availability" title plus round 40px previous/next month buttons (ink border on hover; previous disabled at 35% opacity on the current month). Two months side by side (one under 860px), 7-column grid of square day buttons with 10px corners, Figtree 500 15px tabular figures.
- **Available:** ink number, no fill; pale green on hover.
- **Past:** light grey (#b3b9b5), disabled.
- **Booked:** booked grey, struck through (1.5px line), wash background. Still focusable; choosing one shows a warning.
- **Arrival / departure:** solid farm green with white number.
- **Nights between:** pale green with square corners so the range reads as one band.
- **Today:** a 4px dot under the number in the current text colour.
- **Legend:** small swatches (16px, 5px corners) for "Your dates" and "Available", and a struck-through sample for "Booked".
- **Status line:** a polite live region in muted 15px text that guides the visitor ("Tap your arrival day, then the day you leave"); it turns error rust for warnings (booked night chosen, booked nights inside the range, dates failed to load). Picked dates fill the enquiry form beside it.

### Enquiry form states
Two-column grid (14px gap; one column under 560px). Labels are Figtree 600 14px above their field, with optional muted 13px hints ("Optional", minimum-number notes).
- **Rest:** white field, 1.5px field-stroke border, 10px corners, 12px by 14px padding, Figtree 16px.
- **Focus:** border turns farm green with a 3px pale green halo (no outline).
- **Invalid:** border turns error rust (`aria-invalid="true"`); the first bad field receives focus.
- **Sending:** submit button disabled at 60% opacity.
- **Notes:** a full-width note under the buttons (10px corners, 12px by 14px padding, 15px text): hidden when empty, wash by default, pale green with deep green text on success, error wash with rust text on error. It is a live region.
- Actions: primary "Send enquiry" and ghost "Send on WhatsApp instead" side by side, wrapping. A hidden honeypot field catches spam.

### Footer
Ink background, footer-text colour. Four columns (2:1:1:1): white logo and one-line description, then Stay links, phone numbers, and email and socials, each under a Figtree 13px uppercase tracked footer-muted heading. Links underline on hover. A base row below a faint white hairline holds the copyright in 14px footer-muted.

### WhatsApp button
A fixed 62px circle (56px under 560px) in WhatsApp green with a white inline SVG logo, bottom right at clamp(16px, 2.2vw, 28px) from the edges, on every page. Scales to 1.07 on hover. It has an `aria-label`.

## Do's and Don'ts

### Do:
- **Do** take every colour, radius and font from the `:root` variables in `assets/css/site.css`, or from the literal hex values listed in the frontmatter.
- **Do** open new pages with a real farm photo under the shared scrim and white header, or with the plain white heading used on Rates and Contact.
- **Do** use farm green for the one main action on a screen, with a ghost button for the alternative.
- **Do** keep tabular figures (`font-variant-numeric: tabular-nums`) on prices, tables and calendar dates.
- **Do** compress and size photos (the `-sm.jpg` 720px versions plus 1800px full versions with `srcset`, `loading="lazy"` below the fold): guests are on rural mobile connections.
- **Do** check every layout change at 1100px, 860px and 560px widths.
- **Do** keep the WhatsApp button and a phone number reachable from every page.

### Don't:
- **Don't** add a second accent colour or use WhatsApp green outside the WhatsApp button.
- **Don't** use pure black for photo scrims or shadows; use `rgba(var(--shade), …)`.
- **Don't** put shadows on cards, photos or panels that sit in the page flow.
- **Don't** use Gelasio for numbers, buttons, labels or the calendar, and don't use italic or bold Gelasio (only 500 and 600 are loaded).
- **Don't** put small uppercase "eyebrow" lines above headings; uppercase labels only name the field, column or value beneath them.
- **Don't** use emoji or text glyphs as icons; draw them in CSS or inline SVG with `currentColor`.
- **Don't** add reviews, star ratings or testimonials unless real ones exist.

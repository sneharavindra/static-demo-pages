---
name: Berkyshire Capital — Static Demo Pages
description: An engraved private-banking mandate rendered as an ivory paper instrument with champagne-gold hairlines on midnight navy.
colors:
  navy-950: "#0A1524"
  navy-900: "#0E1B2E"
  navy-800: "#14233A"
  ink: "#1B2836"
  champagne: "#EDE6D6"
  paper: "#F7F2E7"
  paper-hi: "#FFFDF6"
  gold: "#C6A96C"
  gold-soft: "rgba(198,169,108,.22)"
  bronze: "#77602F"
  line: "#D0C8B4"
  line-strong: "#B9AF97"
  muted-paper: "#5A5343"
  muted-navy: "#A7B6C6"
  err: "#8E2F2F"
  err-line: "#9E3B3B"
typography:
  display:
    fontFamily: "Marcellus, Georgia, Times New Roman, serif"
    fontSize: "clamp(26px,4.4vw,32px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.01em"
  wordmark:
    fontFamily: "Marcellus, Georgia, Times New Roman, serif"
    fontSize: "clamp(17px,4.2vw,27px)"
    fontWeight: 400
    letterSpacing: "0.22em"
  headline:
    fontFamily: "Marcellus, Georgia, Times New Roman, serif"
    fontSize: "15px"
    fontWeight: 400
    letterSpacing: "0.16em"
  title:
    fontFamily: "Marcellus, Georgia, Times New Roman, serif"
    fontSize: "16.5px"
    fontWeight: 400
    letterSpacing: "0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  frame: "1px"
  instrument: "2px"
spacing:
  sm: "10px"
  md: "18px"
  lg: "34px"
components:
  paper-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.instrument}"
    padding: "clamp(28px,6vw,56px) clamp(22px,6vw,60px)"
  button-primary:
    backgroundColor: "{colors.navy-900}"
    textColor: "{colors.champagne}"
    rounded: "{rounded.instrument}"
    padding: "15px 34px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-paper}"
    rounded: "{rounded.instrument}"
    padding: "11px 20px"
  input:
    backgroundColor: "{colors.paper-hi}"
    textColor: "{colors.ink}"
    rounded: "{rounded.instrument}"
    padding: "11px 13px"
  chip:
    backgroundColor: "{colors.paper-hi}"
    textColor: "{colors.muted-paper}"
    rounded: "{rounded.instrument}"
    padding: "8px 16px"
  acct-row:
    backgroundColor: "{colors.paper-hi}"
    textColor: "{colors.ink}"
    rounded: "{rounded.instrument}"
    padding: "14px 16px 14px 14px"
---

# Design System: Berkyshire Capital — Static Demo Pages

## Overview

**Creative North Star: "The Engraved Mandate"**

The page is a single engraved banking document laid on midnight navy — not a dark-mode fintech app. All working content lives on one ivory paper instrument that carries an inset hairline frame, guilloche-rosette watermark, and gold corner stops; the navy around it is ground, never a content surface. Depth exists only where paper lifts off the desk: the instrument casts a deep soft shadow, and everything drawn on it is flat until state (focus, hover, selection) breathes life into it.

Typography splits labor the way an engraved certificate does: Marcellus inscriptional serif speaks (wordmark, headings, section legends, account names), and a quiet system sans works (labels, entries, body, buttons). Gold is rationed to hairlines, focus rings, the reeded success seal, and the checked marker; bronze carries small-cap labels on paper. Motion is brief and considered — a half-second paper settle, a staggered seal draw — and fully suppressed under `prefers-reduced-motion`.

**Key Characteristics:**
- One ivory paper instrument on midnight navy; navy is ground, never content
- Champagne-gold hairlines and focus; gold never fills a surface or sets text on paper
- Marcellus for voice, system sans for work; bronze small-cap labels at 11.5px
- Near-square 2px corners; 1px hairline borders with color-step hierarchy
- Depth = one lifted plane + state halos; flat at rest inside the instrument

## Colors

A two-ground palette: a midnight-navy world with a single champagne-gold accent, and an ivory paper family that carries all content.

### Primary
- **Champagne Gold** (`gold`, #C6A96C): the accent. Hairline rules, legend leader lines, focus outlines, selection highlight, seal strokes, footer links, and the checked marker. Its rarity is the point.
- **Gold Soft** (`gold-soft`, rgba(198,169,108,.22)): the 3px focus halo behind gold borders on inputs and selected rows.

### Secondary
- **Bronze** (`bronze`, #77602F): deep gold companion. All small-cap field labels, the input caret, and the seal letterform on paper.

### Tertiary
- **Oxblood Error** (`err`, #8E2F2F) and **Error Line** (`err-line`, #9E3B3B): inline error text and invalid borders. Errors recolor the field, never shout beyond it.

### Neutral
- **Midnight Ground** (`navy-950`, #0A1524): page background and theme color.
- **Midnight Panel** (`navy-900`, #0E1B2E): the primary button and the checked declaration box — navy reappears on paper only as the action and the mark of consent.
- **Midnight Edge** (`navy-800`, #14233A): primary button border.
- **Instrument Ink** (`ink`, #1B2836): primary text on paper and selected-state borders.
- **Champagne Ivory** (`champagne`, #EDE6D6): light text on navy (wordmark, button label).
- **Ivory Paper** (`paper`, #F7F2E7): the instrument's ground.
- **Paper Highlight** (`paper-hi`, #FFFDF6): wells for inputs, chips, account rows, reference box.
- **Hairline** (`line`, #D0C8B4): resting borders on all paper controls.
- **Hairline Strong** (`line-strong`, #B9AF97): hover borders, radio dots, checkbox box.
- **Muted Paper** (`muted-paper`, #5A5343): secondary text on paper.
- **Muted Navy** (`muted-navy`, #A7B6C6): body text on navy.

### Named Rules
**The Gold Ration Rule.** Gold appears only as hairlines, focus treatment, the seal, and the checked marker. It never fills a surface larger than a marker, and it never sets text on the paper instrument — gold letterforms live on the navy ground alone.

**The Two Grounds Rule.** On paper, labels and secondary voice are bronze and muted-paper; on navy, text is champagne ivory and muted-navy. The families never cross grounds except gold's state work.

## Typography

**Display Font:** Marcellus (with Georgia, Times New Roman, serif fallback)
**Body Font:** System sans (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial)
**Label/Mono Font:** None distinct; labels are the system sans in small caps. Figures align via `font-variant-numeric: tabular-nums` on inputs and the reference number.

**Character:** An inscriptional single-weight serif against a silent sans — the certificate and the clerk's hand. Marcellus has no bold; hierarchy comes from size, tracking, and case, never weight.

### Hierarchy
- **Display** (400, clamp(26px,4.4vw,32px), 1.2, .01em): the page h1; the success h2 sits just under it (clamp(24px,4vw,30px)).
- **Wordmark** (400, clamp(17px,4.2vw,27px), .22em tracking): the engraved house name, uppercase in the markup.
- **Headline** (400, 15px, .16em, uppercase): fieldset legends — the document's engraved clause headings.
- **Title** (400, 16.5px, .02em): account names in selection rows.
- **Body** (400, 15px base, 1.55): introduction and notes; working sizes step 12–16px, body copy capped near 56ch.
- **Label** (600, 11.5px, .1em, uppercase, bronze): field and group labels. Button labels enlarge the same idea (13px, .18em); the brand sub-line extremes it (11px, .42em).

### Named Rules
**The Marcellus Speaks Rule.** The serif is reserved for the voice — wordmark, headings, legends, account names, the seal letter. All working type (labels, entries, body, buttons, errors) is the system sans. Body copy is never set in Marcellus.

**The Tabular Figure Rule.** Any numeric entry or issued value (amounts, dates, the reference number) sets `tabular-nums` so figures behave like engraving guides.

## Layout

A single centered column: page max-width 880px with 48px/20px outer padding, opened by a radial glow (#12233B at 50% -80px) behind an engraved masthead (wordmark between fading gold rules, ghosted guilloche rosette at 7% opacity). The instrument's padding breathes with the viewport (clamp(28px,6vw,56px) × clamp(22px,6vw,60px)).

Inside the document: sections separate on 1px ink-alpha rules (rgba(27,40,54,.14)) at 34px top rhythm; each legend runs a gold leader line to the right edge. Field pairs sit on a 1fr/1fr grid with an 18px gap; the deposit row is 130px + 1fr; chips and account rows stack at 10px gaps. At ≤560px all rows collapse to one column and the primary button goes full-width. Conditional fields expand via a `grid-template-rows: 0fr → 1fr` reveal over 0.3s.

### Named Rules
**The Single Instrument Rule.** One paper instrument per view carries all content; the navy carries only the masthead, the footer disclaimer, and ambient glow. Content never floats on navy.

## Elevation & Depth

A hybrid with one structural plane: the paper instrument lifts off the navy with a deep two-layer shadow plus a 1px inset gold top hairline that reads as the sheet's edge catch-light. Everything on the instrument is flat at rest — depth returns only as state: a soft lift under the hovered primary button, and 3px gold-soft halos behind focus and selection. Reduced-motion removes all of it.

### Shadow Vocabulary
- **Instrument lift** (`box-shadow: 0 30px 60px -18px rgba(0,0,0,.55), 0 8px 20px -8px rgba(0,0,0,.4)`): the paper panel, always.
- **Edge catch-light** (`box-shadow: 0 1px 0 rgba(198,169,108,.35) inset`): the instrument's top hairline.
- **Button hover lift** (`box-shadow: 0 10px 24px -10px rgba(0,0,0,.45)`): hovered primary button, with a 1px translate.
- **Focus halo** (`box-shadow: 0 0 0 3px rgba(198,169,108,.22)`): focused inputs, selected account rows (paired with a 1px ink inset ring); invalid focus swaps to `0 0 0 3px rgba(158,59,59,.15)`.

### Named Rules
**The One Plane Rule.** Only the instrument casts ambient shadow. Components inside it are flat at rest; any shadow they gain is a state (hover, focus, checked), never decoration.

## Shapes

Near-square engraved geometry: every corner on the instrument is 2px — panel, inputs, selects, chips, account rows, buttons, checkbox, reference box. The inner frame is a 1px hairline at 12px inset with an even finer 1px radius, marked by gold corner stops (16px × 2px crosses in line-strong ink). Containers border at 1px; only the drawn control marks (radio dot, checkbox box) carry 1.5px. Circles are reserved for the radio dot, the processing spinner, and the reeded seal. The selected chip signs itself with a 2px gold baseline marker (`inset 0 -2px 0`), the system's only non-hairline accent stroke.

## Components

### Buttons
- **Shape:** 2px radius, squared engraved plate.
- **Primary:** midnight panel (navy-900) on champagne ivory text, 1px midnight-edge border, padding 15px 34px, label 13px/600/.18em uppercase; hosts a 15px gold-top spinner while processing (opacity .92, "Processing" label).
- **Hover / Focus:** lifts 1px, border turns gold, gains the hover lift shadow; focus is a 2px gold outline at 3px offset. Active settles back to none.
- **Ghost:** transparent with 1px hairline border, muted-paper text (12.5px, .08em), padding 11px 20px; hover deepens border and text to ink ("Copy", "Submit another application").

### Chips
- **Style:** paper-hi well, 1px hairline border, muted-paper text (13.5px), padding 8px 16px; radio inputs visually hidden.
- **State:** hover tightens to hairline-strong and ink text; checked turns ink-bordered on paper-hi with the gold baseline marker; focus-visible rings the span in gold.

### Cards / Containers
- **Account rows:** paper-hi row, 1px hairline border, 14px/16px padding, 18px radio dot with a gold fill that scales in on check; checked row takes ink border plus the focus halo ring (inset 1px ink + 3px gold-soft). Serif title over muted small text.
- **Paper instrument:** ivory paper (paper), 2px radius, breathing clamp padding, inset hairline frame with gold corner stops, ghosted rosette watermark (4.5% ink), settling in over 0.55s.
- **Declaration:** hairline-bordered strip (rgba ink .14), 16px padding, 18px checkbox box that fills midnight-navy with a champagne check glyph when consented.

### Inputs / Fields
- **Style:** paper-hi well, 1px hairline border, 2px radius, 11px/13px padding, 16px sans in ink, bronze caret, tabular figures.
- **Focus:** gold border with the 3px gold-soft halo; transitions run 0.18s on border, shadow, and background together.
- **Error / Disabled:** invalid fields reborder oxblood on a warmed wash; errors surface as 13px oxblood text beneath the field with `aria-invalid` wiring. Selects replace native chrome with a bronze inline-SVG chevron at right 13px.

### Navigation
No navigation; the masthead (wordmark, gold rules, ghosted rosette) and the footer disclaimer (centered, gold-haired rule, gold links) frame the instrument.

### Conversational Launch
Below the form's foot sits the TalkyForm entry: a ghost-family button (uppercase 12px/600, .12em tracking, 12px 28px padding) labeled "Start Conversation", centered between two 1px ink-alpha hairlines on an 18px-gapped flex row with 28px top rhythm. The block hides when the success panel shows and returns on reset. The avatar widget itself is third-party chrome (deferred script, data-talkyform-id on the form) and inherits none of the instrument's styles; only the launch control belongs to the system.

### Reeded Seal
The success moment: a 128px SVG seal whose concentric circles stroke-draw over 1.1s in 0.25s staggered waves (pathLength 100), the outer reeded ring dashed, before the bronze Marcellus monogram fades up in place. Gold throughout; the document's only figurative gold.

## Do's and Don'ts

### Do:
- **Do** set all content on the ivory instrument with its inset hairline frame and gold corner stops; keep navy as ground.
- **Do** label fields in bronze small caps (11.5px, 600, .1em, uppercase) with 7px beneath to the control.
- **Do** treat focus as gold ceremony: 2px gold outline (2px offset) on controls, or gold border + 3px gold-soft halo on wells.
- **Do** step border hierarchy by color — hairline → hairline-strong → ink — at a constant 1px.
- **Do** collapse paired rows to one column at ≤560px and stretch the primary button full-width.
- **Do** gate every animation and transition behind `prefers-reduced-motion: reduce`.

### Don't:
- **Don't** fill any large surface with gold; it is hairlines, focus, the seal, and the checked marker only.
- **Don't** set gold text on the paper instrument — gold letterforms belong to the navy ground.
- **Don't** thicken borders to signal hierarchy; weight stays 1px (1.5px only for the drawn dot/box marks).
- **Don't** give components inside the instrument resting drop shadows; depth is state, not decoration.
- **Don't** round past 2px or introduce pill shapes; circles are the dot, the spinner, and the seal.
- **Don't** set body copy, entries, or buttons in Marcellus; the serif speaks, the sans works.

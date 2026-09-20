# Design — Private Bank Account Opening Demo Page

Date: 2026-09-20 · Status: Approved (conversation) · Repo: static-demo-pages (not yet a git repo)

## Decision

Single self-contained `index.html` (inline CSS + vanilla JS, no build step) served as a GitHub Pages static site.

## Visual direction (user-pinned)

Luxury private banking: midnight-navy ground, ivory "mandate document" panel carrying the form, champagne-gold rules and accents, inscriptional serif display (Marcellus), guilloche rosette watermark, bronze small-cap labels, 2px corners. Mode: Operate — task completion outranks expression; the paper panel maximizes input legibility.

## Structure

- Header on navy: engraved wordmark, gold hairlines, guilloche.
- Ivory panel: inset hairline frame; sections — Personal Details; Employment & Source of Funds (Other reveals a required specify input); Account Preferences (account type radio rows with descriptors, currency + initial deposit); Residential Address; declaration checkbox.
- Primary action at document foot; processing state; success panel with stroke-drawn gold seal, greeting, reference number + copy button, reset link.
- Footer on navy: demo disclaimer (fictional bank, nothing transmitted/stored) plus Privacy Policy (talkyform.com/privacy) and Terms of Service (talkyform.com/terms) links.
- TalkyForm integration: `data-talkyform="enabled"` on the form; launch button + deferred avatar script (id g4UtyUR7fpzVFfxTQSNkqEie) placed immediately after the form DOM, in-world styled, hidden in the success state.

## Behavior

- HTML5 constraints + JS intercept: inline errors (problem + recovery wording), aria-invalid, focus first invalid field, live clearing on input.
- Valid submit → ~1.1s processing → panel swap (aria-live announcement, focus to success heading).
- Reference number format `MPB-XXXXXX-XXXX` (base36, uppercase).
- DOB capped at 18 years ago; deposit minimum enforced with in-world copy.

## Non-goals

No backend, no analytics, no multi-step wizard, no real claims or institutions.

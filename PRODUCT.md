# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Single self-contained static HTML page (`index.html`, inline CSS/JS, no build step, no dependencies beyond a webfont link), deployed on GitHub Pages. Confirmed in the original request.

## Users

Viewers of the TalkyForm static demo pages. Inferred — likely prospects or team members evaluating form experiences; not individually interviewed.

## Product Purpose

Demonstrate a private-bank account-opening experience as a static page. Success means a visitor can complete the form end-to-end (validation → processing → confirmation with reference number) with no backend, and the page reads as credible private-bank craft rather than a generic form demo.

## Operating Context

Pure demonstration: no data is transmitted or stored; the bank entity is fictional and the page states this. Served as a static page; offline-friendly except the webfont (system-serif fallback provided).

## Capabilities and Constraints

- Fields (confirmed): full name, email, phone, date of birth, nationality; employment status (select); source of funds (Business Income / Employment Income / Inheritance / Other, with a conditional required "specify" input for Other); account type (radio group: Private Savings, Premier Current, Fixed Term Deposit); initial deposit (currency + amount); residential address (street, city, postal code, country); declaration checkbox.
- Submit behavior (confirmed): JS-intercepted validation with inline errors, brief processing state, then the form swaps to a success panel with a generated reference number and a reset option.
- Responsive, semantic, keyboard accessible; reduced-motion respected.
- Footer carries real product links (confirmed 2026-09-20): Privacy Policy → https://www.talkyform.com/privacy, Terms of Service → https://www.talkyform.com/terms.
- TalkyForm conversational integration (confirmed 2026-09-20): form marked `data-talkyform="enabled"`; after the form DOM, a `data-talkyform="launch"` button ("Start Conversation") and the avatar script `https://www.talkyform.com/talkyform-avatar.js` with `data-talkyform-id="g4UtyUR7fpzVFfxTQSNkqEie"` (deferred).

## Brand Commitments

Luxury private-banking aesthetic for this surface, user-selected 2026-09-20: dark navy ground, gold accents, serif display type, premium feel.

## Evidence on Hand

None. All copy is authored fictional demo content, disclaimed on the page. No real claims, rates, or institutions.

## Product Principles

1. The form is the product: every flourish must serve completion and trust.
2. Paper-instrument aesthetic: the form should read as an engraved banking document, not an app widget.
3. Demo honesty is visible: the page itself says nothing is transmitted or stored.

## Accessibility & Inclusion

Standard-minded semantics: labels, fieldsets/legends, focus-visible states, aria-invalid/aria-live, prefers-reduced-motion support. No product-specific standard mandated.

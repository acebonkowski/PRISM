# Prism — Landing Page Outline for Coding Agent

## Meta / Global

Product name: Prism
Domain (placeholder): prism.app
Brand colors: Colors used for the Chrome Extension
Typography: Typography used for the Chrome Extension
Visual language: Glassmorphism UI cards, frosted popups, subtle gradients
Sticky header: Yes — transparent on scroll-top, white/frosted on scroll


## 1. Sticky Header
Layout: Logo left | Nav center | CTA right
Logo: Prism wordmark + octahedron/prism icon (existing brand mark from deck)
Nav links:

Home
How It Works
Features
Pricing


CTA button: Add to Chrome — It's Free → links to Chrome Web Store
Behavior: Transparent at top of page, transitions to frosted/white background on scroll with subtle drop shadow

## 2. Hero Section
Above the fold. Full viewport height.
Headline (large, bold):

You read the news. But are you reading the whole story?

Subheadline (1–2 sentences):

Prism is a one-click Chrome extension that instantly analyzes any article or post — surfacing a verifiability score, credible counter-evidence, and the strongest opposing argument. Without ever leaving the page.

CTA (primary): Add to Chrome — Free
CTA (secondary, text link): See how it works ↓
Hero visual:

Animated or static mockup of the Prism glassmorphism popup overlaid on a news article (e.g. NYT or FT article)
Popup shows: verifiability score ring (e.g. 74, blue), 3 extracted claims, Devil's Advocate section label
Subtle gradient background (light blue-gray to soft periwinkle)


## 3. Problem Bar (1-liner social proof strip)
Thin full-width band between Hero and Features.
Text:

Fake news spreads 6x faster than the truth. Most fact-checkers require you to already be skeptical — and to leave the page. Prism fixes both.

Style: Dark background band (#1A1A1A), white text, small citation footnote (Vosoughi et al., 2018, Science)

## 4. How It Works (3-step process)
Section headline: Three clicks. Full picture.
3 steps, horizontal layout with icon + step number:

Install Prism — Add the free Chrome extension in seconds. Works on any news site, blog, or social media post.
Click the icon — Hit the Prism icon on any article or post. Analysis loads in under 8 seconds — no new tab, no manual searching.
Read the full picture — Get a verifiability score, extracted claims, real sources, and the strongest counter-argument. Share the report or keep reading smarter.

Visual: Simple step flow diagram or browser chrome showing the extension icon being clicked → popup appearing

## 5. Feature Showcase
Section headline: Everything you need to read critically.
Subheadline: Prism runs a full analysis in one click — here's what you get.
Layout: Alternating left-right feature rows (text + UI mockup/screenshot). 6 features total, group into 3 paired rows or show as 2-column grid of feature cards.

Feature 1 — Verifiability Score

Label: Verifiability Score
Description: Every article gets a 0–100 score, a plain-language explanation of why, and a color-coded category (High / Medium / Low). No jargon. Just signal.
Visual: Score ring mockup (circular progress, blue at 74, with label "High Verifiability" and 1-sentence rationale beneath)

Feature 2 — Devil's Advocate

Label: Challenge Argument
Description: An on-demand second AI pass that steel-mans the strongest opposing perspective — written as a reasonable, intelligent person who disagrees would argue. Backed by 3–5 real sourced links.
Visual: Popup card showing "Devil's Advocate 😈" section with 3 counter-arguments and source links

Feature 3 — Source Verification

Label: Source Verification
Description: Prism runs live web searches to surface real supporting or contradicting sources, labeled and linked directly in the extension. See what backs the story — and what challenges it.
Visual: Source cards showing domain name, headline snippet, and "Verified by" or "Challenges this" badge

Feature 4 — Neutral Summary

Label: Neutral Summary
Description: A concise, editorially neutral summary of the page content in under 40 words. Cuts through framing and spin before you even read the article.
Visual: Short summary card in the popup UI

Feature 5 — PDF / Share Export

Label: Share & Export
Description: One click exports the full analysis — score, summary, sources, counter-argument — as a shareable link or print-ready PDF. Every report gets a unique public URL.
Visual: Share button + preview of the web report view with unique URL

Feature 6 — Instant Analysis

Label: Instant Analysis
Description: Two-stage architecture splits the main analysis from the challenge pass so initial results load in under 8 seconds. No page reload. No context switching.
Visual: Loading state → populated popup transition, with a subtle "8s" timing indicator


## 6. Pricing
Section headline: Start free. Go deeper when you need it.
Layout: 3-column pricing cards, center card (Pro) slightly elevated or highlighted

Starter — Free

3 analyses per week
Full feature access
Analysis history (with account)
For curious readers
CTA: Add to Chrome — Free

Pro — €5/month (highlighted)

50 analyses per month
Full feature access
Personal history dashboard
Priority analysis speed
For journalists, researchers, and daily readers
CTA: Start Pro

Teams — €20/seat/month

Unlimited analyses
Team dashboard + shared history
Usage analytics
Collective analysis tracking
For newsrooms, NGOs, and universities
CTA: Contact Us

Fine print beneath: No credit card required for Starter. Cancel Pro anytime.

## 7. Final CTA Section
Full-width band, dark or gradient background
Headline:

The news isn't going to slow down. Your reading should.

Subheadline:

Add Prism to Chrome in 30 seconds. Free to start.

CTA button: Add to Chrome — It's Free
Supporting text (small): Works on Chrome · No account required to start · Supports any news site or social platform

### 8. Footer
4-column layout:
Col 1 — Brand:

Prism logo + tagline: "Read the whole story."
Brief 1-line mission: "We're building tools for epistemic clarity in a polarized information landscape."

Col 2 — Product:

How It Works
Features
Pricing
Chrome Web Store →

Col 3 — Company:

About
Blog / Verifiability Reports
Press
Contact

Col 4 — Legal + Social:

Privacy Policy
Terms of Service
Twitter/X icon
LinkedIn icon

Bottom bar: © 2025 Prism · Built with Claude API · [Privacy] [Terms]

Notes for Coding Agent

Framework: React or plain HTML/CSS depending on stack; Tailwind recommended for rapid build
Extension popup mockups: use static PNG/SVG exports of the actual extension UI — don't simulate with generic screenshots
Animations: subtle entrance animations on scroll (Framer Motion or CSS transitions) — especially on the score ring and feature cards
The score ring in Feature 1 should be an animated SVG circle with the number counting up on scroll entry
Mobile: all sections should stack to single column; sticky header collapses to hamburger menu on mobile
The "Share" feature mockup in Feature 5 should show a realistic-looking unique URL (e.g. prism.app/report/a3f9b2)
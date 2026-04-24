# TruthLayer — Product Requirements Document

**Version:** 1.1 
**Owner:** Ace Bonkowski
**Stack:** Chrome Extension (MV3) + Claude API + Supabase + React web app

---

## 1. Problem Statement

Politically engaged, news-heavy readers are consuming an unprecedented volume of content across social media and digital news — with no fast, in-context tool to pressure-test what they're reading. Existing fact-checkers require the user to already be skeptical and to manually leave the page. The result is that emotionally charged, one-sided, or misleading content reinforces existing beliefs rather than challenging them. The root outcome isn't just misinformation — it's deepening polarization.

Prism's mission is not just to flag false claims, but to actively surface the other side of any argument, building balanced epistemic habits at the moment of consumption.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Reduce friction to fact-checking | Analysis delivered in <8 seconds after icon click |
| Surface counter-perspectives | 3 counter-arguments generated per analysis |
| Drive sharing & virality | Shareable report URL generated per analysis |
| Build usage habits | Return usage rate (tracked via anonymous Supabase ID) |

---

## 3. Target User

**Primary:** Politically engaged, news-heavy readers who consume a high volume of digital content daily across news sites (FT, NYT, Politico, etc.) and social media (Instagram, X). They are literate, opinionated, and capable of critical thinking — but don't have the time or tools to do it for every piece of content. They are not the target of fake news; they are the ones who might unknowingly spread it, or who are subtly radicalized through repeated one-sided framing.

**User mindset:** *"I think I'm already a critical reader. Prove me wrong."*

**Desired behavior changes (all of the following, with anti-polarization as the north star):**
- Stop sharing misinformation before re-posting
- Read more critically / slow down consumption
- Discover counter-perspectives they wouldn't find themselves
- Build long-term media literacy habits

---

## 4. Product Overview

Pism is a Chrome Extension (MV3) with a companion web app. The user clicks the extension icon on any article or social media post. A glassmorphism popup appears with an AI-powered analysis: extracted claims, a verifiability score with plain-language explanation, verification or counter-sources from the web, and a **Devil's Advocate** section with 3 steel-manned counter-arguments each backed by 3–5 sources. Every analysis can be shared as a public web app report via a unique URL.

---

## 5. User Flow

```
User lands on article or Instagram post
        ↓
Clicks TruthLayer extension icon
        ↓
Popup opens → "Analyzing..." loading state
        ↓
Content script extracts page text (DOM)
        ↓
Text sent to background service worker
        ↓
Claude API call (claim extraction + web_search + scoring + counter-args)
        ↓
Results rendered in popup:
  • Top 3–5 extracted claims
  • Verifiability score (0–100) + plain-language description
  • 3–5 verification sources (if score high) or counter-sources (if score low)
  • Devil's Advocate: 3 counter-arguments + 3–5 backing sources
        ↓
User clicks "Share" → result written to Supabase (anonymous UUID)
        ↓
Public URL generated → user copies or opens web app report
```

---

## 6. Core Features (MVP Scope)

### F1 — Claim Extraction

Claude reads the full page text and extracts the 3–5 most significant factual or argumentative claims. Displayed as short, bold statements in the popup. This is the foundation every other feature builds on.

**Claude prompt goal:** *"You are a neutral analyst. Extract the 3–5 core factual or argumentative claims from this content. Be concise. Do not editorialize."*

---

### F2 — Verifiability Score

A composite 0–100 score rendered as a circular progress ring in the popup header. Computed by Claude based on: claim verifiability, source quality of the original outlet, balance of corroborating vs. contradicting evidence found, and recency.

The score ring label reads **"Verifiability."** Directly beneath it, a Claude-generated 1–2 sentence plain-language explanation describes *why* the content received that score.

**Score ring color logic:**
| Range | Color | Token |
|---|---|---|
| 70–100 (High) | Blue | `#0033FF` |
| 40–69 (Medium) | Periwinkle | `#977DFF` |
| 0–39 (Low) | Wine red | `#8B1A2F` |

**Example description (high score):** *"Key claims are supported by multiple independent sources. Sourcing is recent and traceable."*

---

### F3a — Verification Sources *(shown when score ≥ 70)*

3–5 external sources that corroborate and verify the content's primary claims. Sourced via Claude's `web_search` tool. Labeled **"Verified by"** with source domain, headline snippet, and a corroboration badge. Framing: *"Here's what backs this up."*

---

### F3b — Counter Sources *(shown when score < 70, or as secondary section)*

3–5 external sources that contradict or significantly complicate the claims. Same card format as F3a. Framing: *"Here's what challenges this."*

Both F3a and F3b are always included in the Claude JSON output. The UI decides which to lead with based on the score threshold.

---

### F4 — Devil's Advocate 😈

A unified, branded section in the popup with its own header: **"Devil's Advocate."** Contains two subsections rendered together.

**4a — Counter-Arguments**
3 steel-manned counter-arguments to the content's main thesis. Written as the strongest reasonable version of the opposing view — no strawmen, no editorializing.

**Claude prompt goal:** *"Generate 3 steel-manned counter-arguments to the main thesis of this content. Write each as a reasonable, intelligent person who disagrees would argue. No strawmen. No editorializing."*

**4b — Devil's Advocate Sources**
3–5 web sources that specifically substantiate the counter-arguments above. Not generic contradicting articles — Claude selects sources that back up each counter-argument's logic. Sourced in the same API call.

**UX intent:** The user reads a counter-argument, then immediately sees the evidence behind it — making the opposing view feel as credible and sourced as the original content.

---

### F5 — Shareable Report Link

On clicking "Share," the full analysis result is written as a single JSON record to Supabase with a UUID primary key. A public URL is generated: `truthlayer.app/report/{uuid}`. The companion web app fetches and renders this record as a full styled report — same glassmorphism visual language as the popup.

**Anonymous write model:** No auth required to create or view a report. Auth (post-hackathon) allows users to claim and manage their history.

---

## 7. Out of Scope for MVP

- User authentication (post-hackathon)
- AI-generated image / deepfake detection (post-hackathon)
- Bias & framing language detection (post-hackathon)
- History dashboard requiring login (post-hackathon)
- Auto-analysis on page load
- Mobile support

---

## 8. Technical Architecture

### Extension File Structure

```
truthlayer-extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
├── content.js        ← DOM extraction
├── background.js     ← Claude API calls
└── icon.png
```

### Key Manifest Permissions

```json
{
  "manifest_version": 3,
  "name": "TruthLayer",
  "version": "1.0.0",
  "description": "Real-time verifiability analysis on any page.",
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["<all_urls>", "https://api.anthropic.com/*"],
  "background": { "service_worker": "background.js" },
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content.js"] }]
}
```

### Data Flow

| Step | Component | Action |
|---|---|---|
| 1 | `popup.js` | User clicks icon → sends message to content script |
| 2 | `content.js` | Extracts `document.body.innerText` (capped ~4000 tokens) → returns to popup |
| 3 | `popup.js` | Forwards text to `background.js` via `chrome.runtime.sendMessage` |
| 4 | `background.js` | Calls Claude API with `web_search` tool + structured prompt |
| 5 | `background.js` | Returns parsed JSON result to popup |
| 6 | `popup.js` | Renders result in UI |
| 7 | On share: `popup.js` | POSTs result to Supabase REST API → returns UUID URL |

### Claude API Call Design

Single call, structured JSON output. Model: `claude-sonnet-4-20250514` with `web_search` tool enabled.

```json
{
  "claims": ["...", "...", "..."],
  "verifiability_score": 74,
  "verifiability_description": "Key claims are supported by multiple independent sources. Sourcing is recent and traceable.",
  "verification_sources": [
    { "url": "...", "title": "...", "label": "Corroborates" }
  ],
  "counter_sources": [
    { "url": "...", "title": "...", "label": "Contradicts" }
  ],
  "counter_arguments": ["...", "...", "..."],
  "devils_advocate_sources": [
    { "url": "...", "title": "...", "label": "Supports counter-view" }
  ],
  "summary": "..."
}
```

### Supabase Schema

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT,
  page_title TEXT,
  claims JSONB,
  verifiability_score INTEGER,
  verifiability_description TEXT,
  verification_sources JSONB,
  counter_sources JSONB,
  counter_arguments JSONB,
  devils_advocate_sources JSONB,
  summary TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

Public read policy on `reports` table. No auth required to write or read (hackathon scope).

### Web App (Shareable Report)

Simple React app (Vite) hosted on Vercel. Single route: `/report/:id`. Fetches from Supabase by UUID, renders the full analysis report in the same glassmorphism design language as the popup.

---

## 9. Design System

### Visual Direction

Glassmorphism-first. Frosted panels with white borders floating over blurred blue gradient orb backgrounds. Data-forward layout with clean typographic hierarchy. Feels like a premium analytical tool, not a political watchdog.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--navy-deep` | `#00003D` | Page/popup background base |
| `--navy-mid` | `#000066` | Secondary background layer |
| `--blue-primary` | `#0033FF` | CTA buttons, high score ring, badges |
| `--blue-electric` | `#0131FF` | Hover states, active accents |
| `--periwinkle` | `#977DFF` | Medium score ring, secondary labels |
| `--red-wine` | `#8B1A2F` | Low score ring, warning states |
| `--glass-surface` | `#E6E0F8` @ 10% opacity | Card backgrounds |
| `--text-primary` | `#FFFFFF` | All primary text |
| `--text-secondary` | `rgba(255,255,255,0.6)` | Meta text, labels |

### Component Specs

- **Popup size:** 400px wide × 560px tall
- **Border radius:** 16px on cards, 24px on popup container
- **Glass cards:** `backdrop-filter: blur(12px)`, `background: rgba(230,224,248,0.08)`, `border: 1px solid rgba(255,255,255,0.15)`
- **Score ring:** SVG circle, color based on score range, animated on load
- **Background accent:** Gaussian blur orb in `#0033FF` at low opacity, positioned behind glass panels
- **Typography:** Inter or DM Sans — clean, neutral, data-legible
- **Inspiration:** Frosted glass cards over airy photo backgrounds (ref: Ravello Village map UI from design inspo); data cards with bold numeric displays (ref: medication/seizure card grid)



---

## 11. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Instagram dynamic DOM not readable | Target `article` tags via `MutationObserver`; fallback: manual text selection |
| Claude API latency >8s | Show animated loading state; stream if possible |
| Web search returns low-quality sources | Prompt Claude to prefer Reuters, AP, academic, `.gov` sources explicitly |
| Score perceived as politically biased | Framed as "Verifiability" — methodological, not ideological |
| API key exposed in extension | Route all Claude calls through Supabase Edge Function |
| `return true` async message passing bug | Always return `true` from `onMessage` listeners with async responses |

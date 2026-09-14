# PRISM: Product Breakdown

> A product management case study of PRISM, an in-context AI analysis tool for news and social content.

## Executive Summary

PRISM is a Chrome extension and companion web app designed to help people pause before they trust, share, or repeat a piece of content. It extracts the claims on the page, searches for supporting and opposing evidence, assigns a 0-100 verifiability score, and lets the reader request a steel-manned counter-perspective without leaving the page.

The important product choice is the framing. PRISM does not present itself as an ideological referee or a binary "true/false" button. It treats media literacy as a behavior-change problem: reduce the effort required to check a claim, make source quality visible, and deliberately introduce evidence a reader may not encounter inside a personalized information environment.

The MVP is optimized around one moment: a politically engaged reader is about to accept, dismiss, or share a claim and can spend a few seconds pressure-testing it in context.

## Product Thesis

### The opportunity

The pitch deck frames the market problem as an attention and context gap: false or misleading content can spread rapidly because engagement systems reward emotional reactions, while verification tools require a separate search workflow. The PRD sharpens this into an anti-polarization mission: the product should not only flag inaccurate claims; it should build the habit of seeking credible counter-perspectives.

### The hypothesis

If a reader can get a fast, neutral, evidence-linked analysis over the page they are already reading, then the reader is more likely to:

- pause before sharing;
- distinguish verifiability from political agreement;
- discover credible evidence outside their normal feed;
- develop a repeatable media-literacy habit.

### The product promise

**One click. Current evidence. The strongest reasonable challenge to the argument.**

The promise is intentionally narrower than "solve misinformation." PRISM can reduce friction and broaden context; it cannot guarantee truth, eliminate model error, or replace primary-source reading and expert judgment.

## Pain Point

### User pain

The primary user is a politically engaged, high-volume reader consuming news and social content across sites such as major newspapers, policy outlets, and X. This user is capable of critical thinking but has limited time and attention.

Their workflow is currently:

1. Encounter a compelling article, post, or claim.
2. Form an initial reaction from the content's framing.
3. Decide whether it feels credible enough to continue or share.
4. Only sometimes leave the page to search for verification.

The friction is not simply that sources are hard to find. It is that verification has a high context-switching cost and requires skepticism before the tool becomes useful. The reader may already have accepted the framing by the time they begin checking it.

### Jobs to be done

| Situation | Functional job | Emotional/social job |
|---|---|---|
| I am reading a strong claim | Help me identify what is actually being asserted and what evidence exists. | Let me feel intellectually responsible without starting a research project. |
| I am about to share content | Give me a quick signal about support, dispute, and source quality. | Reduce the chance that I spread something misleading. |
| I disagree with an article | Show me the strongest reasonable opposing case, not a caricature. | Challenge my assumptions without making me feel lectured. |
| I want to discuss the topic | Give me linked evidence I can inspect or share. | Help me enter a conversation with more useful context. |

### Unmet need in existing alternatives

- **Traditional fact-checking sites:** high-quality but often disconnected from the reading moment and focused on claims already selected by editors.
- **Search engines:** powerful but require the user to formulate queries, assess sources, and reconcile conflicting evidence.
- **Platform context labels:** visible at the platform level but often lack transparent evidence and a nuanced explanation.
- **LLM chat interfaces:** flexible, but detached from the exact page context and vulnerable to unsupported answers unless grounded in live sources.

PRISM's differentiation is the combination of page-level context, live retrieval, a calibrated-looking score, and an explicit counter-argument workflow.

## Target Users and Segmentation

### Primary segment

Politically engaged, English-speaking desktop readers who consume enough news and social content to feel the cost of checking every claim, but care enough about accuracy to use a lightweight intervention.

### Early adopters

- journalists and media critics who need rapid source triangulation;
- researchers and policy professionals who scan high volumes of claims;
- educators and journalism students building verification habits;
- highly engaged readers who want to challenge their own confirmation bias.

### Institutional buyers

The deck identifies newsrooms, NGOs, and schools as a future team segment. These customers have a different value proposition from individual readers: shared history, usage analytics, team workflows, and repeatable research support rather than personal curiosity alone.

### Non-target users for the MVP

PRISM is not initially designed for fully automated content moderation, mobile-first consumption, deepfake detection, or users looking for a simple political agreement label. Keeping those use cases out of the first release protects the product's core behavior and trust model.

## Product Experience

### Core user journey

```text
Open article or social post
        |
        v
Open PRISM side panel
        |
        v
Click Analyze
        |
        v
Extract visible content from the active page
        |
        v
Receive score, summary, claims, and source context
        |
        +--> Inspect opposing/supportive sources
        |
        +--> Click Challenge Argument for a second AI pass
        |
        +--> Export a printable report
```

### Experience principles

1. **Stay in context.** Analysis appears beside the page rather than forcing the user into a separate research tab.
2. **Lead with a fast signal.** The main analysis is intentionally shorter and cheaper than the deeper challenge pass.
3. **Show evidence, not just conclusions.** Sources are linked, titled, and stance-labelled.
4. **Separate verifiability from ideology.** A low score means evidence is disputed or difficult to verify, not that the content is politically wrong.
5. **Make disagreement constructive.** The challenge feature steel-mans an opposing view and attaches reasoning sources.

## Feature Breakdown

### F1. Page and post extraction

The content script reads meaningful visible text from the active webpage. It prefers semantic containers such as `article`, `main`, and common article-body selectors before falling back to `document.body.innerText`. Input is capped at approximately 4,000 characters in the content script and 3,000 characters before the Claude request.

For X/Twitter, PRISM uses targeted tweet selectors, waits for SPA content with a `MutationObserver`, and collects up to four image URLs for multimodal analysis. Instagram selectors are present as an experimental extraction path, but platform DOM changes make this a maintenance risk.

**Product value:** removes manual copying and preserves the exact context that triggered the user's question.

**Key constraint:** extraction quality varies by site, paywall, dynamic rendering, and page structure. The product needs clear failure states rather than pretending every page is analyzable.

### F2. Verifiability score

The AI returns a score from 0 to 100, a category, and a one-sentence explanation. The current UI maps the ranges as follows:

| Score | Product label | Meaning in the experience |
|---:|---|---|
| 70-100 | Verified | Claims have comparatively strong, traceable support. |
| 40-69 | Contested | Evidence is mixed, incomplete, or meaningfully disputed. |
| 0-39 | Disputed | Claims have weak support or substantial contradicting evidence. |

The score is meant to summarize evidence quality, recency, source quality, and corroboration. It is not a measured probability of truth. This distinction should be explicit in future onboarding and report copy because numeric scores create false precision.

### F3. Neutral summary and claim extraction

The analysis extracts three to five significant factual or argumentative claims and produces a concise neutral summary. These are foundational representations: the claims define what should be searched, while the summary gives the reader a low-friction understanding before they inspect the evidence.

The current implementation limits summary display in the side panel and offers a read-more interaction when the returned text is longer than the compact view allows.

### F4. Source verification and counter-evidence

The Claude prompt instructs the model to batch web searches, prefer sources such as Reuters, AP, BBC, NPR, government, and education domains, and label each result as `Supportive`, `Opposing`, or `Neutral` based on the source's actual stance.

The interface prioritizes opposing sources in the displayed list so contradictory evidence is not buried by a larger set of supportive results. At higher scores, the experience leads with corroborating sources; at lower scores, it leads with challenging sources.

**Trust requirement:** source labels must be auditable. A URL alone is insufficient if the title, publication date, source quality, and relationship to the specific claim are unclear. This is a major area for product iteration.

### F5. Challenge Argument

Challenge Argument is an on-demand second pass. It receives the existing claims and summary, then searches for evidence supporting the opposing view and generates one coherent steel-manned counter-perspective of approximately 27-33 words, with up to five reasoning sources.

This is a strong product decision for both UX and economics:

- the user gets a useful initial result quickly;
- deeper analysis is opt-in, so it does not slow every interaction;
- the product creates a memorable behavior trigger: challenge the argument before sharing it;
- the second call creates a natural boundary for future usage limits or premium value.

The PRD describes three counter-arguments, while the current implementation returns one coherent counter-perspective paragraph. The current behavior should be treated as the source of truth for the MVP; the three-argument format can remain a tested future variant rather than an undocumented promise.

### F6. Report export and sharing

The extension stores the current analysis and optional challenge result in `chrome.storage.local`, opens a dedicated report page, and uses the browser print flow to support PDF export. The report includes the analyzed page, score, summary, sources, and challenge evidence.

The PRD and deck also describe a public Supabase-backed report URL. The current web app implements the `/report/:id` route and Supabase read surface, while the active extension share button currently opens the local print report rather than creating a public record. This is an important product-state distinction: public sharing is architected but not fully connected in the current extension flow.

### F7. Landing and acquisition surface

The React web app includes a landing page with a product demo mockup, feature explanation, pricing sections, and calls to add PRISM to Chrome. The deck's launch strategy uses the product output as acquisition: journalists and media critics publish or share real analyses, and every report can become a distribution object.

## Technology Stack

| Area | Technology | Role |
|---|---|---|
| Browser product | Chrome Extension Manifest V3 | Permissions, side panel, content script, service worker, storage. |
| Extension UI | HTML, CSS, vanilla JavaScript | Lightweight popup/side-panel experience and local report renderer. |
| Web app | React 18, React DOM | Landing page and public report UI. |
| Routing | React Router 6 | `/` landing route and `/report/:id` report route. |
| AI reasoning | Anthropic Claude Messages API | Claim extraction, scoring, summarization, source interpretation, and challenge generation. |
| Retrieval | Brave Search API | Live web search results used as evidence inputs to Claude. |
| Persistence | Supabase / PostgreSQL | Planned and partially implemented report storage and public retrieval. |
| Local persistence | `chrome.storage.local` | Temporary report payload used by the print/export page. |
| Build/configuration | Node.js build script, Vite | Injects extension configuration and bundles the web app. |
| Visual system | Nunito, custom CSS, Feather-style inline SVG icons | Brand and interaction consistency across extension and web report. |

## APIs and Contracts

### Anthropic Messages API

The extension sends a user message to `https://api.anthropic.com/v1/messages` with:

- model: `claude-sonnet-4-6` in the current implementation;
- a bounded token budget of 2,048 tokens per call;
- a custom `web_search` tool definition;
- page title, URL, and capped page text;
- optional image URL blocks for X/Twitter content.

The service worker runs an agentic loop. Claude can request multiple searches in one turn, the extension executes those searches in parallel, and the resulting tool outputs are sent back for synthesis. The loop is capped at two turns for analysis and three for challenge, followed by a forced JSON synthesis when necessary.

### Brave Search API

Requests use the web search endpoint with a query and a result count of five. The response is normalized to title, URL, description, and page age before being returned to Claude.

This is a retrieval layer, not a truth layer. Search ranking, snippets, source duplication, stale pages, and inaccessible pages all affect output quality. Future versions should add source normalization, deduplication, publication date checks, and claim-to-source citations.

### Extension message API

The extension separates browser orchestration from AI work through runtime messages:

| Message | Sender | Receiver | Contract |
|---|---|---|---|
| `EXTRACT_TEXT` | Side panel | Content script | Returns text, title, URL, platform, and optional image URLs. |
| `ANALYZE` | Side panel | Service worker | Sends page content and metadata; returns the primary analysis JSON. |
| `CHALLENGE` | Side panel | Service worker | Sends prior claims and summary plus context; returns counter-perspective JSON. |
| `keepalive` / `PING` | Side panel | Service worker | Keeps the MV3 worker available during long-running API work. |

### Analysis response contract

The current primary response is:

```json
{
  "claims": ["Claim one", "Claim two"],
  "verifiability_score": 74,
  "verifiability_description": "One sentence explaining the score.",
  "sources": [
    {
      "url": "https://example.com/article",
      "title": "Source headline",
      "label": "Supportive"
    }
  ],
  "summary": "A short neutral summary."
}
```

The challenge response is intentionally smaller:

```json
{
  "summary": "A coherent, steel-manned counter-perspective.",
  "sources": [
    {
      "url": "https://example.com/evidence",
      "title": "Evidence headline",
      "label": "Reasoning"
    }
  ]
}
```

The code retains compatibility with an older split-source schema containing `verification_sources` and `counter_sources`. That backward compatibility is useful for cached results, but a production API should version and validate the contract rather than rely on UI fallbacks.

### Supabase data model

The intended `reports` table contains:

```sql
reports (
  id UUID PRIMARY KEY,
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
  created_at TIMESTAMP
)
```

The public web route looks up one record by UUID and renders the report. For a real launch, the schema should also capture `analysis_version`, source metadata, model metadata, latency, product plan, consent state, and abuse controls.

## Software Layers and Architecture

```text
Presentation layer
  Chrome side panel | Local print report | React landing/report web app
             |
Orchestration layer
  popup.js | content.js messaging | background service worker
             |
Content layer
  DOM extraction | semantic selectors | X post/image extraction | text caps
             |
Intelligence layer
  Claude analysis loop | structured prompts | JSON parsing | challenge pass
             |
Retrieval layer
  Brave Search API | parallel tool execution | result normalization
             |
Persistence layer
  chrome.storage.local | Supabase reports table | public UUID route
             |
Configuration and delivery
  .env.local | Node build injection | Vite web build | Chrome MV3 manifest
```

### Runtime sequence

1. The reader opens the PRISM side panel through the Chrome action.
2. `popup.js` identifies the active tab and requests `EXTRACT_TEXT`.
3. `content.js` extracts visible page content, or targets the primary X post and images.
4. `popup.js` sends an `ANALYZE` message to the background service worker.
5. The service worker calls Claude with the page context and a `web_search` tool.
6. Claude requests batched Brave searches; the service worker executes them in parallel.
7. Claude returns structured JSON; the service worker sends it back to the side panel.
8. The side panel renders the score, summary, and sources.
9. If selected, `CHALLENGE` performs a second, narrower research pass using the first result as context.
10. Export stores the report in local Chrome storage and opens `report.html` for printing.

### Architectural strengths

- **Low-friction surface:** the extension is close to the user's decision moment.
- **Clear separation of concerns:** extraction, orchestration, retrieval, AI synthesis, and rendering are distinct modules.
- **Latency-aware AI design:** parallel search calls and a deferred challenge pass reduce the perceived cost of analysis.
- **Graceful platform handling:** the content script has semantic extraction, SPA waiting, and user-facing errors.
- **Multiple distribution surfaces:** local PDF output and a React report experience support sharing and future SEO/discovery.

### Architectural weaknesses and launch risks

1. **Secret exposure.** API calls currently originate in the extension, and the web app configuration references a Supabase secret key. Browser-distributed code cannot protect provider secrets. Production calls should move behind an authenticated backend or Supabase Edge Function with rate limits and server-side key storage.
2. **Search-grounding risk.** Claude is asked to label evidence, but the system does not independently verify that a source supports the claim it is attached to.
3. **Score explainability.** The score is generated by the model from qualitative factors without a transparent scoring rubric or calibration dataset.
4. **Public-report privacy and abuse.** Public UUID reports need retention rules, deletion, abuse reporting, rate limits, and a decision about whether page content or only analysis output is stored.
5. **Contract drift.** The PRD, pitch deck, and implementation differ on counter-argument count, model naming, and sharing behavior. Product documentation should define a single release contract.
6. **Platform brittleness.** X and Instagram DOM selectors can break without notice, so extraction telemetry and selector tests are essential.

## Product Teardown

### What is compelling

**1. It targets a behavior, not an abstract problem.** "Challenge the argument" is a concrete action that can happen before sharing. That is easier to design and measure than a broad goal such as fighting misinformation.

**2. The intervention is well-timed.** The side panel preserves the user's context and reduces the cost of checking. The product can win even when its output is imperfect if it causes more deliberate reading.

**3. The two-pass architecture is a strong MVP tradeoff.** Fast analysis provides immediate value; deeper counter-perspective work is user-triggered and can be reserved for users who need it.

**4. Shared output can become the growth loop.** A journalist's report is both a useful artifact and a demonstration of the product. This supports the deck's seeding strategy better than generic paid acquisition would.

**5. The positioning avoids partisan alignment.** Separating verifiability from political leaning gives PRISM a chance to earn trust across viewpoints, provided the evidence model matches the promise.

### What needs tightening

**The score risks becoming a verdict.** A colored number is memorable, but users may interpret it as objective truth. The product should show the score's factors, evidence coverage, uncertainty, and the claims that most influenced the rating.

**"Neutral" is a high bar.** Neutrality is not achieved by asking an LLM to be neutral. It requires prompt discipline, source diversity, evaluation sets, disagreement review, and visible distinctions between model synthesis and source fact.

**The source UI should be more claim-centric.** A list of articles is useful, but the user needs to know which source supports or challenges which claim and why. Claim-to-source mapping would create more trust than a generic source feed.

**The sharing story is currently split.** Local PDF export and public web reports solve different jobs. The team should decide whether the primary share action is a downloadable artifact, a public URL, or both, then measure each separately.

**The product needs a reason to return.** One-off analysis is valuable, but habit formation needs history, saved topics, weekly review, source literacy feedback, or a personal calibration view. The deck's Pro history dashboard and future account layer are logical retention features.

## Product Strategy

### MVP strategy

The MVP should optimize for a single repeatable loop:

```text
Analyze -> inspect evidence -> challenge the frame -> make a better sharing decision
```

The first release should prioritize:

1. reliable extraction on ordinary articles and X posts;
2. fast, readable analysis with transparent source links;
3. a useful challenge interaction;
4. report export and public sharing that work consistently;
5. instrumentation of latency, completion, source clicks, challenge usage, and repeat use.

Authentication, deepfake detection, broad platform expansion, and team analytics should wait until the core loop shows that users return and change behavior.

### Prioritization framework

| Priority | Investment | Why |
|---|---|---|
| P0 | Move provider calls behind a secure backend | Required before meaningful public distribution. |
| P0 | Validate and version the analysis schema | Prevents UI drift and makes report persistence reliable. |
| P0 | Add claim-to-source evidence and confidence metadata | Directly improves trust in the core promise. |
| P0 | Instrument analysis funnel and failure states | Establishes whether the product changes behavior, not just whether it renders. |
| P1 | Connect public report creation and sharing | Turns analyses into durable, distributable product artifacts. |
| P1 | Add account-backed history | Creates retention and supports the Pro plan. |
| P1 | Add source quality and recency signals | Makes the score interpretable and more actionable. |
| P2 | Team dashboards for newsrooms, NGOs, and schools | Expands monetization after individual value is proven. |
| P2 | Instagram/TikTok support and image/deepfake analysis | Broadens reach but increases extraction, moderation, and evaluation complexity. |

### Monetization model

The pitch deck proposes a freemium funnel:

| Plan | Proposed audience | Proposed value |
|---|---|---|
| Starter: free | Curious readers | Limited analyses with full core functionality. |
| Pro: EUR5/month | Journalists, researchers, daily readers | 50 analyses/month and personal history. |
| Teams: EUR20/seat/month | Newsrooms, NGOs, schools | Unlimited team access, shared history, usage analytics, and collective tracking. |

The most defensible paid boundary is not basic access to a score. It is sustained workflow value: history, exports, higher limits, saved research, collaboration, and administrative controls. Usage limits should count expensive operations separately if the challenge pass has materially higher cost.

### Go-to-market strategy

The deck's three-phase launch is coherent with the product's distribution mechanics:

1. **Seed:** give approximately 50 journalists and media critics free access, learn from their real workflows, and use their outputs as proof.
2. **Launch:** recruit credible reviews and creator demonstrations that show the product analyzing live content.
3. **Scale:** offer education or newsroom access, publish recurring verifiability reports, and make PRISM a reference people cite.

The key strategic metric is not raw installs. It is the rate at which a shared report causes a new user to analyze their own content, followed by repeat use. This links acquisition to product value.

## Metrics and Evaluation

### North Star candidate

**Completed evidence-informed challenges per active reader per week.**

This combines meaningful usage with the product's differentiator: the reader did more than view a score; they engaged with evidence and an opposing perspective.

### Funnel metrics

| Funnel stage | Metric |
|---|---|
| Acquisition | Install-to-first-analysis rate; report-link click-to-install rate. |
| Activation | Analysis completion rate; time to first result; source click-through rate. |
| Behavior | Challenge Argument adoption; export/share rate; pre-share usage where measurable. |
| Retention | Weekly returning analyzers; analyses per active user; history revisit rate. |
| Quality | Extraction failure rate; malformed JSON rate; source availability; user-reported issue rate. |
| Trust | Score explanation helpfulness; source relevance rating; disagreement/appeal rate. |
| Economics | Cost per analysis; challenge-pass attach rate; free-to-Pro conversion; team expansion. |

### Evaluation plan

Before treating the score as a product KPI, create a labeled evaluation set across politics, health, science, economics, and opinion content. Test:

- claim extraction completeness and precision;
- source relevance and stance-label accuracy;
- source diversity and recency;
- score calibration against expert judgments;
- counter-argument quality and non-strawman rate;
- latency and cost by page type.

Human review is especially important for politically sensitive claims, where a fluent answer can still be misleading through omission, framing, or weak source selection.

## Roadmap

### Phase 1: Trustworthy MVP

- Secure the AI and database boundaries.
- Stabilize article and X extraction.
- Ship a single validated analysis contract.
- Add claim-to-source mapping and clear score methodology.
- Connect public report sharing and measure the full funnel.

### Phase 2: Habit and retention

- Add optional accounts and analysis history.
- Let users revisit, compare, and export prior reports.
- Introduce lightweight feedback: source relevance, score helpfulness, and challenge usefulness.
- Add usage limits and Pro billing only after cost and retention are understood.

### Phase 3: Institutional workflow

- Build team workspaces, shared report libraries, role-based access, and usage analytics.
- Provide educator and newsroom templates for consistent verification practice.
- Offer admin controls, retention policies, and audit trails.

### Phase 4: Platform expansion

- Expand extraction to Instagram and TikTok only with platform-specific quality monitoring.
- Add image/deepfake analysis as a separate evaluated capability, not an implicit extension of text verifiability.
- Consider mobile support once the desktop behavior loop and economics are established.

## Portfolio Takeaways

PRISM is a useful product management case because it sits at the intersection of trust, AI UX, browser distribution, and behavior change. The strongest decisions are the in-context surface, two-stage analysis architecture, explicit opposing evidence, and report-based growth loop.

The central product lesson is that a credible trust product must be designed as a system, not a prompt. The interface, retrieval layer, source policy, scoring model, privacy model, evaluation process, and monetization boundary all shape whether users believe and use the result. PRISM's next level is therefore not simply adding more AI features; it is making the evidence chain more inspectable, the security model production-ready, and the behavior impact measurable.
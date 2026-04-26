/**
 * background.js — Prism Service Worker
 *
 * Two separate Claude calls for speed + cost:
 *
 *  ANALYZE  (fast path)
 *    • Extracts claims, score, description, sources, summary
 *    • Counter-arguments excluded — deferred to CHALLENGE
 *    • MAX_TURNS = 2, pageText cap = 3 000 chars
 *
 *  CHALLENGE  (on-demand path, only when user clicks "Challenge Argument")
 *    • Generates 3 steel-manned counter-arguments with backing sources
 *    • Uses existing claims + summary from ANALYZE as context
 *    • MAX_TURNS = 2
 *
 * SECURITY NOTE:
 *   API key is in the extension bundle. Before public launch, route
 *   all Claude calls through a Supabase Edge Function or backend proxy.
 */

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const CLAUDE_API_KEY = ''; // TODO: load from secure backend — never hardcode here
const BRAVE_API_KEY  = 'BSATS77nWJLhg5pHZ1hurr2Y8rDANko';
const CLAUDE_MODEL   = 'claude-sonnet-4-6';

// Token budgets — tighter for main call since we're skipping counter-args
const MAX_TOKENS_ANALYZE   = 2048;
const MAX_TOKENS_CHALLENGE = 2048;

// Agentic loop caps
const MAX_TURNS_ANALYZE   = 2;  // batch searches in turn 1, return JSON in turn 2
const MAX_TURNS_CHALLENGE = 3;  // turn 1: searches, turn 2: optional follow-up, turn 3: JSON

// Hard cap on page text sent to Claude
const PAGE_TEXT_CAP = 3000;

// ─── TOOLS ────────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'web_search',
    description:
      'Search the web for current, real sources. Prefer Reuters, AP, BBC, NPR, .gov, .edu sources.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query. Be specific. Include key names, dates, or topics.',
        },
      },
      required: ['query'],
    },
  },
];

// ─── PROMPTS ───────────────────────────────────────────────────────────────────

/**
 * ANALYZE PROMPT — fast path. No counter-arguments.
 * Instructs Claude to batch ALL searches in a single tool-use response.
 *
 * When analyzing an X/Twitter post, images are included as multimodal blocks
 * before this text prompt, so Claude can visually inspect embedded photos.
 */
const ANALYZE_PROMPT = `You are Prism, a neutral fact-analysis AI. Analyze the provided web page content and return structured JSON. If images are included, analyze them as part of the content.

EFFICIENCY: Issue ALL your web_search calls in a single response (multiple tool_use blocks at once). Do NOT search sequentially — batch every query together in one turn to minimize latency.

ANALYSIS STEPS:
1. Extract the 3–5 most significant factual or argumentative claims. Be concise, no editorializing.
2. Assign a verifiability score (0–100): consider claim verifiability, inferred source quality, balance of evidence, recency.
3. Write ONE sentence explaining why the content received that score.
4. Use web_search to find 4–6 sources relevant to the claims. Search for BOTH corroborating AND contradicting evidence — do not only search for confirmatory sources.
5. For each source found, read its title, description, and URL carefully. Assign a label based on the source's ACTUAL stance toward the claims:
   - "Supportive" — the source genuinely corroborates or confirms the primary claims
   - "Opposing"   — the source directly contradicts, challenges, or refutes the primary claims
   - "Neutral"    — the source provides relevant context but neither clearly supports nor refutes

   CRITICAL: Scale the distribution of labels based on your verifiability score:
   - Score 0–39 (Disputed):  majority should be "Opposing" or "Neutral" (at least 2–3 Opposing sources)
   - Score 40–69 (Contested): balanced mix — at least 1–2 "Opposing" or "Neutral" sources
   - Score 70–99 (Verified):  mostly "Supportive", but include at least 1 "Neutral" source
   - Score 100:              all sources may be "Supportive"

   Do NOT assign all sources the same label. The label must reflect the source's actual content, not a default.

6. Write a neutral summary in at most 37 words. It must end at a sentence boundary — do not stop mid-sentence.

RULES:
- Be neutral and methodological, never ideological
- Score = verifiability, not political leaning
- Search all queries in one batched tool-use turn
- Return ONLY valid JSON matching the schema below. No markdown fences, no explanation.

REQUIRED OUTPUT SCHEMA:
{
  "claims": ["claim 1", "claim 2", "claim 3"],
  "verifiability_score": 74,
  "verifiability_description": "One sentence explaining the score.",
  "sources": [
    { "url": "https://...", "title": "Source headline", "label": "Supportive" },
    { "url": "https://...", "title": "Source headline", "label": "Opposing" },
    { "url": "https://...", "title": "Source headline", "label": "Neutral" }
  ],
  "summary": "Neutral summary of the content in ≤50 words."
}`;

/**
 * CHALLENGE PROMPT — on-demand, only when user clicks "Challenge Argument".
 * Receives the existing claims + summary as context so it doesn't re-analyze.
 */
const CHALLENGE_PROMPT = `You are Prism. Write a single, coherent counter-perspective paragraph on the content below.

EFFICIENCY: Issue ALL web_search calls in ONE batched response (multiple tool_use blocks). Do NOT search sequentially.

STEPS:
1. Read the provided claims and summary.
2. In ONE tool-use turn, run 3–5 web searches to find real evidence for the opposing view.
3. Write ONE coherent paragraph (27–33 words max) that steel-mans the strongest opposing perspective. Write it as a reasonable, thoughtful person who disagrees would argue — no strawmen.
4. List up to 5 real sources (found via web_search) that back up this counter-perspective. Label all as "Reasoning".

RULES:
- The paragraph must be complete and self-contained — do not cut off mid-sentence
- Sources must be real URLs discovered via web_search
- Return ONLY valid JSON. No markdown fences, no explanation text.

REQUIRED OUTPUT SCHEMA:
{
  "summary": "One coherent counter-perspective paragraph (27–33 words, ends at a sentence boundary).",
  "sources": [
    { "url": "https://...", "title": "Source headline", "label": "Reasoning" }
  ]
}`;

// ─── BRAVE SEARCH ──────────────────────────────────────────────────────────────
async function executeWebSearch(query) {
  if (!BRAVE_API_KEY || BRAVE_API_KEY.startsWith('TODO')) {
    return JSON.stringify({ note: 'Web search not configured.', results: [] });
  }

  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_API_KEY,
      },
    });

    if (!response.ok) throw new Error(`Brave API error: ${response.status}`);

    const data = await response.json();
    const results = (data.web?.results || []).slice(0, 5).map(r => ({
      title:       r.title,
      url:         r.url,
      description: r.description || '',
      published:   r.page_age    || '',
    }));

    return JSON.stringify(results);
  } catch (err) {
    console.error('[Prism] Search error:', err);
    return JSON.stringify({ error: err.message, results: [] });
  }
}

// ─── CLAUDE AGENTIC LOOP ───────────────────────────────────────────────────────
/**
 * Generic agentic loop. Runs up to maxTurns rounds of tool use,
 * then forces a final synthesis call if Claude hasn't returned JSON yet.
 *
 * @param {object[]} messages   - Initial messages array
 * @param {number}   maxTurns   - Max tool-use rounds before forced synthesis
 * @param {number}   maxTokens  - Max tokens for each call
 */
async function runAgenticLoop(messages, maxTurns, maxTokens) {
  for (let turn = 0; turn < maxTurns; turn++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':                          'application/json',
        'x-api-key':                             CLAUDE_API_KEY,
        'anthropic-version':                     '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model:      CLAUDE_MODEL,
        max_tokens: maxTokens,
        tools:      TOOLS,
        messages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    console.log(`[Prism] Turn ${turn + 1} stop_reason:`, data.stop_reason);

    if (data.stop_reason === 'end_turn') {
      const textBlock = data.content.find(c => c.type === 'text');
      if (textBlock) return JSON.parse(extractJSON(textBlock.text));
      break; // No text — fall through to synthesis
    }

    if (data.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: data.content });

      // Execute ALL search blocks from this turn in parallel for speed
      const searchPromises = data.content
        .filter(b => b.type === 'tool_use' && b.name === 'web_search')
        .map(async b => {
          console.log(`[Prism] web_search: "${b.input.query}"`);
          return {
            type:        'tool_result',
            tool_use_id: b.id,
            content:     await executeWebSearch(b.input.query),
          };
        });

      const toolResults = await Promise.all(searchPromises);
      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    break; // max_tokens or other stop reason — fall through
  }

  // Forced synthesis — Claude must return text (no tools)
  messages.push({
    role: 'user',
    content: 'You have completed your research. Now compile everything into the final JSON response. Return ONLY the raw JSON object — no markdown fences, no explanation.',
  });

  const finalRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':                          'application/json',
      'x-api-key':                             CLAUDE_API_KEY,
      'anthropic-version':                     '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model:      CLAUDE_MODEL,
      max_tokens: maxTokens,
      // No tools — must return text
      messages,
    }),
  });

  if (!finalRes.ok) {
    const errBody = await finalRes.text();
    throw new Error(`Claude API error ${finalRes.status}: ${errBody}`);
  }

  const finalData = await finalRes.json();
  const textBlock = finalData.content.find(c => c.type === 'text');
  if (!textBlock) throw new Error('Claude returned no text content');

  return JSON.parse(extractJSON(textBlock.text));
}

// ─── ANALYZE (fast main call) ──────────────────────────────────────────────────
/**
 * @param {string}   pageText
 * @param {string}   pageTitle
 * @param {string}   pageUrl
 * @param {string[]} [imageUrls]  — Optional. When present (e.g. X/Twitter posts),
 *                                  constructs a multimodal message so Claude can
 *                                  analyze embedded images alongside the text.
 */
async function callClaudeAnalyze(pageText, pageTitle, pageUrl, imageUrls) {
  const textPrompt = [
    ANALYZE_PROMPT,
    '',
    '---',
    `PAGE TITLE: ${pageTitle}`,
    `PAGE URL: ${pageUrl}`,
    '',
    'PAGE CONTENT:',
    pageText.slice(0, PAGE_TEXT_CAP),
  ].join('\n');

  // Build multimodal content array when images are available (X/Twitter posts)
  let userContent;
  if (imageUrls && imageUrls.length > 0) {
    // Cap at 4 images to keep token cost reasonable
    const imageBlocks = imageUrls.slice(0, 4).map(url => ({
      type: 'image',
      source: { type: 'url', url },
    }));
    userContent = [
      ...imageBlocks,
      { type: 'text', text: textPrompt },
    ];
  } else {
    userContent = textPrompt;
  }

  return runAgenticLoop(
    [{ role: 'user', content: userContent }],
    MAX_TURNS_ANALYZE,
    MAX_TOKENS_ANALYZE,
  );
}

// ─── CHALLENGE (on-demand counter-argument call) ────────────────────────────────
async function callClaudeChallenge(pageText, pageTitle, pageUrl, claims, summary) {
  const claimsText = Array.isArray(claims) ? claims.map((c, i) => `${i + 1}. ${c}`).join('\n') : '';

  const userMessage = [
    CHALLENGE_PROMPT,
    '',
    '---',
    `PAGE TITLE: ${pageTitle}`,
    `PAGE URL: ${pageUrl}`,
    '',
    'PREVIOUSLY EXTRACTED CLAIMS:',
    claimsText,
    '',
    'PREVIOUS SUMMARY:',
    summary || '',
    '',
    'PAGE CONTENT (for additional context):',
    pageText.slice(0, PAGE_TEXT_CAP),
  ].join('\n');

  return runAgenticLoop(
    [{ role: 'user', content: userMessage }],
    MAX_TURNS_CHALLENGE,
    MAX_TOKENS_CHALLENGE,
  );
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function extractJSON(text) {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) return text.slice(start, end + 1);
  return text.trim();
}

// ─── SIDE PANEL INIT ──────────────────────────────────────────────────────────
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// ─── KEEPALIVE PORT ────────────────────────────────────────────────────────────
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keepalive') {
    port.onMessage.addListener((msg) => {
      if (msg.type === 'PING') port.postMessage({ type: 'PONG' });
    });
  }
});

// ─── MESSAGE LISTENER ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

  if (message.type === 'ANALYZE') {
    const { pageText, pageTitle, pageUrl, imageUrls } = message;
    callClaudeAnalyze(pageText, pageTitle, pageUrl, imageUrls)
      .then(result => sendResponse({ ok: true, result }))
      .catch(err => {
        console.error('[Prism] ANALYZE failed:', err);
        sendResponse({ ok: false, error: err.message });
      });
    return true; // Keep channel open for async response
  }

  if (message.type === 'CHALLENGE') {
    const { pageText, pageTitle, pageUrl, claims, summary } = message;
    callClaudeChallenge(pageText, pageTitle, pageUrl, claims, summary)
      .then(result => sendResponse({ ok: true, result }))
      .catch(err => {
        console.error('[Prism] CHALLENGE failed:', err);
        sendResponse({ ok: false, error: err.message });
      });
    return true; // Keep channel open for async response
  }
});

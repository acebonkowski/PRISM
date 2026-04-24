/**
 * popup.js — Prism Popup Controller
 *
 * FLOW:
 *  1. Open → show Start Screen
 *  2. "Analyze" click → show Loading Screen → call ANALYZE → show Results
 *  3. Loading "X" → cancel, return to Start Screen
 *  4. "Challenge Argument" click → mini-load → call CHALLENGE → show counter-args
 *  5. Share icon → POST to Supabase → show link
 */

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MAX_SUMMARY_CHARS = 200;

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const startScreen    = document.getElementById('start-screen');
const loadingScreen  = document.getElementById('loading-screen');
const errorState     = document.getElementById('error-state');
const resultsScreen  = document.getElementById('results');

const analyzeBtn     = document.getElementById('analyze-btn');
const cancelBtn      = document.getElementById('cancel-btn');
const errorBackBtn   = document.getElementById('error-back-btn');
const errorMessage   = document.getElementById('error-message');

const scoreNumber    = document.getElementById('score-number');
const scoreLabel     = document.getElementById('score-label');
const scoreFill      = document.getElementById('score-fill');
const summaryText    = document.getElementById('summary-text');

const verifiedToggle = document.getElementById('verified-toggle');
const verifiedBody   = document.getElementById('verified-body');
const sourcesList    = document.getElementById('sources-list');

const counterargSection = document.getElementById('counterarg-section');
const counterargToggle  = document.getElementById('counterarg-toggle');
const counterargBody    = document.getElementById('counterarg-body');
const counterargLoading = document.getElementById('counterarg-loading');
const counterArgsList   = document.getElementById('counter-args-list');

const challengeBtn   = document.getElementById('challenge-btn');
const shareBtn       = document.getElementById('share-btn');

// ─── STATE ────────────────────────────────────────────────────────────────────
let analysisResult   = null;
let challengeResult  = null;   // populated after "Challenge Argument" completes
let currentPageUrl   = '';
let currentPageTitle = '';
let currentPageText  = '';
let analysisCancelled = false;
let keepalivePort    = null;
let keepaliveTimer   = null;
let loadingTextTimer = null;

// ─── LOADING TEXT CYCLE ───────────────────────────────────────────────────────
const LOADING_PHRASES = ['Scanning...', 'Digging...', 'Thinking...', 'Contemplating...', 'Questioning...'];
const loadingTitleEl        = document.getElementById('loading-title');
const counterargLoadingTitle = document.getElementById('counterarg-loading-title');

// Generic per-element text cycler — returns a stop function
function createLoadingTextCycle(el) {
  if (!el) return () => {};
  let idx = 0;
  el.textContent    = LOADING_PHRASES[0];
  el.style.opacity  = '1';
  const timer = setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % LOADING_PHRASES.length;
      el.textContent   = LOADING_PHRASES[idx];
      el.style.opacity = '1';
    }, 250);
  }, 2000);
  return () => {
    clearInterval(timer);
    el.style.opacity = '1';
    el.textContent   = LOADING_PHRASES[0];
  };
}

let stopLoadingTextFn       = null;
let stopCounterargTextFn    = null;

function startLoadingText() {
  stopLoadingTextFn = createLoadingTextCycle(loadingTitleEl);
}

function stopLoadingText() {
  if (stopLoadingTextFn) { stopLoadingTextFn(); stopLoadingTextFn = null; }
}

function startCounterargLoadingText() {
  stopCounterargTextFn = createLoadingTextCycle(counterargLoadingTitle);
}

function stopCounterargLoadingText() {
  if (stopCounterargTextFn) { stopCounterargTextFn(); stopCounterargTextFn = null; }
}

// ─── SCREEN MANAGEMENT ────────────────────────────────────────────────────────
function showScreen(screen) {
  [startScreen, loadingScreen, errorState, resultsScreen].forEach(s => {
    s.classList.add('hidden');
  });
  screen.classList.remove('hidden');
}

// ─── KEEPALIVE (keeps MV3 service worker alive during long API calls) ─────────
function startKeepalive() {
  if (keepalivePort) return;
  try {
    keepalivePort = chrome.runtime.connect({ name: 'keepalive' });
    keepaliveTimer = setInterval(() => {
      try { keepalivePort.postMessage({ type: 'PING' }); } catch {}
    }, 20000);
  } catch {}
}

function stopKeepalive() {
  clearInterval(keepaliveTimer);
  keepaliveTimer = null;
  if (keepalivePort) {
    try { keepalivePort.disconnect(); } catch {}
    keepalivePort = null;
  }
}

// ─── BUTTON HANDLERS ──────────────────────────────────────────────────────────

analyzeBtn.addEventListener('click', startAnalysis);

cancelBtn.addEventListener('click', () => {
  analysisCancelled = true;
  stopKeepalive();
  stopLoadingText();
  showScreen(startScreen);
});

errorBackBtn.addEventListener('click', () => {
  showScreen(startScreen);
});

// ─── MAIN ANALYSIS FLOW ───────────────────────────────────────────────────────
async function startAnalysis() {
  analysisCancelled = false;
  showScreen(loadingScreen);
  startKeepalive();
  startLoadingText();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('Could not identify the active tab.');

    currentPageUrl   = tab.url   || '';
    currentPageTitle = tab.title || '';

    // Extract page text via content.js (inject on-demand if not yet loaded)
    let extractionResult;
    try {
      extractionResult = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_TEXT' });
    } catch {
      try {
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
        extractionResult = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_TEXT' });
      } catch {
        throw new Error('Could not read this page. Try a regular web page or article.');
      }
    }

    // content.js surfaces a friendly error for X pages that aren't posts
    if (extractionResult?.error) {
      throw new Error(extractionResult.error);
    }

    if (!extractionResult?.text || extractionResult.text.trim().length < 50) {
      throw new Error('Not enough text found on this page to analyze.');
    }

    currentPageText = extractionResult.text;

    if (analysisCancelled) return;

    // Call background.js for the FAST main analysis (no counter-args)
    // imageUrls is present only for X/Twitter posts — background.js uses it
    // to build a multimodal Claude message for visual analysis of tweet photos.
    const response = await chrome.runtime.sendMessage({
      type:      'ANALYZE',
      pageText:  currentPageText,
      pageTitle: extractionResult.title || currentPageTitle,
      pageUrl:   extractionResult.url   || currentPageUrl,
      imageUrls: extractionResult.imageUrls || [],
    });

    if (analysisCancelled) return;
    if (!response?.ok) throw new Error(response?.error || 'Analysis failed — please try again.');

    analysisResult = response.result;
    renderResults(analysisResult);
    showScreen(resultsScreen);

  } catch (err) {
    if (!analysisCancelled) showError(err.message);
  } finally {
    stopKeepalive();
    stopLoadingText();
  }
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

function renderResults(data) {
  try { renderScore(data.verifiability_score); }        catch(e) { console.error('Score:', e); }
  try { renderSummary(data.summary); }                  catch(e) { console.error('Summary:', e); }

  // Support new unified sources array AND legacy split arrays (old cached results)
  const sources = data.sources
    || [
        ...(data.verification_sources || []).map(s => ({ ...s, label: s.label || 'Supportive' })),
        ...(data.counter_sources      || []).map(s => ({ ...s, label: s.label || 'Opposing'   })),
       ];
  try { renderSources(sources, data.verifiability_score); } catch(e) { console.error('Sources:', e); }
}

function renderScore(score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));

  // Category names + colors per design spec
  let color, label;
  if (s >= 70)      { color = '#3471CE'; label = 'Verified';   }
  else if (s >= 40) { color = '#7B6EF6'; label = 'Contested';  }
  else              { color = '#8B1A2F'; label = 'Disputed';   }

  scoreNumber.textContent = s;
  scoreNumber.style.color = color;
  // /100 denom gets same color as the number
  const denomEl = scoreNumber.nextElementSibling;
  if (denomEl) denomEl.style.color = color;
  scoreLabel.textContent  = label;
  scoreLabel.style.color  = color;
  scoreFill.style.background = color;

  requestAnimationFrame(() => {
    scoreFill.style.width = `${s}%`;
  });
}

/**
 * Injects expandable text into `el`. If the text fits within MAX_SUMMARY_CHARS
 * it is set as plain text. Otherwise a truncated preview + "Read more" link is
 * shown; clicking expands to full text and swaps to a "Show less" link.
 */
function renderExpandable(el, text) {
  if (!text) return;
  const trimmed = text.trim();

  if (trimmed.length <= MAX_SUMMARY_CHARS) {
    el.textContent = trimmed;
    return;
  }

  // Find a clean sentence boundary for the preview
  const cut = trimmed.slice(0, MAX_SUMMARY_CHARS);
  const lastBoundary = Math.max(
    cut.lastIndexOf('.'),
    cut.lastIndexOf('!'),
    cut.lastIndexOf('?'),
  );
  const preview = lastBoundary > cut.length * 0.5
    ? cut.slice(0, lastBoundary + 1)
    : cut + '…';

  function showCollapsed() {
    el.innerHTML =
      `${escapeHtml(preview)} ` +
      `<a class="read-more-link" href="#" role="button">Read more</a>`;
    el.querySelector('.read-more-link').addEventListener('click', (e) => {
      e.preventDefault();
      showExpanded();
    });
  }

  function showExpanded() {
    el.innerHTML =
      `${escapeHtml(trimmed)} ` +
      `<a class="read-more-link" href="#" role="button">Show less</a>`;
    el.querySelector('.read-more-link').addEventListener('click', (e) => {
      e.preventDefault();
      showCollapsed();
    });
  }

  showCollapsed();
}

function renderSummary(summary) {
  renderExpandable(summaryText, summary);
}

// Opposing sources rank first so high-profile contradicting evidence is never
// crowded out by a larger number of supportive results from Claude.
const STANCE_RANK = { opposing: 0, neutral: 1, supportive: 2 };

/**
 * Selects the ≤5 sources shown to the user.
 * Sorts Opposing → Neutral → Supportive before capping so a prominent
 * contradicting source is always included when Claude found one.
 */
function selectSources(rawSources, score) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));

  let all = (rawSources || []).map(src => ({
    ...src,
    stance: src.label || src.stance || 'Neutral',
  }));

  all.sort((a, b) => {
    const ar = STANCE_RANK[(a.stance || '').toLowerCase()] ?? 1;
    const br = STANCE_RANK[(b.stance || '').toLowerCase()] ?? 1;
    return ar - br;
  });

  all = all.slice(0, 5);

  // Fallback: guarantee at least one non-Supportive when score < 100
  if (s < 100 && all.length > 0 && all.every(src => src.stance.toLowerCase() === 'supportive')) {
    all[all.length - 1] = { ...all[all.length - 1], stance: 'Neutral' };
  }

  return all;
}

function renderSources(sources, score) {
  const all = selectSources(sources, score);

  if (!all.length) {
    sourcesList.innerHTML = '<li class="source-item"><span class="source-domain">No sources found</span></li>';
    return;
  }

  sourcesList.innerHTML = all.map(renderSourceItem).join('');
}

function renderSourceItem(source) {
  const domain = getDomain(source.url);
  const stance = (source.stance || 'neutral').toLowerCase();
  const badgeClass = ['supportive', 'opposing', 'neutral', 'reasoning'].includes(stance)
    ? stance : 'neutral';
  // Capitalize first letter of badge label (e.g. "reasoning" → "Reasoning")
  const badgeLabel = (source.stance || source.label || 'Neutral')
    .replace(/^\w/, c => c.toUpperCase());

  // Row 1: pill (left) + domain link (right) — domain is the clickable hyperlink
  // Row 2: plain title text (not a link)
  return `
    <li class="source-item">
      <div class="source-meta-row">
        <span class="source-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
        <a class="source-domain-link" href="${escapeAttr(source.url)}"
           target="_blank" rel="noopener noreferrer">${escapeHtml(domain)}</a>
      </div>
      <p class="source-title">${escapeHtml(source.title || 'Untitled source')}</p>
    </li>
  `;
}

// ─── COLLAPSIBLE SECTIONS ─────────────────────────────────────────────────────

function setupCollapsible(toggleBtn, body) {
  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    body.classList.toggle('is-collapsed', isExpanded);
  });
}

setupCollapsible(verifiedToggle,   verifiedBody);
setupCollapsible(counterargToggle, counterargBody);

// ─── CHALLENGE ARGUMENT (on-demand second API call) ───────────────────────────
challengeBtn.addEventListener('click', async () => {
  if (!analysisResult) return;

  // Hide the button entirely once clicked — replaced by counterargument section
  challengeBtn.closest('.challenge-wrap').classList.add('hidden');
  counterargSection.classList.remove('hidden');
  counterargLoading.classList.remove('hidden');
  counterArgsList.classList.add('hidden');
  startCounterargLoadingText();

  // Ensure section is expanded
  counterargToggle.setAttribute('aria-expanded', 'true');
  counterargBody.classList.remove('is-collapsed');

  // Smooth scroll to it
  setTimeout(() => counterargSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);

  startKeepalive();
  try {
    const response = await chrome.runtime.sendMessage({
      type:      'CHALLENGE',
      pageText:  currentPageText,
      pageTitle: currentPageTitle,
      pageUrl:   currentPageUrl,
      // Pass existing analysis so Claude has context without re-extracting claims
      claims:    analysisResult.claims,
      summary:   analysisResult.summary,
    });

    if (!response?.ok) throw new Error(response?.error || 'Challenge failed — please try again.');

    // Store for PDF export, then render
    challengeResult = response.result;
    renderCounterArguments(challengeResult);

  } catch (err) {
    counterArgsList.innerHTML = `
      <p class="counter-summary" style="color: var(--red-wine)">${escapeHtml(err.message)}</p>`;
  } finally {
    stopCounterargLoadingText();
    counterargLoading.classList.add('hidden');
    counterArgsList.classList.remove('hidden');
    stopKeepalive();
  }
});

/**
 * Renders the challenge result.
 * New schema: { summary: string, sources: Array }
 * Also handles legacy array format gracefully.
 */
function renderCounterArguments(data) {
  let summaryStr = '';
  let sources    = [];

  if (data && !Array.isArray(data)) {
    // New schema: { summary, sources }
    summaryStr = data.summary || '';
    sources    = (data.sources || []).slice(0, 5);
  } else if (Array.isArray(data)) {
    // Legacy fallback: array of { argument, sources[] } objects
    summaryStr = data.map(a => typeof a === 'object' ? a.argument : a).join(' ');
    sources    = data.flatMap(a => typeof a === 'object' ? (a.sources || []) : []).slice(0, 5);
  }

  if (!summaryStr && !sources.length) {
    counterArgsList.innerHTML = '<p class="counter-summary">No counter-arguments found.</p>';
    return;
  }

  const sourcesHtml = sources.length
    ? `<ul class="sources-list counter-sources-list">
        ${sources.map(s => renderSourceItem({ ...s, stance: 'reasoning' })).join('')}
       </ul>`
    : '';

  counterArgsList.innerHTML = `
    ${summaryStr ? `<p class="counter-summary js-counter-summary"></p>` : ''}
    ${sourcesHtml}
  `;

  if (summaryStr) {
    renderExpandable(counterArgsList.querySelector('.js-counter-summary'), summaryStr);
  }
}

// ─── EXPORT PDF ───────────────────────────────────────────────────────────────
shareBtn.addEventListener('click', async () => {
  if (!analysisResult) return;

  // Brief spinning-logo loading state
  const originalHTML = shareBtn.innerHTML;
  shareBtn.disabled = true;
  shareBtn.innerHTML =
    '<img src="icons/prism-color.svg" class="logo-spin-sm" alt="" style="width:20px;height:20px;" />';

  // Build the same source list the sidebar showed — sorted & capped at 5
  const rawSources = analysisResult.sources
    || [
        ...(analysisResult.verification_sources || []).map(s => ({ ...s, label: s.label || 'Supportive' })),
        ...(analysisResult.counter_sources      || []).map(s => ({ ...s, label: s.label || 'Opposing'   })),
       ];
  const displayedSources = selectSources(rawSources, analysisResult.verifiability_score);

  await chrome.storage.local.set({
    prismReport: {
      pageUrl:         currentPageUrl,
      pageTitle:       currentPageTitle,
      analysisResult:  { ...analysisResult, sources: displayedSources },
      challengeResult,
      analyzedAt:      new Date().toISOString(),
    },
  });

  chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });

  setTimeout(() => {
    shareBtn.disabled  = false;
    shareBtn.innerHTML = originalHTML;
  }, 800);
});

// ─── ERROR DISPLAY ────────────────────────────────────────────────────────────
function showError(msg) {
  errorMessage.textContent = msg || 'Something went wrong.';
  showScreen(errorState);
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url || ''; }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
showScreen(startScreen);

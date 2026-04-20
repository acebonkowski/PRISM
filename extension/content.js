/**
 * content.js — Content Script
 *
 * ROLE IN DATA FLOW:
 *   Step 2 of 7. Runs in the context of every webpage the user visits.
 *   Listens for a "EXTRACT_TEXT" message from popup.js, extracts the
 *   visible page text, and returns it.
 *
 * WHY A CONTENT SCRIPT?
 *   The popup and background service worker cannot directly access the
 *   DOM of a webpage. Only a content script (which runs inside the
 *   page's context) can read document.body.innerText.
 *
 * X (TWITTER) / INSTAGRAM / DYNAMIC DOM:
 *   For SPA pages, content may load after the initial document_idle event.
 *   We use a MutationObserver to wait for substantial content to appear.
 *
 *   X/Twitter posts: targeted extraction using data-testid attributes
 *   plus image URL collection for multimodal Claude analysis.
 */

// ─── CONFIG ────────────────────────────────────────────────────────────────
const MAX_CHARS = 4000; // ~1000 tokens — keeps Claude API cost predictable
const SPA_WAIT_MS = 2000; // How long to wait for dynamic content to load

// ─── X (TWITTER) EXTRACTION ───────────────────────────────────────────────

/**
 * Returns true if the current page is an X/Twitter post permalink.
 * Pattern: x.com/<handle>/status/<id>
 */
function isXPostPage() {
  const { hostname, pathname } = window.location;
  return (
    (hostname === 'x.com' || hostname === 'www.x.com' ||
     hostname === 'twitter.com' || hostname === 'www.twitter.com') &&
    /\/[^/]+\/status\/\d+/.test(pathname)
  );
}

/**
 * Returns true if the current page is on x.com / twitter.com at all.
 */
function isXDomain() {
  const { hostname } = window.location;
  return (
    hostname === 'x.com' || hostname === 'www.x.com' ||
    hostname === 'twitter.com' || hostname === 'www.twitter.com'
  );
}

/**
 * Extracts tweet text and image URLs from an X/Twitter post permalink.
 *
 * @returns {{ platform: "twitter", text: string, imageUrls: string[] }}
 * @throws {Error} if no tweet article is found on the page
 */
function extractXPost() {
  // Grab all tweet articles — the first one is the primary post on a permalink
  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  if (!articles.length) {
    throw new Error('No tweet found. Navigate to a specific post to analyze it.');
  }

  const article = articles[0];

  // ── Text ──────────────────────────────────────────────────────────────────
  const textNodes = article.querySelectorAll('[data-testid="tweetText"]');
  const text = Array.from(textNodes)
    .map(el => el.innerText.trim())
    .filter(Boolean)
    .join('\n\n')
    .slice(0, MAX_CHARS);

  // ── Images ────────────────────────────────────────────────────────────────
  // Filter out profile images and small icons — keep only tweet photo CDN URLs
  const imageUrls = Array.from(article.querySelectorAll('img'))
    .map(img => img.src)
    .filter(src =>
      src &&
      !src.includes('profile_images') &&   // avatars
      !src.includes('emoji')               // emoji images
    )
    // Deduplicate (srcset sometimes causes duplicates)
    .filter((src, i, arr) => arr.indexOf(src) === i);

  return { platform: 'twitter', text, imageUrls };
}

// ─── GENERIC EXTRACTION ───────────────────────────────────────────────────

/**
 * Extracts meaningful text from the page, preferring semantic article
 * containers over raw body text to reduce noise (nav, footer, ads).
 */
function extractPageText() {
  // Priority 1: try standard article/main content containers
  const contentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.article-body',
    '.story-body',
    // Instagram-specific selectors
    'div[data-testid="post-container"]',
    '._a9zs', // Instagram caption class (may change — check periodically)
  ];

  for (const selector of contentSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText && el.innerText.trim().length > 200) {
      return el.innerText.trim().slice(0, MAX_CHARS);
    }
  }

  // Priority 2: fall back to full body text, minus script/style noise
  const bodyText = document.body.innerText || '';
  return bodyText.trim().slice(0, MAX_CHARS);
}

/**
 * For SPAs, the feed content renders asynchronously after initial page load.
 * Waits up to SPA_WAIT_MS ms for at least 200 characters of meaningful text.
 *
 * @returns {Promise<string>} Resolved page text
 */
function extractWithSPAFallback() {
  return new Promise((resolve) => {
    const text = extractPageText();

    // If we already have substantial content, return immediately
    if (text.length > 200) {
      resolve(text);
      return;
    }

    // Otherwise, watch for DOM mutations (SPA content loading)
    const observer = new MutationObserver(() => {
      const newText = extractPageText();
      if (newText.length > 200) {
        observer.disconnect();
        resolve(newText);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Hard timeout — don't wait forever if content never loads
    setTimeout(() => {
      observer.disconnect();
      resolve(extractPageText());
    }, SPA_WAIT_MS);
  });
}

/**
 * For X/Twitter post pages: waits up to SPA_WAIT_MS for the tweet article
 * to appear in the DOM (the page is a SPA and renders asynchronously).
 *
 * @returns {Promise<{ platform: "twitter", text: string, imageUrls: string[] }>}
 */
function extractXPostWithFallback() {
  return new Promise((resolve, reject) => {
    // Try immediately first
    try {
      const result = extractXPost();
      if (result.text.length > 0) {
        resolve(result);
        return;
      }
    } catch {}

    // Watch for the tweet article to appear
    const observer = new MutationObserver(() => {
      const article = document.querySelector('article[data-testid="tweet"]');
      if (article) {
        observer.disconnect();
        try {
          resolve(extractXPost());
        } catch (err) {
          reject(err);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      try {
        resolve(extractXPost());
      } catch (err) {
        reject(err);
      }
    }, SPA_WAIT_MS);
  });
}

// ─── MESSAGE LISTENER ──────────────────────────────────────────────────────

/**
 * Listens for messages from popup.js.
 * IMPORTANT: Returning `true` is required to keep the message channel
 * open for async responses.
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_TEXT') {

    // ── X / Twitter ─────────────────────────────────────────────────────────
    if (isXDomain()) {
      if (!isXPostPage()) {
        sendResponse({
          text: '',
          title: document.title,
          url: window.location.href,
          error: 'Navigate to a specific post to analyze it.',
        });
        return true;
      }

      extractXPostWithFallback()
        .then(({ platform, text, imageUrls }) => {
          sendResponse({
            text,
            title: document.title,
            url: window.location.href,
            platform,
            imageUrls,
          });
        })
        .catch(err => {
          sendResponse({
            text: '',
            title: document.title,
            url: window.location.href,
            error: err.message,
          });
        });

      return true;
    }

    // ── Generic / all other pages ────────────────────────────────────────────
    extractWithSPAFallback().then((text) => {
      sendResponse({
        text,
        title: document.title,
        url: window.location.href,
      });
    });

    return true;
  }
});

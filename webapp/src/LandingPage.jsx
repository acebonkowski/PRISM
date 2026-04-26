import React, { useState, useEffect, useRef, useId } from 'react';
import './landing.css';

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

function useHeaderDark() {
  const [dark, setDark] = useState(true); // hero is dark, so start true
  useEffect(() => {
    const check = () => {
      const y = 34; // midpoint of the 68px header
      let isDark = false;
      document.querySelectorAll('[data-header-dark]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) isDark = true;
      });
      setDark(isDark);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, []);
  return dark;
}

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.unobserve(el); }
    }, { threshold: 0.3, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ─── Prism Logo (actual brand mark) ───────────────────────────────────────────
function PrismIcon({ size = 28 }) {
  const uid = useId().replace(/:/g, '');
  const h = Math.round(size * 140 / 127);
  return (
    <svg width={size} height={h} viewBox="0 0 127 140" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`pg${uid}`} x1="63.2842" y1="0" x2="63.2842" y2="139.38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5899F4" />
          <stop offset="1" stopColor="#A9A7FF" />
        </linearGradient>
      </defs>
      <path
        d="M126.568 34.8447V104.535L63.2842 139.38L0 104.535V34.8447L63.2842 0L126.568 34.8447ZM14.5586 101.135L58.3076 125.224V77.9727L14.5586 101.135ZM68.3076 125.197L112.026 101.125L68.3076 78.4385V125.197ZM10 92.2324L52.0195 69.9854L10 48.1807V92.2324ZM73.5596 69.8975L116.568 92.2158V47.1279L73.5596 69.8975ZM13.5889 38.7773L58.3076 61.9824V14.1543L13.5889 38.7773ZM68.3076 61.3633L111.993 38.2344L68.3076 14.1807V61.3633Z"
        fill={`url(#pg${uid})`}
      />
    </svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  const scrolled = useScrolled(40);
  const dark = useHeaderDark();
  const [open, setOpen] = useState(false);

  return (
    <header className={`l-header${scrolled ? ' l-header--scrolled' : ''}${dark ? ' l-header--dark' : ' l-header--light'}`}>
      <div className="l-header__inner l-container">

        <a href="/" className="l-logo">
          <PrismIcon size={26} />
          <span className="l-logo__text">Prism</span>
        </a>

        <nav className={`l-nav${open ? ' l-nav--open' : ''}`}>
          <a href="#"           className="l-nav__link" onClick={() => setOpen(false)}>Home</a>
          <a href="#how-it-works" className="l-nav__link" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#features"   className="l-nav__link" onClick={() => setOpen(false)}>Features</a>
          <a href="#pricing"    className="l-nav__link" onClick={() => setOpen(false)}>Pricing</a>
        </nav>

        <button className="l-hamburger" aria-label="Toggle menu" onClick={() => setOpen(o => !o)}>
          <span /><span /><span />
        </button>

      </div>
    </header>
  );
}

// ─── Animated Extension Mockup ────────────────────────────────────────────────
const MOCKUP_SOURCES = [
  { stance: 'Opposing',   cls: 'opposing',   domain: 'politico.com', title: "Voters aren't buying the summit success story" },
  { stance: 'Neutral',    cls: 'neutral',    domain: 'apnews.com',   title: 'What the deal means for global energy policy' },
  { stance: 'Supportive', cls: 'supportive', domain: 'reuters.com',  title: 'UN confirms 1.5°C target remains achievable' },
];

function ExtensionMockup() {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const ref = { timers: [] };
    const cycle = () => {
      ref.timers.forEach(clearTimeout);
      setPhase('idle');
      ref.timers = [
        setTimeout(() => setPhase('hovering'), 1000),
        setTimeout(() => setPhase('clicking'),  1900),
        setTimeout(() => setPhase('loading'),   2400),
        setTimeout(() => setPhase('results'),   3700),
        setTimeout(cycle,                       8800),
      ];
    };
    cycle();
    return () => ref.timers.forEach(clearTimeout);
  }, []);

  const isIdle    = phase === 'idle' || phase === 'hovering' || phase === 'clicking';
  const isLoading = phase === 'loading';
  const isResults = phase === 'results';

  return (
    <div className="l-mockup">
      <div className="l-mockup__browser">
        <div className="l-mockup__browser-bar">
          <div className="l-mockup__dots"><span /><span /><span /></div>
          <div className="l-mockup__url">nytimes.com/climate-summit-2025</div>
        </div>

        <div className="l-mockup__page">
          {/* Article skeleton — always visible */}
          <div className="l-mockup__article">
            <div className="l-mockup__article-title" />
            {[92, 85, 78, 90, 65, 80, 72, 88, 60].map((w, i) => (
              <div key={i} className="l-mockup__article-line" style={{ width: `${w}%` }} />
            ))}
          </div>

          {/* Animated side panel */}
          <div className="l-mockup__panel">
            <div className="l-panel-topbar">
              <PrismIcon size={13} />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B9DC3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </div>

            {/* Phase: idle — show Analyze button + animated cursor */}
            {isIdle && (
              <div className="l-panel-idle">
                <div className="l-analyze-wrap">
                  <button className={`l-panel-analyze${phase === 'clicking' ? ' l-panel-analyze--pressed' : ''}`}>
                    <PrismIcon size={11} />
                    Analyze
                  </button>
                  <div className={`l-cursor l-cursor--${phase}`}>
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                      <path d="M1 1L1 14L5.2 10.2L7.8 16.5L10.2 15.5L7.5 9.2L13.8 9.2L1 1Z" fill="#0F1B35" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Phase: loading */}
            {isLoading && (
              <div className="l-panel-loading">
                <div className="l-panel-loading__icon">
                  <PrismIcon size={38} />
                </div>
                <p className="l-panel-loading__title">Thinking...</p>
              </div>
            )}

            {/* Phase: results */}
            {isResults && (
              <div className="l-panel-results">
                <p className="l-res-score" style={{ '--d': '0ms' }}>74/100</p>
                <p className="l-res-verdict" style={{ '--d': '80ms' }}>Verified</p>
                <div className="l-panel-bar l-res-bar" style={{ '--d': '160ms' }}>
                  <div className="l-panel-bar__fill" style={{ width: '74%' }} />
                </div>
                <p className="l-res-summary" style={{ '--d': '240ms' }}>
                  Claims backed by peer-reviewed data. Minor disputes among signatories on enforcement mechanisms.
                </p>
                <p className="l-res-read-more" style={{ '--d': '300ms' }}>Read more</p>
                <div className="l-res-sources-hdr" style={{ '--d': '340ms' }}>
                  <div className="l-res-sources-hdr__left">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    VERIFIED BY
                  </div>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </div>
                {MOCKUP_SOURCES.map((s, i) => (
                  <div key={s.domain} className="l-res-source" style={{ '--d': `${420 + i * 90}ms` }}>
                    <div className="l-res-source__row">
                      <span className={`l-panel-badge l-panel-badge--${s.cls}`}>{s.stance}</span>
                      <span className="l-res-source__domain">{s.domain}</span>
                    </div>
                    <p className="l-res-source__title">{s.title}</p>
                  </div>
                ))}
                <button className="l-res-challenge" style={{ '--d': '700ms' }}>
                  Challenge Argument
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="l-hero" data-header-dark>
      <div className="l-container l-hero__inner">

        <div className="l-hero__text">
          <h1 className="l-hero__headline">
            You read the news.<br />But are you reading<br />the whole story?
          </h1>
          <p className="l-hero__sub">
            Prism is a one-click Chrome extension that instantly analyzes any article or post, surfacing a verifiability score, credible counter-evidence, and the strongest opposing argument. Without ever leaving the page.
          </p>
          <div className="l-hero__ctas">
            <a href="https://chrome.google.com/webstore" className="l-btn l-btn--primary l-btn--lg" target="_blank" rel="noopener noreferrer">
              Add to Chrome – It's Free
            </a>
            <a href="#how-it-works" className="l-btn l-btn--outline l-btn--lg">
              How It Works
            </a>
          </div>
        </div>

        <div className="l-hero__visual">
          <ExtensionMockup />
        </div>

      </div>
    </section>
  );
}

// ─── Problem Bar ──────────────────────────────────────────────────────────────
function ProblemBar() {
  return (
    <div className="l-problem-bar" data-header-dark>
      <div className="l-container l-pb-inner">
        <div className="l-pb-stat">
          <span className="l-pb-stat__num">6×</span>
          <span className="l-pb-stat__label">faster spread</span>
        </div>
        <div className="l-pb-content">
          <p className="l-pb-body">
            Most fact-checkers require you to already be skeptical — and to leave the page.{' '}
            <strong className="l-pb-highlight">Prism fixes both.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    title: 'Install Prism',
    desc: 'Add the free Chrome extension in seconds. Works on any news site, blog, or social media post.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Click the icon',
    desc: 'Hit the Prism icon on any article or post. Analysis loads in under 8 seconds — no new tab, no manual searching.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Read the full picture',
    desc: 'Get a verifiability score, extracted claims, real sources, and the strongest counter-argument. Share the report or keep reading smarter.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
];

function HowItWorks() {
  return (
    <section className="l-section l-how" id="how-it-works">
      <div className="l-container">
        <h2 className="l-section__title">Three clicks. Full picture.</h2>
        <div className="l-steps">
          {STEPS.map(step => (
            <div className="l-step" key={step.n}>
              <div className="l-step__icon">{step.icon}</div>
              <div className="l-step__n">{step.n}</div>
              <h3 className="l-step__title">{step.title}</h3>
              <p className="l-step__desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Score Ring (animates on scroll entry) ────────────────────────────────────
function ScoreRing({ score = 74 }) {
  const [ref, inView] = useInView();
  const r    = 38;
  const circ = 2 * Math.PI * r;
  const offset = inView ? circ * (1 - score / 100) : circ;

  return (
    <div className="l-score-ring-wrap" ref={ref}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(37,99,235,0.14)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none" stroke="#2563EB" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50px 50px',
            transition: inView ? 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none',
          }}
        />
      </svg>
      <div className="l-score-ring-center">
        <span className="l-score-ring-num">{score}</span>
        <span className="l-score-ring-lbl">Verified</span>
      </div>
    </div>
  );
}

// ─── Features — 4 consolidated cards ─────────────────────────────────────────
const FEATURES = [
  {
    label: 'Verifiability Score',
    title: 'Verifiability Score',
    desc: 'Every article gets a 0–100 score with a plain-language explanation and color-coded verdict. Results load in under 8 seconds — no tab switching, no manual searching. Just signal.',
    visual: <ScoreRing score={74} />,
  },
  {
    label: 'Challenge Argument',
    title: 'Challenge Argument',
    desc: 'An on-demand AI pass that steel-mans the strongest opposing perspective — written as a reasonable, intelligent person who disagrees would argue. Backed by 3–5 real sourced links.',
    visual: (
      <div className="l-feat-visual l-feat-visual--counter">
        <div className="l-feat-counter-header">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M1 8.5L6 11L11 8.5M1 6L6 8.5L11 6M6 1L1 3.5L6 6L11 3.5L6 1Z" stroke="#818CF8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Counterargument
        </div>
        <p className="l-feat-counter-body">
          Critics argue the proposed emissions timeline is politically compromised and underestimates industrial lobbying power in key signatory nations.
        </p>
        <div className="l-feat-counter-source">
          <span className="l-panel-badge l-panel-badge--reasoning">Reasoning</span>
          <span style={{ fontSize: 11, color: '#8B9DC3' }}>theguardian.com</span>
        </div>
      </div>
    ),
  },
  {
    label: 'Source & Summary',
    title: 'Source & Summary',
    desc: 'Live web searches surface real supporting, opposing, and neutral sources — each labeled and linked. Plus a concise, editorially neutral 40-word summary that cuts through framing before you even start reading.',
    visual: (
      <div className="l-feat-visual">
        {[
          { stance: 'Supportive', badgeCls: 'supportive', domain: 'reuters.com',  title: 'UN climate body confirms 1.5°C target achievable' },
          { stance: 'Opposing',   badgeCls: 'opposing',   domain: 'wsj.com',      title: 'Economists warn carbon targets may stifle growth' },
          { stance: 'Neutral',    badgeCls: 'neutral',    domain: 'apnews.com',   title: 'What the new climate deal means for energy policy' },
        ].map(s => (
          <div className="l-feat-source" key={s.domain}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span className={`l-panel-badge l-panel-badge--${s.badgeCls}`}>{s.stance}</span>
              <span style={{ fontSize: 11, color: '#8B9DC3' }}>{s.domain}</span>
            </div>
            <p style={{ fontSize: 11, color: '#0F1B35', lineHeight: 1.5 }}>{s.title}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Share & Export',
    title: 'Share & Export',
    desc: 'One click exports the full analysis — score, summary, sources, counter-argument — as a shareable link or print-ready PDF. Every report gets a unique public URL so you can send context, not just opinions.',
    visual: (
      <div className="l-feat-visual" style={{ alignItems: 'center' }}>
        <div className="l-feat-url">prism.app/report/a3f9b2</div>
        <p style={{ fontSize: 12, color: '#8B9DC3', marginTop: 10 }}>Unique public URL · Print-ready PDF</p>
      </div>
    ),
  },
];

function Features() {
  return (
    <section className="l-section l-features" id="features">
      <div className="l-container">
        <h2 className="l-section__title">Everything you need to read critically.</h2>
        <p className="l-section__sub">Prism runs a full analysis in one click — here's what you get.</p>
        <div className="l-features__grid">
          {FEATURES.map(f => (
            <div className="l-feature-card" key={f.label}>
              <div className="l-feature-card__visual">{f.visual}</div>
              <div className="l-feature-card__label">{f.label}</div>
              <h3 className="l-feature-card__title">{f.title}</h3>
              <p className="l-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    tagline: 'For curious readers',
    features: ['3 analyses per week', 'Full feature access', 'Analysis history (with account)'],
    cta: 'Add to Chrome — Free',
    href: 'https://chrome.google.com/webstore',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€5',
    period: '/month',
    tagline: 'For journalists, researchers, and daily readers',
    features: ['50 analyses per month', 'Full feature access', 'Personal history dashboard', 'Priority analysis speed'],
    cta: 'Start Pro',
    href: '#',
    highlight: true,
  },
  {
    name: 'Teams',
    price: '€20',
    period: '/seat/month',
    tagline: 'For newsrooms, NGOs, and universities',
    features: ['Unlimited analyses', 'Team dashboard + shared history', 'Usage analytics', 'Collective analysis tracking'],
    cta: 'Contact Us',
    href: 'mailto:hello@prism.app',
    highlight: false,
  },
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function Pricing() {
  return (
    <section className="l-section l-pricing" id="pricing" data-header-dark>
      <div className="l-container">
        <h2 className="l-section__title">Start free. Go deeper when you need it.</h2>
        <div className="l-pricing__grid">
          {PLANS.map(plan => (
            <div className={`l-plan${plan.highlight ? ' l-plan--highlight' : ''}`} key={plan.name}>
              {plan.highlight && <div className="l-plan__badge">Most Popular</div>}
              <div className="l-plan__header">
                <h3 className="l-plan__name">{plan.name}</h3>
                <div className="l-plan__price-row">
                  <span className="l-plan__price">{plan.price}</span>
                  {plan.period && <span className="l-plan__period">{plan.period}</span>}
                </div>
                <p className="l-plan__tagline">{plan.tagline}</p>
              </div>
              <ul className="l-plan__features">
                {plan.features.map(f => (
                  <li key={f}><CheckIcon />{f}</li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`l-btn l-btn--full${plan.highlight ? ' l-btn--primary' : ' l-btn--outline'}`}
                target={plan.href.startsWith('http') ? '_blank' : undefined}
                rel={plan.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
        <p className="l-pricing__fine">No credit card required for Starter. Cancel Pro anytime.</p>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="l-final-cta">
      <div className="l-container l-final-cta__inner">
        <h2 className="l-final-cta__headline">
          The news isn't going to slow down.<br />Your reading should.
        </h2>
        <p className="l-final-cta__sub">Add Prism to Chrome in 30 seconds. Free to start.</p>
        <a href="https://chrome.google.com/webstore" className="l-btn l-btn--primary l-btn--lg" target="_blank" rel="noopener noreferrer">
          Add to Chrome — It's Free
        </a>
        <p className="l-final-cta__meta">
          Works on Chrome · No account required to start · Supports any news site or social platform
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="l-footer" data-header-dark>
      <div className="l-container">
        <div className="l-footer__grid">

          <div className="l-footer__col l-footer__brand">
            <a href="/" className="l-logo">
              <PrismIcon size={22} />
              <span className="l-logo__text">Prism</span>
            </a>
            <p className="l-footer__tagline">"Read the whole story."</p>
            <p className="l-footer__mission">
              We're building tools for epistemic clarity in a polarized information landscape.
            </p>
          </div>

          <div className="l-footer__col">
            <h4 className="l-footer__col-title">Product</h4>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">Chrome Web Store →</a></li>
            </ul>
          </div>

          <div className="l-footer__col">
            <h4 className="l-footer__col-title">Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog / Verifiability Reports</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div className="l-footer__col">
            <h4 className="l-footer__col-title">Legal &amp; Social</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
            <div className="l-footer__social">
              <a href="#" aria-label="X / Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

        </div>
        <div className="l-footer__bottom">
          <span>© 2025 Prism · Built with Claude API</span>
          <div>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;
    const prevColor  = body.style.color;
    html.style.background = '#EEF4FF';
    body.style.background = '#EEF4FF';
    body.style.color      = '#0F1B35';
    return () => {
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
      body.style.color      = prevColor;
    };
  }, []);

  return (
    <div className="landing-page">
      <Header />
      <main>
        <Hero />
        <ProblemBar />
        <HowItWorks />
        <Features />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

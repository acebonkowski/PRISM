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

// ─── Prism Icon ───────────────────────────────────────────────────────────────
function PrismIcon({ size = 28 }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`pg${uid}`} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#BDB4FF" />
          <stop offset="50%"  stopColor="#8B82F0" />
          <stop offset="100%" stopColor="#6156D4" />
        </linearGradient>
      </defs>
      <polygon points="14,3 2,25 26,25" fill={`url(#pg${uid})`} />
      <polygon points="14,3 2,25 14,25" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  const scrolled  = useScrolled(40);
  const [open, setOpen] = useState(false);

  return (
    <header className={`l-header${scrolled ? ' l-header--scrolled' : ''}`}>
      <div className="l-header__inner l-container">

        <a href="/" className="l-logo">
          <PrismIcon size={28} />
          <span className="l-logo__text">Prism</span>
        </a>

        <nav className={`l-nav${open ? ' l-nav--open' : ''}`}>
          <a href="#how-it-works" className="l-nav__link" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#features"     className="l-nav__link" onClick={() => setOpen(false)}>Features</a>
          <a href="#pricing"      className="l-nav__link" onClick={() => setOpen(false)}>Pricing</a>
        </nav>

        <a
          href="https://chrome.google.com/webstore"
          className="l-btn l-btn--primary"
          target="_blank" rel="noopener noreferrer"
        >
          Add to Chrome — It's Free
        </a>

        <button className="l-hamburger" aria-label="Toggle menu" onClick={() => setOpen(o => !o)}>
          <span /><span /><span />
        </button>

      </div>
    </header>
  );
}

// ─── Extension Mockup ─────────────────────────────────────────────────────────
function ExtensionMockup() {
  return (
    <div className="l-mockup">
      <div className="l-mockup__browser">

        <div className="l-mockup__browser-bar">
          <div className="l-mockup__dots"><span /><span /><span /></div>
          <div className="l-mockup__url">nytimes.com/climate-summit-2025</div>
        </div>

        <div className="l-mockup__page">
          {/* Simulated article */}
          <div className="l-mockup__article">
            <div className="l-mockup__article-title" />
            <div className="l-mockup__article-line" style={{ width: '92%' }} />
            <div className="l-mockup__article-line" style={{ width: '85%' }} />
            <div className="l-mockup__article-line" style={{ width: '78%' }} />
            <div className="l-mockup__article-line" style={{ width: '90%' }} />
            <div className="l-mockup__article-line" style={{ width: '65%' }} />
          </div>

          {/* Side panel */}
          <div className="l-mockup__panel">
            <div className="l-panel-topbar">
              <PrismIcon size={16} />
              {/* share icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9090A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </div>

            <div className="l-panel-score">
              <span className="l-panel-score__num">74</span>
              <span className="l-panel-score__denom">/100</span>
            </div>
            <span className="l-panel-score__label">Verified</span>

            <div className="l-panel-bar">
              <div className="l-panel-bar__fill" style={{ width: '74%' }} />
            </div>

            <p className="l-panel-summary">
              Claims are backed by peer-reviewed data and official UN reports with minor methodological disputes.
            </p>

            <div className="l-panel-section">
              <div className="l-panel-section__hdr">
                {/* check icon */}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0F0B3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                VERIFIED BY
              </div>
              <div className="l-panel-source">
                <span className="l-panel-badge l-panel-badge--supportive">Supportive</span>
                <span className="l-panel-domain">reuters.com</span>
              </div>
              <div className="l-panel-source">
                <span className="l-panel-badge l-panel-badge--opposing">Opposing</span>
                <span className="l-panel-domain">ft.com</span>
              </div>
              <div className="l-panel-source">
                <span className="l-panel-badge l-panel-badge--neutral">Neutral</span>
                <span className="l-panel-domain">apnews.com</span>
              </div>
            </div>

            <button className="l-panel-challenge">Challenge Argument</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="l-hero">
      <div className="l-container l-hero__inner">

        <div className="l-hero__text">
          <h1 className="l-hero__headline">
            You read the news.<br />But are you reading<br />the whole story?
          </h1>
          <p className="l-hero__sub">
            Prism is a one-click Chrome extension that instantly analyzes any article or post — surfacing a verifiability score, credible counter-evidence, and the strongest opposing argument. Without ever leaving the page.
          </p>
          <div className="l-hero__ctas">
            <a href="https://chrome.google.com/webstore" className="l-btn l-btn--primary l-btn--lg" target="_blank" rel="noopener noreferrer">
              Add to Chrome — Free
            </a>
            <a href="#how-it-works" className="l-hero__text-link">
              See how it works ↓
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
    <div className="l-problem-bar">
      <div className="l-container">
        <p className="l-problem-bar__text">
          Fake news spreads 6× faster than the truth. Most fact-checkers require you to already be skeptical — and to leave the page. Prism fixes both.
        </p>
        <span className="l-problem-bar__cite">Vosoughi et al., 2018, Science</span>
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
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(52,113,206,0.12)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none" stroke="#3471CE" strokeWidth="8"
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

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    label: 'Verifiability Score',
    title: 'Verifiability Score',
    desc: 'Every article gets a 0–100 score, a plain-language explanation of why, and a color-coded category (Verified / Contested / Disputed). No jargon. Just signal.',
    visual: <ScoreRing score={74} />,
  },
  {
    label: 'Challenge Argument',
    title: 'Challenge Argument',
    desc: 'An on-demand second AI pass that steel-mans the strongest opposing perspective — written as a reasonable, intelligent person who disagrees would argue. Backed by 3–5 real sourced links.',
    visual: (
      <div className="l-feat-visual l-feat-visual--counter">
        <div className="l-feat-counter-header">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M1 8.5L6 11L11 8.5M1 6L6 8.5L11 6M6 1L1 3.5L6 6L11 3.5L6 1Z" stroke="#7B6EF6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Counterargument
        </div>
        <p className="l-feat-counter-body">
          Critics argue the proposed emissions timeline is politically compromised and underestimates industrial lobbying power in key signatory nations.
        </p>
        <div className="l-feat-counter-source">
          <span className="l-panel-badge l-panel-badge--reasoning">Reasoning</span>
          <span style={{ fontSize: 11, color: '#9090A8' }}>theguardian.com</span>
        </div>
      </div>
    ),
  },
  {
    label: 'Source Verification',
    title: 'Source Verification',
    desc: 'Prism runs live web searches to surface real supporting or contradicting sources, labeled and linked directly in the extension. See what backs the story — and what challenges it.',
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
              <span style={{ fontSize: 11, color: '#9090A8' }}>{s.domain}</span>
            </div>
            <p style={{ fontSize: 11, color: '#0F0B3E', lineHeight: 1.5 }}>{s.title}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Neutral Summary',
    title: 'Neutral Summary',
    desc: 'A concise, editorially neutral summary of the page content in under 40 words. Cuts through framing and spin before you even read the article.',
    visual: (
      <div className="l-feat-visual">
        <p className="l-feat-summary">
          World leaders reached a binding agreement at COP30 to halve emissions by 2035, with enforcement mechanisms contested by major industrial nations.
        </p>
      </div>
    ),
  },
  {
    label: 'Share & Export',
    title: 'Share & Export',
    desc: 'One click exports the full analysis — score, summary, sources, counter-argument — as a shareable link or print-ready PDF. Every report gets a unique public URL.',
    visual: (
      <div className="l-feat-visual" style={{ alignItems: 'center' }}>
        <div className="l-feat-url">prism.app/report/a3f9b2</div>
        <p style={{ fontSize: 12, color: '#9090A8', marginTop: 10 }}>Unique public URL · Print-ready PDF</p>
      </div>
    ),
  },
  {
    label: 'Instant Analysis',
    title: 'Instant Analysis',
    desc: 'Two-stage architecture splits the main analysis from the challenge pass so initial results load in under 8 seconds. No page reload. No context switching.',
    visual: (
      <div className="l-feat-visual l-feat-visual--timing">
        <div className="l-feat-timing">
          <span className="l-feat-timing-num">8s</span>
          <span className="l-feat-timing-lbl">Initial analysis</span>
        </div>
        <div className="l-feat-timing-bar">
          <div className="l-feat-timing-fill" />
        </div>
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

// Feather check icon for plan features
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function Pricing() {
  return (
    <section className="l-section l-pricing" id="pricing">
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
    <footer className="l-footer">
      <div className="l-container">
        <div className="l-footer__grid">

          <div className="l-footer__col l-footer__brand">
            <a href="/" className="l-logo">
              <PrismIcon size={24} />
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
              {/* X / Twitter */}
              <a href="#" aria-label="X / Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* LinkedIn */}
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
    html.style.background = '#F8F8FC';
    body.style.background = '#F8F8FC';
    body.style.color      = '#0F0B3E';
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

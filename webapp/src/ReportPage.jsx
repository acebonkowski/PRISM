/**
 * ReportPage.jsx — Shareable Analysis Report
 *
 * ROLE IN DATA FLOW:
 *   Fetches a Prism analysis record from Supabase by UUID (from the URL),
 *   then renders the full analysis in the same glassmorphism visual language
 *   as the Chrome extension popup.
 *
 * ROUTE: /report/:id
 *   :id is the Supabase UUID generated when the user clicked "Share" in the extension.
 *
 * DATA SHAPE (from Supabase `reports` table — see PRD §8):
 *   {
 *     id, page_url, page_title, claims, verifiability_score,
 *     verifiability_description, verification_sources, counter_sources,
 *     counter_arguments, devils_advocate_sources, summary, created_at
 *   }
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';

// Score threshold — mirrors popup.js constant
const HIGH_SCORE_THRESHOLD = 70;

// Score ring circumference (r=80 on the larger web ring, 2 * π * 80 ≈ 502.7)
const RING_CIRCUMFERENCE = 502.7;

export default function ReportPage() {
  const { id } = useParams(); // UUID from the URL path
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── FETCH REPORT FROM SUPABASE ──────────────────────────────────────
  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)    // Match by UUID primary key
        .single();       // Expect exactly one row

      if (sbError) {
        setError(sbError.message || 'Report not found.');
      } else {
        setReport(data);
      }

      setLoading(false);
    }

    if (id) fetchReport();
  }, [id]);

  // ── RENDER STATES ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner-large" aria-label="Loading report..." />
        <p className="loading-text">Loading analysis…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="page-center">
        <div className="error-icon" aria-hidden="true">⚠</div>
        <h2 className="error-heading">Report not found</h2>
        <p className="error-body">{error || 'This link may be invalid or expired.'}</p>
      </div>
    );
  }

  // ── DERIVED VALUES ──────────────────────────────────────────────────
  const score = Math.max(0, Math.min(100, Math.round(report.verifiability_score || 0)));
  const isHighScore = score >= HIGH_SCORE_THRESHOLD;

  // Score ring color matches popup.js logic (PRD §6 F2)
  let ringColor;
  if (score >= 70)      ringColor = 'var(--blue-primary)';
  else if (score >= 40) ringColor = 'var(--periwinkle)';
  else                  ringColor = 'var(--red-wine)';

  // Animate ring via inline style — offset = circumference * (1 - score/100)
  const ringOffset = RING_CIRCUMFERENCE * (1 - score / 100);

  // Lead sources: verification for high score, counter for low score
  const leadSources  = isHighScore ? report.verification_sources : report.counter_sources;
  const sourcesLabel = isHighScore ? 'Verified by' : 'Challenged by';
  const badgeClass   = isHighScore ? 'source-badge' : 'source-badge contradicts';

  const formattedDate = report.created_at
    ? new Date(report.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '';

  // ── MAIN RENDER ─────────────────────────────────────────────────────
  return (
    <>
      {/* Background orb accent */}
      <div className="bg-orb" aria-hidden="true" />

      <main className="report-container">

        {/* ── HEADER ── */}
        <header className="report-header">
          <div className="report-branding">
            <span className="logo-mark" aria-hidden="true">⚖</span>
            <span className="logo-text">Prism</span>
          </div>
          <div className="report-meta">
            {report.page_title && (
              <h1 className="report-page-title">
                {report.page_url ? (
                  <a href={report.page_url} target="_blank" rel="noopener noreferrer">
                    {report.page_title}
                  </a>
                ) : (
                  report.page_title
                )}
              </h1>
            )}
            {formattedDate && (
              <span className="report-date">Analyzed {formattedDate}</span>
            )}
          </div>
        </header>

        {/* ── F2: SCORE SECTION ── */}
        <section className="score-section-web" aria-label="Verifiability score">
          <div className="score-ring-wrapper-web">
            <svg className="score-ring-web" viewBox="0 0 180 180" aria-hidden="true">
              {/* Track */}
              <circle className="ring-track-web" cx="90" cy="90" r="80" />
              {/* Animated arc */}
              <circle
                className="ring-arc-web"
                cx="90" cy="90" r="80"
                transform="rotate(-90 90 90)"
                style={{
                  stroke: ringColor,
                  strokeDasharray: RING_CIRCUMFERENCE,
                  strokeDashoffset: ringOffset,
                  transition: 'stroke-dashoffset 1s ease-out',
                }}
              />
            </svg>
            <div className="score-center-web">
              <span className="score-number-web">{score}</span>
              <span className="score-label-web">Verifiability</span>
            </div>
          </div>

          {report.verifiability_description && (
            <p className="score-description-web">{report.verifiability_description}</p>
          )}
        </section>

        {/* ── F1: CLAIMS ── */}
        {report.claims?.length > 0 && (
          <section className="glass-card" aria-label="Extracted claims">
            <h2 className="card-title">Key Claims</h2>
            <ul className="claims-list">
              {report.claims.map((claim, i) => (
                <li key={i}>{claim}</li>
              ))}
            </ul>
          </section>
        )}

        {/* ── F3a / F3b: SOURCES ── */}
        {leadSources?.length > 0 && (
          <section className="glass-card" aria-label="Sources">
            <h2 className="card-title">{sourcesLabel}</h2>
            <ul className="sources-list">
              {leadSources.map((src, i) => (
                <SourceItem key={i} source={src} badgeClass={badgeClass} />
              ))}
            </ul>
          </section>
        )}

        {/* ── F4: DEVIL'S ADVOCATE ── */}
        {(report.counter_arguments?.length > 0 || report.devils_advocate_sources?.length > 0) && (
          <section className="glass-card devils-card" aria-label="Devil's Advocate">
            <h2 className="card-title">
              <span aria-hidden="true">😈</span> Devil's Advocate
            </h2>

            {report.counter_arguments?.length > 0 && (
              <div>
                <h3 className="subsection-title">Counter-Arguments</h3>
                <ol className="counter-args-list">
                  {report.counter_arguments.map((arg, i) => (
                    <li key={i}>{arg}</li>
                  ))}
                </ol>
              </div>
            )}

            {report.devils_advocate_sources?.length > 0 && (
              <div>
                <h3 className="subsection-title">Evidence For These Views</h3>
                <ul className="sources-list">
                  {report.devils_advocate_sources.map((src, i) => (
                    <SourceItem key={i} source={src} badgeClass="source-badge counter-view" />
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ── SUMMARY ── */}
        {report.summary && (
          <section className="glass-card" aria-label="Summary">
            <h2 className="card-title">Summary</h2>
            <p className="summary-text">{report.summary}</p>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="report-footer">
          <p>Analyzed by <strong>Prism</strong> · AI-powered verifiability analysis</p>
          {/* TODO: Add Chrome Web Store link once published */}
        </footer>

      </main>
    </>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

/**
 * SourceItem — renders a single source card (link + domain + badge).
 * Extracted as a component because it's used in 3 sections.
 */
function SourceItem({ source, badgeClass }) {
  const domain = getDomain(source.url);

  return (
    <li className="source-item">
      <a
        className="source-link"
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {source.title || 'Untitled source'}
      </a>
      <div className="source-meta">
        <span className="source-domain">{domain}</span>
        {source.label && (
          <span className={badgeClass}>{source.label}</span>
        )}
      </div>
    </li>
  );
}

// ─── UTILS ────────────────────────────────────────────────────────────────

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url || '';
  }
}

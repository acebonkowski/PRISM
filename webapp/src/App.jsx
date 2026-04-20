/**
 * App.jsx — Root Application Component & Router
 *
 * ROLE IN DATA FLOW:
 *   Entry point for all routing. The companion web app has a single public
 *   route: /report/:id — which renders the shareable analysis report
 *   fetched from Supabase by UUID.
 *
 *   Any other path shows a simple "page not found" fallback.
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ReportPage from './ReportPage';

export default function App() {
  return (
    <Routes>
      {/* Main report route — :id is the Supabase UUID from the extension's share action */}
      <Route path="/report/:id" element={<ReportPage />} />

      {/* Root — shown if someone lands on the domain without a report ID */}
      <Route
        path="/"
        element={
          <div className="not-found">
            <h1>Prism</h1>
            <p>
              Install the{' '}
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chrome Extension
              </a>{' '}
              to start analyzing articles and posts.
            </p>
          </div>
        }
      />

      {/* Catch-all 404 */}
      <Route
        path="*"
        element={
          <div className="not-found">
            <h1>Report not found</h1>
            <p>This analysis link may have expired or the URL may be incorrect.</p>
          </div>
        }
      />
    </Routes>
  );
}

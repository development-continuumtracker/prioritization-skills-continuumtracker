import React, { useState } from 'react';
import { Logo } from './ui/Logo.jsx';
import { Drawer } from './ui/primitives.jsx';
import { PAIN_POINT_NAME, FLOWS, SHIFT, JOURNEY_DIAGRAM, CHANGES } from './data/journey.js';
import { AUDIT } from './data/audit.js';

/* Standardized "Welcome back" intro — identical across every prototype.
   Modelled on the real Continuum Tracker login + marketing hero. Only the
   pain-point name, the two flow one-liners, and the journey/audit data vary. */
export function IntroScreen({ onPick }) {
  const [showRecord, setShowRecord] = useState(false);

  return (
    <div className="welcome">
      <div className="welcome-col">
        <Logo />

        <h1>Welcome back</h1>
        <p className="welcome-sub">
          Today, <b>1&nbsp;billion+</b> products shape how people live every day—yet millions
          still lack the right solution to their needs. Build one.
        </p>

        {/* Journey selector — the app's "methods" container with two cards. */}
        <div className="methods">
          <h2 className="methods-title">Select customer journey</h2>
          <p className="methods-desc">
            Comparing the current vs. suggested journey for <b>{PAIN_POINT_NAME}</b>.
          </p>

          <div className="methods-row">
            <button className="method-card" onClick={() => onPick('current')}>
              <span className="method-badge current">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><path d="M12 8v4l2.5 1.5" />
                </svg>
                Current
              </span>
              <div className="method-title">{FLOWS.current.label}</div>
              <div className="method-desc">{FLOWS.current.desc}</div>
            </button>

            <button className="method-card" onClick={() => onPick('suggested')}>
              <span className="method-badge suggested">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
                </svg>
                Suggested
              </span>
              <div className="method-title">{FLOWS.suggested.label}</div>
              <div className="method-desc">{FLOWS.suggested.desc}</div>
            </button>
          </div>
        </div>

        {/* Centered primary button opens the record sidebar (journey + audit). */}
        <button
          className="welcome-cta"
          onClick={() => setShowRecord(true)}
          aria-expanded={showRecord}
        >
          Audit product thinking
        </button>
      </div>

      {showRecord && (
        <Drawer onClose={() => setShowRecord(false)}>
          <div className="record-drawer">
            <div className="record-head">
              <div>
                <span className="title">Records</span>
                <div className="record-signal">Signal: {PAIN_POINT_NAME}</div>
              </div>
              <button className="record-close" onClick={() => setShowRecord(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="record-body">
              {/* Part 1 — the journey (opening of the story). */}
              <div className="record-part-label">The customer journey</div>
              <pre className="journey-pre">{JOURNEY_DIAGRAM}</pre>

              <div className="shift-banner">
                <div className="shift-name">THE SHIFT — {SHIFT.name}</div>
                <div className="shift-line">{SHIFT.line}</div>
              </div>

              <div className="promo-card" style={{ borderRadius: 'var(--radius-xl)' }}>
                <div style={{ color: 'var(--welcome-title)', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
                  What changes
                </div>
                {CHANGES.map((c, i) => (
                  <div className="change-item" key={i}>
                    <span className="change-num">{i + 1}</span>
                    <div className="change-body">
                      <div className="change-title">{c.title}</div>
                      <div className="change-desc">{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Part 2 — the audit (ongoing reasoning log). */}
              <div className="record-part-label">Audit</div>
              {AUDIT.map((entry, i) => {
                const blocks = entry.blocks || [
                  { label: 'Changed', items: entry.changed },
                  { label: 'Why', items: entry.why },
                  { label: 'Data', items: entry.data },
                ];
                return (
                  <div className="audit-entry" key={i}>
                    <div className="audit-label">{entry.label}</div>
                    {entry.time && <div className="audit-time">{entry.time}</div>}
                    {blocks.map((b) =>
                      b.items && b.items.length ? (
                        <div className="audit-block" key={b.label}>
                          <div className="audit-block-label">{b.label}</div>
                          <ul className="audit-list">
                            {b.items.map((t, j) => (
                              <li key={j}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}

/* App shell — content layout under a slim prototype top-bar (name + Back-to-start +
   hide). The top-bar is the general template for every prototype flow.

   There is deliberately NO left nav menu: the prototype exists to walk one journey,
   and a sidebar of links that go nowhere is chrome that competes with it. */
import React, { useState } from 'react';
import { PAIN_POINT_NAME } from '../data/journey.js';

/* Small flow badge — same icon + label as the intro cards' badges. */
function FlowBadge({ flow }) {
  if (flow !== 'current' && flow !== 'suggested') return null;
  return (
    <span className={`proto-flow-badge ${flow}`}>
      {flow === 'current' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4l2.5 1.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
          <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
        </svg>
      )}
      {flow === 'current' ? 'Current' : 'Suggested'}
    </span>
  );
}

export function Shell({ children, onRestart, flow }) {
  const [barHidden, setBarHidden] = useState(false);

  return (
    <div className="proto-root">
      {barHidden ? (
        <div className="proto-reveal">
          <button className="proto-back" onClick={onRestart}>Back to start</button>
          <button className="proto-hide" onClick={() => setBarHidden(false)} title="Show bar" aria-label="Show bar">▾</button>
        </div>
      ) : (
        <div className="proto-topbar">
          <div className="proto-topbar-left">
            <span className="proto-topbar-name">
              {PAIN_POINT_NAME}<span className="dim"> · Prototype</span>
            </span>
            <FlowBadge flow={flow} />
          </div>
          <div className="proto-topbar-actions">
            <button className="proto-back" onClick={onRestart}>Back to start</button>
            <button className="proto-hide" onClick={() => setBarHidden(true)} title="Hide bar" aria-label="Hide bar">
              Hide ▴
            </button>
          </div>
        </div>
      )}

      <div className="app-shell">
        <main className="content">
          <div className="content-narrow">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Stepper shown at the top of each stage: Feedback → Signals → … */
export function Stepper({ steps, current }) {
  return (
    <div className="row" style={{ gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <span
            className="badge"
            style={{
              background: i === current ? 'var(--primary)' : i < current ? 'var(--accent)' : 'var(--secondary)',
              color: i === current ? '#fff' : i < current ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
            }}
          >
            {i + 1}. {s}
          </span>
          {i < steps.length - 1 && <span className="muted xsmall">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

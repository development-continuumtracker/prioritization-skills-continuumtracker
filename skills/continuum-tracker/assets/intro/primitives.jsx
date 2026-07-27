/* Shared plain-CSS primitives, as React components.
   Both flows import from here only. Do not restyle — use tokens.css / primitives.css. */
import React from 'react';

export function Button({ variant = 'primary', size, block, className = '', ...props }) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    className,
  ].filter(Boolean).join(' ');
  return <button className={cls} {...props} />;
}

export function Card({ soft, pad = true, className = '', children, ...props }) {
  const cls = [soft ? 'card-soft' : 'card', pad ? 'card-pad' : '', className].filter(Boolean).join(' ');
  return <div className={cls} {...props}>{children}</div>;
}

export function Badge({ tone = 'grey', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/** Pain-point category badge — matches the real app's PainPointBadge. */
export function PainPointBadge({ category }) {
  const map = {
    ClusterPainPoint: ['purple', 'Feedback pain point'],
    ManualPainPoint: ['blue', 'Manual pain point'],
    Recommendation: ['orange', 'Recommendation pain point'],
  };
  const [tone, label] = map[category] || ['grey', category];
  return <Badge tone={tone}>{label}</Badge>;
}

/** 0..1 score rendered as a % with a mini bar. green>=.7 / yellow .4-.69 / grey<.4 */
export function ScoreBar({ score, width }) {
  const pct = Math.round(score * 100);
  const tone = pct >= 70 ? 'green' : pct >= 40 ? 'yellow' : 'grey';
  return (
    <span className={`scorebar ${tone}`}>
      <span className="track" style={width ? { width } : undefined}>
        <span className="fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="pct">{pct}%</span>
    </span>
  );
}

/** Generic 0..100 progress bar with % label (relevance-style). */
export function ProgressPct({ value, tone = '' }) {
  return (
    <span className={`scorebar ${tone}`}>
      <span className="track"><span className="fill" style={{ width: `${value}%` }} /></span>
      <span className="pct">{value}%</span>
    </span>
  );
}

export function Confidence({ level }) {
  const map = { high: 'High confidence', med: 'Medium confidence', low: 'Low confidence' };
  return (
    <span className={`confidence ${level}`}>
      <span className="dot" />{map[level]}
    </span>
  );
}

export function Field({ label, children }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      {children}
    </div>
  );
}

export function Modal({ onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function Drawer({ onClose, children }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">{children}</div>
    </>
  );
}

/** Money formatter — compact EUR. */
export function money(n) {
  if (n == null) return '—';
  if (Math.abs(n) >= 1000) return '€' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return '€' + Math.round(n);
}

/* Classic onboarding coach-marks — spotlight + bubble anchored to elements.
   Reusable across prototypes. Steps drive the host's stage via onStep; the host
   gates first-run with localStorage (see storageKey usage in the flow). */
import React, { useEffect, useLayoutEffect, useState } from 'react';

export function OnboardingTour({ steps, run, onStep, onClose }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);

  // Restart at the first step each time a run begins.
  useEffect(() => { if (run) setI(0); }, [run]);

  const step = run ? steps[i] : null;

  // Prepare the host (e.g. switch to the step's stage) before measuring.
  useEffect(() => {
    if (step && onStep) onStep(step);
  }, [run, i]); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure the target element (after the stage has rendered / scrolled).
  useLayoutEffect(() => {
    if (!step) return;
    let cancelled = false;
    const measure = () => {
      const el = step.selector ? document.querySelector(step.selector) : null;
      if (el) {
        try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { /* noop */ }
        if (!cancelled) setRect(el.getBoundingClientRect());
      } else if (!cancelled) {
        setRect(null);
      }
    };
    const t1 = setTimeout(measure, 90);
    const t2 = setTimeout(measure, 420);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelled = true;
      clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [run, i]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!run || !step) return null;

  const last = i === steps.length - 1;
  const finish = () => onClose && onClose();
  const next = () => (last ? finish() : setI(i + 1));
  const back = () => setI(Math.max(0, i - 1));

  const PAD = 10;
  const W = 340;
  const bubbleStyle = { position: 'fixed', zIndex: 62, width: W };
  let ringStyle = null;

  if (rect) {
    ringStyle = {
      position: 'fixed', zIndex: 61, pointerEvents: 'none',
      top: rect.top - PAD, left: rect.left - PAD,
      width: rect.width + PAD * 2, height: rect.height + PAD * 2,
      borderRadius: 12, border: '2px solid var(--primary)',
      boxShadow: '0 0 0 9999px rgba(28,26,78,.5)',
    };
    const placeBelow = rect.bottom + 300 < window.innerHeight || rect.top < window.innerHeight * 0.4;
    bubbleStyle.left = Math.min(Math.max(16, rect.left), window.innerWidth - W - 16);
    if (placeBelow) bubbleStyle.top = rect.bottom + 16;
    else bubbleStyle.bottom = window.innerHeight - rect.top + 16;
  } else {
    bubbleStyle.left = '50%';
    bubbleStyle.top = '50%';
    bubbleStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <>
      {/* Click-blocker so the tour owns interaction. */}
      <div className="tour-blocker" />
      {ringStyle
        ? <div style={ringStyle} />
        : <div style={{ position: 'fixed', inset: 0, zIndex: 61, background: 'rgba(28,26,78,.5)', pointerEvents: 'none' }} />}

      <div className="tour-bubble" style={bubbleStyle}>
        <div className="tour-step">Step {i + 1} of {steps.length}</div>
        <div className="tour-title">{step.title}</div>
        <div className="tour-body">{step.body}</div>
        <div className="tour-actions">
          <button className="tour-skip" onClick={finish}>Skip</button>
          <div className="row gap-2">
            {i > 0 && <button className="btn btn-outline btn-sm" onClick={back}>Back</button>}
            <button className="btn btn-primary btn-sm" onClick={next}>{last ? 'Got it' : 'Next'}</button>
          </div>
        </div>
      </div>
    </>
  );
}

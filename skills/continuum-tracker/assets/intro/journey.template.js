/* TEMPLATE — copy to src/data/journey.js and fill each field from THIS prototype's
   deep-dive. Field → deep-dive source:
     PAIN_POINT_NAME  ← the signal's name (verbatim)
     FLOWS.*.desc     ← one sentence each of the value difference (current vs. suggested flow)
     SHIFT            ← the named shift from Chapter 2 (name + one line of what moves)
     JOURNEY_DIAGRAM  ← the three-part ASCII from Chapter 2 (TODAY → THE SHIFT → WITH), verbatim
     CHANGES          ← the numbered Steps from Chapter 2 (title = step title, desc = the detail)
   The JOURNEY_DIAGRAM below is a shape reference — keep the box/arrow style, replace the
   stages, touchpoints, ✗ (where the pain bites) and ★ (what the feature changes). */

export const PAIN_POINT_NAME = '';

export const FLOWS = {
  current: { label: 'Current user flow', desc: '' },
  suggested: { label: 'Suggested user flow', desc: '' },
};

export const SHIFT = {
  name: '',   // e.g. 'From X to Y'
  line: '',   // one line: what moves for the user
};

/* Rendered as monospace, whitespace-preserved. Keep the alignment intact. */
export const JOURNEY_DIAGRAM = `                          CUSTOMER JOURNEY — TODAY

  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
  │  Stage 1   │ → │  Stage 2   │ → │  Stage 3   │ → │  Stage 4   │
  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
        ▼                ▼                ▼                ▼
   touchpoint       touchpoint       touchpoint      ✗ pain bites here


        ╔══════════════════════════════════════════════════╗
        ║   THE SHIFT — <name>                              ║
        ║   <one line: what moves>                          ║
        ╚═══════════════════════╤══════════════════════════╝
                                ▼

                CUSTOMER JOURNEY — WITH <feature name>

  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
  │  Stage 1   │ → │  Stage 2   │ → │  Stage 3   │ → │  Stage 4   │
  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
        ▼                ▼                ▼                ▼
   touchpoint       touchpoint     ★ NEW: what      ★ the break
                                     changed          is gone`;

/* One object per numbered Step from Chapter 2: { title, desc }. */
export const CHANGES = [];

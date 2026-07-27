/* TEMPLATE — copy to src/data/audit.js and fill the first entry from THIS prototype's
   deep-dive. The FIRST entry reproduces the deep-dive results VERBATIM — the same wording,
   quotes and numbers you produced during the analysis, NOT reworded.

   Entry shape: { label, time, blocks: [{ label, items: [...] }] }
     label   — entry header, rendered h2 ("Initial analysis", later "Update 1")
     time    — absolute timestamp stamped when written (e.g. "16 Jul 2026, 09:40")
     blocks  — each { label } is an analysis-output title (h3); items are the bullets
   Do NOT repeat the pain-point name inside an entry — the Records sidebar already names it.

   First entry blocks ← the deep-dive:
     Context & goal              ← mission, vision, north star + the signal's pain_point & user_story (verbatim)
     Evidence — verbatim feedback ← each session's quote (original language + translation)
     Market research             ← the comparables (CT-corpus rows + the ones your research surfaced), names, years, match %
     Decision & plan             ← the named shift + the numbered Step 1…N

   Later versions (v2+) are opt-in: only after the founder says "add to the audit" do you
   APPEND a new { label:'Update N', time, blocks } describing what changed from a BUSINESS
   perspective (features only if the business framing alone would be repetitive). Never edit
   an earlier entry. */

export const AUDIT = [
  {
    label: 'Initial analysis',
    time: '',
    blocks: [
      { label: 'Context & goal', items: [] },
      { label: 'Evidence — verbatim feedback', items: [] },
      { label: 'Market research', items: [] },
      { label: 'Decision & plan', items: [] },
    ],
  },
];

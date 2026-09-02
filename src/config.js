/* =====================================================================
   Disconfirming but Convincing — Facial Roller Study (4 cells)
   Configuration: endpoints, stimulus copy, and measures.
   Everything a researcher would want to edit lives in this file.
   ===================================================================== */

const CONFIG = {
  studyId: "fr1",
  supabaseUrl: "https://uwrgeizwyybwtzwztrln.supabase.co",
  supabaseKey: "sb_publishable_L7a-Ve4_pt-A3MkqNpaMqg_bU5wMoxd",

  /* Seconds the article must be on screen before "Continue" unlocks. */
  minReadSeconds: 7,

  /* Shown on the completion screen. Replace with your Prolific/CloudResearch
     completion URL to redirect automatically; leave null to just show a code. */
  completionUrl: null,
  completionCode: "DBC-FR-2026"
};

/* ---------------------------------------------------------------------
   STIMULUS
   The introduction is IDENTICAL in all four conditions. Conditions differ
   only by which verdict card(s) appear beneath it.
   Both verdict cards use identical visual treatment — the only difference
   between them is the wording — so that no colour/valence cue is confounded
   with the manipulation.
   --------------------------------------------------------------------- */
const STIMULUS = {
  kicker: "Skincare",
  headline: "Do facial rollers really de-puff your face?",
  standfirst:
    "They are on every beauty shelf and in every morning routine. We looked at what they promise.",

  body: [
    "Facial rollers — the small handheld tools with a smooth stone or metal head that you glide across your cheeks, jaw, and under your eyes — have become one of the most widely sold items in skincare. They are sold in most drugstores and beauty retailers, typically for between $15 and $60.",
    "Manufacturers market them for a range of benefits, but the claim that appears most often on the packaging and in the advertising is this one:"
  ],

  claim: "Reduces facial puffiness.",

  bodyAfterClaim: [
    "The reasoning offered by manufacturers is that rolling the tool across the face moves excess fluid out of the tissue beneath the skin, so the face looks less swollen — particularly around the eyes and along the jawline first thing in the morning."
  ],

  /* The two magazines. Fictional, so that no real publication is depicted
     as having reached a verdict it never reached. Both are described
     identically, so source authority is held constant across conditions
     and across the two sources in the mixed cell. */
  sourceNames: ["Wellbeing Monthly", "The Health Review"],
  sourceTag: "Established health &amp; lifestyle magazine",

  verdict: {
    confirming: {
      eyebrow: "Our verdict",
      headline: "The claim holds up.",
      body:
        "Our editorial team put facial rollers through our standard product evaluation. Based on what we measured, facial rollers <strong>did</strong> produce a meaningful reduction in facial puffiness. We conclude that the manufacturers’ claim <strong>is supported</strong>."
    },
    disconfirming: {
      eyebrow: "Our verdict",
      headline: "The claim does not hold up.",
      body:
        "Our editorial team put facial rollers through our standard product evaluation. Based on what we measured, facial rollers <strong>did not</strong> produce a meaningful reduction in facial puffiness. We conclude that the manufacturers’ claim <strong>is not supported</strong>."
    }
  },

  sectionLabelSingle: "Independent product test",
  sectionLabelMixed: "Independent product tests"
};

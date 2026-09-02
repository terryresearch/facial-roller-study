/* =====================================================================
   Disconfirming but Convincing — Facial Roller Study (4 cells)
   Configuration: endpoints, stimulus copy, and source branding.
   Everything a researcher would want to edit lives in this file.
   ===================================================================== */

const CONFIG = {
  studyId: "fr1",
  supabaseUrl: "https://uwrgeizwyybwtzwztrln.supabase.co",
  supabaseKey: "sb_publishable_L7a-Ve4_pt-A3MkqNpaMqg_bU5wMoxd",

  /* Seconds the article must be on screen before "Continue" unlocks. */
  minReadSeconds: 7,

  /* Completion. `completionUrl` set = participants are returned automatically
     once the debrief has had time to be read; set it to null to just show the
     code. `completionCode` is the fallback shown on screen, so it must match
     the code embedded in the URL. */
  completionUrl: "https://app.prolific.com/submissions/complete?cc=CEKK0PFF",
  completionCode: "CEKK0PFF",

  /* Seconds the debrief stays on screen before the automatic return. The
     button below it returns immediately for anyone who does not want to wait. */
  completionDelaySeconds: 12
};

/* ---------------------------------------------------------------------
   STIMULUS
   The article is IDENTICAL in all four conditions. Conditions differ only
   by which verdict card(s) appear beneath it.
   --------------------------------------------------------------------- */
const STIMULUS = {
  kicker: "Skincare",

  /* Product photo, shown identically in all four conditions.
     To use a different photo, drop it in as img/roller.jpg (or change the
     path) and update `imageCredit` if the new one needs attribution. */
  image: "img/roller.jpg",
  imageAlt: "A jade facial roller: a smooth stone head at each end of a handle.",
  imageCredit:
    "Product photograph: “Face Roller” by jacobcariaga, used under CC&nbsp;BY&nbsp;2.0.",

  headline: "Do facial rollers really de-puff your face?",

  body: [
    "Facial rollers are among the best-selling items in skincare: a smooth stone head on a handle, glided across the cheeks, jaw, and under the eyes. Most sell for $15 to $60."
  ],

  claim: "Reduces facial puffiness.",

  bodyAfterClaim: [
    "Manufacturers say the rolling moves excess fluid out of the tissue beneath the skin, so the face looks less swollen."
  ],

  /* The two magazines. Fictional, so no real publication is depicted
     reaching a verdict it never reached. Both are described identically,
     so source authority is held constant.

     Each publication carries its own accent colour, the way a real masthead
     would. Because which magazine delivers which verdict is already
     counterbalanced, tying colour to the publication counterbalances
     colour against verdict automatically — no extra random factor, and
     neither hue is valence-loaded (no green = good, red = bad). */
  sources: [
    { name: "Wellbeing Monthly", theme: "indigo" },
    { name: "The Health Review", theme: "plum"   }
  ],
  sourceTag: "Established health &amp; lifestyle magazine",

  verdict: {
    confirming: {
      eyebrow: "Our verdict",
      headline: "The claim holds up.",
      body:
        "We put facial rollers through our standard product evaluation. Based on what we measured, they <strong>did</strong> produce a meaningful reduction in facial puffiness. The manufacturers’ claim <strong>is supported</strong>."
    },
    disconfirming: {
      eyebrow: "Our verdict",
      headline: "The claim does not hold up.",
      body:
        "We put facial rollers through our standard product evaluation. Based on what we measured, they <strong>did not</strong> produce a meaningful reduction in facial puffiness. The manufacturers’ claim <strong>is not supported</strong>."
    }
  },

  sectionLabelSingle: "Independent product test",
  sectionLabelMixed: "Independent product tests"
};

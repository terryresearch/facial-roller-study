/* =====================================================================
   MEASURES
   Rendered one at a time in the right-hand panel.
   `when` controls which conditions a measure is shown in.
   ===================================================================== */

const ALL   = ["control", "confirming", "disconfirming", "mixed"];
const VERDICT_CELLS = ["confirming", "disconfirming"];

const MEASURES = [

  /* ---------- PRIMARY DV: belief in the claim (0-100) ----------------
     Anchored to the claim itself, not to the article, so it is
     comparable across all four cells including control.
     Retains the 0-100 slider used in the manuscript for continuity. */
  {
    id: "likelihood",
    when: ALL,
    type: "slider100",
    eyebrow: "Question 1",
    prompt: "How likely is it that facial rollers actually reduce facial puffiness?",
    help: "Drag the slider, or click anywhere on the line, to answer.",
    leftLabel: "Very unlikely",
    rightLabel: "Very likely",
    field: "dv_likelihood"
  },

  /* ---------- Claim belief index (4 items, 7-pt) --------------------
     Semantic differential adapted from Beltramini's (1982) believability
     scale, re-anchored from the advertisement to the claim itself. */
  {
    id: "belief",
    when: ALL,
    type: "semdiff",
    eyebrow: "Question 2",
    prompt: "The claim that facial rollers reduce facial puffiness is…",
    help: "Select one box on each row.",
    items: [
      { field: "belief_believable", left: "Unbelievable",   right: "Believable" },
      { field: "belief_credible",   left: "Not credible",   right: "Credible" },
      { field: "belief_convincing", left: "Not convincing", right: "Convincing" },
      { field: "belief_true",       left: "Definitely false", right: "Definitely true" }
    ]
  },

  /* ---------- Belief certainty (2 items, 7-pt) ----------------------
     Tormala & Rucker (2018). Captures belief STRENGTH independently of
     direction — the mixed cell is expected to lower certainty even where
     it leaves the mean belief unchanged. */
  {
    id: "certainty",
    when: ALL,
    type: "likert",
    eyebrow: "Question 3",
    prompt: "Thinking about the judgment you just made…",
    help: "Select one box on each row.",
    scaleLabels: ["Not at all", "", "", "Moderately", "", "", "Extremely"],
    items: [
      { field: "certainty_certain",   text: "How <em>certain</em> are you about whether facial rollers reduce puffiness?" },
      { field: "certainty_confident", text: "How <em>confident</em> are you that your judgment is correct?" }
    ]
  },

  /* ---------- Perceived objectivity — single-verdict cells ----------
     The manuscript's own four-item objectivity index. */
  {
    id: "objectivity",
    when: VERDICT_CELLS,
    type: "semdiff",
    eyebrow: "Question 4",
    prompt: "The evaluation carried out by {SOURCE} was…",
    help: "Select one box on each row.",
    items: [
      { field: "obj_unbiased",    left: "Biased",          right: "Unbiased" },
      { field: "obj_objective",   left: "Not objective",   right: "Objective" },
      { field: "obj_independent", left: "Not independent", right: "Independent" },
      { field: "obj_impartial",   left: "Not impartial",   right: "Impartial" }
    ]
  },

  /* ---------- Perceived objectivity — mixed cell, source shown FIRST */
  {
    id: "objectivity_first",
    when: ["mixed"],
    type: "semdiff",
    eyebrow: "Question 4",
    prompt: "The evaluation carried out by {SOURCE_FIRST} was…",
    help: "Select one box on each row.",
    items: [
      { field: "objf_unbiased",    left: "Biased",          right: "Unbiased" },
      { field: "objf_objective",   left: "Not objective",   right: "Objective" },
      { field: "objf_independent", left: "Not independent", right: "Independent" },
      { field: "objf_impartial",   left: "Not impartial",   right: "Impartial" }
    ]
  },

  /* ---------- Perceived objectivity — mixed cell, source shown SECOND */
  {
    id: "objectivity_second",
    when: ["mixed"],
    type: "semdiff",
    eyebrow: "Question 5",
    prompt: "The evaluation carried out by {SOURCE_SECOND} was…",
    help: "Select one box on each row.",
    items: [
      { field: "objs_unbiased",    left: "Biased",          right: "Unbiased" },
      { field: "objs_objective",   left: "Not objective",   right: "Objective" },
      { field: "objs_independent", left: "Not independent", right: "Independent" },
      { field: "objs_impartial",   left: "Not impartial",   right: "Impartial" }
    ]
  },

  /* ---------- Mixed cell: which verdict was relied upon -------------
     Bipolar. Displayed left = source shown first, right = source shown
     second; recoded on submission so that + = the DISCONFIRMING source. */
  {
    id: "reliance",
    when: ["mixed"],
    type: "bipolar",
    eyebrow: "Question 6",
    prompt: "In forming your own judgment about whether facial rollers reduce puffiness, which conclusion did you rely on more?",
    help: "Click anywhere on the line, including the middle.",
    centerLabel: "I relied on<br>both equally",
    field: "reliance_raw"
  },

  {
    id: "rel_objectivity",
    when: ["mixed"],
    type: "bipolar",
    eyebrow: "Question 7",
    prompt: "Which of the two evaluations struck you as more <strong>objective</strong>?",
    help: "Click anywhere on the line, including the middle.",
    centerLabel: "Equally<br>objective",
    field: "relobj_raw"
  },

  {
    id: "rel_credibility",
    when: ["mixed"],
    type: "bipolar",
    eyebrow: "Question 8",
    prompt: "Which of the two evaluations did you find more <strong>credible</strong>?",
    help: "Click anywhere on the line, including the middle.",
    centerLabel: "Equally<br>credible",
    field: "relcred_raw"
  },

  {
    id: "reliance_open",
    when: ["mixed"],
    type: "textarea",
    eyebrow: "Question 9",
    prompt: "In a sentence or two, why did you weigh them that way?",
    help: "There are no right answers — whatever went through your mind is useful.",
    placeholder: "Type your answer here…",
    optional: true,
    field: "reliance_open"
  },

  /* ---------- Comprehension check ----------------------------------
     The article is HIDDEN for this screen so the check is diagnostic
     rather than a reading exercise. */
  {
    id: "mcheck",
    when: ALL,
    type: "choice",
    hideStimulus: true,
    eyebrow: "One last thing about the article",
    prompt: "Thinking back to what you read, what conclusion — if any — was reported about the puffiness claim?",
    help: "The article is hidden for this question. Please answer from memory.",
    field: "mc_verdict",
    options: [
      { value: "confirmed",    text: "A magazine tested the claim and concluded that it <strong>is supported</strong>" },
      { value: "disconfirmed", text: "A magazine tested the claim and concluded that it <strong>is not supported</strong>" },
      { value: "mixed",        text: "Two magazines tested the claim and <strong>reached opposite conclusions</strong>" },
      { value: "none",         text: "<strong>No test or conclusion</strong> was reported — only the claim itself" }
    ]
  }
];

/* Correct comprehension-check answer per condition. */
const MC_KEY = {
  control:       "none",
  confirming:    "confirmed",
  disconfirming: "disconfirmed",
  mixed:         "mixed"
};

/* ---------- Demographics (shown without the stimulus) --------------- */
const DEMOGRAPHICS = [
  { field: "age", type: "number", label: "What is your age?", min: 18, max: 110, suffix: "years" },
  {
    field: "gender", type: "radio", label: "What is your gender?",
    options: ["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"],
    selfDescribe: "Prefer to self-describe", selfField: "gender_self"
  },
  {
    field: "education", type: "select", label: "What is the highest level of education you have completed?",
    options: ["Less than high school", "High school / GED", "Some college, no degree",
              "Associate degree", "Bachelor's degree", "Master's degree",
              "Doctoral or professional degree", "Prefer not to say"]
  },
  {
    field: "prior_use", type: "radio", label: "Have you ever used a facial roller?",
    options: ["Never used one", "Tried one once or twice", "Use one occasionally", "Use one regularly"]
  },
  {
    field: "familiarity", type: "scale7", label: "Before today, how familiar were you with facial rollers?",
    left: "Not at all familiar", right: "Extremely familiar"
  }
];

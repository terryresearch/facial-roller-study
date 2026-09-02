# facial-roller-study

Modified replication of Study 4 in *Disconfirming but Convincing: Deviations from the
Norm Signal Objectivity*, with a fourth cell that the manuscript does not contain.

**Live study:** https://terryresearch.github.io/facial-roller-study/

## Design

Four cells, between subjects. Every participant reads the same article about facial
rollers and the manufacturers' claim that they reduce facial puffiness. The cells differ
only in what appears beneath that claim.

| cell | what is shown under the claim |
|---|---|
| `control` | nothing — the claim only |
| `confirming` | one magazine's verdict: the claim **is** supported |
| `disconfirming` | one magazine's verdict: the claim is **not** supported |
| `mixed` | two magazines, one confirming and one disconfirming |

Both verdict cards use an identical visual treatment — same border, accent, and
typography — so no colour or valence cue is confounded with the manipulation. The
magazines are fictional, described identically, so source authority is held constant.

## Measures

Presented one at a time in the right-hand panel while the article stays on the left.

**All cells**
- `dv_likelihood` — 0-100 slider: how likely facial rollers actually reduce puffiness.
  No default thumb position, so there is nothing to anchor on. This is the manuscript's
  own DV, kept for continuity.
- `belief_index` — 4-item semantic differential on the claim (unbelievable/believable,
  not credible/credible, not convincing/convincing, definitely false/definitely true),
  adapted from Beltramini (1982) and re-anchored from the advertisement to the claim.
- `certainty_index` — 2 items (Tormala & Rucker 2018). Belief *strength*, independent of
  direction: the mixed cell is expected to lower certainty even where it leaves the mean
  belief unmoved.
- `mc_verdict` — comprehension check with the article **hidden**, so it is diagnostic
  rather than a reading exercise.

**Confirming / disconfirming cells**
- `obj_index` — the manuscript's 4-item objectivity index (biased/unbiased,
  not objective/objective, not independent/independent, not impartial/impartial).

**Mixed cell**
- `obj_confirming`, `obj_disconfirming`, `obj_diff` — the same objectivity index applied
  to each source separately, asked in display order and recoded to verdict.
- `reliance_verdict` — which conclusion the participant leaned on, bipolar with a true
  midpoint.
- `relative_objectivity`, `relative_credibility` — which evaluation seemed more objective,
  and more credible.
- `reliance_open` — one sentence on why (optional).

All three bipolar measures are coded **-50 = entirely the confirming source, 0 = both
equally, +50 = entirely the disconfirming source**, regardless of which was shown first.

Demographics (age, gender, education, prior facial-roller use, familiarity) come last, so
they cannot contaminate the DVs.

## Randomisation

`assign()` hands out the least-filled cell under a per-study advisory lock, so concurrent
sessions cannot collide, and it is idempotent per participant. Counterbalancing alternates
strictly inside each cell: the single-verdict cells alternate which magazine carries the
verdict, the mixed cell alternates which verdict is shown first. Which name carries which
verdict in the mixed cell is drawn at random per participant and recorded.

## Data

Supabase → SQL Editor:

    select * from fr1_data;     -- one row per participant, flat, indices precomputed
    select * from fr1_balance;  -- assigned vs completed per cell, live

Exclude pilot rows with `where not is_test`.

## Recruitment links

    https://terryresearch.github.io/facial-roller-study/?PROLIFIC_PID={{%PROLIFIC_PID%}}&STUDY_ID={{%STUDY_ID%}}&SESSION_ID={{%SESSION_ID%}}

Append `&test=1` to flag a row as a pilot. Set `completionUrl` in the config block to
redirect on finish; otherwise participants are shown the completion code.

## Previewing conditions

On localhost only, `?preview=control|confirming|disconfirming|mixed` forces a cell and
writes nothing to the database. Add `&swap=1` to flip the verdict order in the mixed cell.
The parameter is inert once deployed.

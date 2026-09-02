/* =====================================================================
   Disconfirming but Convincing — Facial Roller Study
   Flow: consent -> article -> measures (split view) -> demographics -> done
   ===================================================================== */

(function () {
  "use strict";

  /* ---------------- session state ---------------- */
  const S = {
    pid: null,          // participant id (Prolific PID when present)
    pidSource: null,
    isTest: false,
    blurCount: 0,
    startedAt: 0,
    condition: null,
    confirmFirst: null,
    sourcePrimary: null,
    sourceConfirm: null,
    sourceDisconfirm: null,
    sourceFirst: null,
    sourceSecond: null,
    answers: {},
    timings: {},
    queue: [],
    idx: 0,
    screenEnteredAt: 0
  };

  const $  = (s, r) => (r || document).querySelector(s);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  /* ---------------- Supabase RPC ---------------- */
  async function rpc(fn, body) {
    if (PREVIEW) { console.log("[preview] skipped", fn, body); return { preview: true }; }
    const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CONFIG.supabaseKey,
        Authorization: `Bearer ${CONFIG.supabaseKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`${fn} failed: ${res.status} ${await res.text()}`);
    const txt = await res.text();
    return txt ? JSON.parse(txt) : null;
  }

  function makeUid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "s-" + Date.now() + "-" + Math.random().toString(36).slice(2, 12);
  }

  /* ---------------- screen switching ---------------- */
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("is-active"));
    $("#" + id).classList.add("is-active");
    window.scrollTo(0, 0);
    const pane = $("#" + id + " .pane-measure");
    if (pane) pane.scrollTop = 0;
  }

  /* =====================================================================
     1. CONSENT
     ===================================================================== */
  function initConsent() {
    const box  = $("#consent-agree");
    const btn  = $("#consent-btn");
    const err  = $("#consent-err");
    box.addEventListener("change", () => { btn.disabled = !box.checked; });

    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Starting…";
      err.classList.remove("show");
      try {
        await startSession();
        renderArticle();
        show("screen-intro");
      } catch (e) {
        console.error(e);
        btn.disabled = false;
        btn.textContent = "I agree — begin the study";
        err.textContent = "We could not start the study. Please check your connection and try again.";
        err.classList.add("show");
      }
    });
  }

  /* Preview mode: forces a condition and disables all database writes.
     Only ever active on localhost / file:// — inert once deployed. */
  const PREVIEW = (function () {
    const host = location.hostname;
    const local = host === "localhost" || host === "127.0.0.1" || location.protocol === "file:";
    if (!local) return null;
    const c = new URLSearchParams(location.search).get("preview");
    return ["control", "confirming", "disconfirming", "mixed"].indexOf(c) !== -1 ? c : null;
  })();

  function initIntro() {
    $("#intro-btn").addEventListener("click", () => {
      show("screen-article");
      beginReadTimer();
    });
  }

  async function startSession() {
    const q = new URLSearchParams(location.search);

    /* participant id: Prolific PID when present, else a stable random id */
    const prolific = q.get("PROLIFIC_PID") || q.get("participant_id") || "";
    if (prolific) { S.pid = prolific; S.pidSource = "prolific"; }
    else {
      let anon = sessionStorage.getItem("fr1_pid");
      if (!anon) { anon = "anon-" + makeUid(); sessionStorage.setItem("fr1_pid", anon); }
      S.pid = anon; S.pidSource = "anonymous";
    }
    S.isTest = q.get("test") === "1";
    S.startedAt = Date.now();

    if (PREVIEW) {
      S.condition = PREVIEW;
      S.confirmFirst = q.get("swap") !== "1";
      S.nameSwap = false;
      applySources();
      S.queue = MEASURES.filter(m => m.when.indexOf(S.condition) !== -1);
      return;
    }

    const meta = {
      prolific_study_id: q.get("STUDY_ID") || "",
      prolific_session:  q.get("SESSION_ID") || "",
      pid_source:        S.pidSource,
      is_test:           S.isTest,
      user_agent:        navigator.userAgent,
      screen_w:          window.screen.width,
      screen_h:          window.screen.height,
      is_mobile:         window.matchMedia("(max-width: 900px)").matches
    };

    const a = await rpc("assign", {
      p_study: CONFIG.studyId,
      p_pid: S.pid,
      p_session: sessionStorage.getItem("fr1_sid") || (function () {
        const v = makeUid(); sessionStorage.setItem("fr1_sid", v); return v;
      })(),
      p_meta: meta
    });

    S.condition = a.factors.condition;

    /* `label_order` is the strictly alternating counterbalance handed back
       by assign(). Single-verdict cells alternate which magazine carries the
       verdict; the mixed cell alternates which verdict is shown first. */
    const order = a.factors.label_order;
    if (S.condition === "mixed") {
      S.confirmFirst = order !== "disconfirm_first";
      S.nameSwap     = Math.random() < 0.5;   // nuisance factor, randomised
    } else {
      S.confirmFirst = true;
      S.nameSwap     = order === "name_b";
    }
    applySources();
    S.queue = MEASURES.filter(m => m.when.indexOf(S.condition) !== -1);
  }

  /* Resolve the two publications onto their roles. Each carries its own
     accent colour, so tying colour to the publication counterbalances
     colour against verdict for free — nameSwap already alternates which
     publication delivers which verdict. */
  function applySources() {
    const src = STIMULUS.sources;
    const a = S.nameSwap ? src[1] : src[0];
    const b = S.nameSwap ? src[0] : src[1];

    S.primary    = a;
    S.confirmSrc = S.confirmFirst ? a : b;
    S.disconfSrc = S.confirmFirst ? b : a;
    S.firstSrc   = S.confirmFirst ? S.confirmSrc : S.disconfSrc;
    S.secondSrc  = S.confirmFirst ? S.disconfSrc : S.confirmSrc;

    /* plain-name aliases used throughout the copy */
    S.sourcePrimary    = a.name;
    S.sourceConfirm    = S.confirmSrc.name;
    S.sourceDisconfirm = S.disconfSrc.name;
    S.sourceFirst      = S.firstSrc.name;
    S.sourceSecond     = S.secondSrc.name;
  }

  /* =====================================================================
     2. ARTICLE
     ===================================================================== */
  function verdictCardHTML(source, kind) {
    const v = STIMULUS.verdict[kind];
    return `
      <article class="verdict-card theme-${source.theme}">
        <div class="verdict-source">
          <span class="tag">${STIMULUS.sourceTag}</span>
          <span class="name">${source.name}</span>
        </div>
        <div class="verdict-eyebrow">${v.eyebrow}</div>
        <h3 class="verdict-headline">${v.headline}</h3>
        <p class="verdict-body">${v.body}</p>
      </article>`;
  }

  function articleHTML() {
    let verdicts = "";

    if (S.condition === "confirming" || S.condition === "disconfirming") {
      verdicts = `
        <section class="verdicts">
          <div class="verdicts-label">${STIMULUS.sectionLabelSingle}</div>
          ${verdictCardHTML(S.primary, S.condition)}
        </section>`;
    } else if (S.condition === "mixed") {
      const first  = S.confirmFirst
        ? verdictCardHTML(S.confirmSrc, "confirming")
        : verdictCardHTML(S.disconfSrc, "disconfirming");
      const second = S.confirmFirst
        ? verdictCardHTML(S.disconfSrc, "disconfirming")
        : verdictCardHTML(S.confirmSrc, "confirming");
      verdicts = `
        <section class="verdicts">
          <div class="verdicts-label">${STIMULUS.sectionLabelMixed}</div>
          ${first}${second}
        </section>`;
    }

    return `
      <div class="masthead">
        <span class="brand">The Consumer Desk</span>
        <span class="section">${STIMULUS.kicker}</span>
      </div>
      <h1 class="article-headline">${STIMULUS.headline}</h1>
      <figure class="article-figure"><img src="${STIMULUS.image}" alt="${STIMULUS.imageAlt}" width="820" height="322" decoding="async"></figure>
      <div class="article-body">
        ${STIMULUS.body.map(p => `<p>${p}</p>`).join("")}
        <div class="claim-block">
          <div class="claim-label">The manufacturers’ claim</div>
          <div class="claim-text">“${STIMULUS.claim}”</div>
        </div>
        ${STIMULUS.bodyAfterClaim.map(p => `<p>${p}</p>`).join("")}
      </div>
      ${verdicts}`;
  }

  /* Rendered ONCE. The same node is later moved into the left-hand pane
     rather than duplicated, so the browser never fetches the photo twice. */
  function renderArticle() {
    $("#article-full").innerHTML = articleHTML();
  }

  function beginReadTimer() {
    const btn = $("#article-btn");
    let left = CONFIG.minReadSeconds;
    btn.disabled = true;
    const base = "Continue to the questions";
    btn.textContent = `${base} (${left})`;
    const t = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(t);
        btn.disabled = false;
        btn.textContent = base;
      } else {
        btn.textContent = `${base} (${left})`;
      }
    }, 1000);

    btn.onclick = () => {
      S.timings.article_ms = Date.now() - S.articleStart;
      const pane = $("#stimulus-pane");
      pane.insertBefore($("#article-full"), pane.firstChild);
      S.idx = 0;
      show("screen-measures");
      renderMeasure();
    };
    S.articleStart = Date.now();
  }

  /* =====================================================================
     3. MEASURES
     ===================================================================== */
  function fillTokens(str) {
    return str
      .replace(/\{SOURCE_FIRST\}/g,  `<strong>${S.sourceFirst}</strong>`)
      .replace(/\{SOURCE_SECOND\}/g, `<strong>${S.sourceSecond}</strong>`)
      .replace(/\{SOURCE\}/g,        `<strong>${S.sourcePrimary}</strong>`);
  }

  /* total steps = measures + demographics screen */
  function totalSteps() { return S.queue.length + 1; }

  function renderMeasure() {
    const m = S.queue[S.idx];
    const pane = $("#measure-pane");


    const wrap = el("div", "measure");

    /* progress */
    const prog = el("div", "progress");
    prog.innerHTML = `
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="progress-count">${S.idx + 1} of ${totalSteps()}</div>`;
    wrap.appendChild(prog);

    if (m.eyebrow) wrap.appendChild(el("div", "eyebrow", m.eyebrow));
    wrap.appendChild(el("h2", "measure-prompt", fillTokens(m.prompt)));
    if (m.help) wrap.appendChild(el("p", "measure-help", m.help));

    const body = el("div", "measure-body");
    wrap.appendChild(body);

    const btnRow = el("div", "btn-row");
    const next   = el("button", "btn", S.idx === S.queue.length - 1 ? "Continue" : "Next");
    next.disabled = !m.optional;
    btnRow.appendChild(next);
    wrap.appendChild(btnRow);

    const err = el("div", "err");
    wrap.appendChild(err);

    /* ---- build the control ---- */
    const state = { value: undefined, values: {} };
    const ready = () => {
      if (m.optional) return true;
      if (m.type === "semdiff" || m.type === "likert") {
        return m.items.every(i => state.values[i.field] !== undefined);
      }
      return state.value !== undefined;
    };
    const refresh = () => { next.disabled = !ready(); };

    if (m.type === "slider100")      buildSlider100(body, m, state, refresh);
    else if (m.type === "bipolar")   buildBipolar(body, m, state, refresh);
    else if (m.type === "semdiff")   buildSemdiff(body, m, state, refresh);
    else if (m.type === "likert")    buildLikert(body, m, state, refresh);
    else if (m.type === "choice")    buildChoice(body, m, state, refresh);
    else if (m.type === "textarea")  buildTextarea(body, m, state, refresh);

    pane.innerHTML = "";
    pane.appendChild(wrap);
    pane.scrollTop = 0;
    requestAnimationFrame(() => { $(".progress-fill", wrap).style.width =
      ((S.idx + 1) / totalSteps() * 100) + "%"; });

    S.screenEnteredAt = Date.now();

    next.addEventListener("click", async () => {
      if (!ready()) return;
      S.timings["t_" + m.id] = Date.now() - S.screenEnteredAt;

      if (m.type === "semdiff" || m.type === "likert") {
        Object.assign(S.answers, state.values);
      } else {
        S.answers[m.field] = state.value;
      }

      /* breadcrumb so partial progress survives a drop-off */
      rpc("log_event", {
        p_study: CONFIG.studyId,
        p_pid: S.pid,
        p_kind: "page",
        p_detail: { measure: m.id, index: S.idx, ms: S.timings["t_" + m.id] }
      }).catch(e => console.warn("log_event", e));

      S.idx += 1;
      if (S.idx < S.queue.length) renderMeasure();
      else { renderDemographics(); show("screen-demographics"); }
    });
  }

  /* ---------- 0-100 slider, no default position ---------- */
  function buildSlider100(host, m, state, refresh) {
    const wrap = el("div", "slider-wrap");
    wrap.innerHTML = `
      <div class="slider-value"><span class="placeholder">Not yet answered</span></div>
      <div class="track-outer" tabindex="0" role="slider"
           aria-valuemin="0" aria-valuemax="100" aria-label="${m.prompt.replace(/"/g, "&quot;")}">
        <div class="track">
          <div class="track-fill"></div>
          <div class="track-ticks">
            ${[0,25,50,75,100].map(p => `<span style="left:${p}%"></span>`).join("")}
          </div>
          <div class="thumb"></div>
        </div>
      </div>
      <div class="track-labels">
        <span>${m.leftLabel}</span><span>${m.rightLabel}</span>
      </div>`;
    host.appendChild(wrap);

    const outer = $(".track-outer", wrap);
    const fill  = $(".track-fill", wrap);
    const thumb = $(".thumb", wrap);
    const read  = $(".slider-value", wrap);

    const set = v => {
      v = Math.round(Math.min(100, Math.max(0, v)));
      state.value = v;
      outer.classList.add("is-engaged");
      fill.style.width = v + "%";
      thumb.style.left = v + "%";
      read.innerHTML = `<span class="num">${v}</span><span class="pct">%</span>`;
      outer.setAttribute("aria-valuenow", v);
      refresh();
    };

    attachTrack(outer, x => set(x * 100));

    outer.addEventListener("keydown", e => {
      const cur = state.value === undefined ? 50 : state.value;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowRight" || e.key === "ArrowUp")        { set(cur + step); e.preventDefault(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown")  { set(cur - step); e.preventDefault(); }
      else if (e.key === "Home")                                { set(0);   e.preventDefault(); }
      else if (e.key === "End")                                 { set(100); e.preventDefault(); }
    });
  }

  /* ---------- bipolar slider (mixed cell), -50 .. +50 ---------- */
  function buildBipolar(host, m, state, refresh) {
    const wrap = el("div", "slider-wrap bipolar");
    wrap.innerHTML = `
      <div class="bipolar-readout"><span class="placeholder">Not yet answered</span></div>
      <div class="track-outer" tabindex="0" role="slider"
           aria-valuemin="-50" aria-valuemax="50" aria-label="${m.prompt.replace(/<[^>]+>/g,"").replace(/"/g,"&quot;")}">
        <div class="track">
          <div class="track-fill"></div>
          <div class="track-ticks">
            <span style="left:0%"></span>
            <span style="left:25%"></span>
            <span class="center" style="left:50%"></span>
            <span style="left:75%"></span>
            <span style="left:100%"></span>
          </div>
          <div class="thumb"></div>
        </div>
      </div>
      <div class="bipolar-labels">
        <div class="side left">
          <span class="who">${S.sourceFirst}</span>
          ${S.confirmFirst ? "said the claim <em>is</em> supported" : "said the claim is <em>not</em> supported"}
        </div>
        <div class="mid">${m.centerLabel}</div>
        <div class="side right">
          <span class="who">${S.sourceSecond}</span>
          ${S.confirmFirst ? "said the claim is <em>not</em> supported" : "said the claim <em>is</em> supported"}
        </div>
      </div>`;
    host.appendChild(wrap);

    const outer = $(".track-outer", wrap);
    const fill  = $(".track-fill", wrap);
    const thumb = $(".thumb", wrap);
    const read  = $(".bipolar-readout", wrap);

    const set = v => {
      v = Math.round(Math.min(50, Math.max(-50, v)));
      state.value = v;
      outer.classList.add("is-engaged");
      const pct = (v + 50);
      thumb.style.left = pct + "%";
      /* fill grows out from the centre in whichever direction was chosen */
      if (v >= 0) { fill.style.left = "50%"; fill.style.width = (pct - 50) + "%"; }
      else        { fill.style.left = pct + "%"; fill.style.width = (50 - pct) + "%"; }

      const mag = Math.abs(v);
      if (mag === 0) read.innerHTML = `<strong>Both equally</strong>`;
      else {
        const who = v > 0 ? S.sourceSecond : S.sourceFirst;
        const how = mag < 17 ? "slightly more" : mag < 34 ? "somewhat more" : "much more";
        read.innerHTML = `<strong>${who}</strong> &mdash; ${how}`;
      }
      outer.setAttribute("aria-valuenow", v);
      refresh();
    };

    attachTrack(outer, x => set(x * 100 - 50));

    outer.addEventListener("keydown", e => {
      const cur = state.value === undefined ? 0 : state.value;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowRight" || e.key === "ArrowUp")       { set(cur + step); e.preventDefault(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") { set(cur - step); e.preventDefault(); }
      else if (e.key === "Home")                               { set(-50); e.preventDefault(); }
      else if (e.key === "End")                                { set(50);  e.preventDefault(); }
    });
  }

  /* shared pointer handling for both slider types */
  function attachTrack(outer, onFraction) {
    const frac = clientX => {
      const r = $(".track", outer).getBoundingClientRect();
      return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    };
    let dragging = false;
    const down = e => {
      dragging = true;
      outer.setPointerCapture && e.pointerId != null && outer.setPointerCapture(e.pointerId);
      onFraction(frac(e.clientX));
      e.preventDefault();
    };
    const move = e => { if (dragging) onFraction(frac(e.clientX)); };
    const up   = () => { dragging = false; };
    outer.addEventListener("pointerdown", down);
    outer.addEventListener("pointermove", move);
    outer.addEventListener("pointerup", up);
    outer.addEventListener("pointercancel", up);
  }

  /* ---------- semantic differential ---------- */
  function buildSemdiff(host, m, state, refresh) {
    const scale = el("div", "semdiff-scale");
    scale.innerHTML = `<div></div>
      <div class="scale-numbers">${[1,2,3,4,5,6,7].map(n => `<span>${n}</span>`).join("")}</div>
      <div></div>`;
    host.appendChild(scale);

    m.items.forEach(item => {
      const row = el("div", "semdiff-row");
      const opts = [1,2,3,4,5,6,7].map(v => `
        <label class="opt">
          <input type="radio" name="${item.field}" value="${v}"
                 aria-label="${item.left} to ${item.right}, ${v} of 7">
          <span class="dot"></span>
        </label>`).join("");
      row.innerHTML = `
        <div class="anchor">${item.left}</div>
        <div class="opt-row">${opts}</div>
        <div class="anchor right">${item.right}</div>`;
      row.addEventListener("change", e => {
        state.values[item.field] = parseInt(e.target.value, 10);
        refresh();
      });
      host.appendChild(row);
    });
  }

  /* ---------- likert ---------- */
  function buildLikert(host, m, state, refresh) {
    m.items.forEach(item => {
      const block = el("div", "likert-item");
      const opts = [1,2,3,4,5,6,7].map(v => `
        <label class="likert-opt">
          <input type="radio" name="${item.field}" value="${v}"
                 aria-label="${m.scaleLabels[v-1] || v} (${v} of 7)">
          <span class="dot"></span>
          <span class="lab">${m.scaleLabels[v-1] || ""}</span>
        </label>`).join("");
      block.innerHTML = `
        <div class="statement">${item.text}</div>
        <div class="likert-scale">${opts}</div>`;
      block.addEventListener("change", e => {
        state.values[item.field] = parseInt(e.target.value, 10);
        refresh();
      });
      host.appendChild(block);
    });
  }

  /* ---------- single choice ---------- */
  function buildChoice(host, m, state, refresh) {
    const list = el("div", "choice-list");
    m.options.forEach(o => {
      const lab = el("label", "choice");
      lab.innerHTML = `
        <input type="radio" name="${m.field}" value="${o.value}">
        <span class="radio"></span>
        <span class="text">${o.text}</span>`;
      list.appendChild(lab);
    });
    list.addEventListener("change", e => { state.value = e.target.value; refresh(); });
    host.appendChild(list);
  }

  /* ---------- free text ---------- */
  function buildTextarea(host, m, state, refresh) {
    const ta = el("textarea");
    ta.placeholder = m.placeholder || "";
    ta.addEventListener("input", () => {
      state.value = ta.value.trim();
      refresh();
    });
    state.value = "";
    host.appendChild(ta);
  }

  /* =====================================================================
     4. DEMOGRAPHICS
     ===================================================================== */
  function renderDemographics() {
    const host = $("#demo-body");
    host.innerHTML = "";
    const vals = {};

    DEMOGRAPHICS.forEach(d => {
      const item = el("div", "demo-item");
      item.appendChild(el("div", "demo-label", d.label));

      if (d.type === "number") {
        const row = el("div", "input-row");
        const inp = el("input");
        inp.type = "number"; inp.min = d.min; inp.max = d.max; inp.placeholder = "—";
        inp.addEventListener("input", () => {
          const v = parseInt(inp.value, 10);
          vals[d.field] = (v >= d.min && v <= d.max) ? v : undefined;
          check();
        });
        row.appendChild(inp);
        if (d.suffix) row.appendChild(el("span", "suffix", d.suffix));
        item.appendChild(row);

      } else if (d.type === "radio") {
        const box = el("div", "demo-radios");
        d.options.forEach(o => {
          const lab = el("label", "choice");
          lab.innerHTML = `<input type="radio" name="${d.field}" value="${o}">
                           <span class="radio"></span><span class="text">${o}</span>`;
          box.appendChild(lab);
        });
        let selfInput = null;
        if (d.selfDescribe) {
          selfInput = el("input");
          selfInput.type = "text";
          selfInput.placeholder = "Please describe";
          selfInput.style.display = "none";
          selfInput.style.marginTop = "4px";
          selfInput.addEventListener("input", () => { vals[d.selfField] = selfInput.value.trim(); });
          box.appendChild(selfInput);
        }
        box.addEventListener("change", e => {
          vals[d.field] = e.target.value;
          if (selfInput) {
            const on = e.target.value === d.selfDescribe;
            selfInput.style.display = on ? "block" : "none";
            if (!on) { selfInput.value = ""; vals[d.selfField] = undefined; }
          }
          check();
        });
        item.appendChild(box);

      } else if (d.type === "select") {
        const sel = el("select");
        sel.innerHTML = `<option value="">Select…</option>` +
          d.options.map(o => `<option value="${o}">${o}</option>`).join("");
        sel.addEventListener("change", () => {
          vals[d.field] = sel.value || undefined;
          check();
        });
        item.appendChild(sel);

      } else if (d.type === "scale7") {
        const block = el("div", "likert-item");
        block.style.borderTop = "none";
        block.style.paddingTop = "0";
        const opts = [1,2,3,4,5,6,7].map(v => `
          <label class="likert-opt">
            <input type="radio" name="${d.field}" value="${v}" aria-label="${v} of 7">
            <span class="dot"></span>
            <span class="lab">${v === 1 ? d.left : v === 7 ? d.right : ""}</span>
          </label>`).join("");
        block.innerHTML = `<div class="likert-scale">${opts}</div>`;
        block.addEventListener("change", e => {
          vals[d.field] = parseInt(e.target.value, 10);
          check();
        });
        item.appendChild(block);
      }

      host.appendChild(item);
    });

    const btn = $("#demo-btn");
    const required = DEMOGRAPHICS.map(d => d.field);
    const check = () => { btn.disabled = !required.every(f => vals[f] !== undefined); };
    check();

    $("#demo-count").textContent = `${totalSteps()} of ${totalSteps()}`;
    requestAnimationFrame(() => { $("#demo-progress").style.width = "100%"; });

    const started = Date.now();
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = "Submitting…";
      S.timings.t_demographics = Date.now() - started;
      Object.assign(S.answers, vals);
      try {
        await submit();
        show("screen-done");
        if (CONFIG.completionUrl) setTimeout(() => { location.href = CONFIG.completionUrl; }, 1200);
      } catch (e) {
        console.error(e);
        btn.disabled = false;
        btn.textContent = "Submit and finish";
        const err = $("#demo-err");
        err.textContent = "We could not save your responses. Please check your connection and try again.";
        err.classList.add("show");
      }
    };
  }

  /* =====================================================================
     5. SUBMIT — build the final payload, recoding the mixed-cell items
        from display order into a confirming/disconfirming frame.
     ===================================================================== */
  function buildPayload() {
    const a = S.answers;
    const p = Object.assign({}, a);

    if (S.condition === "mixed") {
      /* per-source objectivity: first/second shown -> confirming/disconfirming */
      const map = (from, to) => {
        ["unbiased", "objective", "independent", "impartial"].forEach(k => {
          if (a[`obj${from}_${k}`] !== undefined) p[`obj${to}_${k}`] = a[`obj${from}_${k}`];
        });
      };
      map("f", S.confirmFirst ? "c" : "d");   // source shown first
      map("s", S.confirmFirst ? "d" : "c");   // source shown second
      ["objf_", "objs_"].forEach(pre =>
        Object.keys(p).forEach(k => { if (k.indexOf(pre) === 0) delete p[k]; }));

      /* bipolar sliders: raw is -50 (first shown) .. +50 (second shown).
         Recode so that + always means the DISCONFIRMING source.        */
      const sign = S.confirmFirst ? 1 : -1;
      if (a.reliance_raw  !== undefined) p.reliance_verdict     = sign * a.reliance_raw;
      if (a.relobj_raw    !== undefined) p.relative_objectivity = sign * a.relobj_raw;
      if (a.relcred_raw   !== undefined) p.relative_credibility = sign * a.relcred_raw;
      delete p.reliance_raw; delete p.relobj_raw; delete p.relcred_raw;
    }

    return p;
  }

  async function submit() {
    const payload = buildPayload();

    /* record the realised stimulus assignment alongside the answers */
    payload.source_primary    = S.sourcePrimary;
    payload.source_confirm    = S.condition === "mixed" ? S.sourceConfirm : null;
    payload.source_disconfirm = S.condition === "mixed" ? S.sourceDisconfirm : null;
    payload.confirm_first     = S.confirmFirst;
    payload.name_swap         = S.nameSwap;
    payload.theme_confirm     = S.condition === "control" ? null : S.confirmSrc.theme;
    payload.theme_disconfirm  = S.condition === "control" ? null : S.disconfSrc.theme;

    const paradata = {
      pid_source:        S.pidSource,
      is_test:           S.isTest,
      prolific_study_id: new URLSearchParams(location.search).get("STUDY_ID") || null,
      duration_ms:       Date.now() - S.startedAt,
      read_ms:           S.timings.article_ms || null,
      blur_count:        S.blurCount,
      is_mobile:         window.matchMedia("(max-width: 900px)").matches,
      user_agent:        navigator.userAgent,
      page_ms:           S.timings
    };

    await rpc("submit", {
      p_study: CONFIG.studyId,
      p_pid: S.pid,
      p_data: payload,
      p_paradata: paradata
    });
  }

  /* =====================================================================
     boot
     ===================================================================== */
  window.addEventListener("blur", () => { S.blurCount += 1; });

  document.addEventListener("DOMContentLoaded", () => {
    $("#done-code").textContent = CONFIG.completionCode;
    $("#photo-credit").innerHTML = STIMULUS.imageCredit || "";
    initConsent();
    initIntro();
    if (PREVIEW || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      window.__DBC = { S, buildPayload };
    }
  });
})();

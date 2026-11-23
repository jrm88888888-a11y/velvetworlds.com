/* Velvet Golf: the lobby, the Golf Shop and the game's host (velvetworlds.com/golf/).
   The lobby is the Standard Model chart: one course for each particle. The accounts server keeps stars, courses opened
   and everything bought (the golf-* ops of POST /game). Signed out, the free course can be played and its stars are
   kept on this device, then sent up at the next sign-in. */
(function () {
  "use strict";
  var auth = window.Arcade && window.Arcade.auth;
  var root = document.getElementById("vg-app");
  var SITE = window.AISM_SITE || "https://aistudymethod.com";
  var ENGINE = "/velvet-worlds/game/index", ENGINE_BYTES = 39514754;   // the same engine files as Velvet Blaster
  var PCK = "/golf/game/golf.pck", PCK_V = "20261123j", PCK_BYTES = 2547584;
  var PACKS = "/velvet-worlds/packs/", PACKS_V = "20261122c";
  var LS_LOCAL = "vg-local", LS_SEL = "vg-course";

  /* The same two tables as the accounts server (GOLF_COURSES and GOLF_ITEMS in aism-accounts-edge-script.ts).
     golf-server-test.mjs fails if they differ. Change them there first. */
  var GOLF_COURSES = {
    "electron": { price: 0, pars: [9] },
    "up": { price: 20, pars: [] },
    "down": { price: 40, pars: [] },
    "photon": { price: 60, pars: [] },
    "gluon": { price: 80, pars: [] },
    "strange": { price: 100, pars: [] },
    "charm": { price: 120, pars: [] },
    "muon": { price: 140, pars: [] },
    "tau": { price: 160, pars: [] },
    "electron-neutrino": { price: 180, pars: [] },
    "muon-neutrino": { price: 200, pars: [] },
    "tau-neutrino": { price: 220, pars: [] },
    "bottom": { price: 240, pars: [] },
    "top": { price: 260, pars: [] },
    "w-boson": { price: 280, pars: [] },
    "z-boson": { price: 300, pars: [] },
    "higgs": { price: 320, pars: [] },
    "graviton": { price: 340, pars: [] },
  };
  var GOLF_ITEMS = {
    "ball-red": { price: 50, keep: true, slot: "ball" },
    "ball-blue": { price: 50, keep: true, slot: "ball" },
    "ball-lime": { price: 50, keep: true, slot: "ball" },
    "ball-orange": { price: 50, keep: true, slot: "ball" },
    "ball-pink": { price: 50, keep: true, slot: "ball" },
    "ball-violet": { price: 50, keep: true, slot: "ball" },
    "ball-gold": { price: 300, keep: true, slot: "ball" },
    "boost-mulligan": { price: 5 },              // replay one putt
    "up-aim": { levels: [100, 200, 300] },       // a longer aim line
  };
  var SILVER_OVER = 3;

  /* What the lobby shows for each course. row and col place it on the chart. Charge and spin are the only particle
     figures shown; anything more must be checked against the Particle Data Group's tables before it is added. */
  var INFO = {
    "up": { sym: "u", name: "Up quark", fam: "quark", row: 1, col: 1, charge: "+⅔", spin: "½", place: "Summit Trail", twist: "Every hole climbs." },
    "charm": { sym: "c", name: "Charm quark", fam: "quark", row: 1, col: 2, charge: "+⅔", spin: "½", place: "Storybook Village", twist: "Moving bridges and a stream that carries the ball." },
    "top": { sym: "t", name: "Top quark", fam: "quark", row: 1, col: 3, charge: "+⅔", spin: "½", place: "Rooftops", twist: "The heaviest ball, and gaps between the towers." },
    "gluon": { sym: "g", name: "Gluon", fam: "gauge", row: 1, col: 4, charge: "0", spin: "1", place: "Sweet Factory", twist: "The ball is on an elastic tether." },
    "higgs": { sym: "H", name: "Higgs boson", fam: "scalar", row: 1, col: 5, charge: "0", spin: "0", place: "Crystal Vault", twist: "Gates that change the ball's mass." },
    "graviton": { sym: "G", name: "Graviton", fam: "tensor", row: 1, col: 6, charge: "0", spin: "2", place: "Deep Space", twist: "Small planets with their own gravity.", hyp: true },
    "down": { sym: "d", name: "Down quark", fam: "quark", row: 2, col: 1, charge: "−⅓", spin: "½", place: "The Mine", twist: "Every hole descends." },
    "strange": { sym: "s", name: "Strange quark", fam: "quark", row: 2, col: 2, charge: "−⅓", spin: "½", place: "Giant's Bedroom", twist: "You are tiny, and toy cars cross the track." },
    "bottom": { sym: "b", name: "Bottom quark", fam: "quark", row: 2, col: 3, charge: "−⅓", spin: "½", place: "Sea Floor", twist: "Water drag, currents and bubble vents." },
    "photon": { sym: "γ", name: "Photon", fam: "gauge", row: 2, col: 4, charge: "0", spin: "1", place: "Night Funfair", twist: "Mirror walls and bank shots." },
    "electron": { sym: "e", name: "Electron", fam: "lepton", row: 3, col: 1, charge: "−1", spin: "½", place: "Circuit City", twist: "Charged posts. Your ball is negative: red + posts pull it, blue − posts push it away." },
    "muon": { sym: "μ", name: "Muon", fam: "lepton", row: 3, col: 2, charge: "−1", spin: "½", place: "Pyramid Dig", twist: "The ball lasts only seconds, and a faster ball lasts longer." },
    "tau": { sym: "τ", name: "Tau", fam: "lepton", row: 3, col: 3, charge: "−1", spin: "½", place: "Volcano Ruins", twist: "A heavy ball, and tiles that crumble behind it." },
    "z-boson": { sym: "Z", name: "Z boson", fam: "gauge", row: 3, col: 4, charge: "0", spin: "1", place: "Collider Ring", twist: "Boost pads, loops and long tunnels." },
    "electron-neutrino": { sym: "νₑ", name: "Electron neutrino", fam: "lepton", row: 4, col: 1, charge: "0", spin: "½", place: "Haunted Graveyard", twist: "The ball passes through most walls." },
    "muon-neutrino": { sym: "νμ", name: "Muon neutrino", fam: "lepton", row: 4, col: 2, charge: "0", spin: "½", place: "Sky Islands", twist: "The ball cycles through three colours; a gate opens only to its own." },
    "tau-neutrino": { sym: "ντ", name: "Tau neutrino", fam: "lepton", row: 4, col: 3, charge: "0", spin: "½", place: "South Pole Ice Station", twist: "Ghost walls, on ice." },
    "w-boson": { sym: "W", name: "W boson", fam: "gauge", row: 4, col: 4, charge: "±1", spin: "1", place: "The Foundry", twist: "Pads that change the ball into another kind." }
  };
  var FAM = { quark: "Quark", lepton: "Lepton", gauge: "Gauge boson", scalar: "Scalar boson", tensor: "Tensor boson" };
  var ORDER = Object.keys(GOLF_COURSES);
  var BALL_COLOURS = { "": "#ffffff", "ball-red": "#f23338", "ball-blue": "#4080ff", "ball-lime": "#99f233", "ball-orange": "#ff8c1f", "ball-pink": "#ff73bf", "ball-violet": "#9e66ff", "ball-gold": "#ffcc33" };
  var BALL_NAMES = { "": "White", "ball-red": "Red", "ball-blue": "Blue", "ball-lime": "Lime", "ball-orange": "Orange", "ball-pink": "Pink", "ball-violet": "Violet", "ball-gold": "Gold" };
  /* The course a student chose in Velvet Blaster decides which questions golf asks (the same packs). */
  var LIBS = { ks3: { chemistry: "ks3-science" }, gcse: { biology: "gcse-biology", chemistry: "gcse-chemistry", physics: "gcse-physics" },
    ib: { biology: "ib-biology", chemistry: "ib-chemistry", physics: "ib-physics" }, alevel: { biology: "alevel-biology", chemistry: "alevel-chemistry", physics: "alevel-physics" },
    ap: { biology: "ap-biology", chemistry: "ap-chemistry", "physics-1": "ap-physics-1", "physics-2": "ap-physics-2", "physics-c-mechanics": "ap-physics-c-mechanics", "physics-c-em": "ap-physics-c-em" } };
  var LEVEL_NAMES = { ks3: "KS3", gcse: "GCSE", ib: "IB", alevel: "A-level", ap: "AP" };

  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function track(name, props) { try { if (typeof window.plausible === "function") window.plausible("Velvet Golf: " + name, props ? { props: props } : undefined); } catch (e) {} }
  function signedIn() { return !!(auth && auth.isLoggedIn()); }
  function coins() { var w = signedIn() ? auth.wallet() : null; return w && typeof w.coins === "number" ? w.coins : 0; }
  function emptyGolf() { return { courses: [], stars: {}, best: {}, wins: {}, items: {}, looks: [], upgrades: {}, equip: {} }; }

  var game = null, golf = emptyGolf(), saving = true;   // saving = the server understands the golf ops
  var local = lsGet(LS_LOCAL, { best: {} });            // signed out: fewest strokes per course and level, on this device
  var sel = lsGet(LS_SEL, "electron"), busy = false, note = "", playing = false, engine = null;
  if (!GOLF_COURSES[sel]) sel = "electron";

  /* ---- the accounts server ---- */
  async function api(method, body) {
    if (!signedIn()) return { ok: false, error: "signed-out" };
    var res, data = null;
    try {
      res = await fetch(auth.API + "/game", { method: method, headers: Object.assign({ authorization: "Bearer " + auth.token() }, body ? { "content-type": "application/json" } : {}), body: body ? JSON.stringify(body) : undefined });
    } catch (e) { return { ok: false, error: "network" }; }
    try { data = await res.json(); } catch (e) {}
    if (data && data.game) { game = data.game; golf = game.golf || emptyGolf(); }
    if (res.status === 400 && data && data.error === "bad-op" && body && /^golf-/.test(body.op)) saving = false;   // an accounts server from before golf
    return { ok: res.ok, status: res.status, error: data && data.error, data: data || {} };
  }
  async function refresh() {
    game = null; golf = emptyGolf();
    if (signedIn()) {
      await api("GET");
      // stars won on this device before signing in: the server works each star out again from the strokes
      var sent = false;
      for (var c in local.best) for (var l in local.best[c]) {
        if (GOLF_COURSES[c] && GOLF_COURSES[c].pars[l - 1]) { var r = await api("POST", { op: "golf-win", course: c, level: +l, strokes: local.best[c][l] }); if (r.ok) sent = true; else if (r.error !== "course-locked" && r.error !== "level-locked") { paint(); return; } }
      }
      if (sent || Object.keys(local.best).length) { local = { best: {} }; lsSet(LS_LOCAL, local); }
    }
    paint();
  }

  /* ---- what the account has ---- */
  function starOf(course, level) {
    if (signedIn()) return (golf.stars[course] || {})[level] || 0;
    var b = (local.best[course] || {})[level], par = GOLF_COURSES[course].pars[level - 1];
    if (!b || !par) return 0;
    return b - par <= 0 ? 3 : b - par <= SILVER_OVER ? 2 : 1;
  }
  function bestOf(course, level) { return signedIn() ? (golf.best[course] || {})[level] || 0 : (local.best[course] || {})[level] || 0; }
  function built(course) { return GOLF_COURSES[course].pars.length > 0; }
  function open(course) { return GOLF_COURSES[course].price === 0 || golf.courses.indexOf(course) > -1; }
  function owned(item) { return golf.looks.indexOf(item) > -1; }
  function stars3(course) {
    var h = "";
    for (var l = 1; l <= 3; l++) { var s = starOf(course, l); h += '<span class="star' + (s === 3 ? " g" : s === 2 ? " s" : s === 1 ? " b" : "") + '">★</span>'; }
    return h;
  }
  function starWord(s) { return s === 3 ? "Gold star" : s === 2 ? "Silver star" : s === 1 ? "Bronze star" : "No star yet"; }

  /* ---- the questions: the chosen course's pack for this golf course's number ---- */
  function chosenCourse() {
    var c = (game && game.course) || lsGet("vw-course", null) || {};
    var level = LIBS[c.level] ? c.level : "gcse", subject = LIBS[level][c.subject] ? c.subject : (level === "ks3" ? "chemistry" : level === "ap" ? "physics-1" : "physics");
    var lib = LIBS[level][subject]; if (level === "alevel") lib += "-" + (/^(aqa|ocr|edexcel|eduqas|ccea)$/.test(c.board) ? c.board : "aqa");
    return { lib: lib, tier: c.tier === "higher" ? "higher" : "", label: LEVEL_NAMES[level] + " " + subject.replace(/-/g, " ").replace(/\b[a-z]/, function (x) { return x.toUpperCase(); }), chosen: !!(c.level && LIBS[c.level]) };
  }
  async function loadQuestions(course) {
    var cc = chosenCourse(), n = ORDER.indexOf(course) + 1;
    try {
      var r = await fetch(PACKS + cc.lib + "/w" + n + ".json?v=" + PACKS_V); if (!r.ok) return [];
      var pack = await r.json(), qs = (pack.questions || []).filter(function (q) { return q && q.stem && q.options && q.options.length > 1 && (cc.tier === "higher" || q.tier !== "higher"); });
      return qs.map(function (q) { return { id: q.id, stem: q.stem, options: q.options.map(function (o) { return { text: o.text, correct: !!o.correct }; }), explanation: q.explanation || "" }; });
    } catch (e) { return []; }
  }

  /* ---- painting ---- */
  function tile(course) {
    var i = INFO[course], c = GOLF_COURSES[course], cls = "tile " + i.fam + (built(course) ? (open(course) ? " open" : "") : " soon") + (course === sel ? " sel" : "");
    var lock = !built(course) ? "soon" : open(course) ? "" : c.price + " ●";
    return '<button type="button" class="' + cls + '" data-course="' + course + '" style="grid-row:' + (i.row + 1) + ";grid-column:" + i.col + '" aria-label="' + esc(i.name) + (built(course) ? "" : ", coming soon") + '">'
      + '<span class="num">' + (ORDER.indexOf(course) + 1) + '</span><span class="lock">' + lock + '</span><span class="sym">' + esc(i.sym) + '</span><span class="nm">' + esc(i.name) + '</span><span class="st">' + stars3(course) + "</span></button>";
  }
  function infoPanel() {
    var i = INFO[sel], c = GOLF_COURSES[sel], h = '<div class="info"><h3>' + esc(i.name) + '</h3><div class="place">Course ' + (ORDER.indexOf(sel) + 1) + " · " + esc(i.place) + "</div>";
    h += '<div class="facts"><span>' + FAM[i.fam] + "</span><span>Charge " + i.charge + "</span><span>Spin " + i.spin + "</span>" + (i.hyp ? '<span class="hyp">Hypothetical: not part of the Standard Model, never observed</span>' : "") + "</div>";
    h += "<p>" + esc(i.twist) + "</p>";
    if (!built(sel)) return h + '<p class="hint">This course is not built yet.</p></div>';
    if (!open(sel)) {
      h += '<div class="lv"><div class="t">Open this course<small>' + c.price + " Velvet Coins</small></div>";
      h += signedIn() ? '<button type="button" class="go" data-open="' + sel + '"' + (coins() < c.price || busy ? " disabled" : "") + ">Open</button>" : '<button type="button" data-signin="1">Sign in</button>';
      return h + "</div>" + (signedIn() && coins() < c.price ? '<p class="hint">You need ' + (c.price - coins()) + ' more coins. <a href="' + SITE + '/">Do a lesson</a> to earn them.</p>' : "") + "</div>";
    }
    for (var l = 1; l <= 3; l++) {
      var par = c.pars[l - 1], s = starOf(sel, l), b = bestOf(sel, l), can = par && (l === 1 || starOf(sel, l - 1) > 0);
      h += '<div class="lv"><span class="big star' + (s === 3 ? " g" : s === 2 ? " s" : s === 1 ? " b" : "") + '">★</span><div class="t">Level ' + l + " · holes " + (l * 3 - 2) + " to " + (l * 3)
        + "<small>" + (par ? "Par " + par + " · " + starWord(s) + (b ? " · best " + b + " strokes" : "") : "Coming soon") + (par && !can ? " · finish level " + (l - 1) + " first" : "") + "</small></div>"
        + (par ? '<button type="button" class="go" data-play="' + l + '"' + (can && !busy ? "" : " disabled") + ">Play</button>" : "") + "</div>";
    }
    var cc = chosenCourse();
    h += '<p class="hint" style="margin-top:10px">Questions for mulligans: ' + esc(cc.label) + (cc.chosen ? "" : " (choose your own course in <a href=\"/blaster/\">Velvet Blaster</a>)") + ".</p>";
    if (!signedIn()) h += '<p class="hint">Stars are kept on this device. <a href="#" data-signin="1">Sign in</a> to keep them on your account.</p>';
    return h + "</div>";
  }
  function shopPanel() {
    var h = '<div class="shop"><h2>Golf Shop</h2><div class="hint">Spend Velvet Coins on your game.' + (signedIn() ? "" : ' <a href="#" data-signin="1">Sign in</a> to buy.') + "</div>";
    var wearing = golf.equip.ball || "";
    h += "<h3>Balls</h3><div class=\"balls\">";
    [""].concat(Object.keys(GOLF_ITEMS).filter(function (k) { return GOLF_ITEMS[k].slot === "ball"; })).forEach(function (id) {
      var have = id === "" || owned(id), on = wearing === id, price = id ? GOLF_ITEMS[id].price : 0;
      var label = on ? "Wearing" : have ? "Wear" : price + " ●";
      h += '<button type="button" class="ball' + (on ? " on" : "") + '" data-ball="' + id + '"' + ((on || busy || !signedIn() || (!have && coins() < price)) ? " disabled" : "") + ' aria-label="' + BALL_NAMES[id] + " ball: " + label + '"><i style="background:' + BALL_COLOURS[id] + '"></i>' + BALL_NAMES[id] + "<span>" + label + "</span></button>";
    });
    h += "</div><h3>Help on the course</h3>";
    var mull = golf.items["boost-mulligan"] || 0, mp = GOLF_ITEMS["boost-mulligan"].price;
    h += '<div class="buyrow"><div class="t">Mulligan<small>Take back one putt. You have ' + mull + '. You can also win them by answering questions.</small></div>'
      + '<button type="button" data-buy="boost-mulligan" data-count="1"' + (!signedIn() || busy || coins() < mp ? " disabled" : "") + ">1 for " + mp + " ●</button>"
      + '<button type="button" data-buy="boost-mulligan" data-count="5"' + (!signedIn() || busy || coins() < mp * 5 ? " disabled" : "") + ">5 for " + mp * 5 + " ●</button></div>";
    var lv = golf.upgrades["up-aim"] || 0, levels = GOLF_ITEMS["up-aim"].levels, next = levels[lv];
    h += '<div class="buyrow"><div class="t">Longer aim line<small>Level ' + lv + " of " + levels.length + ". Each level makes the line half as long again.</small></div>"
      + (lv >= levels.length ? "<button type=\"button\" disabled>Full</button>" : '<button type="button" data-upgrade="up-aim"' + (!signedIn() || busy || coins() < next ? " disabled" : "") + ">Level " + (lv + 1) + " for " + next + " ●</button>") + "</div>";
    h += '<p class="soonlist">Coming to the shop: ball trails, cup effects, flags, putters and putt sounds.</p>';
    return h + "</div>";
  }
  function paint() {
    if (playing) return;
    var h = '<div class="wrap"><div class="top"><a class="back" href="/">← Velvet Worlds</a></div>';
    h += '<header class="marquee"><div class="over">VELVET WORLDS PRESENTS</div><h1>VELVET GOLF</h1><div class="sub">One course for each particle of the Standard Model</div></header>';
    h += '<div class="deal"><p>Do lessons on <a href="' + SITE + '/" data-out="lessons">aistudymethod.com</a> to earn Velvet Coins. Spend them here to open courses and buy things for your game.</p>'
      + (signedIn() ? '<div class="coins" id="coinBox"><span aria-hidden="true">●</span><span id="coinNum">' + coins() + "</span><small>your coins</small></div>" : "") + "</div>";
    h += '<div class="note" id="note"' + (note ? "" : " hidden") + ">" + esc(note) + "</div>";
    h += '<div class="cols"><section class="card"><h2>Choose a course</h2><div class="hint">Each course has three levels of three holes. A level gives a bronze, silver or gold star.</div><div class="sm">';
    ["I", "II", "III", "Forces", "Higgs", "Gravity"].forEach(function (t, k) { h += '<div class="head" style="grid-row:1;grid-column:' + (k + 1) + '">' + t + "</div>"; });
    ORDER.forEach(function (c) { h += tile(c); });
    h += '</div><div class="key"><span><i style="background:var(--quark)"></i>Quarks</span><span><i style="background:var(--lepton)"></i>Leptons</span><span><i style="background:var(--gauge)"></i>Gauge bosons</span><span><i style="background:var(--scalar)"></i>Higgs boson</span><span><i style="background:var(--tensor)"></i>Graviton (hypothetical)</span></div></section>';
    h += '<section class="card">' + infoPanel() + shopPanel() + "</section></div>";
    h += '<footer>Velvet Golf is made by <a href="' + SITE + '/">AI Study Method</a>. <a href="' + SITE + '/privacy.html">Privacy</a></footer></div>';
    h += '<div id="stage" hidden><canvas id="canvas" tabindex="0"></canvas><div id="loading"><div id="loadText">Loading Velvet Golf…</div><progress id="loadBar" max="100" value="0"></progress></div></div>';
    root.innerHTML = h;
  }
  function say(text) { note = text; paint(); }
  var ERR = { insufficient: "You do not have enough coins for that.", "already-owned": "You already have that.", network: "Could not reach the server. Check your connection and try again.",
    "not-built": "That course is not built yet.", maxed: "That is already at its top level.", full: "You cannot hold any more of those.", "signed-out": "Sign in first." };
  async function act(body, done) {
    if (busy) return; busy = true; note = ""; paint();
    var r = await api("POST", body);
    if (r.ok && auth.pull) await auth.pull();   // the new coin balance
    busy = false;
    if (!r.ok) note = !saving ? "The shop is not open yet. Please try again later." : (ERR[r.error] || "That did not work. Please try again.");
    else if (done) done(r);
    paint();
  }

  /* ---- clicks ---- */
  root.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-course],[data-play],[data-open],[data-ball],[data-buy],[data-upgrade],[data-signin],[data-out]") : null;
    if (!t) return;
    if (t.hasAttribute("data-out")) { track("go to lessons"); return; }
    if (t.hasAttribute("data-signin")) { e.preventDefault(); if (auth && auth.open) auth.open("login", { source: "golf" }); return; }
    if (t.disabled) return;
    if (t.hasAttribute("data-course")) { sel = t.getAttribute("data-course"); lsSet(LS_SEL, sel); note = ""; paint(); track("course looked at", { course: sel }); return; }
    if (t.hasAttribute("data-play")) { play(sel, +t.getAttribute("data-play")); return; }
    if (t.hasAttribute("data-open")) { var c = t.getAttribute("data-open"); act({ op: "golf-course", course: c }, function () { track("course opened", { course: c }); }); return; }
    if (t.hasAttribute("data-ball")) {
      var id = t.getAttribute("data-ball");
      if (id === "" || owned(id)) act({ op: "golf-equip", slot: "ball", item: id }, function () { track("ball worn", { item: id || "white" }); });
      else act({ op: "golf-shop", item: id }, function () { track("bought", { item: id }); act({ op: "golf-equip", slot: "ball", item: id }); });
      return;
    }
    if (t.hasAttribute("data-buy")) { var item = t.getAttribute("data-buy"), n = +t.getAttribute("data-count") || 1; act({ op: "golf-shop", item: item, count: n }, function () { track("bought", { item: item, count: String(n) }); }); return; }
    if (t.hasAttribute("data-upgrade")) { var u = t.getAttribute("data-upgrade"); act({ op: "golf-upgrade", item: u }, function (r) { track("upgraded", { item: u, level: String(r.data.level) }); }); return; }
  });

  /* ---- the game ---- */
  function stateForGame(course, level, questions) {
    return { page: true, signedIn: signedIn(), course: course, level: level, golf: { equip: golf.equip, upgrades: golf.upgrades, items: golf.items }, questions: questions };
  }
  var cur = { course: "", level: 1, questions: [] };
  function pushState() { window.vgState = stateForGame(cur.course, cur.level, cur.questions); try { if (typeof window.vgStateChanged === "function") window.vgStateChanged(); } catch (e) {} }
  function loadScript(src) { return new Promise(function (ok, no) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.body.appendChild(s); }); }
  async function play(course, level) {
    if (playing || !built(course) || !open(course)) return;
    playing = true; cur = { course: course, level: level, questions: [] };
    document.body.classList.add("vg-playing");   // the account chip would sit on top of the game's own buttons
    var stage = document.getElementById("stage"); stage.hidden = false; document.body.style.overflow = "hidden";
    track("play", { course: course, level: String(level), signed_in: signedIn() ? "yes" : "no" });
    try {
      cur.questions = await loadQuestions(course);
      window.vgState = stateForGame(course, level, cur.questions);
      if (!window.Engine) await loadScript(ENGINE + ".js");
      var sizes = {}; sizes[ENGINE + ".wasm"] = ENGINE_BYTES; sizes[PCK] = PCK_BYTES;
      engine = new window.Engine({ canvas: document.getElementById("canvas"), executable: ENGINE, canvasResizePolicy: 2, focusCanvas: true, fileSizes: sizes, args: [],
        onProgress: function (c, t) { if (t > 0) document.getElementById("loadBar").value = Math.min(100, Math.round(100 * c / t)); } });
      await Promise.all([engine.init(ENGINE), engine.preloadFile(PCK + "?v=" + PCK_V, "index.pck")]);
      await engine.start({ args: ["--main-pack", "index.pck"] });
    } catch (err) {
      track("load failed"); playing = false; document.body.style.overflow = ""; document.body.classList.remove("vg-playing"); say("The game could not load. Check your connection and try again.");
    }
  }
  var queue = Promise.resolve();
  window.vgEvent = function (ev) {
    if (typeof ev === "string") { try { ev = JSON.parse(ev); } catch (e) { return; } }
    if (!ev || !ev.event) return;
    if (ev.event === "loaded") { var l = document.getElementById("loading"); if (l) l.hidden = true; track("loaded"); }
    else if (ev.event === "hole-done") track("hole done", { course: ev.course, hole: String((ev.level - 1) * 3 + ev.hole), strokes: String(ev.strokes), par: String(ev.par) });
    else if (ev.event === "question") track("question", { correct: ev.correct ? "yes" : "no" });
    else if (ev.event === "win") {
      track("level finished", { course: ev.course, level: String(ev.level), star: String(ev.star), signed_in: signedIn() ? "yes" : "no" });
      if (signedIn()) queue = queue.then(function () { return api("POST", { op: "golf-win", course: ev.course, level: ev.level, strokes: ev.strokes }); });
      else { var b = (local.best[ev.course] = local.best[ev.course] || {}); if (!b[ev.level] || ev.strokes < b[ev.level]) { b[ev.level] = ev.strokes; lsSet(LS_LOCAL, local); } }
    }
    else if (ev.event === "use") {
      track("mulligan used", { kind: "bought" });
      queue = queue.then(function () { return api("POST", { op: "golf-use", item: ev.item, count: 1 }); }).then(pushState);
    }
    else if (ev.event === "exit") { track("back to courses"); queue.then(function () { location.href = "/golf/"; }); }   // a fresh page: the engine cannot be started twice in one
  };

  if (auth) auth.onChange(function () { if (!playing) refresh(); });
  if (auth && auth.mountCorner) { try { auth.mountCorner(); } catch (e) {} }   // the account chip, top right: sign in, avatar, coins
  paint();
  refresh();
})();

/* The sign-in handoff. A student who was signed in on aistudymethod.com arrives with "#ho=<code>" on the address. The code
   works once and for 60 seconds. It is swapped at the accounts server for this domain's own sign-in before the page's
   scripts start, so the page opens signed in. The code is taken off the address at once. If the swap fails the page
   opens signed out. */
(function () {
  var API = String(window.AISM_ACCOUNTS_URL || "https://aism-accounts-7aktx.bunny.run").replace(/\/+$/, "");
  function start() {
    var i = 0, list = window.VW_SCRIPTS || [];
    (function next() {
      if (i >= list.length) { if (typeof window.VW_READY === "function") window.VW_READY(); return; }
      var s = document.createElement("script"); s.src = list[i++]; s.onload = next; s.onerror = next; document.body.appendChild(s);
    })();
  }
  var m = /[#&]ho=([^&]+)/.exec(location.hash || "");
  if (!m) { start(); return; }
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  var code = ""; try { code = decodeURIComponent(m[1]); } catch (e) {}
  var started = false; function once() { if (!started) { started = true; start(); } }
  setTimeout(once, 6000);                                      // a slow server must not leave a blank page
  fetch(API + "/handoff-claim", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: code }) })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (d && d.token && d.userId && !started) {
        try { localStorage.setItem("aism-auth", JSON.stringify({ token: d.token, userId: d.userId, username: d.username })); } catch (e) {}
        try { if (d.wallet) localStorage.setItem("aism-wallet", JSON.stringify({ uid: d.userId, w: d.wallet })); else localStorage.removeItem("aism-wallet"); } catch (e) {}
        try { if (typeof window.plausible === "function") window.plausible("Velvet Worlds: arrived signed in"); } catch (e) {}
      }
    })
    .catch(function () {})
    .then(once);
})();

// Patches tw-load.js text: prefetch site/bundle.js in parallel, run it after app4; fall back to the old per-file chain.
module.exports = function (src) {
  if (src.includes("site/bundle.js")) return { text: src, changed: false };
  const a = src.indexOf("function loadRemote(");
  const b = src.indexOf("['site/app5.js'"); const e = b >= 0 ? src.indexOf("Promise.resolve()); });", b) : -1;
  if (a < 0 || b < 0 || e < 0) throw new Error("pattern not found");
  const pre = "var BUNDLE = REF.then(function (b) { return fetch(b + 'site/bundle.js' + (b ? '?t=' + Date.now() : ''), { cache: 'no-store' }); }).then(function (r) { if (!r.ok) throw 0; return r.text(); }).catch(function () { return null; });\n  ";
  const oldChain = src.slice(b, e + "Promise.resolve()); });".length);
  const chainExpr = oldChain.replace(/\); \}\);$/, ")");
  const neu = "BUNDLE.then(function (x) { if (x) { var s = document.createElement('script'); s.textContent = x; document.body.appendChild(s); return; } return " + oldChain.slice(0, oldChain.length - " });".length) + "; }); });";
  const out = src.slice(0, a) + pre + src.slice(a, b) + neu + src.slice(e + "Promise.resolve()); });".length);
  return { text: out, changed: true };
};
